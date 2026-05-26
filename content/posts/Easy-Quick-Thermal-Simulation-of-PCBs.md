---
title: "Easy and Quick Thermal Simulation of PCBs"
date: 2026-04-11
tags:
- Keysight ADS
- ADS
- Thermal Simulation
- RF Hacking
- Amateur Radio
---

I could NOT get the [Open-Source Thermal Simulation of PCBs technique](https://jrainimo.com/build/2024/11/oss-thermal-simulation-of-pcbs/) to work with my 4-layer PCB board at all, even after spending some days on it. To make things worse, I was NOT able to get useful debugging feedback from the involved patchy toolchain.

Getting access to the `TRM software by ADAM Research` turned out to be a sort
of very bureaucratic and slow process - I never ended up using it.

My first PCB spin failed - predictably - due to thermal issues. A TO-252 GaN FET
dissipated enough heat to significantly affect a nearby RX TCXO. The TCXO drift
became obvious above 45°C or so.

We eventually fixed the issue by manually reasoning through heat flow, copper
spreading, and component placement. But this clearly wasn't scalable,
repeatable, or reliable.

I was still looking for a systematic way to catch thermal problems early.

As luck would have it, I attended a Keysight EDA conference and met some
incredibly helpful engineers. They walked me through PCB thermal simulation in
Keysight ADS - in under three minutes.

Despite being completely new to ADS, I had my own board simulated in under 20 minutes.

The results were immediately insightful: I could clearly see the thermal hotspot from the FET coupling into the TCXO region, and why the original layout could never have worked. The revised layout, on the other hand, showed safe temperature margins.

Priceless!

Failing PCB:

![Failing PCB: Thermal coupling into TCXO region](/images/ADS-Thermal-Sim-0.png)

Revised PCB:

![Revised PCB: No thermal coupling into TCXO region](/images/ADS-Thermal-Sim-1.png)

![Revised PCB: No thermal coupling into TCXO region](/images/ADS-Thermal-Sim-2.png)

For RF designs where frequency stability matters, thermal simulation is not optional - it's essential.

Quick ADS reference:

```
$ cat /etc/lsb-release
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=26.04
DISTRIB_CODENAME=resolute
DISTRIB_DESCRIPTION="Ubuntu 26.04 LTS"

sudo apt install libxcb-ewmh2 ksh
```

```
cd ~/ADS

export ADS_LICENSE_FILE=27009@localhost

./Licensing/2026.2/linux_x86_64/bin/lmgrd -c agileesofd.lic -l license.log

./bin/ads
```

Process:

1. Export ODB++ file from KiCad ≥ 10.

2. Ensure NPTH holes are NOT included (temporarily modify footprints if required).

3. Create a new workspace in ADS and import the ODB++ file.

4. From the ADS layout window, launch SIPro / PIPro.

5. Define heat sources and power dissipation values for relevant components.

6. Click Run - and you're done.

Even complex multi-layer boards converge quickly without manual meshing or solver tuning. The whole process takes less than 5 minutes and gives back immediately actionable results!
