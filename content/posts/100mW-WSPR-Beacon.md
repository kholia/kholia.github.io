---
title: "100mW WSPR Beacon (2025)"
date: 2025-02-14
tags:
- WSPR
- FT8
- Beacon
- 100mW
- Pico 2
- Amplifier
- Pico
- RF Hacking
- Amateur Radio
---

I have built what is probably the easiest, reasonably rugged, and most
cost-effective 100mW WSPR (or FT8) beacon.

![100mW WSPR Beacon](/images/Pico-100mW-Direct-RF.png)

## The Build

Here is my quick and dirty build with whatever I had lying around:

![Quick-N-Dirty Build](/images/Quick-Dirty-100mW.jpg)

We replaced the traditional expensive Mini-Circuits transformer with a
cost-effective Bourns coupled inductor.

## Analysis

Power consumption: Before RF generation starts ➔ 20mA @ 5V. After RF generation
starts ➔ 52mA @ 5V. So the input power consumed in the RF generation process is
more than 150mW (which is good).

## Theory

The first law of thermodynamics states that the total energy of an isolated
system is constant: energy can neither be created nor destroyed, only
transformed from one form to another. We do not want to break it ;)

## Results

Results: 6.6 Vpp sine-ish wave on the scope @ 28 MHz!

## Cost

Cost: Around 600 INR. This can be easily reduced to 300 INR by using `Adiy LuatOS RP2040 board`! Beat this ;)

## Software

Time to build: Less than 15 minutes

Software link: You can use [pico-WSPR-tx](https://github.com/RPiks/pico-WSPR-tx) or [Pico-FT8-TX](https://github.com/kholia/Pico-FT8-TX).
