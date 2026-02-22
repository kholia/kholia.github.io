---
title: "A proper single transistor LNA for HF"
date: 2025-10-28
tags:
- RF Hacking
- RF
- LNA 
- Characterization
- HF
- Shortwave
- RX
- Small-signal
- Amp
- Amplifier
- BRF93A
- S9018
- MMBTH10LT1G 
- BFR106
- PY2OHH
- mcHF
- Proper
- Antenna Amplifier
- Pre-Amp
- PreAmp
- Impedance Matching
- Impedance Matched
- Tadka
- Coupled Inductors
- Ismo
---

Note: This HF LNA design is inspired by PY2OHH designs and mcHF work.

Previous article: [Single Transistor LNA for HF]({{< relref "Single-Transistor-LNA-HF.md" >}}) - it cut a corner when it came to output impedance matching ;)

## Design

The idea that a single-transistor-preamp with 10 dB gain is more than enough for HF comes from Gajendra Kumar (VU2BGS). As a new "designer" I am often overwhelmed by the different possible design paths - so having guidance from an `elmer` becomes crucial.

![HF LNA Simulation](/images/Proper-LNA-Sim.png)

![HF LNA Simulation 2](/images/Proper-LNA-Sim-2.png)

![HF LNA Simulation 3](/images/Proper-LNA-Sim-3.png)

![HF LNA Simulation Gain](/images/Proper-LNA-Simulation-Gain.png)

Circuit diagram (original from mcHF project):

![HF LNA in mcHF](/images/BFR93A-PreAmp-mcHF.png)

## Implementation

Actual `quick` build:

![Actual quick build](/images/Proper-LNA-Build.jpg)

This properly impedance matched LNA will be used in the RX path of the `DDX Commercial` series of transceivers soon. It can also perhaps replace the `2N3906 RF AMP` (https://www.n6qw.com/MC1496.html) for usage with MC1496 based DCRs.

Note: If BRF93A oscillates (its 6 GHz fT is excessive for our needs) in the PCB build version, then we can try our luck with S9018 or MMBTH10LT1G transistors (same pinout).

Our twist: We found that there is NO need to wind and build the `4:1 transformer` by hand. Instead, we can simply use a SMD coupled inductor from [LCSC](https://www.lcsc.com/search?q=XRRF7342) in the compact `SMD-4P,7.5x7.5mm` footprint.

PCB render:

![PCB render](/images/Proper-LNA-Render-1.png)

## Results

NanoVNA results:

- Input ATTN: 10dB (Port 1 of NanoVNA)
- Output ATTN: 50dB (Port 2 of NanoVNA)

![NanoVNA results 1](/images/Proper-LNA-NanoVNA-1.png)

![NanoVNA results 2](/images/Proper-LNA-NanoVNA-2.png)

Resulting gain: ~20dB or more over HF

Power consumption: `~9mA @ 5V`

WSJT-X results:

![WSJT-X with LNA added 1](/images/With-BFR93A-LNA-1.png)

![WSJT-X with LNA added 2](/images/With-BFR93A-LNA-2.png)

![WSJT-X with LNA added 3](/images/With-BFR93A-LNA-3.png)

Even the partially-overlapping signals are decoded just fine in WSJT-X!

## References

- [XRRF7342 Series](https://www.lcsc.com/search?q=XRRF7342)

- [PY2OHH Buffer/Amplifier](https://www.qsl.net/py2ohh/trx/buffer/buffer.html)

- [mcHF Project](https://github.com/m0nka/mcHF)
