---
title: "WSPRing on higher bands"
date: 2025-08-30
tags:
- Higher bands
- 6m
- 4m
- WSPRing
- WSPR'ing
- Ideas
- Idea
- RF Hacking
- HAM
- Amateur Radio
- WSPR
- 50 MHz
- 70 MHz
---

Our WSPR beacon design works fine even on the 4m band (~70 MHz) . The key is to use a 25 MHz high-quality TCXO, like the 25 MHz HCI 0.5ppm TCXO!

## Results

![Demo 1](/images/WSPR-4m-HCI-25-TCXO.png)
![Demo 2](/images/WSPR-4m-HCI-25-TCXO-2.png)

## Challenges

2m WSPR is still out of reach for now - see the following `sporadic` decodes.

![Drifty 1](/images/WSPR-2m-tough-August-2025.png)
![Drifty 2](/images/WSPR-2m-tough-August-2025-2.png)

Of course, the next challenge is to get 2m WSPR beacons working 100% reliably at a low cost.

Initially, we will be driving Si5351 with a 10 MHz clock output from a GPSDO to achieve this task.

## References

- [Easy-Beacons-STEM](https://github.com/kholia/Easy-Beacons-STEM)

- [Si5351-Trimmed-Module-25-MHz](https://github.com/kholia/Si5351-Module-Clone-TCXO/tree/master/Si5351-Trimmed-Module-25-MHz)
