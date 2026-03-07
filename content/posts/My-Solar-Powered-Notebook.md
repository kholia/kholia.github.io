---
title: "My solar powered website"
date: 1999-01-01
tags:
- Solar
- Go Green
- Hacking
- Computers
- Webserver
- Digital Notebook
- Sustainability
---

This notebook (aka 'blog') is powered by free solar energy!

I was (and am) inspired to start writing again by reading [this excellent article by 'LOW←TECH MAGAZINE'](https://solar.lowtechmagazine.com/power/). Imitation is the sincerest form of flattery...

## Tech Stack

Tech stack: Navitas 100W Solar Panel, Exide solar charge controller (10A), Exide Solar Blitz 40AH battery, 200W 20A DC-DC CC CV Buck module (Robu), Cuzor Mini Pro RouterUPS (12V), LM2596S DC-DC 24V/12V to 5V 5A Step Down USB module, Raspberry Pi Zero 2W

Photos of components involved (for reference):

![5V USB Buck Module](/images/5V-USB-Buck-Module.jpg)

![200W CC CV Buck Module](/images/200W-CC-CV-Buck-Module.jpg)

![Cuzor UPS 12V](/images/Cuzor-UPS-12V.jpg)

## Boot Settings

```ini
system:~$ cat /boot/usercfg.txt
hdmi_force_hotplug=1
# Disable the ACT LED on the Pi Zero.
dtparam=act_led_trigger=none
dtparam=act_led_activelow=on
dtparam=audio=off
dtoverlay=disable-bt
# Automatically load overlays for detected cameras
camera_auto_detect=0
# Automatically load overlays for detected DSI displays
display_auto_detect=0
# underclock
arm_freq=600
arm_freq_min=600
```

We will see how this stack fares during the rainy monsoon season of Pune later this year.

## Updates

Update: This setup will soon be housed in a `Plantex 1U DVR case`.

![Solar Setup Case](/images/Solar-Setup-Case.jpg)

Update (Late-March, 2025): I moved to a different solar charge controller and Cuzor 9V UPS. Also, the DC-DC buck converter now outputs 9V for the Cuzor 9V UPS.

![New Solar Charge Controller](/images/New-Charge-Controller.jpg)

![New 9V UPS](/images/Cuzor-9V-2A.jpg)
