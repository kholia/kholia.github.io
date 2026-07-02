---
title: "RF Power Converter"
description: "Convert between watts, dBm, dBW, voltage, and dBmV for common RF impedances."
date: 2026-07-02
showtoc: true
---

Convert between RF power and voltage levels. Choose an impedance, then enter
any one value; the remaining values update automatically in your browser.

{{< rf-power-converter >}}

## Conversion notes

The voltage conversions assume a sine wave across a purely resistive load.
The calculator uses RMS voltage as the link between power and voltage:

```text
P = Vrms² / R
Vpeak = Vrms × √2
Vpp = 2 × Vpeak
dBm = 10 × log₁₀(P / 1 mW)
dBmV = 20 × log₁₀(Vrms / 1 mV)
```

In RF systems, 50 Ω is the most common impedance. Cable television and video
systems commonly use 75 Ω, while 600 Ω is historically associated with
balanced audio and telecommunications circuits.

## Useful reference points

| dBm | Power |
|---:|---:|
| -30 dBm | 1 µW |
| -20 dBm | 10 µW |
| -10 dBm | 100 µW |
| 0 dBm | 1 mW |
| 10 dBm | 10 mW |
| 20 dBm | 100 mW |
| 30 dBm | 1 W |
| 40 dBm | 10 W |

Adding 3 dB approximately doubles power; adding 10 dB multiplies power by ten.
