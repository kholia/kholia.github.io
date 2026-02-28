---
title: "Sustainable Radio Design V2"
date: 2025-11-07
tags:
- RF Hacking
- RF
- CD2003
- MC1496
- Not-DCR
- DCR
- Real World Constraints
- HF
- Shortwave
- Transceiver
- Radio Architecture
- Ideas
- RP2350
- STM32H5
---

Related articles:

- [Proper Single Transistor LNA for HF]({{< relref "Proper-Single-Transistor-LNA-HF.md" >}})
- [A Sustainable Radio Design?]({{< relref "Sustainable-Radio-Design.md" >}})

## Design

We are finally going to build a QSD RX!

Here is the rough schematic I am thinking about:

![QSD RX schematic](/images/QSD-Schematic-1.png)

## References

- [MC1496 Information](https://www.n6qw.com/MC1496.html)

- [HSDAOH on RP2350](https://github.com/steve-m/hsdaoh-rp2350) (see `internal_adc` section)

  This way we can continue using `RP2350` instead of moving to something like `STM32H5` immediately

- [PicoRX Simulations](https://github.com/dawsonjon/PicoRX/tree/master/simulations) (also for DSP code)
