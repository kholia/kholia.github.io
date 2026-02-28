---
title: "Success with 2m WSPR!"
date: 2025-09-25
tags:
- Higher bands
- 2m
- VHF
- WSPRing
- WSPR'ing
- RF Hacking
- HAM
- Amateur Radio
- WSPR
- 144 MHz
- VHF WSPR
- Success Story
---

OCXO's are awesome - this is what I learned while trying to get WSPR working reliably on the 2m band.

## Hardware

Here is all you need for reliable WSPR'ing on the 2m band:

![OCXO PCB Module 1](/images/OCXO-PCB-Module-1.png)

A RAW OCXO "can" works fine too!

![Modded Si5351 board](/images/si5351-board-modified.jpg)

Note: This modded Si5351 board image comes from [SimonsDialogs](https://www.simonsdialogs.com). Essentially we are modding the CLK2 output port to become an input port which accepts the OCXO's output signal.

I didn't find modding the Si5351 board to be that easy - I had to bump the hot air workstation's temperature to 490 degrees (?!) to desolder the existing onboard quartz crystal. Designing a new, small PCB to put the OCXO and Si5351 together might be a good idea!

Note 2: I have connected a 6dB attenuator between the RAW output of the OCXO and the `XA` input pin of the Si5351 IC as I was not sure about the signal levels involved.

Demo screenshot:

![WSPR 2m demo](/images/WSPR-2m-Success-With-OCXO.png)

The setup:

![WSPR 2m setup](/images/Si5351+OCXO.jpg)

Now the 2m WSPR decodes aren't affected by the fan running, open windows with changing weather and so on 😅

Next challenge: Get WSPR to work on UHF (~433 MHz band). Oh, we also need to figure out a low-cost, non-linear VHF amplifier chain.

## Code

Sample code:

```cpp
// Runs on Raspberry Pi Pico (and 2). WSPR timing is done manually ;)

#include <Wire.h>
#include <si5351.h>
#include <Arduino.h>
#include <JTEncode.h>

// Si5351 stuff
Si5351 si5351;
int32_t si5351CalibrationFactor = 0;  // This is automatically derived!

// long long frequency = 50295000 * 100UL; // 6m!
uint64_t frequency = 144490500ULL * 100LL; // 2m!!!
uint8_t tones[255];
int toneDelay;
int symbolCount;
int toneSpacing;

// WSPR properties
#define WSPR_TONE_SPACING 146  // ~1.46 Hz
#define WSPR_DELAY 683         // Delay value for WSPR
char call[] = "VU3CER";        // CHANGE THIS PLEASE!
char loc[] = "MK68";
uint8_t dbm = 23;
JTEncode jtencode;

void tx(uint8_t *tones) {
  uint8_t i;

  Serial.println("TX!");
  digitalWrite(LED_BUILTIN, HIGH);
  si5351.set_clock_pwr(SI5351_CLK0, 1);
  si5351.output_enable(SI5351_CLK0, 1);

  for (i = 0; i < symbolCount; i++) {
    si5351.set_freq(frequency + (tones[i] * toneSpacing), SI5351_CLK0);
    delay(toneDelay);
  }

  // Turn off the output
  si5351.set_clock_pwr(SI5351_CLK0, 0);
  si5351.output_enable(SI5351_CLK0, 0);
  digitalWrite(LED_BUILTIN, LOW);
}

// Debug helper
void led_flash() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(250);
  digitalWrite(LED_BUILTIN, LOW);
  delay(250);
  digitalWrite(LED_BUILTIN, HIGH);
  delay(250);
  digitalWrite(LED_BUILTIN, LOW);
  delay(250);
  digitalWrite(LED_BUILTIN, HIGH);
  delay(250);
  digitalWrite(LED_BUILTIN, LOW);
  delay(250);
  digitalWrite(LED_BUILTIN, HIGH);
}

void setup() {
  int ret = 0;

  // Setup I/O pins
  pinMode(LED_BUILTIN, OUTPUT);

  Serial.begin(115200);

  // I2C pins
  Wire.setSDA(16);
  Wire.setSCL(17);
  Wire.begin();

  // Initialize the Si5351
  ret = si5351.init(SI5351_CRYSTAL_LOAD_8PF, 10000000, si5351CalibrationFactor);
  if (ret != true) {
    Serial.println(ret);
    led_flash();
    watchdog_reboot(0, 0, 1000);
  }
  si5351.set_clock_pwr(SI5351_CLK0, 0);  // safety first

  // Prep for WSPR
  jtencode.wspr_encode(call, loc, dbm, tones);
  toneDelay = WSPR_DELAY;
  toneSpacing = WSPR_TONE_SPACING;
  symbolCount = WSPR_SYMBOL_COUNT;
}

void loop() {
  tx(tones);

  delay(10);
}
```

References:

- [Si5351 Specifications, Myths, and Truth](https://www.simonsdialogs.com/2018/11/si5351a-any-frequency-cmos-clock-generator-and-vco-specifications-myths-and-truth/)

- https://github.com/rxt1077/wspr_spread

- https://github.com/rxt1077/dissecting_wsprd

- https://github.com/kholia/Easy-Beacons-STEM

- https://github.com/kholia/Si5351-Module-Clone-TCXO/tree/master/Si5351-Trimmed-Module-25-MHz
