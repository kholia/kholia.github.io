---
title: "APRS interface for BaoFeng and other radios"
date: 2026-01-17
tags:
- APRS
- BaoFeng
- VHF
- UHF
- KiCad
- Digital Interface
---

## The design

Here is a "safe" APRS interface for BaoFeng and other radios.

Sample schematic:

{{< embed-pdf url="/pdfs/TheDigitalInterface-2026.pdf" hideLoader="true" >}}

## Render

![TheDigitalInterface-2026](/images/TheDigitalInterface-2026.png)

## Motivation

https://github.com/skuep/AIOC works but it seems to have a couple of problems:

1. RF feedback problem with monopole antennas

2. Hard-to-source exact 3.5mm and 2.5mm audio connectors

3. Mechanical fragility of these "half-cut" (chopped off) and then only SMD-style soldered TRS connectors

   ![Chopped off 'SMD' connectors](/images/k1-aioc-photo.jpg)

4. Reliance on the PCBA process to get a working product. In contrast, we want
   our users to be able to homebrew the digital interface (if desired).

I believe we can reduce the cost by a lot and also make the whole thing
homebrew-able without placing a JLCPCB PCBA order.

Also, we are hoping that we might be able to use ready-made off-the-shelf audio
cables in our design.

## BOM

- Waveshare RP2040-Zero Clone - 200

- Ambrane 3.5mm to 3.5mm male aux stereo cable TRS - 130

- 2.5mm to 3.5mm aux stereo cable - 250 (element14)

- PCB - 150

- Components - 70

- Case - 100 INR

Total - 900 INR or less

## Pros

- No cables to make. No cables to cut up!

- THT audio connectors which can handle rough handling.

Our competition is with Digirig (70 USD). Our product is 1/6th the cost of Digirig and is "software configurable" with many "gears".

## References

- https://aprsdroid.org/download/builds/

- https://github.com/na7q/aprsdroid

- https://github.com/ge0rg/aprsdroid

- [AIOC - Known issues](https://github.com/skuep/AIOC?tab=readme-ov-file#known-issues)

- https://direbox.net/blog/aioc-cable-review
