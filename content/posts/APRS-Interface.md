---
title: "APRS Interface for BaoFeng and Other Radios"
date: 2026-01-17
tags:
- APRS
- VHF
- UHF
- KiCad
- Digital Interface
- BaoFeng
---

## Design

Here is a "safe" APRS interface for BaoFeng and other radios.

Sample schematic:

{{< embed-pdf url="/pdfs/TheDigitalInterface-2026.pdf" hideLoader="true" >}}

## Render

![TheDigitalInterface-2026](/images/TheDigitalInterface-2026.png)

## Motivation

https://github.com/skuep/AIOC works, but it appears to have a couple of
problems:

1. RF feedback problem with monopole antennas

2. Hard-to-source exact 3.5mm and 2.5mm audio connectors

3. Mechanical fragility of these "half-cut" (chopped off) and then only SMD-style soldered TRS connectors

   ![Chopped off 'SMD' connectors](/images/k1-aioc-photo.jpg)

4. Reliance on the PCBA process to get a working product. In contrast, we want
   our users to be able to homebrew the digital interface (if desired).

I believe we can reduce the cost significantly and also make the entire design
homebrew-friendly, without placing a JLCPCB PCBA order.

Also, we use ready-made and widely available off-the-shelf audio cables in our
design.

## BOM

- Waveshare RP2040-Zero Clone - 200

- Ambrane 3.5mm to 3.5mm male aux stereo cable TRS - 130

- 2.5mm to 3.5mm aux stereo cable - 250 (element14)

- PCB - 150

- Components - 70

- Case - 100 INR

Total - 900 INR or less

## Pros

- No cables to make. No cables to cut up!

- THT audio connectors which can handle rough handling.

Our competition is Digirig (70 USD). Our product is about one-sixth the cost of
Digirig and is "software configurable" with many "gears".

Digirig is AWESOME but can be hard to import and afford (especially for new
student operators). Buying an interface which costs 3X the price of the radio
transceiver itself might NOT make enough sense for many others ;)

## Useful commands

```
$ rm -f x.wav; echo -n "VU3CER>WORLD:Hello, world!" | gen_packets -a 30 -o x.wav -
Amplitude set to 30%.
Output file set to x.wav
Reading from stdin ...

$ file x.wav
x.wav: RIFF (little-endian) data, WAVE audio, Microsoft PCM, 16 bit, mono 44100 Hz
```

```
$ atest x.wav
44100 samples per second.  16 bits per sample.  1 audio channels.
41810 audio bytes in file.  Duration = 0.5 seconds.
Fix Bits level = 0
Channel 0: 1200 baud, AFSK 1200 & 2200 Hz, A, 44100 sample rate, Tx AX.25.

DECODED[1] 0:00.466 VU3CER audio level = 30(8/8)
[0] VU3CER>WORLD:Hello, world!
```

ATTENTION: APRS is extremely sensitive to audio sample rate mismatches. Use
`aplay x.wav` to play the audio files (for loopback testing among other
purposes). Playing with VLC will mess up things enough to cause complete
decoding failures.

## References

- https://aprsdroid.org/download/builds/

- https://github.com/na7q/aprsdroid

- https://github.com/ge0rg/aprsdroid

- [AIOC - Known issues](https://github.com/skuep/AIOC?tab=readme-ov-file#known-issues)

- https://direbox.net/blog/aioc-cable-review
