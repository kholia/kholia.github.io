---
title: "Scalable Class-D RF PA architecture for HF"
date: 2026-08-18
tags:
- QRO
- RF Amplifier
- HF
- Shortwave
- Beacon
- 10W
- 250W
- 500W
- Amplifier
- Baby-QRO
- RF Hacking
- RF
- 2026
- FT8 Amplifier
---

## Related work

- [Baby QRO Switching RF amplifier for HF]({{< relref "Baby-QRO-Switching-Amplifier.md" >}})
- [Digitally Adjustable RF PA Supply]({{< relref "Digitally-Adjustable-PA-Supply.md" >}})

A new generation of the `Baby-QRO switching amplifier` targets 10 W to 500W+ of
RF output for `FT8` and other FSK modes.

## Design

This design comes from `AI7SG` - thank you!

{{< embed-pdf url="/pdfs/QRO-RF-Amplifier-2026.pdf" hideLoader="true" >}}

Note: We can shift to the much faster `TI LMG1210` driver and EPC GaN FETs once
their availability improves!

Simulation results for the general idea:

!["Similar" simulation results](/images/QRO-RF-Amplifier-2026-1.png)

This particular simulation version targets ~25W of output power with 80% plus
PAE.

## The general idea

> As switched-mode power supplies are driven to become smaller and more
> efficient, eGaN transistors have emerged as a key technology. Operating at
> ever higher frequencies, the distinction between the operation as a radio
> frequency (RF) amplifier or a switching element in a direct current (dc)
> power supply is becoming increasingly blurry.

![Similarities - all around us](/images/Blurry-Boundaries-1.png)

## Results

To be tested!

## Usage

The input RF comes directly from the Si5351 (3.3V). You can use our [CW-SigGen](https://github.com/kholia/HF-PA-v10/tree/master/CW-SigGen) project to generate a suitable test signal. It is also possible to pair this amplifier with our [Easy-Digital-Beacons-v1](https://github.com/kholia/Easy-Digital-Beacons-v1) project.
