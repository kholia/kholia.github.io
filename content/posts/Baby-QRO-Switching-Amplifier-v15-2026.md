---
title: "Baby-QRO FT8 Amplifier 2026"
date: 2026-06-20
tags:
- QRO
- RF Amplifier
- HF
- Shortwave
- Beacon
- 25W
- 50W
- Amplifier
- Baby-QRO-v15
- Baby-QRO
- RF Hacking
- RF
- 2026
- FT8 Amplifier
---

## Related work

- [Baby QRO Switching RF amplifier for HF]({{< relref "Baby-QRO-Switching-Amplifier.md" >}})
- [Digitally Adjustable RF PA Supply]({{< relref "Digitally-Adjustable-PA-Supply.md" >}})

A new generation of the `Baby-QRO switching amplifier` targets 25W to 50W of RF
output for `FT8` and other FSK modes.

While it can do 100W, it becomes more of a thermal engineering project then ;)

It is designed to operate with a `Bare` DDX-Commercial transceiver board and
has an inbuilt T/R switch.

## Design

3D render:

![Baby-QRO amplifier v15 render](/images/3D-Render-Baby-QRO-Amp-v15.png)

With some new improvements added:

![Baby-QRO amplifier v15 with improvements](/images/3D-Render-Baby-QRO-Amp-v15-2.png)

## Results

To be tested!

## Usage

The input RF comes directly from the Si5351 (3.3V). You can use our [CW-SigGen](https://github.com/kholia/HF-PA-v10/tree/master/CW-SigGen) project to generate a suitable test signal. It is also possible to pair this amplifier with our [Easy-Digital-Beacons-v1](https://github.com/kholia/Easy-Digital-Beacons-v1) project.

## Caution

The boost module can generate a high-voltage rail of around 75V at startup. To
help tame the power-supply startup transients, we added a physical switch and a
capacitor load before feeding this supply into the amplifier.

## Cost

Cost for `~50W`: Around 20 dollars - for everything including PCB and BOM components

## Time to build

Time to build: Less than 45 minutes - no coils to wind - yay!
