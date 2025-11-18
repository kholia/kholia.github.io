---
title: "Emulating a full FT8 band for 'real'"
date: 2025-10-17
tags:
- FT8'ing
- FT8
- Busy Band
- RealSim
- Simulating
- RF Hacking
- HAM
- Amateur Radio
- "Science"
- Emulation
- Multi-Channel
- RPi
- Raspberry Pi
---


[This code](https://github.com/kholia/ConsensusBasedTimeSync/tree/master/Wide-FT8-Tester) generates a .wav file which emulates a fully-populated FT8 band!

This .wav file can then be played with `rpitx` on actual air (well on a dummy load) for receiver testing purposes.

![FT8 Full-Band Demo 1](/images/Wide-FT8-Tester-1.png)

![FT8 Full-Band Demo 2](/images/Wide-FT8-Tester-2.png)

```
rm mixed.wav; sox -m *.wav mixed.wav

sox mixed.wav -r 48000 sampleaudio.wav
```

Now play sampleaudio.wav using https://github.com/F5OEO/rpitx.

I have tested https://github.com/F5OEO/rpitx on Raspberry Pi Zero 2W TX'ing @ 14.074 MHz.

References:

- https://github.com/kholia/ConsensusBasedTimeSync/tree/master/Wide-FT8-Tester

- https://github.com/kgoba/ft8_lib/ (source for `gen_ft8` binary)
