---
title: "Headless WSPR Monitoring System (2025)"
date: 2025-10-22
tags:
- RF Hacking
- WSPR
- HAM
- Amateur Radio
- Airspy
- HF
- HF+ Discovery
- Monitoring
- RPi
- Raspberry Pi
---

### Setup OS and SDR

Please use the latest Raspberry Pi OS 64-bit on RPi 4 or later.

Using a Raspberry Pi (<=3) is NOT recommended as it has quite a bit of power
supply noise on the USB ports, which reduces the performance of the connected
SDR.

Install dependencies:

```
sudo apt-get update

sudo apt-get install airspyhf \
  soapysdr-tools sox libsox-fmt-all wsjtx \
  pulseaudio-utils git vim fluxbox xterm tightvncserver
```

```
sudo apt-get install cmake pkg-config \
    libusb-1.0-0-dev \
    libasound2-dev \
    libairspy-dev \
    libairspyhf-dev \
    librtlsdr-dev \
    libsndfile1-dev \
    portaudio19-dev \
    libvolk-dev
```

Build `airspyhf-fmradion` SDR software:

```
cd ~

git clone --recursive https://github.com/jj1bdx/airspy-fmradion.git

cd airspy-fmradion

cmake .

make -j8
```

Optional: Install https://tailscale.com/ on the RPi.

Recommended: Use a `RF clipper` for protecting the SDR - see https://www.kk5jy.net/rf-clipper/ for details.

Antenna: See [My PA0FRI Active Antenna article]({{< relref "Active-Antenna-PA0FRI-Results.md" >}}) for details on the "best" antenna for RX purposes.

Setup: Active antenna ➔ 20 meter BPF ➔ RF limiter ➔ SDR

Tips

- Check time sync on RPi using the `timedatectl show-timesync` command

### Setup Headless Hopping Skimmer

```
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

On RPi systems, set `dtparam=audio=off` in `/boot/firmware/config.txt` file and reboot.

```
pi@sdr:~$ aplay -l
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
pi@sdr:~$ cat /etc/rc.local
#!/bin/bash

sudo modprobe snd-aloop enable=1,1,1 index=1,2,3

sudo -H -u user /usr/bin/tightvncserver &

sudo -H -u user bash -c "cd ~/airspy-fmradion && ./airspy-fmradion -t airspyhf -c freq=14095600 -m usb -P - &"
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
# Fix to make GNOME work
export XKL_XMODMAP_DISABLE=1
/etc/X11/Xsession
```

```
chmod +x ~/.vnc/xstartup
```

Set up the VNC password (once):

```
vncpasswd
```

In WSJT-X do the following:

```
File > Settings > Audio, Input Set to "plughw:CARD=Loopback,DEV=1", "Left"
```

```
File > Settings > Audio, Output Set to "plughw:CARD=Loopback_1,DEV=0", "Both"
```

### It works!

![First WSPR Decode](/images/First-WSPR-Decode.png)

### FT8 reception using Active Antenna

![FT8 DX 1](/images/Active-Antenna-DX-1.png)
![FT8 DX 2](/images/Active-Antenna-DX-2.png)
![FT8 DX 3](/images/Active-Antenna-DX-3.png)

### References

- [My PA0FRI Active Antenna article]({{< relref "Active-Antenna-PA0FRI-Results.md" >}})

- [RSP1 Clone Notes]({{< relref "RSP1-Clone-Notes.md" >}})

- https://github.com/kholia/airspy-utils

- https://wspr.rocks/

- https://www.kk5jy.net/rf-clipper/
