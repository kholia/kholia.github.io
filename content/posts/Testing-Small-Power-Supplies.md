---
title: "Testing small power supplies"
date: 2025-02-18
tags:
- Electronics
- Power Supplies
- Load testing
- HAM
- Testing
- Trust but verify
---

I found this `60W Electronic Load` to be quite useful for testing small power adapters and supplies.

![Small Electronic Load](/images/Electronic-Load-Small.jpg)

While it is [possible to homebrew an adjustable electronic load](https://github.com/kholia/Adjustable-Load-v1.1) we recommend getting this electronic load module or a [better-but-costlier one](https://www.toolworld.in/product.php?pid=12296) like the UNI-T UTL8212+ electronic load.

## Observations

You can stress-test power supplies using this electronic load quite easily and conveniently.

It turns out that the `Orange` branded 12V 2A or 3A adapters from Robu are of really poor quality. The output voltage drops to less than 2V when the load current is increased to around 1A. This is NOT the first time that the `Orange` branded stuff has turned out to be of poor quality. In the end, you get what you pay for.

Sample 'Orange' adapter:

![Sample Orange Adapter](/images/Orange-9V-2A-Power-Supply-2.png)

In a similar vein, the power supply shipped with the `Airtel's GX router` is really lightweight and quite unreliable. I had to reboot my router every day to get the internet working again. Once this `GX` branded 12V 1.5A power adapter was replaced with a Mornsun 12V 3A SMPS, the very same GX FTTH router became rock solid even with multiple weeks of uptime!

Robu's newer 2025 `Pro-Range` branded power adapters fared much better in my testing. I will power a `Tata Sky STB` using a 12V Pro-Range 1.5A adapter soon and see how it works in real-life.

![Sample Pro-Range Adapter](/images/Pro-Range-Adapter.jpg)

Update: The `Pro-Range` branded power adapters are able to supply the specified power but are still pretty `noisy` it seems!
