---
title: A VFM ADS-B Receiver
date: 2026-01-12
tags:
- ADS-B
- UHF
- LNA
- Ismo
- RP2350
- OH2FTG
- Radio Architecture
- RF Hacking
- RF
- Ideas
---

## Idea

Ismo recently shared the https://github.com/CoolNamesAllTaken/adsbee project,
which is very interesting.

## Challenges

The ADS-B (Automatic Dependent Surveillance-Broadcast) system uses a data rate
of 1 Mbit/s (1 megabit per second) for aircraft position and identification
transmissions on 1090 MHz. Unfortunately, this is too fast for HOPERF CMT2300A
and related transceiver chips.

This led us to consider the following VFM ADS-B RX chain.

## Architecture

Here is a simple ADS-B receiver chain.

Antenna (a simple dipole / ground-plane antenna / PCB antenna) ➔ Zeenko LNA ➔ ADS-B Bandpass SAW Filter ➔ 100 pF (DC block) ➔ (Optional digitally controlled RF attenuator for AGC loop) ➔ Fast Schottky detector diode (BAT68 SOT-23) ➔ RC filter (10 kΩ, 10-33 pF) ➔ MCP6567 SOIC-8 comparator with output pull-up ➔ MCU GPIO (RP2350 PIO controlled).

Once this design is proven, all components can be integrated on a single PCB
for further cost optimization.

## References

- https://github.com/CoolNamesAllTaken/adsbee
