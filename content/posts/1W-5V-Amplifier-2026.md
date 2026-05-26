---
title: "Generating 1W RF from 5V"
date: 2026-06-27
tags:
- RF Amplifier
- HF
- Shortwave
- Beacon
- 1W
- 5V
- Amplifier
- RF Hacking
- Amateur Radio
- GaN
---

## The constraints

- 5V (~500mA) power from phone
- 1W RF output required
- Very compact with less "moving" parts
- 14 MHz capable

## The design

We purposefully utilize "high Rds" EPC GaN parts with very low Qgs.

![1W RF amplifier](/images/1W-GaN-Phone-Power.png)

## Simulation Results

Power consumption: Around 300mA @ 5V.

```
pout: AVG(v(out)*i(r3))=1.0606 FROM 5e-05 TO 0.0001

pin: AVG(-5*i(v3))=1.38209 FROM 5e-05 TO 0.0001

isupply: AVG(-i(v3))=0.276418 FROM 5e-05 TO 0.0001

eff: pout/pin*100=76.7393
```

## Cost

Cost: < 500 INR.

## Time to build

This will require factory assembly ;)

## Bonus

```python
#!/usr/bin/env python3
"""
lmatch.py - L-network impedance matching calculator.

Examples:
  ./lmatch.py 14e6 12.5 50
  ./lmatch.py 14 12.5 50 --freq-unit MHz --series E24 --ltspice
"""

import argparse
import math
from dataclasses import dataclass

E_SERIES = {
    "E6":  [10, 15, 22, 33, 47, 68],
    "E12": [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82],
    "E24": [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30,
            33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91],
    "E48": [100,105,110,115,121,127,133,140,147,154,162,169,
            178,187,196,205,215,226,237,249,261,274,287,301,
            316,332,348,365,383,402,422,442,464,487,511,536,
            562,590,619,649,681,715,750,787,825,866,909,953],
    "E96": [100,102,105,107,110,113,115,118,121,124,127,130,
            133,137,140,143,147,150,154,158,162,165,169,174,
            178,182,187,191,196,200,205,210,215,221,226,232,
            237,243,249,255,261,267,274,280,287,294,301,309,
            316,324,332,340,348,357,365,374,383,392,402,412,
            422,432,442,453,464,475,487,499,511,523,536,549,
            562,576,590,604,619,634,649,665,681,698,715,732,
            750,768,787,806,825,845,866,887,909,931,953,976],
}

@dataclass
class Part:
    kind: str
    value: float
    x_ohms: float

def nearest_preferred(value: float, series: str) -> float:
    if value <= 0:
        raise ValueError("value must be positive")
    series = series.upper()
    vals = E_SERIES[series]
    decade = 10 ** math.floor(math.log10(value))
    candidates = []
    for d in (decade / 10, decade, decade * 10):
        for v in vals:
            base = v / 10 if series in ("E6", "E12", "E24") else v / 100
            candidates.append(base * d)
    return min(candidates, key=lambda x: abs(math.log(x / value)))

def fmt_value(kind: str, value: float) -> str:
    if kind == "L":
        if value < 1e-6:
            return f"{value*1e9:.3g} nH"
        if value < 1e-3:
            return f"{value*1e6:.3g} uH"
        return f"{value*1e3:.3g} mH"
    if value < 1e-9:
        return f"{value*1e12:.3g} pF"
    if value < 1e-6:
        return f"{value*1e9:.3g} nF"
    return f"{value*1e6:.3g} uF"

def spice_value(kind: str, value: float) -> str:
    if kind == "L":
        if value < 1e-6:
            return f"{value*1e9:.6g}n"
        if value < 1e-3:
            return f"{value*1e6:.6g}u"
        return f"{value*1e3:.6g}m"
    if value < 1e-9:
        return f"{value*1e12:.6g}p"
    if value < 1e-6:
        return f"{value*1e9:.6g}n"
    return f"{value*1e6:.6g}u"

def lmatch(rs: float, rl: float, freq_hz: float):
    if rs <= 0 or rl <= 0 or freq_hz <= 0:
        raise ValueError("rs, rl, and frequency must be positive")
    if math.isclose(rs, rl):
        return []

    w = 2 * math.pi * freq_hz
    r_low = min(rs, rl)
    r_high = max(rs, rl)
    q = math.sqrt(r_high / r_low - 1)
    xs = q * r_low
    xp = r_high / q

    def cap(x): return 1 / (w * x)
    def ind(x): return x / w

    if rl > rs:
        placement = "series first, shunt across load side"
    else:
        placement = "shunt across source side, then series"

    return [
        {"name": "Low-pass", "placement": placement, "q": q,
         "series": Part("L", ind(xs), xs), "shunt": Part("C", cap(xp), -xp)},
        {"name": "High-pass", "placement": placement, "q": q,
         "series": Part("C", cap(xs), -xs), "shunt": Part("L", ind(xp), xp)},
    ]

def freq_to_hz(freq: float, unit: str) -> float:
    return freq * {"Hz": 1, "kHz": 1e3, "MHz": 1e6, "GHz": 1e9}[unit]

def print_match(m, series_name, rounded, ltspice):
    print(f"{m['name']}")
    print("-" * len(m["name"]))
    print(f"Placement : {m['placement']}")
    print(f"Q         : {m['q']:.4g}")

    for label in ("series", "shunt"):
        p = m[label]
        shown = nearest_preferred(p.value, series_name) if rounded else p.value
        arrow = f" -> {fmt_value(p.kind, shown)} ({series_name.upper()})" if rounded else ""
        print(f"{label.capitalize():9}: {p.kind} {fmt_value(p.kind, p.value)}{arrow}   X = {p.x_ohms:+.3g} ohm")

    if ltspice:
        s = m["series"]
        p = m["shunt"]
        sv = nearest_preferred(s.value, series_name) if rounded else s.value
        pv = nearest_preferred(p.value, series_name) if rounded else p.value
        print("\nLTspice fragment:")
        print(f"{s.kind}1 in out {spice_value(s.kind, sv)}")
        print(f"{p.kind}2 out 0 {spice_value(p.kind, pv)}")
    print()

def main():
    parser = argparse.ArgumentParser(description="LC L-match calculator with preferred-value rounding.")
    parser.add_argument("frequency", type=float, help="Frequency, default unit Hz")
    parser.add_argument("rs", type=float, help="Source resistance in ohms")
    parser.add_argument("rl", type=float, help="Load resistance in ohms")
    parser.add_argument("--freq-unit", choices=["Hz", "kHz", "MHz", "GHz"], default="Hz")
    parser.add_argument("--series", choices=sorted(E_SERIES), default="E24",
                        help="Preferred value series for rounding")
    parser.add_argument("--exact", action="store_true", help="Do not round to preferred values")
    parser.add_argument("--ltspice", action="store_true", help="Print LTspice netlist fragments")
    args = parser.parse_args()

    f = freq_to_hz(args.frequency, args.freq_unit)
    matches = lmatch(args.rs, args.rl, f)

    print(f"Matching {args.rs:g} ohm -> {args.rl:g} ohm @ {f/1e6:.6g} MHz\n")
    if not matches:
        print("Source and load are already equal; no L-match needed.")
        return

    for m in matches:
        print_match(m, args.series, not args.exact, args.ltspice)

if __name__ == "__main__":
    main()
```

```
% python3 ./lmatch.py 14 15 50 --freq-unit MHz --series E24 --ltspice
Matching 15 ohm -> 50 ohm @ 14 MHz

Low-pass
--------
Placement : series first, shunt across load side
Q         : 1.528
Series   : L 260 nH -> 270 nH (E24)   X = +22.9 ohm
Shunt    : C 347 pF -> 360 pF (E24)   X = -32.7 ohm

LTspice fragment:
L1 in out 270n
C2 out 0 360p

High-pass
---------
Placement : series first, shunt across load side
Q         : 1.528
Series   : C 496 pF -> 510 pF (E24)   X = -22.9 ohm
Shunt    : L 372 nH -> 360 nH (E24)   X = +32.7 ohm

LTspice fragment:
C1 in out 510p
L2 out 0 360n
```

## References

- [The DDX-UNO HF transceiver design]({{< relref "ddx-uno-radio-you-actually-carry.md" >}})

- https://leleivre.com/rf_lcmatch.html
