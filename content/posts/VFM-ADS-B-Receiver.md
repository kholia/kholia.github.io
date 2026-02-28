---
title: A VFM ADS-B receiver
date: 2026-01-12
tags:
- RF Hacking
- RF
- ADSB
- ADS-B
- UHF
- UHF receiver
- Radio Architecture
- Ideas
- Ismo
- RP2350
- OH2FTG
---

## Idea

Ismo recently shared the https://github.com/CoolNamesAllTaken/adsbee project which is pretty cool.

## Challenges

The ADS-B (Automatic Dependent Surveillance-Broadcast) system uses a data rate of 1 Mbit/s (1 megabit per second) for its aircraft position and identification transmissions on the 1090 MHz frequency. This is too much for HOPERF CMT2300A and related transceiver chips unfortunately!

This got us thinking about the following VFM ADS-B RX chain.

## Architecture

Here is a simple ADS-B RX circuit description.

Antenna (a simple dipole / ground-plane antenna / PCB antenna) ➔ Zeenko LNA ➔ ADS-B Bandpass SAW Filter ➔ 100 pF (DC block) ➔ (Optional digitally controlled RF attenuator for AGC loop) ➔ Fast Schottky detector diode (BAT68 SOT-23) ➔ RC filter (10 kΩ, 10-33 pF) ➔ MCP6567 SOIC-8 comparator with output pull-up ➔ MCU GPIO (RP2350 PIO controlled).

Once this design is proven to work, all components can be put on a single PCB for further cost optimization.

## References

- https://github.com/CoolNamesAllTaken/adsbee
