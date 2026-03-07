---
title: "Easy reproducible LPF filters"
date: 2025-11-01
tags:
- RF Hacking
- HAM
- Amateur Radio
- 25W
- LPFs
- LPF
- RF filters
- Filters
- LCR
- DE-5000
- Elsie
---

Here is the schematic for a standard 50Ω LPF for the 12-11-10m bands.

## Designs

![LPF Schematic 3](/images/LPF-Schematic-1.png)

PCB Render:

![LPF Render](/images/LPF-Render.png)

Actual photo:

![LPF Board Photo](/images/LPF-Photo-1.jpg)

## Performance

NanoVNA results of the PCB build:

![LPF NanoVNA Result 1](/images/LPF-NanoVNA-1.png)

![LPF NanoVNA Result 2](/images/LPF-NanoVNA-2.png)

## Build Notes

```text
These values come from RobG (https://hackaday.io/)

Shunt C: 100pF

Series L: 12T on T37-6 core, 11T on T50-6, making about 485nH

Shunt C: 180pF

Series L: 13T on T37-6 core, 12T on T50-6, making about 580nH

Shunt C: 180pF

Series L: 12T on T37-6 core, 11T on T50-6, making about 485nH

Shunt C: 100pF

Winding wire size: 27 SWG (is non-critical)
```

Note: We needed to reduce 1T (from the values specified above) when using the T50-6 cores. As usual, use a DE-5000 LCR Meter (or better) to know the exact values.

We have reduced the cost of such filters by using cost-effective 1kV SMD C0G caps instead of hard-to-get and "probably-obsolete" Silver Mica caps.

Cost: Less than 500 INR per filter!

Time to build: Less than 30 minutes per filter

Tested input power: 5W to 10W. Can handle 25W to 30W it seems.

## Other Bands

LPF for the 40-30m bands:

![LPF Schematic 1](/images/LPF-40-30.png)

LPF for the 20-17-15m bands:

![LPF Schematic 2](/images/LPF-20-17-15.png)

Note: We had to push the cutoff frequency to 25 MHz to get commercially-viable (available) high-voltage C0G caps.

Alternate LPF for the 20-17-15m bands:

![LPF MB Schematic](/images/LPF-MB-Design.png)

![LPF MB Response](/images/LPF-MB-Response.png)

## References

- [T50-6 Info](https://toroids.info/T50-6.php)

- [T50-2 Info](https://toroids.info/T50-2.php)

- [Marki Microwave Filter Design Tool](https://markimicrowave.com/technical-resources/tools/lc-filter-design-tool/)
