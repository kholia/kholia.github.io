---
title: Ideas for a 2m (144 MHz) WSPR / FT8 beacon
date: 2025-04-15
tags:
- Ideas
- Idea
- RF Hacking
- HAM
- Amateur Radio
- WSPR
- Amplifier
- 2m
- WSPR
- FT8
---

I am posting an early design sketch of a 2m WSPR beacon.

Here are the key points:

- 25 MHz HCI 0.5ppm TCXO powering the Si5351 module instead of the 26 MHz TCXO.

  If this fails, we can use a 10 MHz OCXO instead (a bit out of spec but works fine).

- Tokmas CID10N65F GaN FET might work @ 144 MHz as the 'final'. If not, use Mitsubishi RD15HVF1-501 MOSFET as backup.

- 2SK3475 as the driver with variable DC bias at the gate

- The whole VCC to this amplifier will be PTT switched

- Ideally, we would want to keep the driver stage linear but the final stage as switched (Class C/D)

  Alternate: Perhaps by DC coupling the Si5351 input to 2SK3475, we can avoid the need for DC gate bias

- The "RFC" (bifilar coil still needed?) part will need to be figured out for VHF!

Results: To be built and tested soon!

Update: There is NO 2m "SSB / FT8 / WSPR" traffic in India it seems.

Update 2: See https://rfzero.net/documentation/third-party-solutions/pa-50-mhz-aft05ms031n/ for inspiration!
