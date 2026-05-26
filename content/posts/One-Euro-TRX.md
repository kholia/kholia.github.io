---
title: "1€ TRX - One Euro TRX"
date: 2026-06-28
draft: false
tags:
- OH2FTG
- Challenge
- HF
- RF Hacking
- Amateur Radio
---

I learned about the `Sub-1€ TRX` challenge from Ismo (OH2FTG) - thank you
(maybe for getting me addicted?).

## The constraints

- Sub-1€ TRX, with LCSC parts.

- This excludes the PCB, so it can be 10x10 2-layer or 5x5 4-layer.

## My Design

- `WIRELESS WL4456` (TX) and `WIRELESS WL550` (RX) pair - 17 cents

- T/R switch: TECH PUBLIC TPAS169-73LF - 16 cents

- 13.56 MHz crystals (HY13560M49SBSMDOB1R30 / 8DSC135G0012L) - 5 cents * 2

- MCU: PY32F002AL15S6TU SOP-8 from Puya - ~11 cents

- Misc: Active Buzzer, Morse Key, Push buttons, Jellybean passives - In the remaining budget

- Use (visual) LED instead of the buzzer - Stealth and saves more cents - Just like in Raazi movie :D

- Monopole wire antenna is enough?

- Use phone for supplying 5V power via USB

- Who needs a PCB? ;)

## Further savings

- WIRELESS WL2800 - 2.4 GHz transceiver chip - 11 cents!

## Future ideas (for expanded budgets)

- Use `CH552G SOP-16` for connectivity with Android phone (CW keyer,
  Auto-Decoding, etc)

- Use INNOTION MMICs for ~1W output :=)

## Cost

We have a UHF TRX design in under a Dollar / Euro ;)

## Time to build

Less than 30 minutes

## Resources

- https://github.com/cnlohr/lolra

- https://www.lcsc.com/

- https://lkeng.org/2024/07/19/433-mhz-temperature-humidity-transmitter/

- https://github.com/SP8ESA/SX1280_QO100_SSB_TX (Inspiring)
 
  `EBYTE E28-2G4M27SX 2.4GHz SX1281` should also work?
