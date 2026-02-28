---
title: "RSP1 Clone SDR Notes (2025)"
date: 2025-02-13
tags:
- RF Hacking
- HAM
- Amateur Radio
- RSP1
- SDR
- SDRPlay
---

Notes to get RSP1 working on Linux and macOS using FOSS drivers (2025)

![Reference photo](/images/RSP1-Clone-SDR.jpg)

## Prerequisites

Please use a mainstream Linux distribution like Ubuntu 24.04 LTS (or later) or
the latest Raspberry Pi OS.

Using a Raspberry Pi is NOT recommended as it has quite a bit of power supply
noise on the USB ports, which reduces the performance of the connected SDR.

## Linux Setup

On Linux, add the following lines to the `/etc/modprobe.d/blacklist.conf` file

```conf
blacklist sdr_msi3101
blacklist msi001
blacklist msi2500
```

Execute the following command:

```bash
sudo systemctl restart systemd-modules-load.service
```

Install dependencies:

```bash
sudo apt-get install libsoapysdr0.8-dev libsoapysdr0.8 libsoapysdr-dev \
  soapysdr-tools build-essential sox cmake libusb-1.0-0-dev libsox-fmt-all \
  wsjtx pulseaudio-utils git vim fluxbox xterm tightvncserver
```

NB: Do NOT install the official SDRplay software.

Remove the problematic `mirisdr` stuff:

```bash
sudo dpkg -r soapysdr0.8-module-mirisdr soapysdr0.8-module-all
```

Install the FOSS driver and the interface layer:

```bash
mkdir -p ~/repos
cd ~/repos

git clone https://github.com/ericek111/libmirisdr-5.git
cd libmirisdr-5 && cmake . && make -j4 && sudo make install
sudo mkdir -p /usr/local/lib/SoapySDR/modules0.8
sudo cp src/libmirisdr.so* /usr/local/lib/SoapySDR/modules0.8

cd ~/repos
git clone https://github.com/ericek111/SoapyMiri.git
cd SoapyMiri && cmake . && make -j4 && sudo make install
```

Set up permissions:

```bash
$ lsusb | grep SDR
Bus 001 Device 002: ID 1df7:2500 SDRplay RSP1

$ sudo vim /etc/udev/rules.d/66-mirics.rules
SUBSYSTEM=="usb",ENV{DEVTYPE}=="usb_device",ATTRS{idVendor}=="1df7", \
  ATTRS{idProduct}=="2500", MODE="666", GROUP="plugdev", ENV{MTP_NO_PROBE}="1"
```

```bash
sudo udevadm control --reload-rules && sudo udevadm trigger
```

(Re)-connect the RSP1 SDR to the computer, and then execute the following
command:

```bash
SoapySDRUtil --probe
```

See if the SDR is visible now.

You are done! You can run `Gqrx SDR` and it should see the RSP1 SDR now.

### macOS Sequoia

Execute the following steps:

```bash
brew install soapysdr
```

```bash
mkdir -p ~/repos
cd ~/repos

git clone https://github.com/ericek111/libmirisdr-5.git
cd libmirisdr-5 && cmake . && make -j4 && sudo make install
sudo mkdir -p /opt/homebrew/lib/SoapySDR/modules0.8
sudo cp libmirisdr.4.*  /opt/homebrew/lib/SoapySDR/modules0.8

cd ~/repos
git clone https://github.com/ericek111/SoapyMiri.git
cd SoapyMiri && cmake . && make -j4 && sudo make install
```

### Usage

```bash
SoapySDRUtil --probe
```

```bash
pactl load-module module-null-sink sink_name=Virtual0

pactl list sinks
```

```bash
~/repos/libmirisdr-5/src/miri_fm -e 2 -g 7 -f 28074000 -M usb \
  -w 8000000 | play -t raw -r24k -es -b 16 -c 1 -V1 - lowpass 3k
```

On macOS (at least), the `-e 2` helps a lot with USB stability! With `-e 2` things are working smoothly in Jan-2025 on macOS and Linux!

### Setup Headless Hopping Skimmer

```bash
$ vim  ~/.asoundrc
pcm.!default {
        type hw
        card 2
}

ctl.!default {
        type hw
        card 2
}
```

On RPi systems, set `dtparam=audio=off` in `/boot/firmware/config.txt` file.

```
pi@radio:~$ aplay -l
**** List of PLAYBACK Hardware Devices ****
card 0: vc4hdmi0 [vc4-hdmi-0], device 0: MAI PCM i2s-hifi-0 [MAI PCM i2s-hifi-0]
  Subdevices: 1/1
  Subdevice #0: subdevice #0
card 1: vc4hdmi1 [vc4-hdmi-1], device 0: MAI PCM i2s-hifi-0 [MAI PCM i2s-hifi-0]
  Subdevices: 1/1
  Subdevice #0: subdevice #0
card 2: Loopback [Loopback], device 0: Loopback PCM [Loopback PCM]
  Subdevices: 7/8
  Subdevice #0: subdevice #0
  Subdevice #1: subdevice #1
  Subdevice #2: subdevice #2
  Subdevice #3: subdevice #3
  Subdevice #4: subdevice #4
  Subdevice #5: subdevice #5
  Subdevice #6: subdevice #6
  Subdevice #7: subdevice #7
card 2: Loopback [Loopback], device 1: Loopback PCM [Loopback PCM]
  Subdevices: 8/8
  Subdevice #0: subdevice #0
  Subdevice #1: subdevice #1
  Subdevice #2: subdevice #2
  Subdevice #3: subdevice #3
  Subdevice #4: subdevice #4
  Subdevice #5: subdevice #5
  Subdevice #6: subdevice #6
  Subdevice #7: subdevice #7
...
```

Add the following lines to `/etc/rc.local` file:

```
pi@radio:~$ cat /etc/rc.local
#!/bin/bash

sudo modprobe snd-aloop enable=1,1,1 index=1,2,3

sudo -H -u pi /usr/bin/tightvncserver &

sudo -H -u pi bash -c "cd ~/repos/libmirisdr-5/src && ~/repos/libmirisdr-5/src/miri_fm -e 2 -g 7 -f 28074000 -M usb -w 8000000 | play -t raw -r24k -es -b 16 -c 1 -V1 - lowpass 3k &"
```

```
chmod +x /etc/rc.local
```

```
$ cat ~/.vnc/xstartup
#!/bin/sh

xrdb "$HOME/.Xresources"
fluxbox &
xterm &
xsetroot -solid grey
#x-terminal-emulator -geometry 80x24+10+10 -ls -title "$VNCDESKTOP Desktop" &
#x-window-manager &
# Fix to make GNOME work
export XKL_XMODMAP_DISABLE=1
/etc/X11/Xsession
```

Set up the VNC password (once):

```bash
vncpasswd
```

In WSJT-X do the following:

```text
File > Settings > Audio, Input Set to "plughw:CARD=Loopback,DEV=1", "Left"
```

```text
File > Settings > Audio, Output Set to "plughw:CARD=Loopback_1,DEV=0", "Both"
```

These WSJT-X notes are borrowed from [sbitx](https://github.com/afarhan/sbitx/blob/main/wsjtx_notes.txt) project.

### References

- [libmirisdr-5](https://github.com/kholia/libmirisdr-5) (has automatic band hopping feature)

- [RX Report 1](https://pskreporter.info/pskmap.html?preset&callsign=VU3CER&txrx=rx&timerange=7200)

- [RX Report 2](https://pskreporter.info/pskmap.html?preset&callsign=VU3FOE&txrx=rx&timerange=7200)
