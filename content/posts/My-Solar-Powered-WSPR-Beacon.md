---
title: "My solar powered WSPR beacon"
date: 2025-10-26
tags:
- Solar
- Go Green
- WSPR
- Beacon
- Digital Beacon
- Sustainability
- 12m
---

My solar powered WSPR beacon is now active on the 12m band!

Tech stack: Navitas 100W Solar Panel, Exide Solar Blitz 40AH battery, Skypearll Solar Charge Controller 30A, 200W 20A DC-DC CC CV Buck module (Robu) - set to output 7.5V, Waveshare ESP32-S3 Zero board, Si5351 with 0.5ppm TCXO, `GSD-Hacks-v5` amplifier, DFRobot Gravity Digital 5A Relay Module

Photos of components involved (for reference):

![200W CC CV Buck Module](/images/200W-CC-CV-Buck-Module.jpg)

![New Solar Charge Controller](/images/New-Charge-Controller.jpg)

First spots:

![WSPR 12m - First Spots](/images/WSPR-12m-First-Spots.png)

![WSPR 12m - Spots](/images/12m-WSPR-Spots-Late-2025.png)

I will work on improving the power efficiency of this system in the coming days - stay tuned for updates...

Next steps:

- Enable TX'ing on different bands (17-15-12-10). Antenna plans: Multi-band vertical antenna (`17-Five`?) with `ATU-10` automatic antenna tuner.

- Enable power gating for `GSD-Hacks-v5` amplifier via a MCU controlled 3.3v compatible relay module.

- TX every 10 minutes during daytime. TX every hour during night-time.

References:

- https://github.com/kholia/HF-PA-v10/tree/master/GSD-Hacks-v5

- https://github.com/kholia/Si5351-Module-Clone-TCXO

- https://github.com/kholia/Multi-WSPR/tree/master/Tightest-WSPR-v2
