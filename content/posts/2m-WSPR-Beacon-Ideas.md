---
title: Ideas for a 2m (144 MHz) WSPR / FT8 beacon
date: 2025-04-15
tags:
- WSPR
- FT8
- Beacon
- 2m
- Amplifier
- Ideas
- RF Hacking
- Amateur Radio
---

This is an early design sketch of a 2m WSPR beacon.

## Key Points

- 25 MHz HCI 0.5ppm TCXO powering the Si5351 module instead of the 26 MHz TCXO.
  If this fails, we can use a 10 MHz OCXO instead (a bit out of spec but works fine).
- Tokmas CID10N65F GaN FET might work @ 144 MHz as the 'final'. If not, use Mitsubishi RD15HVF1-501 MOSFET as backup.
- 2SK3475 as the driver with variable DC bias at the gate
- The whole VCC to this amplifier will be PTT switched
- Ideally, we would want to keep the driver stage linear but the final stage as switched (Class C/D)
  Alternate: Perhaps by DC coupling the Si5351 input to 2SK3475, we can avoid the need for DC gate bias
- The "RFC" (bifilar coil still needed?) part will need to be figured out for VHF!

## Status

Results: To be built and tested soon!

**Update:** There appears to be no 2m "SSB / FT8 / WSPR" traffic in India.

**Update 2:** See [RFZero PA 50 MHz](https://rfzero.net/documentation/third-party-solutions/pa-50-mhz-aft05ms031n/) for inspiration!
