---
title: "ADS-B decoding under 1W and US$25"
date: 2026-11-09
draft: false
tags:
- ADS-B
- RP2350
- Ethernet
- Low Power
- Pico 2
- PoE
- 1090 MHz
---

My new ADS-B decoding system consumes **less than 1W** and costs **under US$25**.
It runs standalone, handling everything from reception to feeding
[adsb.lol](https://adsb.lol/).

The hardware: **RP2350 (Pico 2) + W5500 for Ethernet + Core2021-HF 'LoRa' module + NEO-7M**.

The **Core2021-HF** is a LoRa module that also handles ADS-B demodulation entirely
in hardware. The **NEO-7M** is a u-blox GPS module.

Power and data travel over a **single Cat 6 cable**, using an **Adafruit passive
PoE injector and extractor**.

We recommend feeding clean 'linearly-generated' DC power into the passive PoE
injector. Otherwise, feeding noisy SMPS-generated power to a long Cat 6 cable
(think antenna!) is likely to cause EMI problems!

It even can boot over the LAN, **PXE style**, for easier firmware development
and debugging.

![ADS-B system in action](/images/ADS-B-1.png)

![ADS-B system in action 2](/images/ADS-B-2.png)

The 'range' is around 122 kms even from a non-optimal location. It even works
indoors when planes are nearby ;)

Currently, it is connected to a rubber ducky antenna tuned to 868 MHz but it
still manages to perform decently.

Yes, it does MLAT too! :=)

Quick PoC build:

![ADS-B system in action - PoC build](/images/ADS-B-3.jpg)
