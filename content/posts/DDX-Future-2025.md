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
- RP2350
- STM32H5
- Ismo
- OH2FTG
---

Shipping hardware internationally is a hard, labor intensive, and overall a frustrating process - especially more so these days.

Here is our plan to supply the DDX to customers:

- Make the hardware files free / low-cost. The users will be able to order fully assembled boards from JLCPCB or other vendors on their own.

- Required a small licensing fee for the software firmware part. This is how we get to keep the hobby self-sustaining!

## Architecture

Future DDX architecture ideas (from Ismo and other folks):

Antenna ➔ CD2003 ➔ 455 kHz IF ➔ Ceramic filter SMD (HCI) ➔ "IF amplifier" needed? ➔ Pico 2's ADC ➔ Down-conversion and processing in digital domain ➔ Expose the processed audio samples over USB (Pico 2 acts as a sound card).

Benefits: This enables reception of SSB and CW signals!

Alternate easier and traditional radio architecture:

Antenna ➔ CD2003 ➔ 455 kHz IF ➔ Ceramic filter SMD (HCI) ➔ BFO mixer ("product detector") ➔ Direct Sound output ➔ Pico 2's ADC ➔ Pico exposes the audio samples over USB

Alternate ideas: One of the more promising and well-tested CD2003 designs is documented at [KH-GPS CD2003 RX](http://www.kh-gps.de/cd2003_rx.htm). This actually looks like the most promising option!

## Immediate Plans

Immediate architecture (for DDX-Commercial series):

![DDX-Commercial-21 PCB render](/images/DDX-21-PCB.png)

Antenna ➔ RX path ➔ SMD BPF (7 to 28) ➔ CD2003 with AGC ON ➔ Small "emergency" 10k SMD pot to tweak volume one time ➔ (X)MCP6022 (fixed gain, MFB with LPF action) ➔ RP2350 2's ADC

In other news, I got a `DX 100` award with DDX on 10m recently - w00t!

![DDX DX 100 award](/images/DX-100-Award-October-2025.png)

## References

- [HSDAOH on RP2350](https://github.com/steve-m/hsdaoh-rp2350) (see `internal_adc` section)

  This way we can continue using `RP2350` instead of moving to something like `STM32H5` immediately

- [Pico-ADX BFO Code](https://github.com/mpmarks/pico-adx/blob/master/src/main.cpp)

- [KH-GPS CD2003 RX](http://www.kh-gps.de/cd2003_rx.htm)
