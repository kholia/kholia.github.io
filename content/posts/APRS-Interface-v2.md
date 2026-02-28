---
title: "Wireless APRS interface for BaoFeng and other radios!"
date: 2026-01-29
tags:
- APRS
- BaoFeng
- VHF
- UHF
- KiCad
- Bluetooth
- SPP
- BLE
- Wireless
- APRSdroid
- Digital Interface
- KISSLink
- v1
- YAAC
---

## Description

We have built a Bluetooth-enabled and APRSdroid-compatible digital interface (KISS TNC) for less than 15 USD (for the fully-loaded make including cables). We call it the KISSLink v1.

![KISSLink v1](/images/aprsdroid-3.jpg)

![KISSLink v1 Render](/images/KISSLink-v1-7.png)

This digital interface can be powered from the USB 5V or the inbuilt battery.

## Schematic

{{< embed-pdf url="/pdfs/KISSLink-v1.pdf" hideLoader="true" >}}

## RX path simulation (AF front-end)

![KISSLink v1 Simulation TX](/images/KISSLink-Sim-TX-1.png)

![KISSLink v1 Simulation RX](/images/KISSLink-Sim-RX-1.png)

## Motivation

https://store.mobilinkd.com/products/mobilinkd-tnc4 is the BEST but it is expensive and hard to source (from many global locations).

Think upwards of 150 USD for getting a fully-loaded Mobilinkd TNC4.

## BOM

- Raspberry Pi Pico 2W - 610 to 750 INR

- Ambrane 3.5mm to 3.5mm male aux stereo cable TRS - 130

- 2.5mm to 3.5mm aux stereo cable - 250 (element14)

- PCB - 150

- Components - 70

- Case - 100 INR

- Good quality 18650 cell - 150 to 200 INR

Total - ~1375 INR or less (< 15 USD)

## Notes

- We considered using "1000mAh" 14500 cells for their compactness (AA sized)
  but ultimately went in for much higher capacity 18650 cells.

- The device can be powered either from the internal battery or via the Pico USB port. When charging the battery, use the externally exposed TP4056 module's USB connector. Do not connect both USB ports simultaneously!

## Pros

- FREE hardware (Gerbers + BOM + CPL + enclosure design file)

- Open schematic!

- No cables to make. No cables to cut up!

- THT audio connectors which can handle rough handling

- We may even open-source the firmware part (currently requires a support license) after sales target are hit ;)

## Currently Supported Protocols

- KISS over Bluetooth SPP

- KISS over Serial USB

![YAAC support 1](/images/YAAC-1.png)

## Tested Software

- APRSdroid from https://aprsdroid.org/download/builds/

- YAAC from https://www.ka2ddo.org/ka2ddo/YAAC.html

- `aprx` from https://github.com/PhirePhly/aprx (the best headless aprs software)

## Configuring 'aprx' for KISS TNC over Serial USB

```
sudo apt-get install aprx

$ cat /etc/aprx.conf  | grep -v "#"
mycall  VU3CER-1


<aprsis>
passcode  ...
server    rotate.aprs2.net
</aprsis>

<logging>
...
</logging>

<interface>
   serial-device /dev/ttyACM0  9600 8n1    KISS
</interface>

<beacon>
</beacon>
```

```
sudo systemctl enable aprx

sudo systemctl start aprx
```

```
$ pwd
/var/log/aprx

$ tail -f aprx-rf.log
2026-02-05 15:49:51.694 VU3CER-1  R KISSLK>APRS:>Vpp: 75 mV
2026-02-05 15:49:53.020 VU3CER-1  R VU3CER>VU3FOE,WIDE1-1,WIDE2-2:!/E0Hoa1#!>   /A=002116Pico APRS Beacon
2026-02-05 15:49:53.580 VU3CER-1  R KISSLK>APRS:>Vpp: 667 mV
2026-02-05 15:49:53.708 VU3CER-1  R KISSLK>APRS:>DEC: heard+1 good+1 fcs+0 flag+38 cdt+0/0
2026-02-05 15:49:55.661 VU3CER-1  R KISSLK>APRS:>Vpp: 74 mV
2026-02-05 15:49:57.677 VU3CER-1  R KISSLK>APRS:>Vpp: 71 mV
2026-02-05 15:49:59.653 VU3CER-1  R KISSLK>APRS:>Vpp: 72 mV
...
```

## The Challenging Bits

Trying to fit / map the wide voltage range of BaoFeng's speaker output (audio
power amplifier output and NOT line-level audio) into the narrow ADC's voltage
range is not a trivial problem.

## Future

- Enable and test BLE support in the firmware for iOS

## Mechanical strength matters

On why the audio connectors can't be SMD ones:

![Weak SMD Audio Connector](/images/Poor-SMD-Audio-Connectors.png)

## References

- https://aprsdroid.org/download/builds/

- https://github.com/na7q/aprsdroid

- https://github.com/ge0rg/aprsdroid

- [AIOC - Known issues](https://github.com/skuep/AIOC?tab=readme-ov-file#known-issues)

- https://direbox.net/blog/aioc-cable-review

- https://store.mobilinkd.com/products/mobilinkd-tnc4

- https://www.ka2ddo.org/ka2ddo/YAAC.html
