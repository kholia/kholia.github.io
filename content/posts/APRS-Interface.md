---
title: "APRS interface for BaoFeng and other radios"
date: 2026-01-17
tags:
- APRS
- BaoFeng
- VHF
- UHF
- KiCad
---

## The design

Here is a "safe" APRS interface for BaoFeng and other radios.

Sample schematic:

{{< embed-pdf url="/pdfs/TheDigitalInterface-2026.pdf" hideLoader="true" >}}

## Motivation

https://github.com/skuep/AIOC works but it seems to have a couple of problems:

1. RF feedback problem with monopole antennas

2. Hard-to-source exact 3.5mm and 2.5mm audio connectors

3. Mechanical fragility of these "half-cut" (chopped off) and then only SMD-style soldered TRS connectors

4. Reliance on the PCBA process to get a working product

I believe we can reduce the cost by a lot and also make the whole thing
homebrew-able without placing a JLCPCB PCBA order.

Also, we are hoping that we might be able to use ready-made off-the-shelf audio
cables in our design.

## References

- https://aprsdroid.org/download/builds/

- https://github.com/na7q/aprsdroid

- https://github.com/ge0rg/aprsdroid
