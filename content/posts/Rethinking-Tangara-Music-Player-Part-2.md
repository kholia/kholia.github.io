---
title: Reimagining the 'Tangara' music player - Part 2
date: 2025-04-11
tags:
- Music Hardware
- DAP
- Music
- Hacking
- Optimization
- Price Hacking
- Repairable
- Sustainable
- Minimal
- Retro-Modern
- Hackability
- Sound
- Audio
---

[Tangara](https://www.crowdsupply.com/cool-tech-zone/tangara) is a pretty awesome project!

[It recently inspired us]({{< relref "Rethinking-Tangara-Music-Player.md" >}}) to build a similar FOSS DAP product but at a much lower cost of <= 40 USD. Our initial tech stack: RP2350-Zero, PCM5102A 32-bit 384kHz DAC, Burr-Brown OPA1662 (specified for 3.3v) as the unity gain buffer and headphone driver, no explicit DC-DC converters anywhere, microSD card, everything will be a module if possible

We quickly got this prototype working on a breadboard and discovered some limitations:

- No WiFi support - meaning the microSD card would need to be physically taken out to load (new) songs on to it

- Perhaps no easy way to get 32-bit 192 kHz files playing

- Limited codec support and no live codec swapping support in https://github.com/earlephilhower/BackgroundAudio library

We then even briefly considered using a ESP32-WROVER-E-N16R8 module (just like Tangara) to reuse the Tangara's firmware. However, we were NOT very excited about doing that.

Fast forward a few months...

Recently, I learned about the `LicheeRV Nano (W) SG2002 WIFI6` board and it seems perfect for powering a full-fledged DAP!

New tech stack: Sipeed LicheeRV Nano (W) SG2002 WIFI6 board, AUDIOCULAR D07 CX31993 Portable DAC Amp

![Sipeed LicheeRV Nano (W)](/images/LicheeRV-Nano-2.jpg)

![Dongle DAC](/images/Dongle-DAC-2.jpg)

New projected cost: <= 40 to 50 USD!

Power source: We will have to use a 2x14500 Li-ion AA batteries it seems (we need 5V). Or perhaps we can get away with using a 1x14500 Li-ion cell as the LicheeRV Nano's operating range is `3.6~5.5V`. To be figured out experimentally!

Note: For the initial version we might NOT need a custom PCB.

Current unknowns:

- How well does the LicheeRV Nano support the USB DACs?

  ```
  dhiru@zippy:/data/LicheeSG-Nano-Build
  $ rg USB | grep AUDIO | grep rvnano
  build/boards/sg200x/sg2002_licheervnano_sd/linux/sg2002_licheervnano_sd_defconfig:CONFIG_USB_U_AUDIO=y
  linux_5.10/arch/riscv/configs/sg2002_licheervnano_sd_defconfig:CONFIG_USB_U_AUDIO=y
  ```

  At least the support for USB AUDIO is turned on by default.

- Battery life?

  Idle current consumption is hovering around 137mA @ 4.7V input - This was measured by an inline USB power meter. And when playing a 192 kHz ALAC file, the current consumption ranges between 180mA to 230mA. Power consumption as an active `Airplay 2 Receiver` is 0.187mA @ 4.8V.

- Is there any power management (via frequency scaling) on the LicheeRV Nano board?

  Seems yes, based on a https://community.milkv.io post.

Updated findings:

- LicheeRV Nano supports USB-C DACs pretty well!

- The `ffplay` program runs into swapping issues and causes audio underruns!

- As usual, `mpd` works just fine and plays 24-bit 192 kHz files just fine.

- https://web.archive.org/web/20220505044524/http://www.2l.no/hires/ and https://www.oppodigital.com/hra/dsd-by-davidelias.aspx are pretty good for getting High-Resolution samples!

- https://github.com/mikebrady/shairport-sync is magical and just works (even without any configuration!). LicheeRV Nano works very well as a `AirPlay 2 Receiver`!

- A special shoutout goes to https://github.com/scpcom and other folks for building and maintaining a Linux distribution for LicheeRV Nano devices.

References:

- [Reimagining the 'Tangara' music player - Part 1]({{< relref "Rethinking-Tangara-Music-Player.md" >}})

- https://github.com/scpcom/LicheeSG-Nano-Build/issues/10 (Upstream wishlist of sorts)

- Sansa Clip specs (for reference): Multi-bit Sigma Delta Converters - DAC: 18bit with 94dB SNR ('A' weighted), 2 x 60mW @ 16Ω driver capacity (stereo headphone audio amplifier)

- [Measuring (Tangara's) Audio Quality](https://www.crowdsupply.com/cool-tech-zone/tangara/updates/measuring-tangaras-audio-quality)

- [What Every Audiophile Should Know and Never Forget](https://www.biline.ca/audio_critic/critic1.htm)

- https://github.com/scpcom/LicheeSG-Nano-Build

- https://wiki.sipeed.com/hardware/en/lichee/RV_Nano/1_intro.html

- http://cn.dl.sipeed.com/shareURL/LICHEE/LicheeRV_Nano/01_Specification

- https://cn.dl.sipeed.com/shareURL/LICHEE/LicheeRV_Nano/02_Schematic

- https://github.com/sophgo/sophgo-doc/releases/download/sg2002-trm-v1.02/sg2002_trm_en_v1.02.pdf

- https://www.lcsc.com/datasheet/lcsc_datasheet_2407031102_TMI-TMI7003C_C840566.pdf

- https://www.analog.com/en/products/max97220.html

Notes:

I see the `Audiocular D07` DAC in action while playing the FLAC files from https://www.oppodigital.com/hra/dsd-by-davidelias.aspx webpage.

```
# cat /proc/asound/card0/pcm0p/sub0/hw_params
access: RW_INTERLEAVED
format: S24_3LE
subformat: STD
channels: 2
rate: 96000 (96000/1)
period_size: 12000
buffer_size: 48000
```

While playing a DSD64 file from the same webpage, I see:

```
# cat /proc/asound/card0/pcm0p/sub0/hw_params
access: RW_INTERLEAVED
format: S24_3LE
subformat: STD
channels: 2
rate: 384000 (384000/1)
period_size: 43690
buffer_size: 174762
```

Nice!

```
# cat /etc/mpd.conf
#
# Sample configuration file for mpd
# This is a minimal configuration, see the manpage for more options
#

# Directory where the music is stored
music_directory         "/root/music"

# Directory where user-made playlists are stored (RW)
playlist_directory      "/var/lib/mpd/playlists"

# Database file (RW)
db_file                 "/var/lib/mpd/database"

# Log file (RW)
log_file                "/var/log/mpd.log"

# Process ID file (RW)
pid_file                "/var/run/mpd.pid"

# State file (RW)
state_file              "/var/lib/mpd/state"

# User id to run the daemon as
#user                   "nobody"

# TCP socket binding
bind_to_address         "any"
#bind_to_address        "localhost"

# Unix socket to listen on
bind_to_address         "/var/lib/mpd/socket"

audio_output {
        type            "alsa"
        name            "My ALSA Device"
        device          "hw:0,0"        # optional
        mixer_type      "disabled"      # optional
}
```

The following command is quite necessary:

```
ffmpeg -i 04.\ Marooned.m4a -vn 04.\ Marooned.flac
```

Why? The `mpd` process can start consuming almost 60MB of RAM if FFmpeg support is compiled in. FFmpeg is a "bloatware" on smaller systems (yes, I just said that...) it seems. Perhaps, we can trim down the FFmpeg bits to a bare minimum - to be investigated - FFmpeg is one of the best maintained software out there and we want to make use of it! Without FFmpeg support compiled in, mpd's memory consumption hovers around 13MB.

![ffplay memory usage](/images/ffplay-memory-usage-swapping.png)

By converting 24-bit 192 kHz Hi-Res ALAC files into FLAC, we avoid having to use the FFmpeg audio pipeline to decode the `.m4a` files! As a bonus mpd will actually put the DAC mode in correct mode when playing these Hi-Res FLAC files.

TLDR version: Keep using `BR2_PACKAGE_MPD_FFMPEG=n` for SBCs with "tiny" amounts of RAM.

Update: `@FFmpeg` folks on Twitter kindly pointed out the `--disable-everything` build option. After narrowing down the final build options to `./configure --disable-everything --enable-libfdk-aac --enable-demuxer=mov --enable-protocol=file --enable-nonfree --enable-decoder=alac --enable-filter=aresample`, I was able to reduce the RAM usage of mpd to around 28 MB (from ~60MB earlier). The system no longer swaps - yay!

With `04. Marooned.m4a` (192000 Hz, s32p - 24 bit) track playing,

```
# cat /proc/asound/card0/pcm0p/sub0/hw_params
access: RW_INTERLEAVED
format: S32_LE
subformat: STD
channels: 2
rate: 192000 (192000/1)
period_size: 24000
buffer_size: 96000
```

All is well!

Update (22-April-2025): Paul B. Mahol pointed out that `aresample` (as the default resampling filter) is awful. The following screenshot perhaps captures this awfulness?

![FFmpeg gotchas 2](/images/ffmpeg-gotchas-2.png)

(Screenshot via https://src.infinitewave.ca/)

We will be looking into enabling `soxr` based resampling soon (`./configure --enable-libsox`). Next, we need to confirm that `mpd` is using this feature correctly (`-af aresample=resampler=soxr`).
