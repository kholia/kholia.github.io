---
title: "Generating 1W RF from 5V - Redux"
date: 2026-06-28
tags:
- RF Amplifier
- HF
- Shortwave
- Beacon
- 1W
- 5V
- Amplifier
- RF Hacking
- Amateur Radio
- MMIC
- INNOTION
---

## The constraints

- 5V (~500mA) power from mobile phone
- 1W RF output required
- Very compact with less "moving" parts
- 14 MHz capable

## The design

We use `INNOTION YG401530VB` MMIC in this design.

```
              100n
Si5351 CLK 0 --||----+---------+
                     |  MMIC   |
                     |   IN    |
                     |         |
                     |   OUT   +----||---- RF OUT ---- LPF ---- 50R dummy load
                     +----+----+   100nF
                          |
                         10uH RFC
                          |
                          |---100n---GND
                          | 
                         +5V
```

Note: No explicit 'special' matching required it seems ;)

This seems to be an extremely broadband circuit which should cover all HF!

## Results

10 dBm from Si5351 and 13.8 dB gain of the INNOTION MMIC gives ~9.8Vpp output
theoretically.

I am getting 10.8Vpp (~24 dBm) after a strong 20m BPF filter and into a 50 ohms
load, which is roughly ~290 mW of RF power.

The goal however is to get around 1W (30 dBm) - I need another 6dB gain it
seems.

My idea: Condition the output of Si5351 by adding a 6ns fast comparator in
series. This comparator will produce 5V square wave drive with 65mA plus
current drive! Some attenuation after the comparator will be required.

Another possibility:

```
Si5351 -- 22Ω -- 74LVC1G04 @ 5V -- attenuator (3-6 dB) -- +14 dBm -- MMIC input
```

Another idea:

For +14 dBm into 50Ω, we need about:

```
P = 25 mW
Vrms = 1.12 V
Vpp sine ≈ 3.16 V
Ipk ≈ 32 mA
```

```
                 33Ω
ACT04 gate 1 ---/\/\---+
                 33Ω   |
ACT04 gate 2 ---/\/\---+---- 6 dB pad ---- MMIC input
```

The `ACT04` can do 24mA per output pin.

Compact idea:

SN74LVC2G04 / 74LVC2G04, two gates paralleled. Compact, fast, easy. Use one
package with two inverters, parallel outputs through separate resistors:

```
Si5351 -- 22Ω +--- gate1 ---- 22Ω ----+
              |                       +---- 3–6 dB pad ---- RF input
              +--- gate2 ---- 22Ω ----+
```

https://www.random-science-tools.com/electronics/dBm-Watts-volts.htm is very
useful for doing the math.

## Cost

The INNOTION MMIC costs around 30 INR - beat that! ;)

## Time to build

Less than 30 minutes

## Datasheet

{{< embed-pdf url="/pdfs/INNOTION_YG401530VB.pdf" hideLoader="true" >}}

## References / Resources

- [The DDX-UNO HF transceiver design]({{< relref "ddx-uno-radio-you-actually-carry.md" >}})

- [1W @ 5V amplifier]({{< relref "1W-5V-Amplifier-2026.md" >}})

- https://leleivre.com/rf_lcmatch.html

- https://www.zachtek.com/1011-v1

- [TinyDX HF Transceiver](https://github.com/WB2CBA/TinyDX---Tiny-Digital-Modes-HF-Transceiver)

- https://ludens.cl/Electron/RFamps/RFamps.html

- [40 meter Direct Conversion QRP Transceiver using 74AC240 Power amp](https://circuitsalad.com/2015/08/11/40-meter-direct-conversion-qrp-transceiver-using-74ac240-power-amp/)

- [1.5 Watt 74HC240 QRP RF Amp using 74AC240 inverter for improved output](https://circuitsalad.com/2015/07/23/1-watt-qrp-rf-amp-using-74ac240-or-74ac04-inverter/)
