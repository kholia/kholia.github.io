---
title: "A Sustainable Radio Design?"
date: 2025-10-17
tags:
- RF Hacking
- RF
- CD2003
- MC1496
- Not-DCR
- Real World Constraints
- HF
- Shortwave
- Transceiver
- Radio Architecture
- Ideas
- 2025
- Shipping Pains
- RP2350
- STM32H5
- Ismo
- OH2FTG
- N6QW
- VeroRoute
- BFR93A
---

Future radio receiver design ideas (from Ismo, Pete and other folks):

Antenna ➔ (BPF) ➔ BFR93A based pre-amp from mcHF project ➔ MC1496 (Mixer) ➔ 455 kHz IF ➔ Ceramic filter SMD (HCI) ➔ 'IF amplifier' (20-40 dB gain?) ➔ Overclocked Pico 2's ADC (3+ MSPS) ➔ Digital down-conversion and processing in digital domain ➔ Expose the processed audio samples over USB (Pico 2 acts as a sound card).

Benefits: This enables reception of SSB and CW signals! The 455 kHz IF with digital processing gives us the best of both analog selectivity (ceramic filter) and digital flexibility.

The Pico 2 (RP2350) with dual Cortex-M33 `overclocked` cores should handle:

- Digital mixing/down-conversion
- FIR/IIR filtering
- Demodulation
- USB audio streaming

Also, we are planning to build a opamp powered IF amplifier using the fast `TI TLV3541` part. The LO comes from Si5351 as usual.

Note: Before trying the `digital superhet` version (above), I will likely be using MC1496 in a DCR design first.

![MC1496 DCR](/images/MC1496-Circuit.png)

We are hoping that `MC1496` continues to be available!

References:

- https://www.n6qw.com/MC1496.html

- https://github.com/steve-m/hsdaoh-rp2350 (see `internal_adc` section)

  This way we can continue using `RP2350` instead of moving to something like `STM32H5` immediately

- BFO handling code: https://github.com/mpmarks/pico-adx/blob/master/src/main.cpp

- http://www.kh-gps.de/cd2003_rx.htm (old favorite)

- https://www.ti.com/product-category/amplifiers/op-amps/high-speed/overview.html (`TLV3541`)

- https://github.com/dawsonjon/PicoRX/tree/master/simulations (also for DSP code)

- https://sourceforge.net/projects/veroroute/
