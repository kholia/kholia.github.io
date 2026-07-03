---
title: WSPR Beacon Ideas for UHF
date: 2026-07-03
tags:
- WSPR
- Beacon
- 70cm
- 440 MHz
- Amplifier
- Ideas
- RF Hacking
- Amateur Radio
- Ismo
---

This is an early design sketch of a UHF (70cm - 440 MHz) WSPR beacon.

This design comes from Ismo (OH2FTG).

## Key Points

- 10 MHz OCXO TCXO powering the Si5351 module instead of the usual 25 or 26 MHz 0.5 ppm TCXO.

- Si5351 generates 217 MHz output, which we double to ~434Mhz using the
  https://techlib.com/files/diodedbl.pdf technique.

- Use 440 MHz SAW filter at the output (from LCSC)

- ONSEMI MMBD701LT1G RF Schottky diodes - locally available

- Modulation is continuous phase 4-FSK, with 1.4648 Hz tone separation.

  Since tone separation will also double with the above circuit, we have to
  make appropriate changes in the base stage (Si5351).

- INNOTION YG602020 gain block into ATTN and then into INNOTION YG401530VB
  driver block.

- Use Mitsubishi RD15HVF1-501 MOSFET as finals

- Easy and more than 1W RF output?

## Status

Results: To be built and tested soon!

## Resources

- https://www.qsl.net/va3iul/Frequency_Multipliers/Frequency_Multipliers.pdf
