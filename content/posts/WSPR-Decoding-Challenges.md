---
title: "WSPR Decoding Challenges"
date: 2025-09-21
tags:
- Higher bands
- 6m
- 4m
- 2m
- WSPRing
- WSPR'ing
- RF Hacking
- HAM
- Amateur Radio
- WSPR
- 50 MHz
- 70 MHz
- 144 MHz
- "Science"
---

The https://github.com/rxt1077/wspr_spread work is pretty awesome.

It helped us debug why our TCXO-powered-WSPR beacon was pretty decent on 4m band but flaky on 2m.

`Doppler spread` value  on 70 MHz:

```
... 70.0924994  VU3CER MK68 23          0  0.29  1  1    0  1  44     1   810  0.517
```

Now see the problem on 144 MHz:

```
... 144.4905417  VU3CER MK68 23         -3  0.12  1  1    0  1  39     1   810  0.865
```

![WSPR Spread My](/images/VU3CER_region_of_interest.png)

Pretty all over the place but we are operating on 2m - so probably expected for a 25 MHz TCXO based system!

A better WSPR generator would produce something like this (https://github.com/rxt1077/dissecting_wsprd sample):

![WSPR Spread Proper](/images/W3HH_region_of_interest.png)

We will get there at a low cost eventually ;)

Update: Based on https://www.qrz.com/db/W3HH it seems that this sample recording is from 30m or 10m band. This explains the "low / tight doppler spread" value  for W3HH!


References:

- https://github.com/rxt1077/wspr_spread

- https://github.com/rxt1077/dissecting_wsprd

- https://github.com/kholia/Easy-Beacons-STEM

- https://github.com/kholia/Si5351-Module-Clone-TCXO/tree/master/Si5351-Trimmed-Module-25-MHz
