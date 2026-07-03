---
title: "1/4 Wave HF Vertical DX Antenna"
date: 2026-07-13
tags:
- WSPR
- Beacon
- 20m
- Antenna
- HF
---

My new favorite HF antenna is the `1/4 Wave HF Vertical DX Antenna with 2
Elevated Radials`.

It is NOT the most portable antenna (an EFHW wins there) but it is the easiest
HF antenna to construct!

It is easier to construct, install, and tune than even the basic dipole
antenna!

It takes less than 15 minutes to build and get on the air with this HF DX
antenna!

No impedance transformer is required. After trimming, the antenna can directly
feed 50 Ω coax. A 1:1 common-mode choke (`coax choke works too`) at the
feedpoint is recommended but NOT absolutely required at low power levels.

Elevated Radials ARE a MUST: Mount the feedpoint approximately 2-3 m above
local ground. Run the two radials in opposite directions, sloping downward
symmetrically, while keeping their ends insulated and clear of the ground.

## Things needed

- Wire lugs * 2

- Three quarter-wave wire elements, approximately ~5.3 m each for 20 m; start slightly longer for trimming - Polycab 0.5 sq mm or thicker

- Heat shrink tubing

- SO-239 chassis mount connector * 1

- Decathlon `Ufish compact 5-m telescopic pole fishing pole`

  Note: The pole must be RF-transparent

- [Optional] Threadlocker adhesive (`Anabond 122 or 412 - 4ml`)

- Twist ties - always helpful ;)

![Reference Photo - Quarter-Wave Vertical HF](/images/Quarter_Wave_Drawing.png)

Note: Please ignore the 45-degree angle in the above sample picture.

Note 2: For 20 m, initially cut all three wires to approximately 5.2-5.3 m.
Install the complete antenna in its final geometry, then shorten or fold back
the wires symmetrically until resonance is at the desired frequency.

## Results

Within less than 48 hours of WSPR'ing from a 1st-floor balcony with `~1W` RF output:

![WSPR Results](/images/WSPR-2026-1.png)

The antenna produced widespread international WSPR reception with approximately
1 W from a partially obstructed first-floor balcony, demonstrating that this
simple installation is effective for QRP DX operation.

Note: The `West` direction is blocked by multiple buildings!

Approximate propagation conditions:

```bash
$ python3 dx.py

═══════════════════════════════════════════════════════
  HF DX INDEX - Current Conditions
═══════════════════════════════════════════════════════
  Updated: 2026-07-13 04:16 UTC

  Band   Now      Rating             Tomorrow
  ────────────────────────────────────────────────
  10m    31.5     🔴 Poor             41.9 (Fair)
  15m    17.4     ⚫ VeryPoor         10.1 (VeryPoor)
  20m    33.4     🔴 Poor             37.1 (Fair)
  40m    69.2     🟢 Good ⬆+58%       48.0 (Fair)
  80m    46.1     🟠 Fair             40.7 (Fair)

═══════════════════════════════════════════════════════
  Source: tinyurl.com/HFDXProp | 73 de HB9VQQ
```

## Previous Experience

Around December-2023, I did two park trips with this antenna design.

![3-GP-In-Park-1](/images/Park-3-GP-1.jpg)

![3-GP-In-Park-2](/images/Park-3-GP-2.jpg)

![FT8 App in action](/images/FT8-App-Park-1.jpg)

I even managed to get a Plus-FT8 report from Sweden from MK68 with a QRP TRX!

## Resources

- https://www.kk5jy.net/three-wire-gp/ - AWESOME!

- https://pa3a.nl/antenna-design-with-eznec/
