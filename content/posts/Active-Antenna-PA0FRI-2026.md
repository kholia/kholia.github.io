---
title: "PA0FRI Active Antenna Redux - The final version?"
date: 2026-02-12
tags:
- RF Hacking
- RF
- Active Antenna
- Antenna
- HAM
- Amateur Radio
- PA0FRI
- BFR93A
- BFR106
- BFR193
---

I recently worked on a PA0FRI Active Antenna design with fast BFR93A / BFR106 /
BFR193 transistors.

## Design

3D render:

![PA0FRI Active Antenna 2026 Render](/images/AA-2026-Final-4.png)

Schematic:

{{< embed-pdf url="/pdfs/AA-2026.02-1.pdf" hideLoader="true" >}}

## Simulation Results

![PA0FRI Active Antenna 2026 Sim 1](/images/AA-2026-Sim-1.png)

![PA0FRI Active Antenna 2026 Sim 2](/images/AA-2026-Sim-2.png)

![PA0FRI Active Antenna 2026 Sim 3](/images/AA-2026-Sim-3.png)

With BFR193 transistors:

![PA0FRI Active Antenna 2026 Sim 4](/images/AA-2026-Sim-4.png)

With a more faithful simulation and harder biasing, we were able to improve the OIP3 figure!

![PA0FRI Active Antenna 2026 Sim 5](/images/AA-2026.02-Max-OIP3.png)

Final biasing values?

![PA0FRI Active Antenna 2026 Sim 6](/images/AA-2026-Sim-Final-Biasing.png)

## Updates

March 2026: The design worked right away! Current consumption is ~24mA at 10V
voltage input (0.7V is dropped across the polarity protection diode we have in
there). And 33mA @ 10.5V. This matches the simulations pretty well!

With and without the `PA0FRI Active Antenna 2026`:

![PA0FRI Active Antenna 2026 - 1](/images/AA-2026-1.png)

On-air testing:

![PA0FRI Active Antenna 2026 - 2](/images/AA-2026-2.png)

![PA0FRI Active Antenna 2026 - 4](/images/AA-2026-4.png)

## Notes

The three aspects of an `Active Antenna` that affect its performance:

- The installation location

- The physical loop itself (currently 1m diameter RG-213 coax - shorted on both ends)

- Lastly, the 'active' amplifier

## Related Articles

- [My PA0FRI Active Antenna Results]({{< relref "Active-Antenna-PA0FRI-Results.md" >}})

- [Comparing LZ1AQ, M0AYF, PA0FRI and MLA-30+ active loops](https://sites.google.com/site/randomwok/Home/electronic-projects/aerials/comparing-lz1aq-m0ayf-pa0fri-and-mla-30-active-loops)

- [PA0FRI active loop evaluation](https://sites.google.com/site/randomwok/Home/electronic-projects/aerials/pa0fri-active-loop-evaluation)
