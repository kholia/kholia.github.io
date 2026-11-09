---
title: "Omnesta: A Smart Home App Under 256 KiB"
date: 2026-11-16
description: "eWeLink kept logging my wife out when I logged in. That frustration became Omnesta, a tiny native Android app bringing five smart home ecosystems together."
tags:
- Android
- Smart Home
- Software
- Hacking
---

The eWeLink app would log my wife out when I logged in from my phone.

Let that sink in. Two people living in the same house, wanting to operate
the same switches. My logging in would make her app stop working.
For our use, this was **100% unusable**.

The apps were slow to use too. Opening an app, waiting for it to become
useful, finding the device, and finally operating a switch felt like far
too much ceremony. Walking over to the physical switch was becoming a
competitive option.

Then there was the collection of apps. A device from one brand meant one
app. Buy something from another brand and acquire another app, another
login, and another interface to remember.

I wanted one quick place to operate the devices we already owned.

So I built **Omnesta**, available on [Google Play](https://play.google.com/store/apps/details?id=com.omnesta.app).

## Design decisions, upfront

We made a few deliberate choices about what we wanted to live with:

- **Vendor clouds are OK for now.** Our devices already use them, and we
  accept that dependency for the current setup. Internet access, vendor
  uptime, and their API and account rules remain part of the deal. We can
  revisit that tradeoff as our needs change.
- **No additional box to run and maintain forever.** We did not want
  another always-on computer or hub needing power, updates, backups, and
  occasional troubleshooting. Someone has to keep that equipment working
  long after the fun of setting it up has worn off.
- **No separate Omnesta backend either.** Moving that maintenance job to
  a rented server would still leave us with a maintenance job. The phone
  talks directly to the existing vendor clouds.
- **Keep the devices we already own.** No replacing working switches,
  flashing firmware, or rebuilding the house around a single brand.
  Vendor apps can continue to handle pairing and specialist features.
- **Make everyday control quick.** One small app, a common device view,
  and a short path to the power switch. Extra capabilities can come as
  they become useful; live video is one of those planned additions.

Home Assistant is amazing. But a dedicated installation still needs
hardware, power, and ongoing maintenance.
[Home Assistant Green is USD 199 before taxes](https://www.home-assistant.io/green),
and even Raspberry Pi prices now approach USD 400 at the high end:
[the 16 GB Pi 5 alone is USD 385 as of November 2026](https://www.raspberrypi.com/news/price-rises-for-some-16gb-raspberry-pi-products/).
Cheaper Pis exist, but a general-purpose Pi still feels like overkill for
our switching needs. We would also want rugged internal storage rather
than a setup relying on a removable microSD card.

Even if SBCs were free, they still would not appeal to us: constant power
draw, storage reliability concerns, and the whole thing being mega-overkill
for turning a switch on and off.

Our preferred direction would be to implement the home automation
**backend itself on an MCU**: device state, schedules, rules, and the
integrations we need, with Omnesta providing the phone interface. The
controller would run as embedded firmware, with **at most 0.5 W for the
whole setup**, rugged internal storage, and **close to zero maintenance**
as design targets. This would be a focused implementation of the functions
we need, rather than a port of the full Home Assistant stack.

There are precedents: [Tasmota](https://tasmota.github.io/docs/Berry/)
provides on-device automation and scripting, while projects such as
[ESP32 MQTT Broker](https://github.com/AntonSemko08/esp32-mqtt-broker)
put a broker, rules, timers, and a dashboard on the MCU itself. They show
parts of the idea already exist; they do not establish our power or
maintenance targets. We have not built our version yet. For now, a small
app using our existing vendor clouds suits us.

Those choices set the scope of Omnesta: bring our existing ecosystems
into a fast, convenient interface while keeping the amount we have to
operate and maintain small.

The irony of still needing power-guzzling vendor clouds (probably heating
up the atmosphere somewhere) just to turn off my Diwali lights is not
lost on us ;)

## Under 256 KiB. Yes, KiB.

**Omnesta's Android APK weighs under 256 KiB. You read that right.**

It launches instantly. The interface gets out of the way and lets me get
on with operating the house. Device discovery and commands still depend
on the network and the vendor's cloud; instant launch does not magically
remove Internet latency.

The app uses plain Android framework Java. No AndroidX, no bundled vendor
SDKs, and no third-party runtime libraries. Android already provides the
widgets, networking, cryptography, and storage primitives this app needs.

Even the build is small enough to understand: Android's resource tools,
`javac`, `d8`, packaging, alignment, and signing. No Gradle required.
It runs on Android 8 and newer.

The small APK is a satisfying result of keeping the implementation focused.
The useful part is how quickly I can get to a switch.

Once we add live video support, the app will grow in size. That is only
natural ;)

## One home for several ecosystems

Omnesta brings these integrations into one dashboard:

- **Tapo** / TP-Link
- **ZEB Home** / Zebronics
- **Wipro Smart Home**
- **Sonoff** / eWeLink
- **Qubo**

All five providers can be connected together, with one account per provider.
There is device search, an All view, provider filters, online/offline status,
and individual channel controls where supported. A local demo home lets
you try the interface without connecting an account.

A plug should feel like a plug, whichever logo happens to be printed on it.

Support here means the implemented device discovery and power-control
paths. It does not mean every camera, sensor, bulb feature, or device model
in each catalogue works. ZEB Home has been verified with my real device;
Tapo account sign-in and listing have also been confirmed. Wipro and Qubo
still need real-account and physical-device validation, and broader model
coverage needs testing across the integrations.

## The platform underneath the app

The Android screen is one part of Omnesta. Underneath it is a common device
model and separate clients for each provider. Each client handles its own
authentication, device discovery, state, and power commands. The dashboard
works with the resulting devices and channels.

That separation is what makes this a useful foundation for more integrations:
adding another ecosystem should not require inventing another dashboard.

The repository also contains protocol research and Python clients for
exploring the underlying services. Understanding those protocols lets the
Android implementation speak to the providers directly without carrying
their SDK bundles along for the ride.

There is no separate Omnesta server to deploy. The phone talks directly to
the provider clouds. Existing devices and accounts stay in place; there is
no firmware replacement or additional hub required for these integrations.

It remains cloud-dependent. Vendor outages, API changes, and account rules
still matter. In particular, **Omnesta cannot override eWeLink's server-side
session restrictions**. It reuses saved sessions and can recover from a
rejected session, but a fresh login can still displace another phone.
The original frustration explains why I started; it is not a claim that a
different interface can repeal the provider's rules.

## A switch needs honest state

There are some details I care about much more than fancy animations:

- A cloud accepting a command is different from confirming that the
  physical device changed state.
- Missing information must stay unknown. It must not quietly become “off.”
- A failed refresh should preserve the last known device list, mark it
  stale, and disable the affected controls.
- An uncertain command must not be automatically replayed after a timeout.
- Operating a device should preserve the dashboard's scroll position.

Sonoff has a foreground WebSocket connection for reports and commands;
the other integrations check status periodically while the app is visible.
Automatic updates stop when the app goes into the background.

Saved credentials and sessions are encrypted using an Android Keystore
key. The app requests only the Internet permission. There is no telemetry,
background service, or wake lock.

## What is currently missing (16-Nov-2026)

Currently, we just toggle switches from different vendors :D

- Live Tapo camera audio/video feeds.
- Bulb color and brightness controls.
- Device pairing, scenes, and timers.
- Other device-specific features beyond the supported power controls.

We are going to add these features because we need them ourselves too :D

The vendor apps still have a role for setup and features Omnesta does not
implement yet.

## Buy once, run forever

The app does not send us logs, telemetry, or any other data. Your phone
communicates directly with the vendor clouds; there is no Omnesta backend
for us to run and maintain.

**Buy once, run forever** is the idea. Continued operation still depends
on Android compatibility and the vendor clouds and APIs, as described above.

Heck, we might even make it open-core or open-source at some point :D

## What comes next

**We know Omnesta is not complete yet. Feedback is highly welcome!**

If you try it, tell us what works, what breaks, and what you would like
to see next. Reports with the device model and ecosystem are especially
helpful as we expand compatibility.

Omnesta is currently developed in a private repository.

Broader device testing and live video support are on the road ahead. The
existing protocol and client fixtures, plus isolated phone UI tests, help
check the implementation as it grows. Physical device testing remains
essential across the different ecosystems.

I wanted opening a smart home app to feel as immediate as reaching for a
switch. Omnesta is my attempt to get there, with five ecosystems sharing
one tiny app.

[Get Omnesta on Google Play](https://play.google.com/store/apps/details?id=com.omnesta.app).

## A future side project

But now I have a new side project (no thanks to Anuj from Makerville!): implement a
Home Assistant "backend" on a cheap **ESP32-S3**. The MCU would run the
controller, with Omnesta providing the phone interface.

S31 and P4X availability is super poor for us right now, so the readily
available S3 is the target.

One day!
