---
title: "Simplest APRS Digipeater and iGate on MCU!"
date: 2026-02-07
tags:
- APRS
- iGate
- Digipeater
- BaoFeng
- VHF
- UHF
- KiCad
- Digital Interface
- KISSLink
- RPi
- Pico 2 W
- Power Efficiency
---

## Description 

We have built the simplest, power efficient and 'ready-for-solar' APRS
Digipeater and iGate on a MCU (RPi Pico 2 W)!

![KISSLink v1 Render](/images/KISSLink-v1-7.png)

Our existing `KISSLink v1 BLE KISS TNC` device is capable of running in
standalone mode with an alternate firmware!

Goal(s): Our design prioritizes low power, reliability, and unattended
deployment over flexibility.

And yes, we want to do this with cheap, widely available BaoFeng radios. This
means a couple of things:

- We need remotely configurable volume knob (PT2259-S).

- FM notch filter OR VHF bandpass filter for BaoFeng's frontend-overload
  protection.

- The firmware will open a `control channel` in outbound mode.

  Essentially, it will be using standard MQTT for remote control, configuration
  and debugging.

## Configuring Mosquitto MQTT server

```
$ sudo cat /etc/mosquitto/mosquitto.conf
...
listener 1883
allow_anonymous true

listener 9001
protocol websockets
```

```
sudo systemctl enable mosquitto.service

sudo systemctl restart mosquitto.service
```

## Pros

- FREE hardware (Gerbers + BOM + CPL + enclosure design file)

- Open schematic!

- No cables to make. No cables to cut up!

- THT audio connectors which can handle rough handling

- We may even open-source the firmware part (currently requires a support license) after sales target are hit ;)

- No more struggling with flaky and power-hungry Raspberry Pi APRS setups ;)
