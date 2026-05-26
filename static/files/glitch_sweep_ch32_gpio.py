#!/usr/bin/env python3
"""
CH32V003 glitch sweep with GPIO-marker classification.

Tuned for demo.c auth-bypass target (fault-injection lab firmware).

demo.c timing analysis (CH32V003 @ 24 MHz default HSI, ~41.7 ns/cycle):
  - Trigger pulse: 200 nop cycles (~8.3 us)
  - First comparison:  immediately after trigger falls  (offset ~8300 ns)
  - 700 nop gap:       ~29.2 us
  - Second comparison:  ~38000 ns from trigger rise
  - Final AND / if(ok): ~40000 ns from trigger rise

The sweep targets all three glitch windows by default and uses a
two-phase strategy:
  Phase 1 (coarse): few trials per coordinate, wide steps
  Phase 2 (fine):   many trials around coordinates that showed success

Efficiency features:
  - Early-stop per coordinate once --early-stop-n successes are seen
  - Power cycle only after --max-consecutive-timeout consecutive timeouts
  - Batched DB writes and time-based progress reporting
  - Partial results written to CSV on Ctrl+C
"""

import argparse
import csv
import sys
import time
from collections import Counter

from findus import Database, PicoGlitcher


class Glitcher:
    """Thin adapter around findus.PicoGlitcher for GPIO-marker campaigns."""

    def __init__(
        self,
        port: str,
        trigger_input: str,
        trigger_edge: str,
        marker_success_pin: int | None,
        marker_fail_pin: int | None,
        marker_reset_pin: int | None,
        marker_pull: str,
        glitch_mode: str,
        serial_read_timeout_s: float,
        pyboard_cmd_timeout_s: float,
        comm_retries: int,
    ):
        self.port = port
        self.trigger_input = trigger_input
        self.trigger_edge = trigger_edge
        self.marker_success_pin = marker_success_pin
        self.marker_fail_pin = marker_fail_pin
        self.marker_reset_pin = marker_reset_pin
        self.marker_pull = marker_pull.upper()
        self.glitch_mode = glitch_mode
        self.serial_read_timeout_s = serial_read_timeout_s
        self.pyboard_cmd_timeout_s = pyboard_cmd_timeout_s
        self.comm_retries = max(0, comm_retries)
        self.dev = None
        self._pyb = None

    def connect(self) -> None:
        self.dev = PicoGlitcher()
        try:
            self.dev.init(port=self.port)
        except SystemExit:
            raise RuntimeError("Pico Glitcher connection failed (port busy or not found)")

        if self.glitch_mode == "hp":
            self.dev.set_hpglitch()
        else:
            self.dev.set_lpglitch()

        if self.trigger_edge == "falling":
            self.dev.falling_edge_trigger(pin_trigger=self.trigger_input)
        else:
            self.dev.rising_edge_trigger(pin_trigger=self.trigger_input)

        self._pyb = self.dev.pico_glitcher.pyb
        self._pyb.serial.timeout = self.serial_read_timeout_s

        pull_expr = f"machine.Pin.PULL_{self.marker_pull}"
        setup_code = f"""
import machine, time
_p_s = machine.Pin({self.marker_success_pin}, machine.Pin.IN, {pull_expr}) if {self.marker_success_pin} is not None else None
_p_f = machine.Pin({self.marker_fail_pin}, machine.Pin.IN, {pull_expr}) if {self.marker_fail_pin} is not None else None
_p_r = machine.Pin({self.marker_reset_pin}, machine.Pin.IN, {pull_expr}) if {self.marker_reset_pin} is not None else None

def _poll(timeout_ms):
    deadline = time.ticks_add(time.ticks_ms(), timeout_ms)
    while time.ticks_diff(deadline, time.ticks_ms()) > 0:
        if _p_r and _p_r.value():
            return "reset"
        if _p_s and _p_s.value():
            return "success"
        if _p_f and _p_f.value():
            return "fail"
    return "timeout"
"""
        self._exec(setup_code)

    def _exec(self, code: str) -> bytes:
        ret, ret_err = self._pyb.exec_raw(code, timeout=self.pyboard_cmd_timeout_s)
        if ret_err:
            raise RuntimeError(ret_err.decode("utf-8", errors="ignore"))
        return ret

    def reconnect(self) -> None:
        self.close()
        for attempt in range(5):
            try:
                self.connect()
                return
            except (RuntimeError, Exception):
                if attempt == 4:
                    raise
                time.sleep(1.0 + attempt)

    def _with_retry(self, fn, *args, **kwargs):
        last_err = None
        for attempt in range(self.comm_retries + 1):
            try:
                return fn(*args, **kwargs)
            except KeyboardInterrupt:
                raise
            except Exception as exc:
                last_err = exc
                if attempt >= self.comm_retries:
                    raise
                self.reconnect()
        raise last_err

    def arm(self, offset: int, width: int, level: int = 1) -> None:
        _ = level
        self._with_retry(self.dev.arm, offset, width)

    def wait_and_glitch(self, timeout_ms: int) -> bool:
        try:
            self._with_retry(self.dev.block, timeout_ms / 1000.0)
            return bool(self._with_retry(self.dev.check_glitch))
        except KeyboardInterrupt:
            raise
        except Exception:
            return False

    def read_marker_state(self, timeout_ms: int) -> str:
        try:
            out = self._with_retry(self._exec, f"print(_poll({timeout_ms}))")
            return out.decode("utf-8", errors="ignore").strip() or "timeout"
        except KeyboardInterrupt:
            raise
        except Exception:
            return "comm_error"

    def power_cycle_target(self, seconds: float) -> None:
        self._with_retry(self.dev.power_cycle_target, seconds)

    def close(self) -> None:
        if self._pyb is not None:
            try:
                self._pyb.close()
            except Exception:
                pass
        self.dev = None
        self._pyb = None


class FastDB:
    """Batched inserts on top of findus.Database."""

    def __init__(self, db: Database, commit_every: int):
        self.db = db
        self.commit_every = max(1, commit_every)
        self.pending = 0

    def begin(self) -> None:
        if self.db.nostore:
            return
        self.db.cur.execute("BEGIN")

    def insert(self, experiment_id: int, delay: int, length: int, color: str, response: bytes) -> None:
        if self.db.nostore:
            return
        if (experiment_id + self.db.base_row_count) == 0:
            s_argv = " ".join(self.db.argv[1:])
            self.db.cur.execute(
                "INSERT INTO metadata (stime_seconds,argv) VALUES (?,?)",
                [int(time.time()), s_argv],
            )

        values = [experiment_id + self.db.base_row_count, delay, length, color, response]
        self.db.cur.execute(
            "INSERT INTO experiments (id,delay,length,color,response) VALUES (?,?,?,?,?)",
            values,
        )
        self.pending += 1
        if self.pending >= self.commit_every:
            self.db.con.commit()
            self.pending = 0
            self.db.cur.execute("BEGIN")

    def commit(self) -> None:
        if self.db.nostore:
            return
        self.db.con.commit()
        self.pending = 0

    def rollback(self) -> None:
        if self.db.nostore:
            return
        try:
            self.db.con.rollback()
        except Exception:
            pass
        self.pending = 0


def state_to_color(state: str) -> str:
    if state == "success":
        return "G"
    if state == "fail":
        return "R"
    if state == "reset":
        return "M"
    if state == "timeout":
        return "Y"
    return "C"


def fmt_duration(seconds: float) -> str:
    seconds = max(0, int(seconds))
    h, r = divmod(seconds, 3600)
    m, s = divmod(r, 60)
    if h > 0:
        return f"{h}h{m:02d}m{s:02d}s"
    if m > 0:
        return f"{m}m{s:02d}s"
    return f"{s}s"


def print_status(prefix: str, done: int, total: int, counts: Counter, start_t: float) -> None:
    elapsed = max(1e-9, time.monotonic() - start_t)
    rate = done / elapsed
    rem = total - done
    eta_s = rem / rate if rate > 0 else 0
    print(
        f"{prefix} {done}/{total} ({(100.0 * done / total) if total else 0.0:6.2f}%) "
        f"rate={rate:6.1f}/s eta={fmt_duration(eta_s)} "
        f"ok={counts['success']} fail={counts['fail']} reset={counts['reset']} "
        f"timeout={counts['timeout']} noTrig={counts['no_trigger']} commErr={counts['comm_error']}",
        flush=True,
    )


def write_csv_row(writer, offset: int, width: int, trials_done: int, counts: Counter) -> None:
    success_rate = (counts["success"] / trials_done) if trials_done else 0.0
    writer.writerow(
        [
            offset,
            width,
            trials_done,
            counts["success"],
            counts["fail"],
            counts["reset"],
            counts["timeout"],
            counts["no_trigger"],
            counts["comm_error"],
            f"{success_rate:.4f}",
        ]
    )


def build_coordinate_list(args: argparse.Namespace) -> list[tuple[int, int]]:
    """Build the list of (offset, width) coordinates to sweep."""
    coords = []
    for offset in range(args.offset_start, args.offset_stop + 1, args.offset_step):
        for width in range(args.width_start, args.width_stop + 1, args.width_step):
            coords.append((offset, width))
    return coords


def run_coordinate(
    g: Glitcher,
    fast_db: FastDB,
    experiment_id: int,
    offset: int,
    width: int,
    trials: int,
    args: argparse.Namespace,
) -> tuple[int, Counter, int, bool, float]:
    """Run trials at a single (offset, width) coordinate.

    Returns (trials_done, counts, new_experiment_id, interrupted, start_time).
    """
    counts = Counter()
    done = 0
    interrupted = False
    consecutive_timeouts = 0
    start_t = time.monotonic()
    next_status_t = start_t + args.status_every_s

    fast_db.begin()

    for _ in range(trials):
        try:
            g.arm(offset=offset, width=width, level=args.level)

            trig = g.wait_and_glitch(timeout_ms=args.trigger_timeout_ms)
            if not trig:
                state = "no_trigger"
            else:
                state = g.read_marker_state(timeout_ms=args.classify_timeout_ms)

            counts[state] += 1
            fast_db.insert(
                experiment_id,
                offset,
                width,
                state_to_color(state),
                state.encode("utf-8"),
            )
            experiment_id += 1
            done += 1

            if done % args.status_every_trials == 0 or time.monotonic() >= next_status_t:
                print_status("[.]", done, trials, counts, start_t)
                next_status_t = time.monotonic() + args.status_every_s

            # Smart power cycling: only after consecutive timeouts
            if state in ("no_trigger", "timeout"):
                consecutive_timeouts += 1
                if consecutive_timeouts >= args.max_consecutive_timeout:
                    try:
                        g.power_cycle_target(args.power_cycle_s)
                        time.sleep(0.1)
                    except Exception as exc:
                        print(f"[!] power-cycle failed: {exc}", flush=True)
                        counts["comm_error"] += 1
                    consecutive_timeouts = 0
            else:
                consecutive_timeouts = 0

            # Early-stop: we confirmed this coordinate is glitchable
            if args.early_stop_n > 0 and counts["success"] >= args.early_stop_n:
                break

            time.sleep(args.cooldown_s)
        except KeyboardInterrupt:
            interrupted = True
            break
        except Exception as exc:
            counts["comm_error"] += 1
            fast_db.insert(
                experiment_id,
                offset,
                width,
                state_to_color("comm_error"),
                f"comm_error:{type(exc).__name__}".encode("utf-8"),
            )
            experiment_id += 1
            done += 1
            print(f"[!] comm error: {type(exc).__name__} (recovering)", flush=True)
            try:
                g.reconnect()
            except Exception as reconnect_exc:
                print(
                    f"[!] reconnect failed: {type(reconnect_exc).__name__}; stopping",
                    flush=True,
                )
                interrupted = True
                break
            time.sleep(args.error_backoff_s)

    if interrupted:
        print("[!] Interrupted by user during coordinate.", flush=True)
        fast_db.rollback()
    else:
        fast_db.commit()

    return done, counts, experiment_id, interrupted, start_t


def run_sweep(args: argparse.Namespace) -> int:
    print("[+] Starting sweep script...", flush=True)
    print(
        f"[i] demo.c glitch windows @ 24 MHz / ~41.7 ns per cycle:\n"
        f"    Window A (1st cmp):  ~8300-9500   (after trigger pulse)\n"
        f"    Window B (2nd cmp):  ~37500-39500 (after 700-nop gap)\n"
        f"    Window C (if(ok)):   ~39500-41500 (final check in main)",
        flush=True,
    )

    g = Glitcher(
        port=args.glitch_port,
        trigger_input=args.trigger_input,
        trigger_edge=args.trigger_edge,
        marker_success_pin=args.success_pin,
        marker_fail_pin=args.fail_pin,
        marker_reset_pin=args.reset_pin,
        marker_pull=args.marker_pull,
        glitch_mode=args.glitch_mode,
        serial_read_timeout_s=args.serial_read_timeout_s,
        pyboard_cmd_timeout_s=args.pyboard_cmd_timeout_ms / 1000.0,
        comm_retries=args.comm_retries,
    )

    print(f"[+] Connecting to Pico Glitcher on {args.glitch_port}...", end="", flush=True)
    g.connect()
    print(" Done.", flush=True)

    print(f"[+] Initializing database (resume={args.resume})...", end="", flush=True)
    db = Database(
        sys.argv,
        dbname=args.dbname,
        resume=args.resume,
        nostore=args.no_store,
        column_names=["delay", "length"],
    )
    fast_db = FastDB(db, commit_every=args.db_commit_every)
    print(f" Done. (Database: {db.dbname} [Fast Mode])", flush=True)

    experiment_id = 0
    interrupted = False
    hit_coords: list[tuple[int, int]] = []

    coords = build_coordinate_list(args)
    total_coords = len(coords)
    print(
        f"[+] Phase 1 (coarse): {total_coords} coordinates, "
        f"{args.trials} trials each (early-stop after {args.early_stop_n} successes)",
        flush=True,
    )

    print(f"[+] Opening CSV for results: {args.csv}", flush=True)
    csv_header = [
        "phase", "offset", "width", "trials", "success", "fail",
        "reset", "timeout", "no_trigger", "comm_error", "success_rate",
    ]

    with open(args.csv, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(csv_header)
        f.flush()

        try:
            # --- Phase 1: Coarse sweep ---
            for idx, (offset, width) in enumerate(coords):
                print(
                    f"[*] [{idx + 1}/{total_coords}] offset={offset:6d}ns width={width:4d}ns "
                    f"({args.trials} trials)",
                    flush=True,
                )

                done, counts, experiment_id, interrupted, coord_start_t = run_coordinate(
                    g, fast_db, experiment_id, offset, width, args.trials, args,
                )

                phase_label = "coarse"
                writer.writerow([
                    phase_label, offset, width, done,
                    counts["success"], counts["fail"], counts["reset"],
                    counts["timeout"], counts["no_trigger"], counts["comm_error"],
                    f"{(counts['success'] / done if done else 0):.4f}",
                ])
                f.flush()

                print_status("[=] Saved", done, args.trials, counts, coord_start_t)

                if counts["success"] > 0:
                    hit_coords.append((offset, width))
                    print(
                        f"[!] HIT at offset={offset}ns width={width}ns "
                        f"({counts['success']}/{done} = "
                        f"{100.0 * counts['success'] / done:.1f}%)",
                        flush=True,
                    )

                if interrupted:
                    break

            # --- Phase 2: Fine sweep around hits ---
            if hit_coords and not interrupted and args.fine_trials > 0:
                fine_coords = _build_fine_coords(hit_coords, args)
                print(
                    f"\n[+] Phase 2 (fine): {len(fine_coords)} coordinates around "
                    f"{len(hit_coords)} hits, {args.fine_trials} trials each",
                    flush=True,
                )

                for idx, (offset, width) in enumerate(fine_coords):
                    print(
                        f"[*] [fine {idx + 1}/{len(fine_coords)}] "
                        f"offset={offset:6d}ns width={width:4d}ns "
                        f"({args.fine_trials} trials)",
                        flush=True,
                    )

                    done, counts, experiment_id, interrupted, coord_start_t = run_coordinate(
                        g, fast_db, experiment_id, offset, width, args.fine_trials, args,
                    )

                    writer.writerow([
                        "fine", offset, width, done,
                        counts["success"], counts["fail"], counts["reset"],
                        counts["timeout"], counts["no_trigger"], counts["comm_error"],
                        f"{(counts['success'] / done if done else 0):.4f}",
                    ])
                    f.flush()

                    print_status("[=] Saved", done, args.fine_trials, counts, coord_start_t)

                    if counts["success"] > 0:
                        print(
                            f"[!] CONFIRMED at offset={offset}ns width={width}ns "
                            f"({counts['success']}/{done} = "
                            f"{100.0 * counts['success'] / done:.1f}%)",
                            flush=True,
                        )

                    if interrupted:
                        break
            elif hit_coords and args.fine_trials > 0:
                print("[i] Skipping Phase 2 (interrupted).", flush=True)

        finally:
            try:
                g.close()
            finally:
                db.close()

    print(f"\nSaved CSV: {args.csv}", flush=True)
    if hit_coords:
        print(f"[+] Total coarse hits: {len(hit_coords)}", flush=True)
        for o, w in hit_coords:
            print(f"    offset={o}ns width={w}ns", flush=True)
    else:
        print("[i] No successes found in coarse sweep.", flush=True)

    return 130 if interrupted else 0


def _build_fine_coords(
    hit_coords: list[tuple[int, int]],
    args: argparse.Namespace,
) -> list[tuple[int, int]]:
    """Expand hit coordinates into a fine grid around each hit."""
    seen = set()
    fine = []
    for base_offset, base_width in hit_coords:
        for d_off in range(-args.fine_offset_radius, args.fine_offset_radius + 1, args.fine_offset_step):
            for d_w in range(-args.fine_width_radius, args.fine_width_radius + 1, args.fine_width_step):
                o = base_offset + d_off
                w = base_width + d_w
                if o < 0 or w < 5:
                    continue
                key = (o, w)
                if key not in seen:
                    seen.add(key)
                    fine.append(key)
    fine.sort()
    return fine


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="CH32V003 demo.c auth-bypass glitch sweep (two-phase, GPIO markers).",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )

    hw = p.add_argument_group("hardware")
    hw.add_argument("--glitch-port", default="/dev/ttyACM0")
    hw.add_argument("--power-cycle-s", type=float, default=0.2)
    hw.add_argument("--glitch-mode", choices=("lp", "hp"), default="hp",
                     help="hp for stronger glitch (demo.c needs to overcome branch).")
    hw.add_argument("--trigger-input", choices=("default", "alt", "ext1", "ext2"), default="default")
    hw.add_argument("--trigger-edge", choices=("rising", "falling"), default="rising",
                     help="Rising = trigger pulse leading edge from demo.c PIN_TRIGGER.")
    hw.add_argument("--success-pin", type=int, default=20,
                     help="Pico GPIO reading CH32 PIN_SUCCESS (PC2).")
    hw.add_argument("--fail-pin", type=int, default=21,
                     help="Pico GPIO reading CH32 PIN_FAIL (PC4).")
    hw.add_argument("--reset-pin", type=int, default=None)
    hw.add_argument("--marker-pull", choices=("down", "up"), default="down")
    hw.add_argument("--level", type=int, default=1)

    coarse = p.add_argument_group("phase 1 (coarse sweep)")
    # Default offsets cover all three glitch windows in demo.c @ 24 MHz:
    #   Window A (~8300-9500ns):   first XOR comparison
    #   Window B (~37500-39500ns): second addition comparison
    #   Window C (~39500-41500ns): final AND / if(ok) in main
    coarse.add_argument("--offset-start", type=int, default=6000,
                        help="Start offset in ns (before Window A).")
    coarse.add_argument("--offset-stop", type=int, default=44000,
                        help="Stop offset in ns (past Window C).")
    coarse.add_argument("--offset-step", type=int, default=250,
                        help="Coarse offset step in ns (~6 cycles @ 24 MHz).")
    coarse.add_argument("--width-start", type=int, default=20,
                        help="Min glitch width in ns.")
    coarse.add_argument("--width-stop", type=int, default=200,
                        help="Max glitch width in ns.")
    coarse.add_argument("--width-step", type=int, default=20,
                        help="Coarse width step in ns.")
    coarse.add_argument("--trials", type=int, default=50,
                        help="Trials per coordinate in coarse pass.")

    fine = p.add_argument_group("phase 2 (fine sweep around hits)")
    fine.add_argument("--fine-trials", type=int, default=500,
                      help="Trials per coordinate in fine pass (0 to skip phase 2).")
    fine.add_argument("--fine-offset-radius", type=int, default=400,
                      help="Explore +/- this many ns around each hit offset.")
    fine.add_argument("--fine-offset-step", type=int, default=50,
                      help="Fine offset step in ns.")
    fine.add_argument("--fine-width-radius", type=int, default=40,
                      help="Explore +/- this many ns around each hit width.")
    fine.add_argument("--fine-width-step", type=int, default=10,
                      help="Fine width step in ns.")

    eff = p.add_argument_group("efficiency")
    eff.add_argument("--early-stop-n", type=int, default=3,
                     help="Stop a coordinate early after N successes (0 = disabled).")
    eff.add_argument("--max-consecutive-timeout", type=int, default=3,
                     help="Power-cycle target only after this many consecutive timeouts.")

    timing = p.add_argument_group("timing")
    timing.add_argument("--trigger-timeout-ms", type=int, default=200)
    timing.add_argument("--classify-timeout-ms", type=int, default=100)
    timing.add_argument("--cooldown-s", type=float, default=0.005,
                        help="Inter-trial cooldown (demo.c has 250k-cycle gap = ~5.2ms).")

    storage = p.add_argument_group("storage")
    storage.add_argument("--csv", default="ch32v003_glitch_sweep.csv")
    storage.add_argument("--dbname", default=None)
    storage.add_argument("--resume", action="store_true")
    storage.add_argument("--no-store", action="store_true")
    storage.add_argument("--db-commit-every", type=int, default=1000)

    comms = p.add_argument_group("communication")
    comms.add_argument("--serial-read-timeout-s", type=float, default=0.2)
    comms.add_argument("--pyboard-cmd-timeout-ms", type=int, default=500)
    comms.add_argument("--comm-retries", type=int, default=1)
    comms.add_argument("--error-backoff-s", type=float, default=0.05)

    ui = p.add_argument_group("UI")
    ui.add_argument("--status-every-s", type=float, default=2.0)
    ui.add_argument("--status-every-trials", type=int, default=200)

    return p.parse_args()


if __name__ == "__main__":
    raise SystemExit(run_sweep(parse_args()))
