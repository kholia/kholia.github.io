---
title: "DDX-UNO: The HF Radio You Actually Carry"
date: 2026-05-26
draft: false
tags:
- amateur-radio
- QRP
- HF
- portable
- QRPp
- Vision
- HF Vision
- Digital Pixie  
---

Photographers often say:

> The best camera is the one you have with you.

DDX-UNO ("Digital Pixie") applies the same philosophy to amateur radio.

> The best HF transceiver isn't necessarily the most powerful one. It's the one you remembered to bring.

Most HF stations remain at home. Portable radios often require batteries, coax cables, antenna tuners, protective cases, and a backpack full of accessories. The result is that many operators leave their radios behind.

DDX-UNO is designed to eliminate excuses.

> We are not selling another HF transceiver. We are selling the moment HF stops being a station and starts being something you carry - everyday and everywhere.

Imagine a complete sub-1-watt HF digital transceiver smaller (but 'fatter') than a smartphone. Think BaoFeng Mini but even lighter? A tiny PCB protected by heat-shrink tubing contains everything needed for operation: RF front end, audio codec, microcontroller, filtering, and a built-in end-fed half-wave matching transformer. Just unfold the pluggable half-wave wire antenna and the counterpoise, plug into a phone, and get on the air.

## No Battery. No Coax. No Nuisance.

The transceiver draws power directly from the smartphone. A modern MCU handles audio processing, control, and autonomous operation even when a phone is disconnected. The radio can beacon, monitor, decode, or execute preconfigured tasks independently.

The goal is simple:

- No battery pack
- No coax cable
- No external tuner
- No enclosure
- Just radio

## Prime Lenses, Not Zoom Lenses

Each DDX-UNO board is optimized for a single amateur band.

Rather than carrying one complicated wideband radio, operators carry several tiny dedicated boards - much like photographers choose multiple lightweight prime lenses instead of a single heavy zoom lens.

Need 20 meters today? Grab the 20-meter board.

Testing 30 meters tomorrow? Carry the 30-meter version.

Because every board is band-specific, compromises disappear. Filters are simpler, performance improves, and construction costs remain low.

## Hardware Philosophy

Each board contains:

- Dedicated low-pass filter for maximum efficiency
- Single-band RF optimization
- Compact SMD final amplifier
- Integrated EFHW transformer on the PCB
- Extensive ES8311 codec test points for experimentation
- USB phone interface
- Autonomous operating capability
- Ultra-low component count

## Why It Matters

The most interesting aspect of DDX-UNO is not the power output.

It is the removal of all the supporting baggage that traditionally accompanies HF operation.

Everybody already carries a smartphone. By using the phone as the power source, display, user interface, and computing platform, the radio itself can become remarkably small and inexpensive.

A complete HF station can fit in a pocket:

- DDX-UNO HF transceiver
- A smartphone (which you already carry)
- USB-C cable

Nothing more.

## The Vision

> Less power. More adventure. Infinite possibilities.

DDX-UNO is not trying to compete with a 100-watt base station.

> Does making an 'assured' DX contact using 5 kW and a 128-element beam antenna spark joy?
>
> Perhaps not so much.

> Does climbing up a mountain in Pune and reaching Belize with 1 W spark joy?
>
> Quite an indescribable one :)

It is attempting to create a radio that is always available, always portable, and always ready for experimentation.

A radio that can travel anywhere because it weighs almost nothing and fits in a small flat'ish tin can!

A radio that encourages spontaneous operating.

A radio that removes excuses.

Because a sub-1-watt transceiver in your pocket will make more contacts than a 100-watt transceiver left at home.

## Technical Notes

- Tokmas SMD GaN FET as final?

  - Check thermal stresses and stability in ADS

  - What about the no-final-FET approach?

  - SOIC-8 NCP81074ADR2G or NCP81074A-DFN → Bifilar SMD transformer → LPF → Antenna!

  - Backup plan: Boring SN74LVC244A-QFN (logic-buffer PA approach)

- ES8311 codec with many test points

- Bulk electrolytic SMT caps - Say NO to tantalums!

- Smaller than a mobile phone - not slimmer yet though ;)

- 2.54mm pluggable PCB terminal block (M + F)

- RP2350-Zero will NOT be mounted on the berg strip 'bed'

- Transparent heat shrink wrapping

- Dedicated single band SMD LPF

- Single PCB - keeps manufacturing and assembly costs down

- Superb RX performance (80 to 100+ countries in day)

- Powers from a mobile phone

- 15m and 10m both using single LPF? DDX-UNO's first batch.

- Think Pixie-CW but with relatively space-age components and technology!

- Auto-mode: The MCU does stuff even without the phone connected!

- XC6206P332MR-G, 3.3v 200mA

- EFHW Toroid ~16mm OD

- How much power is being generated at 5V drain? 500mW plus is good!

- Onboard SMA connector for antenna tuning?

- Not a copy-paste of the same uSDX firmware

- Modern design with modern ("space-age") components

- Inbuilt EFHW with a 1m to 3m counterpoise

## A fresh new architecture?

- Puya SOP-16 'invisible' MCU - Used for AFP-FSK loop during TX only

- CM108B as the only USB exposed chip

- While there are better Cmedia chips (with embedded programmable MCU?) , they are pretty much unobtanium

## Target Price

Is a target price of <= 2000 INR possible? What about <= 1500 INR?

## Schematic

{{< embed-pdf url="/pdfs/DDX-UNO.pdf" hideLoader="true" >}}

Filter simulation (from TinyDX project):

![TinyDX LPF Filter Sim](/images/TinyDX-Filter-Sim.png)

The RX performance is pretty nice!

![RX performance](/images/DDX-RX-1.png)
