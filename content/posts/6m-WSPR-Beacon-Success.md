---
title: "Initial success with cost-effective 6m WSPR + 2m FT8 beacons"
date: 2025-08-16
tags:
- Ideas
- Idea
- RF Hacking
- HAM
- Amateur Radio
- WSPR
- Amplifier
- 6m
- 50 MHz
---

Our 6m WSPR beacon design works fine now. The key is to use a 25 MHz high-quality TCXO, like the 25 MHz HCI 0.5ppm TCXO!

![Demo 1](/images/6m-WSPR-Beacon-1.png)
![Demo 2](/images/6m-WSPR-Beacon-2.png)
![Demo 3](/images/6m-WSPR-Beacon-3.png)
![Demo 4](/images/6m-WSPR-Beacon-4.png)
![Demo 5](/images/6m-WSPR-Beacon-5.png)

2m WSPR is still out of reach for this VFO design - see the following `drifty` screenshots:

![Drifty 1](/images/2m-drift-1.png)
![Drifty 2](/images/2m-drift-2.png)
![Drifty 3](/images/2m-drift-3.png)

While WSPR is no good, 2m FT8 works pretty fine!

![2m FT8 1](/images/2m-FT8-1.png)
![2m FT8 2](/images/2m-FT8-2.png)

Of course, the next challenge is to get 2m WSPR beacons working at a low cost.

References:

- https://github.com/kholia/Easy-Beacons-STEM

- https://github.com/kholia/Si5351-Module-Clone-TCXO/tree/master/Si5351-Trimmed-Module-25-MHz

- https://github.com/kholia/Easy-Beacons-STEM/tree/master/Amplified-WSPR-Beacon-v3-Production/Pico-Beacons-NTP-TCXO-FT8-v2
