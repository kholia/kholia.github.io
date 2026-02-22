---
title: "Black Box output characterization of CD2003 DCR receiver"
date: 2025-09-21
tags:
- RF Hacking
- RF
- CD2003
- Characterization
- HF
- Shortwave
- RX
- Receiver
- LNA
- RF gain
- 6m
- BONUS!
---

Circuit: DDX-Commercial-7

Antenna: Small jumper cable attached

![DDX-Commercial-7](/images/DDX-Commercial-7.png)

## Initial Results

10m: 36 dB on WSJT-X audio meter, on quiet and also with nearby beacon on !!!

12m: 36 dB on audio meter, on quiet and also with nearby beacon on !!!

15m: 46 dB on audio meter on quiet, 65 dB with nearby beacon on - OK

20m: 44 dB on quiet,  65 dB with beacon on - OK

40m: 40 dB on quiet, 60 dB with beacon on - OK

## LNA Tests

Setup: Same jumper antenna ➔ 20 dB LNA (Zeenko BM) ➔ 10 dB ATTN ➔ Same RX circuit as before

10m: 47 dB on audio meter on quiet, 63 dB with beacon on. SnR is much improved (checked on WSJT-X spectrum and FT8 decodes).

20m: 55 dB on quiet - OK, frontend running hot?

40m: 54 dB on quiet - OK, frontend running hot?

## Findings

Finding 1: 10 dB gain works better than 20 dB gain on 10m. Too much gain can be problematic!

With actual 5m EFHW antenna attached: Audio meter is near 60 dB on 10m - great!

Conclusion: We need to fix the RF gain problem on 12m and 10m bands.

## Visuals

With `Zeenko BM` LNA added:

![CD2003 with LNA](/images/CD2003-with-LNA-Sep-2025.png)

![CD2003 with LNA 2](/images/CD2003-with-LNA-Sep-2025-2.png)

The "waterfall spectrum" display is pretty clean!

![CD2003 with LNA 3](/images/CD2003-with-LNA-Sep-2025-3.png)

![CD2003 with LNA 4](/images/CD2003-with-LNA-Sep-2025-4.png)

![CD2003 with LNA 5](/images/CD2003-with-LNA-Sep-2025-5.png)

![CD2003 with LNA 6](/images/CD2003-with-LNA-Sep-2025-6.png)

CD2003 works even on 6m when LNA is added (!!!).

![CD2003 6m with LNA 1](/images/CD2003-6m-LNA-Needed-1.png)
