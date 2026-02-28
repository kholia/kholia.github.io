---
title: "Choosing a coax for HF field operations"
date: 2025-11-05
tags:
- Coax
- RF Hacking
- HAM
- Amateur Radio
- SOTA
- POTA
- FieldOps
- Portability
- Hard Choices
---

Setup: Si5351 RF generator (@ 28 MHz) ➔ GSD-Hacks-v5 digital amplifier ➔ 7th order LPF ➔ {COAX-UNDER-TEST} ➔ Digital RF power meter ➔ Dummy load

## Results

Results at 13.8V drain:

|Coax Type | Power Reading |
|----------|---------------|
| RG-58 (7 meters)  | 4.5W |
| RG-316 (7 meters) | 3.9W |
| RG-188 (7 meters) | 3.9W |

Results at 15V drain:

|Coax Type | Power Reading |
|----------|---------------|
| RG-58 (7 meters)  | 5.4W |
| RG-316 (7 meters) | 4.7W |
| RG-188 (7 meters) | 4.7W |

These measurement results seem to match the ones from `Eric, WD8RIF`.

## Conclusion

For ultra-portable HF field operations (POTA / SOTA / others), carrying a roll of RG-58 coax can be challenging.

Using RG-316 (light but a little stiff) and RG-188 (flexible and lightweight) for bicycle-portable or man-portable operations can be a decent option if we are willing to tolerate some RF power losses.

Also, RG-58 with PL-259 connectors is pretty mechanically rugged in comparison against RG-316 and RG-188 - another factor to keep in mind.

## References

- [GSD-Hacks-v5](https://github.com/kholia/HF-PA-v10/tree/master/GSD-Hacks-v5)

- [Easy-Digital-Beacons-v1](https://github.com/kholia/Easy-Digital-Beacons-v1)
