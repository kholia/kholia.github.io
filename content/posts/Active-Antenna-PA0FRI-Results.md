---
title: "My PA0FRI Active Antenna"
date: 2025-02-08
tags:
- RF Hacking
- RF
- Active Antenna
- Antenna
- HAM
- Amateur Radio
---

My homebrewed PA0FRI Active Antenna is working well from a very physically constrained location.

3D render:

![PA0FRI Active Antenna Render](/images/PA0FRI-Active-Antenna-Render.png)

Schematic:

![PA0FRI Active Antenna Schematic](/images/PA0FRI-Active-Antenna-Schematic.png)

Results:

![PA0FRI Active Antenna Results](/images/FT8-Reception-Results-4.png)

The antenna is connected to a RSP1 Clone SDR which is running custom FT8-band-hopping software. I am using a `SOLID 4-Way 5-2400 MHz RF splitter` to connect multiple SDRs to the same active antenna. NB: Plug-in 75-ohms dummy loads (terminators) on the unused ports of the RF splitter - MX-282 / MX-280 75-ohms dummy loads work fine.

![SOLID RF Splitter](/images/SOLID-RF-Splitter.jpg)

Time to build: Less than 45 minutes for the PCB. The mechanical aspects (loop construction and boxing) can take a while.

My live reception results from this antenna can be viewed at the following URL(s):

- [Live FT8 reception results](https://pskreporter.info/pskmap.html?preset&callsign=VU3CER&txrx=rx&timerange=86400)

Testing Update: An 10m EFHW antenna installed in the same 'surrounded balcony' location receives less than half-the-countries as compared to the PA0FRI active antenna.

Magic might not exist for grownups but the reception results of this Active Antenna from a very limited physical location are nothing short of magical!

The files for this project are [published here](https://github.com/kholia/DDX/tree/master/Active-Antenna) for personal (non-commercial) usage.

Special shout-out goes to Ismo (OH2FTG) and Gajendra Kumar Sir for their guidance on these topics - thank you!

Notes:

The first two decodes in the following screenshot are from a "turned off" active antenna. The last two decodes are from the same active antenna when turned on.

![The Active Antenna Effect](/images/Active-Antenna-Last-2-Decodes-28-MHz.png)

Remember the `Don't let the perfect be the enemy of the good` saying? While theoretically better active-antenna designs exist, we are not keen in pursuing those designs because the results of this PA0FRI AA are good enough (TM).

References:

- [Simple active receive loop antenna](https://www.pa1m.nl/simple-active-receive-loop/) - for physical construction aspects
