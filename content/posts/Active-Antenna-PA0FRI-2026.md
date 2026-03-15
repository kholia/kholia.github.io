---
title: "PA0FRI Active Antenna Redux - The final version?"
date: 2026-02-12
tags:
- Active Antenna
- PA0FRI
- BFR93A
- BFR106
- BFR193
- MMBT2222A,215
- Antenna
- RF Hacking
- RF
- Amateur Radio
---

I recently worked on a redesign of the PA0FRI active antenna using high-speed
BFR93A, BFR106, and BFR193 transistors. As a fallback in case of issues, we
planned to use NXP `MMBT2222A,215` transistors.

## Design

3D render:

![PA0FRI Active Antenna 2026 Render](/images/AA-2026-Final-4.png)

Schematic:

{{< embed-pdf url="/pdfs/AA-2026.02-1.pdf" hideLoader="true" >}}

## Simulation Results

![PA0FRI Active Antenna 2026 Sim 1](/images/AA-2026-Sim-1.png)

![PA0FRI Active Antenna 2026 Sim 2](/images/AA-2026-Sim-2.png)

![PA0FRI Active Antenna 2026 Sim 3](/images/AA-2026-Sim-3.png)

Using BFR193 transistors:

![PA0FRI Active Antenna 2026 Sim 4](/images/AA-2026-Sim-4.png)

With a more faithful simulation and stronger biasing, we were able to improve
the OIP3 figure.

![PA0FRI Active Antenna 2026 Sim 5](/images/AA-2026.02-Max-OIP3.png)

Final bias values:

![PA0FRI Active Antenna 2026 Sim 6](/images/AA-2026-Sim-Final-Biasing.png)

## Updates

March 2026: The design worked immediately. Current consumption is ~24 mA at a
10 V input (about 0.7 V is dropped across the polarity-protection diode). This
matches the simulations closely.

With and without the `PA0FRI Active Antenna 2026`:

![PA0FRI Active Antenna 2026 - 1](/images/AA-2026-1.png)

On-air testing:

![PA0FRI Active Antenna 2026 - 2](/images/AA-2026-2.png)

![PA0FRI Active Antenna 2026 - 6](/images/AA-2026-6.png)

15-March-2026: To improve the reliability and ruggedness, we substituted the
BFR193 parts with the common and 'boring' `MMBT2222A,215` transistors.

With and without the `PA0FRI Active Antenna 2026`:

![PA0FRI Active Antenna 2026 - MMBT2222A NXP](/images/AA-2026-7.png)

Conclusion: The PA0FRI Active Antenna 2026 has more than enough gain on 28 MHz
with NXP `MMBT2222A,215` transistors.

Proper SDR software settings for testing:

![PA0FRI Active Antenna 2026 - SDR software settings](/images/AA-2026-8.png)

## Notes

Three aspects of an `active antenna` that affect performance:

- The installation location

- The physical loop itself (currently a 1 m diameter RG-213 coax loop, shorted
  at both ends). We are not yet sure whether this helps the performance.

- The active amplifier stage

- The PCB fits within a Schedule-40 2-inch PVC endcap easily.

## Related Articles

- [My PA0FRI Active Antenna Results]({{< relref "Active-Antenna-PA0FRI-Results.md" >}})

- [Comparing LZ1AQ, M0AYF, PA0FRI and MLA-30+ active loops](https://sites.google.com/site/randomwok/Home/electronic-projects/aerials/comparing-lz1aq-m0ayf-pa0fri-and-mla-30-active-loops)

- [PA0FRI active loop evaluation](https://sites.google.com/site/randomwok/Home/electronic-projects/aerials/pa0fri-active-loop-evaluation)
