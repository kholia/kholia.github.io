---
title: "Single Transistor LNA for HF"
date: 2025-09-21
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
- S9018
- KSP10
- MMBTH10LT1G
- MMBT2222A
---


Note: This HF LNA design is inspired by Charlie Morris ZL2CTM's prior work.

The idea that a single-transistor-preamp with 10 dB gain is more than enough for HF comes from Gajendra Kumar (VU2BGS). As a new "designer" I am often overwhelmed by the different possible design paths - so having guidance from an `elmer` becomes crucial.

![HF LNA 1](/images/HF-LNA-1.png)

![HF LNA 2](/images/HF-LNA-2.png)

It seems even MMBT2222A should work for building a HF LNA!

![HF LNA 3](/images/MMBT2222A-Simulation-LNA.png)

This LNA will be used in the RX path of the `DDX Commercial` series of transceivers soon!

Simulation files: https://github.com/kholia/Gain-Blocks-LTspice/tree/main/HF-LNA

Please always publish your simulation files ;)
