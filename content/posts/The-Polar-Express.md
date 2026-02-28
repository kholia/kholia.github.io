---
title: "The Polar Express - Efficient SSB Generation"
date: 2026-02-16
tags:
- RF Hacking
- RF
- Amplifier
- HAM
- Amateur Radio
- Source
- Signal Source
- RF Testing
- SSB
- Si5351
- ECP5
- FPGA
---

## Polar Modulation for the masses

We have been working on generating SSB signals using `Polar Modulation`.

Hardware stack: RP2350-Zero MCU board + Fast Si5351 module + AP63301 buck regulator (for 5W mode).

![Polar Modulation SSB 1](/images/PolarModulationSSB-Demo-1.png)

Please see https://github.com/kholia/PolarModulationSSB for more details.

The audio fidelity and general quality is ok'ish at the moment but it can only
improve from here. We are yet to hookup the amplitude ("envelope") restoration
part.

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

PRs, ideas, and feedback are welcome!

## Notes

- The most critical factor for the SSB quality is the I2C speed we can practically achieve. 1KΩ pull-ups really help (our setup is currently using 2KΩ pull-ups).

- Useful commands:

  ```
  pactl load-module module-null-sink sink_name=Virtual0

  arecord -f cd -t wav Fresh-Recording-Feb-2026-21.wav
  ```

## Updates

We have an initial rough-and-dirty "port" running on the cheap and widely available `ColorLight 5A-75B` FPGA board now!

![FPGA based Polar Modulation 1](/images/cl-5a-75b-v82-front.jpg) 

The hope is to be able to do faster phase updates which may result in much better SSB quality output.

## References and Credits

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
