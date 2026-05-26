---
title: "Fast(est) gate drivers in the West"
date: 2025-06-03
tags:
- RF Amplifier
- Digital Modes
- Amplifier
- Gate Drivers
- Parts
- Class D
- RF Hacking
- Amateur Radio
---

I recently found some FET gate drivers which are quite fast!

## The Drivers

- [Wuxi Maxinmicro MX1025D](https://www.lcsc.com/product-detail/GaN-Transistors-GaN-HEMT_Wuxi-Maxinmicro-MX1025D_C5341121.html) - Favorite!

- BD2311NVX-LBE2 from ROHM Semiconductor

- [TI LMG1020](https://www.ti.com/lit/ds/symlink/lmg1020.pdf)

- [Tokmas LMG1020YFFR](https://www.lcsc.com/product-detail/C6423790.html)

## Usage

They are perfect for driving the fast Tokmas GaN FETs that we recently discussed on this site.

Our 'workhorse' gate driver for the recent experiments has been the Onsemi's NCP81074ADR2G in a friendly SOIC-8 package. We have also used `UCC27614DR` and `UCC27517` (SOT-23-5) with excellent results.

And we have shifted to `MX1025D` gate driver in our latest amplifier designs.

## References

- [Plasma-Driver project](https://github.com/westonb/Plasma-Driver)

- [UCC27517](https://www.ti.com/lit/ds/symlink/ucc27517.pdf)
