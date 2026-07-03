---
title: "HF Propagation"
description: "Live HF band conditions and regional WSPR propagation paths."
date: 2026-08-13
showtoc: true
---

See current HF band conditions worldwide, or choose a region to see its active
long-distance WSPR corridors. The display loads live data when the page opens,
refreshes every five minutes, and can be refreshed manually at any time.

{{< hf-propagation >}}

## Reading the display

The global view shows the current DX Index and tomorrow's forecast for each
available band. Regional views show the strongest band and WSPR activity for
each active intercontinental corridor.

The regional activity labels use the same thresholds as `dx.py`:

| WSPR spots per transmitter | Activity |
|---:|:---|
| 50 or more | Excellent |
| 25–49 | Good |
| 10–24 | Fair |
| Below 10 | Poor |

The data is produced by [HB9VQQ's HF DX Index](https://wspr.hb9vqq.ch/).
It is based on actual WSPR reception reports rather than a propagation model.
