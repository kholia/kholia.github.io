---
title: "New RF parts and new promises"
date: 2025-03-20
tags:
- RF Hacking
- HAM
- Amateur Radio
- WSPR
- HF
- Shortwave
- 1W
- 5W
- Amplifier
- RF Amplifier
---

Ismo (OH2FTG) recently introduced me to a bunch of Tokmas RF parts. Out of these, the `Tokmas CID10N65F GaN FET` stood out. It seems to have a lot of potential (for HF + 6m) at a very low price point.

This RF MOSFET part can be purchased from LCSC.

It seems `Tokmas CID10N65F` has the potential to completely replace the `RD16HHF1` part from Mitsubishi Electric!

Datasheet excerpt:

![New hotness](/images/Tokmas-CID10N65F-1.png)

The full datasheet is available [here](https://www.lcsc.com/datasheet/lcsc_datasheet_2410121803_Tokmas-CID10N65F_C22446732.pdf).

This device should be quite competitive even when compared to the RD15HVF1-501 MOSFET!

![Old dog](/images/RD15HVF1-501-Ciss.png)

I am planning to build a couple of projects around this part soon - stay tuned for more!

Updates:

The copper substrate is connected to the source. So it can be placed on the radiator right away without an insulating thermal pad. The TO-220F package has an insulating plastic body on all sides. By using a "sharpening bar", the plastic body can be scraped away from below to reach the copper substrate (via http://cqham.ru forum). This modification results in a massive heat dissipation improvement (about 30 degrees).

![New hotness modification](/images/TO220F-Insulation-Scraping.jpg)

Here is the 3D render for a PCB I made for testing this part:

![GaN FET Test PCB](/images/GaN-Test-PCB-2.png)

Updates (22-April-2025):

With `Tokmas CID10N65F`, 14V @ drain, 5V to driver we get ~8W on 28MHz and 6W at 50 MHz! It seems we have a winner here. The DUT also stays pretty cool (as compared to the "famous" IRF510) it seems. With 20V @ drain, it easily reaches ~12W at 50 MHz!

Picture:

![Demo picture](/images/Tokmas-TO-220-1.jpg)
