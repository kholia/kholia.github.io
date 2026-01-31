---
title: "Reasonable MCU ADC performance - STM32H562"
date: 2026-01-10
tags:
- HF
- Shortwave
- RF
- HAM
- Amateur Radio
- Ismo
- Si4732
- STM32
- ADC performance
- ADC Quality
- ADC
- UAC-2
- UAC
- wsjt-x_improved
---

Ismo (OH2FTG) has praised the STM32's ADC quality multiple times, and I finally decided to give it a go.

I usually stick with Waveshare RP2350-Zero boards, but the RP2350 ADC performance is limited to under 10 ENOB.

With the STM32H562RGT6, we're able to achieve ~13 ENOB using 16× hardware ADC oversampling, with potential headroom to push this even further.

By sampling the Si4732's SSB output using the STM32H562RGT6 ADC and exposing the audio samples to the host via a "virtual" USB UAC-2 device, we get the following RX results:

![Si4732-STM32H562-To-USB-UAC2](/images/Si4732-STM32H562-To-USB-UAC2.png)

Not bad!

As usual, we stick with non-optimal antennas (a 10m-long EFHW in this experiment) to better emulate POTA / SOTA / man-portable operating conditions.

Yes, a high-quality narrow-band QSD IQ SDR will often outperform wide-open, ultra-wideband SDRs in single-band performance ;)
