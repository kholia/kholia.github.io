---
title: VHF APRS Beacon Ideas
date: 2026-07-08
tags:
- APRS
- Beacon
- 2m
- 145 MHz
- Amplifier
- Ideas
- RF Hacking
- Amateur Radio
---

This is an early design sketch of VHF (2m - 145 MHz) APRS beacons that are
small and can be placed in vehicles like ambulances or fire trucks.

## Key Points

- Si5351 module powered by the usual 25 or 26 MHz 0.5 ppm TCXO.

- Si5351 generates 145 MHz `Two-Tone APRS` RF output directly! Using an Si5351
  for APRS (Automatic Packet Reporting System) transmission via FSK (Frequency
  Shift Keying) allows us to generate highly accurate AX.25 packets directly at
  the RF frequency (e.g., 144.390 MHz), eliminating the need for a separate
  modulator and VCO.Since APRS typically uses AFSK (Audio Frequency Shift Keying)
  fed into an FM transmitter, generating FSK with an Si5351 means directly
  shifting the carrier frequency or the VFO instead of modulating an audio tone.

- INNOTION YG602020 gain block into ATTN and then into INNOTION YG401530VB
  driver block. Add appropriate filters between stages!

- Use Mitsubishi RD15HVF1-501 MOSFET as finals

- Easy and more than 1W RF output?

## Alt Ideas

- https://how.aprs.works/lora-aprs-bringing-aprs-into-the-21st-century/ (LoRa APRS FTW!)

  LoRa APRS @ 868 MHz looks very promising!

  LoRa APRS @ 433 MHz seems the best for cities and dense urban settings - Let's do a PoC with it!

- UHF APRS - not very well explored - skip!

## Status

Results: To be built and tested soon!

## Resources

- https://www.george-smart.co.uk/aprs/aprs-on-hf/

- https://github.com/kenndaniel/APRSBalloon

- [FSK with the Si5351 Clock Generator (Increasing the Si5351 register update rate)](http://wb6cxc.com/?p=143)

- https://how.aprs.works/finding-70-cm-equipment-for-lora-aprs/

- https://github.com/richonguzman/LoRa_APRS_Tracker

- https://gsasindia.com/blog/reyax-lora-getting-started-433mhz-india
