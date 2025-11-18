---
title: "Ideas for a 6m WSPR beacon"
date: 2025-04-10
tags:
- Ideas
- Idea
- RF Hacking
- HAM
- Amateur Radio
- WSPR
- Amplifier
- 6m
---

I am posting an early design sketch of a 6m WSPR beacon.

Here are the key points:

- 25 MHz HCI 0.5ppm TCXO powering the Si5351 module instead of the 26 MHz TCXO.

  If this fails, we can use a 10 MHz OCXO instead (a bit out of spec but works fine).

- Tokmas CID10N65F GaN FET should work @ 50 MHz

- TI UCC27614 or Onsemi NCP81074 gate driver

Results: To be built and tested soon!

Update: The https://github.com/kholia/HF-PA-v10/tree/master/GSD-Hacks-v3-SMD PCB was built and tested with RD15HVF1-501 (GSD pinout MOSFET that we had lying around). 14V @ drain and 5V to gate driver produces ~4W RF output @ 50 MHz (6m). Not bad!

![3D render](/images/6m-amplifier-GSD-2.png)

The simplicity, ruggedness and performance of this design is quite remarkable. Please see http://www.carnut.info/WSPR_Tx/WSPR_Tx.htm for an alternate older design. We are quite happy with the reduced cost and infinitely more ruggedness of our design as compared to this `Ultimate 3S powered 5 Watt power amplifier` work.

On the internet, you will find stories of how fragile the Ultimate 3S's BS170 based PA is. On the other hand, it seems it can even go up to 2m band. What we want is a BS170 which is NOT a BS170 😅. Of course, we can choose RD06HVF1-501 / RD01MUS1 / RD00HVS1 as drivers but these parts are NOT widely available and are NOT the cheapest. Instead we are hoping that using `2SK3475` (from LCSC) as the driver will allow our design to operate on 2m too with full power.
