---
title: "The easiest and best WSPR + FT8 decoder?"
date: 2026-08-22
tags:
- WSPR
- Airspy
- HF+ Discovery
- Raspberry Pi
- SDR
- ESP32
- Si5351
---

Could a serious WSPR station need only one small program and one memorable
command?

I built this especially for my friend Brad, K1TE. We both believe in practical
P2P, point-to-point radio contacts, and we are working toward making them
reliable across the breadth of planet Earth.

[`airspyhf-wsprd`](https://github.com/kholia/airspyhf-wsprd) is a dedicated
receiver for the Airspy HF+ Discovery. It tunes, aligns to the WSPR boundary,
decodes, reports to WSPRnet, and repeats:

```bash
./airspyhf-wsprd -b 20m -c VU3CER -g MK68xm
```

No dial-frequency memorization, GUI, virtual audio cable, or Fortran runtime.

![Loopback Demo](/images/Loopback-WSPR-demo-1.png)

## Install

On Debian, Ubuntu, or Raspberry Pi OS:

```bash
curl -fsSL https://raw.githubusercontent.com/kholia/airspyhf-wsprd/master/install.sh | sudo bash
```

The installer confirms the callsign and grid, builds and tests the software,
enables automatic WSPRnet reporting, and installs a self-restarting systemd
service. If `libairspyhf-dev` is unavailable, install the official
[`airspyhf`](https://github.com/airspy/airspyhf) package from source.

For antenna and broader station notes, see my
[headless WSPR monitoring system]({{< relref "Headless-WSPR-Monitoring-System.md" >}})
and [PA0FRI active antenna]({{< relref "Active-Antenna-PA0FRI-2026.md" >}})
articles.

## Why it might be the best

- The decoder tracks the upstream
  [`wsprd`](https://github.com/kholia/wsprd/tree/main) core.
- Strict `-O3` builds retain safe floating-point behavior.
- The 192 ksample/s default becomes the same filtered 375 sample/s decoder
  input as higher rates, with one quarter of the USB and host load of 768k.
- A 32-block RAM queue and dedicated DSP worker keep processing away from the
  Airspy callback.
- WSPRnet uploads are asynchronous and retry from a bounded RAM queue.
- Clock health, callsigns, grids, HTTP replies, and decoder deadlines are
  checked.
- The systemd service keeps decoder state and bounded logs in RAM, avoiding
  microSD writes during reception.

A Raspberry Pi 4 or newer is recommended. The load is small, so no powered USB
hub is needed.

## Tested with real RF

The bundled recording must produce all nine expected spots:

```bash
make test-wav
```

A second test uses an ESP32-S3-Zero and Si5351 with a 25 MHz TCXO. The generator
stays silent until the host sends `*tx*` at an even UTC boundary:

```bash
make esp32-flash PORT=/dev/cu.usbmodemXXXX
make test-hw PORT=/dev/cu.usbmodemXXXX
```

The complete ESP32 to Si5351 to Airspy to decoder path worked:

```text
Spot : 40.00 -2.00  14.097088  0  VU3CER MK68 10
Spot : 23.00 -1.00  14.097088  0  VU3CER MK68 10
```

```
user@rpi:~ $ sudo journalctl -u airspyhf-wsprd -b -o cat
Starting airspyhf-wsprd.service - Airspy HF+ WSPR receiver and reporter...
HF+ sample rates: 768000 384000 256000 192000 Hz
Starting airspyhf-wsprd (2026-08-22, 08:19z) - Version 0.5
  Callsign     : VU3CER
  Locator      : MK68xm
  Band         : 20m
  Dial freq.   : 14095600 Hz
  IQ center    : 14097100 Hz
  Rate         : 192000 Hz
  Decimation   : 512
  HF AGC       : yes
  AGC threshold: high
  Attenuation  : 0 dB (ignored while AGC is enabled)
  Preamp       : no
  WSPRnet      : upload enabled
  S/N          : <something>
Wait for time sync (start in 56 sec)
Clock is not synchronized; WSPR capture is paused
Started airspyhf-wsprd.service - Airspy HF+ WSPR receiver and reporter.
Clock synchronized; WSPR capture resumed
No spot [2026-08-22 08:24 UTC]
No spot [2026-08-22 08:26 UTC]
No spot [2026-08-22 08:28 UTC]
Spot : -25.00 0.20  14.097021  0  VU2ITI MK80 23
Spot : -24.00 0.20  14.097021  0  <VU2ITI> MK80EB 23
No spot [2026-08-22 08:34 UTC]
No spot [2026-08-22 08:36 UTC]
No spot [2026-08-22 08:38 UTC]
```

![On-air WSPR demo](/images/WSPR-RX-demo-1.png)

```
$ curl http://rpi.local:8080/health
{
  "healthy": true,
  "receiver_state": "capturing",
  "mode": "FT8",
  "clock_synchronized": true,
  "decoder_busy": true,
  "callsign": "VU3CER",
  "grid": "MK68",
  "band": "40m",
  "dial_frequency_hz": 7074000,
  "band_hopping": true,
  "hop_interval_seconds": 120,
  "adaptive_hopping": true,
  "selected_bands": ["20m", "15m", "17m", "40m"],
  "exploration_slot": false,
  "reporting_enabled": true,
  "reporting_network": "PSK Reporter",
  "report_queue_depth": 21,
  "frames_decoded": 13,
  "spots_decoded": 34,
  "decoder_errors": 0,
  "last_decodes_ft8lib": 0,
  "last_decodes_jt9": 0,
  "total_decodes_ft8lib": 16,
  "total_decodes_jt9": 33,
  "frames_decoded_ft8lib": 13,
  "frames_decoded_jt9": 13,
  "average_decodes_ft8lib": 1.23,
  "average_decodes_jt9": 2.54,
  "airspy_overrun_samples": 0,
  "dsp_queue_overrun_samples": 0,
  "started_unix": 1787416848,
  "uptime_seconds": 222,
  "last_decode_unix": 1787417059,
  "last_spot_unix": 1787417046,
  "version": "0.9"
}
```

![On-air FT8 demo](/images/WSPR-RX-demo-2.png)

For an Airspy HF+ owner wanting a reliable headless WSPR (plus FT8) receiver,
this may be the easiest and best option yet.
