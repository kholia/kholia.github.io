---
title: "Fast(est) gate drivers in the West"
date: 2025-06-03
tags:
- RF Hacking
- HAM
- Amateur Radio
- Digital Modes
- Amplifier
- RF Amplifier
- Fast
- Gate Drivers
- Parts
- Part
- Class D
---

I recently found some FET gate drivers which are quite fast!

## The Drivers

- [Wuxi Maxinmicro MX1025D](https://www.lcsc.com/product-detail/GaN-Transistors-GaN-HEMT_Wuxi-Maxinmicro-MX1025D_C5341121.html) - Favorite!

- BD2311NVX-LBE2 from ROHM Semiconductor

- [TI LMG1020](https://www.ti.com/lit/ds/symlink/lmg1020.pdf)

- [Tokmas LMG1020YFFR](https://www.lcsc.com/product-detail/C6423790.html)

## Usage

They are perfect for driving the fast Tokmas GaN FETs that we recently discussed on this site.

Our 'workhorse' gate driver for the recent experiments has been the Onsemi's NCP81074ADR2G in a friendly SOIC-8 package.

And we have shifted to `MX1025D` gate driver in our latest amplifier designs.

## References

- [Plasma-Driver](https://github.com/westonb/Plasma-Driver)
