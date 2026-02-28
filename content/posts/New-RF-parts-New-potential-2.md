---
title: "New RF parts and new promises - part 2"
date: 2025-06-15
tags:
- RF Hacking
- HAM
- Amateur Radio
- WSPR
- 1W
- 5W
- Amplifier
- RF Amplifier
---

`Tokmas CID9N65E3` rocks!

## Performance

It is CRAZY how efficient this GaN FET is in TO-252 (DPAK) package. It generates 5W @ 28 MHz with 13.8V at drain without even warming up! Close to 4W @ 50 MHz with 12.0V at drain. 5W+ @ 50 MHz with 13.8V at drain. 11W+ @ 50 MHz with 20V at drain.

It even produces ~3W at 70 MHz with 13V at drain - w00t!

![Thermal testing](/images/FLIR_20250616_041115_567.jpg)

Less than 39 degrees!

## Datasheet

Datasheet excerpt:

![New hotness 2](/images/Tokmas-CID9N65E3-1.png)

The full datasheet is available [here](https://lcsc.com/datasheet/lcsc_datasheet_2411261515_Tokmas-CID9N65E3_C22446729.pdf).

## Implementation

Here is the 3D render for a PCB I made for testing this part:

![GaN FET Test PCB](/images/GaN-Test-PCB-7.png)

The PCB design is available at [HF-PA-v10](https://github.com/kholia/HF-PA-v10/tree/master/GSD-Hacks-v4-SMD) (non-commercial use only).

Here is what the hand-assembled PCB looks like:

![Real Pic 1](/images/Old-RF-Amp-Hand-Assembled-1.jpg)

Here is what the latest (`GSD-Hacks-v5`) factory assembled PCB looks like:

![Real Pic 2](/images/Tokmas-FET-and-Driver.jpg)

## Updates

Update: I guess there is NO reason to consider [Toshiba 2SK3476](https://lcsc.com/datasheet/lcsc_datasheet_2410121910_TOSHIBA-2SK3476-TE12L-Q_C224377.pdf) (which actually is NRND now) these days.

Update 2: This Tokmas DPAK GaN part is pretty competitive even when compared to NXP DPAK GaN parts!

![NXP DPAK GaN FET](/images/NXP-GaN-DPAK.png)

NB: Our 'workhorse' gate driver for this and the recent experiments has been the Onsemi's NCP81074ADR2G in the friendly SOIC-8 package.

NB 2: For 'extra' cooling, we are successfully using a small NVMe heatsink along with a thermal pad for insulation and heat transfer.

![NVMe heatsink](/images/NVMe-Cooling.png)
