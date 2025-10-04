---
title: "The future of DDX - 2025 version"
date: 2025-10-04
tags:
- RF Hacking
- RF
- CD2003
- DDX
- Real World Constraints
- HF
- Shortwave
- Transceiver
- Radio Architecture
- Ideas
- Ismo
- 2025
- Shipping Pains
---

Shipping hardware internationally is a hard, labor intensive, and overall a frustrating process - especially more so these days.

Here is our plan to supply the DDX to customers:

- Make the hardware part free (Free an in Freedom)

  The users will be able to order fully assembled boards from JLCPCB or other vendors on their own.

- Required a small licensing fee for the software firmware part
 
  This is how we get to keep the hobby self-sustaining!


Future DDX architecture ideas (from Ismo and other folks):

Antenna ➔ CD2003 ➔ 455 kHz IF ➔ Ceramic filter SMD (HCI) ➔ Pico 2's ADC ➔ Down-conversion and processing in digital domain ➔ Expose the processed audio samples over USB (Pico 2 acts as a sound card).

Benefits: This enables reception of SSB and CW signals!

We are planning to try `STM32H5` for this new DDX architecture!

Alternate easier and traditional radio architecture:

Antenna ➔ CD2003 ➔ 455 kHz IF ➔ Ceramic filter SMD (HCI) ➔ Mix with BFO ➔ "Some detector" ➔ Direct Sound output ➔ Pico 2's ADC ➔ Pico exposes the audio samples over USB
