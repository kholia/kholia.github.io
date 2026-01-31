---
title: "Wireless APRS interface for BaoFeng and other radios!"
date: 2026-01-29
tags:
- APRS
- BaoFeng
- VHF
- UHF
- KiCad
- Bluetooth
- SPP
- BLE
- Wireless
- Digital Interface
- KISSLink
- v1
---

## Description 

We have built a Bluetooth-enabled and APRSdroid-compatible digital interface for less than 15 USD (for the fully-loaded make including cables). We call it the KISSLink v1.

![KISSLink v1](/images/aprsdroid-1.jpg)

![KISSLink v1](/images/aprsdroid-2.jpg)

Yes - We need to chop-off the trailing bytes ;)

![KISSLink v1 Render](/images/KISSLink-v1-5.png)

This digital interface can be powered from the USB 5V or the inbuilt battery.

## Schematic

{{< embed-pdf url="/pdfs/KISSLink-v1.pdf" hideLoader="true" >}}

## RX path simulation (AF front-end)

![KISSLink v1 Simulation](/images/KISSLink-Sim-1.png)

## Motivation

https://store.mobilinkd.com/products/mobilinkd-tnc4 is the BEST but it is expensive and hard to source (from many global locations).

Think upwards of 150 USD for getting a fully-loaded Mobilinkd TNC4.

## BOM

- Raspberry Pi Pico 2W - 610 to 750 INR

- Ambrane 3.5mm to 3.5mm male aux stereo cable TRS - 130

- 2.5mm to 3.5mm aux stereo cable - 250 (element14)

- PCB - 150

- Components - 70

- Case - 100 INR

- Good quality 18650 cell - 150 to 200 INR

Total - ~1375 INR or less (< 15 USD)

## Notes

- We considered using "1000mAh" 14500 cells for their compactness (AA sized)
  but ultimately went in for much higher capacity 18650 cells.

- The device can be powered either from the internal battery or via the Pico USB port. When charging the battery, use the externally exposed TP4056 module's USB connector. Do not connect both USB ports simultaneously!

## Pros

- FREE hardware (Gerbers + BOM + CPL + enclosure design file)

- Open schematic!

- No cables to make. No cables to cut up!

- THT audio connectors which can handle rough handling

- We may even open-source the firmware part (currently node locked) after sales target are hit ;)

## References

- https://aprsdroid.org/download/builds/

- https://github.com/na7q/aprsdroid

- https://github.com/ge0rg/aprsdroid

- [AIOC - Known issues](https://github.com/skuep/AIOC?tab=readme-ov-file#known-issues)

- https://direbox.net/blog/aioc-cable-review

- https://store.mobilinkd.com/products/mobilinkd-tnc4
