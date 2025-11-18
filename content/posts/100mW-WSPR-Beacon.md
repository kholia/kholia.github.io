---
title: "100mW WSPR beacon (2025)"
date: 2025-02-14
tags:
- RF Hacking
- HAM
- Amateur Radio
- WSPR
- 100mW
- Amplifier
- Pico
- Pico 2
---

I have built probably the easiest, reasonably rugged and most cost-effective 100mW WSPR (or FT8) beacon.

![100mW WSPR Beacon](/images/Pico-100mW-Direct-RF.png)

Here is my quick and dirty build with whatever I had lying around:

![Quick-N-Dirty Build](/images/Quick-Dirty-100mW.jpg)

We have replaced the traditional expensive Mini-Circuits transformer with a cost-effective Bourns coupled inductor.

Power consumption: Before RF generation starts -> 20mA @ 5v. After RF generation starts -> 52mA @ 5v. So the power input consumed in the RF generation process is more than 150mW it seems (which is good).

First law of thermodynamics states that total energy of an isolated system is constant, energy can neither be created nor be destroyed but can be transformed from one form to another. We do not want to break it ;)

Results: 6.6 Vpp sine'ish wave on the scope @ 28 MHz!

Cost: Around 600 INR. This can be easily reduced to 300 INR by using `Adiy LuatOS RP2040 board`! Beat this ;)

Time to build: Less than 15 minutes

Software link: You can use [pico-WSPR-tx](https://github.com/RPiks/pico-WSPR-tx) or [Pico-FT8-TX](https://github.com/kholia/Pico-FT8-TX).
