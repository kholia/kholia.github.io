---
title: "Baby-QRO RF switching amplifier"
date: 2025-01-31
tags:
- RF Hacking
- RF
- Amplifier
- QRO
- HAM
- Amateur Radio
- RF Amplifier
- 100W
- HF
- Shortwave
- Baby-QRO
---

Sometimes we all need a bit of QRO - Life's too short for QRP sometimes. So we give you the Baby-QRO switching amplifier!

This Baby-QRO switching RF amplifier design is inspired by the wonderful [Single NXP MRF-101 Eval Board](https://sites.google.com/site/rfpowertools/rf-power-tools) project by Jim Veatch. Thank you Jim!

Instead of using the expensive MRF101 MOSFET, we use fast SiC MOSFET(s) from Wolfspeed / SUPSiC.

## Design

3D render:

![Baby-QRO amplifier render](/images/Baby-QRO-Amplifier.png)

Actual picture:

![Baby-QRO amplifier picture](/images/Baby-QRO-Build.jpg)

Schematic:

![Baby-QRO amplifier schematic](/images/Baby-QRO-Amplifier-Schematic.png)

## Results

This PCB was tested in late January-2025 and it works great. It produces 100W+ at 50V drain on 7 MHz. The gain drops with increasing frequency but not too badly!

|Settings              | 7 MHz | 14 MHz | 28 MHz |
|---|---|---|---|
|9V driver, 43V drain  | ~70W  | ~60W   | 30W    |
|12V driver, 43V drain | ~70W  | -      | -      |
|12V driver, 48V drain | 100W  | -      | 60W    |

Efficiency (of the final MOSFET) is close to 50% on 28 MHz and around 55% at 7 MHz.

## Usage

The input RF comes directly from the Si5351 (3.3V). You can use our [CW-SigGen](https://github.com/kholia/HF-PA-v10/tree/master/CW-SigGen) project to generate a suitable test signal. It is also possible to pair this amplifier with our [Easy-Digital-Beacons-v1](https://github.com/kholia/Easy-Digital-Beacons-v1) project.

Another motivating factor: MRF101 is 'too precious' (read expensive) especially with its thermally self-limiting TO-220 package.

## Cost

Cost for 100W: Around 15 dollars - for everything including PCB and BOM components

## Time to build

Time to build: Less than 30 minutes - no coils to wind - yay!

## Files

The files for this project are [published here](https://github.com/kholia/HF-PA-v10/tree/master/SiC-QRO-Amp) for personal (non-commercial) usage.
