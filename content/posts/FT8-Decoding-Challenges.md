---
title: "FT8 Decoding Challenges on Android"
date: 2025-09-29
tags:
- Higher bands
- FT8'ing
- FT8
- Decoding
- DSP
- RF Hacking
- HAM
- Amateur Radio
- WSPR
- "Science"
- Fast Compute
- Compute
- WSJTX-X
- MSHV
---

Here is the [FT8 WAV test file](https://github.com/kgoba/ft8_lib/blob/master/test/wav/20m_busy/test_01.wav).

On an AMD64 machine:

![MSHV PC](/images/MSHV-PC-1.png)

1 second using the `fast decode` settings.

We were able to get the MSHV's FT8 engine to work on Android, thanks to the work done by https://github.com/sannysanoff/SDRPlusPlusBrown folks.

![MSHV FT8 decoder on Android](/images/MSHV-Engine-Android-1.jpg)

Around ~4.5 seconds to decode the same file.

This is why we can't really have full-blown realtime FT8 decoder(s) on Android just yet!

Idea: But we can surely use this full-blown FT8 decoder in our `FT8 Decoder` app which has no realtime requirements!

...

Side-note: The best FT8 decoding performance is achieved by `WSJT-X_IMPROVED` as of September-2025.

```
$ sudo dpkg -i wsjtx_3.0.0_improved_PLUS_250915-RC1_amd64.deb &> log.txt

$ time jt9 --ft8 -M ~/Documents/test_01.wav
000000   2  0.8 2138 ~  LZ365BM <...> 73
000000   0  0.8 1369 ~  CQ OK6LZ JN99
000000   2  0.9  708 ~  CQ IK4LZH JN54
000000  -3  1.0 1291 ~  EA9ACD HA5LGO -13
000000   1  0.8 2327 ~  CQ R8AU MO05
000000   0  0.9  823 ~  LY2EW DL1KDA RR73
000000  -7  1.7 2389 ~  CQ E75C JN93
000000  -6  0.9  559 ~  OE3MLC G3ZQQ 73
000000  -4  0.8 1124 ~  CQ HB9CUZ JN47
000000  -8  0.8  338 ~  JO1COV PE1OYB JO21
000000  -2  0.7 2692 ~  CQ OE8GMQ JN66
000000   3  0.8 1513 ~  JO1COV DL4SBF 73
000000   3  1.2 2279 ~  PY2DPM ON6UF RR73
000000  -8  0.1 1345 ~  CQ 4U1A JN88
000000  -6  0.6  955 ~  CQ IU8DMZ JN70
000000 -14  1.9  771 ~  JA1FWS OK2BV JN89
000000  -2  1.0 1564 ~  JI1TYA DH1NAS 73
000000  -1 -1.1 2378 ~  R1CBP SP9LKP RR73
000000 -13  0.1 1285 ~  MM0IMC 4U1A -06
000000   8  0.8  892 ~  SA5QED IQ5PJ 73
000000 -11  0.7 1615 ~  JO1COV PA0CAH JO21
000000 -12  0.8  947 ~  <...> E77VM R-11
000000  -4  0.9 1088 ~  CQ R7NO KN98         a1
000000  -9  0.8 1158 ~  CQ HA1BF JN86
000000  -5  1.0  773 ~  JA1FWS HA7CH JN97
000000  -5  1.9  719 ~  <...> SQ9JJR JO90
000000  -9  0.8 2104 ~  F1BHB SP4TXI 73
000000 -12  1.8 1450 ~  CQ RX3ASQ KO95
000000 -14  0.7 2051 ~  PD0CIF/PHOTO
000000  -6  0.9 2047 ~  9A9A OK1AWC JO70
<DecodeFinished>   0  30        0

real	0m1.182s
user	0m8.039s
sys	0m0.102s
```

In comparison, `ft8_lib` is pretty fast but has lesser decodes!

```
$ time ~/repos/ft8_lib/decode_ft8 ~/Documents/test_01.wav | grep 000000 | wc -l
Sample rate 12000 Hz, 180000 samples, 15.000 seconds
Block size = 1920
Subblock size = 960
N_FFT = 3840
#############################################################################################
Max magnitude: -19.1 dB
Decoded 18 messages, callsign hashtable size 26
18

real	0m0.024s
user	0m0.019s
sys	0m0.009s
```

Update (October-2025): With the latest `ft8_lib_mashup` code:

```
user@system:~/repos/ft8_lib_mashup$ time ./decode_ft8 test/wav/20m_busy/test_01.wav
Sample rate 12000 Hz, 180000 samples, 15.000 seconds
Block size = 1920
Subblock size = 480
N_FFT = 3840
#############################################################################################
Max magnitude: -19.1 dB
000000 -06.0 +1.52 2138 ~  LZ365BM <...> 73
000000 -05.2 +1.48 1369 ~  CQ OK6LZ JN99
000000 -05.0 +1.52 1512 ~  JO1COV DL4SBF 73
000000 -03.1 +1.60  709 ~  CQ IK4LZH JN54
000000 -08.9 +1.60  825 ~  LY2EW DL1KDA RR73
000000 -06.5 +1.48 2328 ~  CQ R8AU MO05
000000 -07.6 +1.44  891 ~  SA5QED IQ5PJ 73
000000 -07.5 -0.40 2378 ~  R1CBP SP9LKP RR73
000000 -09.0 +1.44 2691 ~  CQ OE8GMQ JN66
000000 -07.9 +1.76 1291 ~  EA9ACD HA5LGO -13
000000 -08.2 +1.52 1125 ~  CQ HB9CUZ JN47
000000 -09.6 +1.56  559 ~  OE3MLC G3ZQQ 73
000000 -09.5 +1.48  338 ~  JO1COV PE1OYB JO21
000000 -08.0 +1.76 1566 ~  JI1TYA DH1NAS 73
000000 -08.3 +2.60  772 ~  JA1FWS OK2BV JN89
000000 -09.4 +1.32  956 ~  CQ IU8DMZ JN70
000000 -13.0 +2.44 1450 ~  CQ RX3ASQ KO95
000000 -06.3 +1.84 2278 ~  PY2DPM ON6UF RR73
000000 -09.3 +1.52 1156 ~  CQ HA1BF JN86
000000 -11.5 +1.64  772 ~  JA1FWS HA7CH JN97
000000 -11.4 +1.40 1616 ~  JO1COV PA0CAH JO21
000000 -06.4 +2.32 2391 ~  CQ E75C JN93
Decoded 22 messages, callsign hashtable size 31

real    0m0.177s
user    0m0.172s
sys     0m0.006s
```

Not bad - This will power the `FT8 Radio` app soon!

References:

- https://github.com/kholia/SDRPlusPlusBrown/

- https://github.com/sannysanoff/SDRPlusPlusBrown

- https://sourceforge.net/projects/wsjt-x-improved/

- https://play.google.com/store/apps/details?id=com.bunzee.digitalradioreceiver

- https://play.google.com/store/apps/details?id=com.bunzee.ft8radio
