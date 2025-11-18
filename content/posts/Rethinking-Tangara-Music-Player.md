---
title: Reimagining the 'Tangara' music player
date: 2025-02-15
tags:
- Music Hardware
- DAP
- Music
- Hacking
- Optimization
- Price Hacking
- Repairable
- Sustainable
- Minimal
- Retro-Modern
- Hackability
- Sound
- Audio
---

[Tangara](https://www.crowdsupply.com/cool-tech-zone/tangara) is a pretty awesome project - no doubts about it. I found [this review of Tangara's design](https://halestrom.net/darksleep/blog/053_tangara/) pretty interesting and educational.

It has inspired us to build a similar FOSS DAP product but at a much lower cost of 40 USD (that being the launch price of Sansa Clip in year 2007). The idea is to deliver '90% of the value' of Tangara in a slightly smaller (but fatter) and more cost-effective package.

Initial tech stack: RP2350-Zero, PCM5102A 32-bit 384kHz DAC, Burr-Brown OPA1662 (specified for 3.3v) as the unity gain buffer and headphone driver, no explicit DC-DC converters anywhere, microSD card, everything will be a module if possible

Keywords: Mindful, Repairable, Sustainable, Minimal, Hand solderable, Retro-Modern, Hackability

Here is a very early WIP PoC schematic:

![Very early WIP PoC schematic](/images/ThePlayer-0.02.png)

We are likely to optimize the default performance for IEMs like Aria 2 (~33Ω). Driving large high-impedance headphones with a portable setup like this is NOT a priority.

Power source: We would like to use 14500 Li-ion AA battery, ideally. Cheap, readily available and easy to self-replace. The standard `AA` size won us over!

Initial impressions with `Alone With You - deadmau5` test track:

- CJMCU-4344 DAC module + TS922 -> Fidelio X2. The 'rumbling bass' on this track seems to be much attenuated as compared to FiiO X3-II. Update: This was a bug in the selection of the output DC blocking capacitors values! `10uF` with a ~32 ohms load forms a HPF with a cutoff of almost 500 Hz (heh)! Switching the DC blocking caps to `>= 680uF` fixes the low-bass problem!

While the `CJMCU-4344 DAC module` work pretty well, the underlying CS4344 chip has been discontinued by Cirrus Logic. We now use TI PCM5102A DAC module and it works even better it seems. TI TAD5242 (DAC with headphone driver) sounds amazing too but its QFN package can be problematic! For now TI PCM5102A serves us well and seems to "beat" WM8523 on paper.

Here is the new schematic for the `mShuffle` DAP:

![Very early WIP PoC schematic](/images/ThePlayer-0.04.png)

Have you noticed how much time is wasted these days on `content browsing` versus `actual content consumption`? So there will be no browse functionality in our player. Please do `content curation` on your computer and not on the DAP (this applies elsewhere too). This means that we can eliminate the display (screen) from our design. Since this is an `audiophool` grade device, there will be no wireless support either! Also, Bluetooth is quite problematic in apartment buildings with too many WiFi access points! The Bluetooth audio stream dropouts are a mood killer... enough said.

How do we strike the balance between "ultimate audiophool" quality, practicality and affordability? - How many of us have all of our favorite music in `DSD 512` format? Also, how many of us can distinguish between `DSD 512` and `Opus 256` in a double-blind test? Is the answer `none` to these questions? ;)

Update: Special thanks to [Hales](https://halestrom.net) for reviewing the `mShuffle` design in depth! Here is the updated schematic:

![Very early WIP PoC schematic](/images/mShuffle-0.05.png)

Here is how an early PCB render is looking:

![Very early WIP PoC render](/images/mShuffle-0.05-render.png)

Our WIP design files are [available on GitHub](https://github.com/kholia/mShuffle).

References:

- Sansa Clip specs (for reference): Multi-bit Sigma Delta Converters - DAC: 18bit with 94dB SNR ('A' weighted), 2 x 60mW @ 16Ω driver capacity (stereo headphone audio amplifier)

- [Measuring (Tangara's) Audio Quality](https://www.crowdsupply.com/cool-tech-zone/tangara/updates/measuring-tangaras-audio-quality)

- [What Every Audiophile Should Know and Never Forget](https://www.biline.ca/audio_critic/critic1.htm)

- [AN-581: Biasing and Decoupling Op Amps in Single Supply Applications](https://www.analog.com/en/resources/app-notes/an-581.html)

- [Hi-Res WAV player for Raspberry Pi Pico](https://github.com/elehobica/RPi_Pico_WAV_Player)
