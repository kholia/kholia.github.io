---
title: "The Polar Express - Efficient SSB Generation"
date: 2026-02-16
tags:
- FPGA
- Si5351
- ECP5
- Amplifier
- RF Testing
- SSB
- RF Hacking
- RF
- Amateur Radio
- Signal Source
---

## Polar Modulation for Everyone

We have been working on SSB generation using `polar modulation`.

Hardware stack: RP2350-Zero MCU board + Fast Si5351 module + AP63301 buck regulator (for 5W mode).

![Polar Modulation SSB 1](/images/PolarModulationSSB-Demo-1.png)

See https://github.com/kholia/PolarModulationSSB for details.

Audio fidelity is acceptable at the moment and should improve further. We still
need to hook up the amplitude ("envelope") restoration stage.

## Motivation

Why should Guido, Hans, and FlexRadio folks have all the fun? ;)

## Samples

Original audio 1:
<audio controls preload="auto">
    <source src="/audio/Original_Kore.wav">
</audio>

Transmitted SSB quality (received by SDR) 1 @ 1 MHz I2C (`FM+` mode):
<audio controls preload="auto">
    <source src="/audio/SSB-Loopback-Kore-3.wav">
</audio>

*NEW* AD9850 transmitted SSB quality (received by same SDR):
<audio controls preload="auto">
    <source src="/audio/Recording-April-2026-04.wav">
</audio>

...

Original audio 2:
<audio controls preload="auto">
    <source src="/audio/Winston_Churchill_-_Be_Ye_Men_of_Valour.ogg">
</audio>

AD9850 transmitted SSB quality (received by same SDR over-the-air):
<audio controls preload="auto">
    <source src="/audio/Recording-Winston-OTA-3.wav">
</audio>

Reminder: We are yet to hookup the amplitude ("envelope") restoration part. This being said, here are Guido's notes on this topic - `After some experimenting, amplitude information can be completely rejected, instead the frequency must be placed outside the single side band (e.g. placed to center freq). In this case single side band is generated wihout suppressed carrier, i.e. a constant amplitude envelope is applied (good to prevent RF interference). In this case the audio quality does not seem to suffer from this constant amplitude, and the audio quality becomes even better by applying a little-bit of noise to the microphone input. My impression is that using SSB with constant amplitude increases the readability when the signal is just above the noise.`

PRs, ideas, and feedback are welcome!

## Notes

- The most critical factor for the SSB quality is the I2C speed we can practically achieve. 1KΩ pull-ups really help (our setup is currently using 2KΩ pull-ups).

- Useful commands:

  ```
  pactl load-module module-null-sink sink_name=Virtual0

  arecord -f cd -t wav Fresh-Recording-Feb-2026-21.wav
  ```

## Updates

We now have an initial rough "port" running on the inexpensive and widely
available `ColorLight 5A-75B` FPGA board.

![FPGA based Polar Modulation 1](/images/cl-5a-75b-v82-front.jpg) 

The goal is to support faster phase updates, which should improve SSB output
quality.

## References and Credits

- https://github.com/kholia/PolarModulationSSB/tree/master/firmware_ssb_ad9850

- https://www.pe1nnz.nl.eu.org/2013/05/direct-ssb-generation-on-pll.html - Classic modern reference

- https://dl0tz.de/polar/index_en.html - Modern FOSS work - The reference!

- [The Polar Explorer - ARRL](https://www.arrl.org/files/file/QEX_Next_Issue/Mar-Apr2017/MBF.pdf)

- [Guido's work on PM](https://github.com/threeme3/usdx)

- https://en.wikibooks.org/wiki/Digital_Circuits/CORDIC

- [Bringing SSB to QMX - Hans](https://qrp-labs.com/images/qmx/fdim/G0UPL.pdf)

- [CE SSB](https://www.arrl.org/files/file/QEX_Next_Issue/2014/Nov-Dec_2014/Hershberger_QEX_11_14.pdf)

- https://daveshacks.blogspot.com/2025/03/polar-modulation-deep-dive-into-phase.html

- https://daveshacks.blogspot.com/2025/02/guidos-ssb-modulation-analysis-and.html

- https://daveshacks.blogspot.com/2025/12/testing-revised-phase-calculation.html

- https://github.com/F5OEO/rpitx - The SSB TX quality is pretty good!

- https://github.com/tmcqueen-materials/pio-i2c-hs (3.4 Mbps I2C!)

- https://github.com/q3k/chubby75/tree/master/5a-75b

- https://github.com/kholia/Colorlight-5A-75B/tree/master/dds_ssb_uart - (FPGA SSB PM PoC)
