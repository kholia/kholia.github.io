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
- PZT2222A
- OnSemi PZT2222A
- PXT2222A
---

Note: This HF LNA design is inspired by Charlie Morris ZL2CTM's prior work.

The idea that a single-transistor-preamp with 10 dB gain is more than enough for HF comes from Gajendra Kumar (VU2BGS). As a new "designer" I am often overwhelmed by the different possible design paths - so having guidance from an `elmer` becomes crucial.

![HF LNA 1](/images/HF-LNA-1.png)

![HF LNA 2](/images/HF-LNA-2.png)

It seems even MMBT2222A should work for building a HF LNA!

![HF LNA 3](/images/MMBT2222A-Simulation-LNA.png)

It doesn't feel right to dissipate ~45mW *continuously* in a SOT-23 package, so we will be shifting to PZT2222A (SOT-223) or PXT2222A (SOT-89).

With NXP parts:

![HF LNA 4](/images/LNA-NXP-2222.png)

With onsemi part:

![HF LNA 5](/images/LNA-onsemi-2222.png)

So which transistor model is more accurate? ;)

It is a pleasure to work with `onsemi's` .lib spice models - they are usable right away!

This LNA will be used in the RX path of the `DDX Commercial` series of transceivers soon!

Simulation files: https://github.com/kholia/Gain-Blocks-LTspice/tree/main/HF-LNA

Please always publish your simulation files ;)

Updates (October-2025):

![HF LNA 1](/images/Falstad-CircuitJS-Demo.png)

![LNA Actual Picture 1](/images/HF-LNA-Pic-1.jpg)

![LNA Measurements 1](/images/LNA-S21-Report.png)

![LNA Measurements 2](/images/Real-LNA-Measurements-Oct-2025.png)

![HF LNA Sim](/images/LNA-Accurate-SIM-Best.png)

As you can see, NXP's transistor model is pretty decent and mimics reality well!

NanoVNA setup notes:

Input ATTN: 30dB (Port 1 of NanoVNA)

Output ATTN: 33dB (Port 2 of NanoVNA)

References:

- https://www.qsl.net/py2ohh/trx/buffer/buffer.html
