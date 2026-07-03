#!/usr/bin/env python3
"""Match one WAV file's integrated loudness to a reference WAV file."""

from __future__ import annotations

import argparse
import json
import math
import re
import shutil
import subprocess
import sys
from pathlib import Path


LOUDNESS_JSON = re.compile(r"\{\s*\"input_i\".*?\}", re.DOTALL)


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, text=True, capture_output=True, check=False)


def measure(path: Path, ffmpeg: str) -> dict[str, float]:
    result = run(
        [
            ffmpeg,
            "-hide_banner",
            "-nostats",
            "-i",
            str(path),
            "-af",
            "loudnorm=I=-24:LRA=7:TP=-1:print_format=json",
            "-f",
            "null",
            "-",
        ]
    )
    match = LOUDNESS_JSON.search(result.stderr)
    if result.returncode != 0 or not match:
        detail = result.stderr.strip().splitlines()[-1] if result.stderr.strip() else "unknown error"
        raise RuntimeError(f"Could not measure {path}: {detail}")

    raw = json.loads(match.group())
    values = {key: float(raw[key]) for key in ("input_i", "input_tp")}
    if not math.isfinite(values["input_i"]):
        raise RuntimeError(f"Could not measure {path}: the file is silent or too short")
    return values


def audio_codec(path: Path, ffprobe: str) -> str:
    result = run(
        [
            ffprobe,
            "-v",
            "error",
            "-select_streams",
            "a:0",
            "-show_entries",
            "stream=codec_name",
            "-of",
            "json",
            str(path),
        ]
    )
    if result.returncode != 0:
        raise RuntimeError(f"Could not inspect {path}")

    streams = json.loads(result.stdout).get("streams", [])
    if not streams:
        raise RuntimeError(f"No audio stream found in {path}")

    codec = streams[0].get("codec_name", "")
    # Preserve PCM bit depth/sample representation. Decode other WAV codecs to PCM16.
    return codec if codec.startswith("pcm_") else "pcm_s16le"


def default_output(target: Path) -> Path:
    return target.with_name(f"{target.stem}-normalized.wav")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Match TARGET.wav's integrated LUFS to REFERENCE.wav."
    )
    parser.add_argument("target", type=Path, help="WAV file whose volume will be adjusted")
    parser.add_argument("reference", type=Path, help="WAV file whose loudness will be matched")
    parser.add_argument("-o", "--output", type=Path, help="output WAV path")
    parser.add_argument("-f", "--force", action="store_true", help="overwrite an existing output")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    target = args.target.expanduser().resolve()
    reference = args.reference.expanduser().resolve()
    output = (args.output or default_output(target)).expanduser().resolve()

    for path in (target, reference):
        if not path.is_file():
            raise RuntimeError(f"File not found: {path}")
        if path.suffix.lower() != ".wav":
            raise RuntimeError(f"Expected a WAV file: {path}")

    if output in (target, reference):
        raise RuntimeError("Output must not overwrite either input file")
    if output.exists() and not args.force:
        raise RuntimeError(f"Output already exists: {output} (use --force to replace it)")
    output.parent.mkdir(parents=True, exist_ok=True)

    ffmpeg = shutil.which("ffmpeg")
    ffprobe = shutil.which("ffprobe")
    if not ffmpeg or not ffprobe:
        raise RuntimeError("ffmpeg and ffprobe must be installed and available on PATH")

    target_stats = measure(target, ffmpeg)
    reference_stats = measure(reference, ffmpeg)
    gain_db = reference_stats["input_i"] - target_stats["input_i"]
    predicted_peak = target_stats["input_tp"] + gain_db

    if predicted_peak > 0:
        print(
            f"warning: matching loudness may clip (predicted true peak {predicted_peak:+.2f} dBTP)",
            file=sys.stderr,
        )

    command = [ffmpeg, "-hide_banner", "-loglevel", "error"]
    command.append("-y" if args.force else "-n")
    command += [
        "-i",
        str(target),
        "-map",
        "0:a:0",
        "-af",
        f"volume={gain_db:.6f}dB",
        "-c:a",
        audio_codec(target, ffprobe),
        str(output),
    ]
    result = run(command)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "ffmpeg failed")

    result_stats = measure(output, ffmpeg)
    print(f"Target:    {target_stats['input_i']:.2f} LUFS")
    print(f"Reference: {reference_stats['input_i']:.2f} LUFS")
    print(f"Gain:      {gain_db:+.2f} dB")
    print(f"Result:    {result_stats['input_i']:.2f} LUFS")
    print(f"Written:   {output}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, OSError, json.JSONDecodeError) as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
