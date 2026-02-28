---
title: "433 MHz CW signal source"
date: 2025-10-04
tags:
- RF Hacking
- HopeRF
- CMOSTEK
- 70cm
- 433
- 433 MHz
- UHF
- RF
- HAM
- Amateur Radio
- RF Amplifier Testing
- VFO
- Signal Generator
- RF Testing
- WiFi VFO
- Beacon
- Dollar RF
- OH2FTG
- 20mW
- 13dBm
- CMT2119A
---

For HF and amateur VHF bands our [WiFi VFO]({{< relref "WiFi-VFO.md" >}}) works great.

But we didn't have a cost-effective UHF signal source until now...

## Design

Thanks to Ismo (OH2FTG), we recently experimented with a HopeRF CMT2119A powered board called `HOPERF RF module RFM119W-433S1`.

Here is the CMT2119A powered board in action producing a CW (OOK) signal at ~433 MHz.

![UHF CW Demo 1](/images/433-CW-Beacon.png)

The stability is pretty good and a bit surprising considering that the board uses a 20ppm 26 MHz regular quartz crystal - not bad!

![CMT2119A Module's Picture](/images/CMT2119A-board.jpg)

The official RFPDK software is pretty easy to use and runs fine without the external (and expensive) USB programmer connected.

![CMT2119A Official Programming SW](/images/CMT2119A-Official-Software.png)

Future work: Create a 5W UHF RF amplifier for fun and learning purposes!

## Software

Here is the MCU code targeting Raspberry Pi Pico using the `arduino-pico` framework:

```c
/*
 * CMT2119A OOK CW Transmitter
 *
 * For Raspberry Pi Pico with Arduino-Pico framework
 *
 * Message: "CQ CQ CQ DE VU3CER"
 *
 * Reference: github.com/g4eml/RP2040_Synth
 */

// Pin definitions (matching folder 1 code)
#define TWICLK 6  // GPIO 6 Connect to CMT2119A CLK Pin
#define TWIDAT 7  // GPIO 7 Connect to CMT2119A DAT Pin

// Frequency configuration
#define CARRIER_FREQ_MHZ 250.00  // Set your desired frequency in MHz (150-1297 MHz range)
#define REF_OSC_MHZ 26.0         // CMT2119A reference oscillator

// Timing for morse code (WPM = 12)
#define DOT_MS 100
#define DASH_MS 300
#define SYMBOL_SPACE_MS 100
#define CHAR_SPACE_MS 300
#define WORD_SPACE_MS 700

double refOsc = 26.0;

/*

Generated using RFPDK 1.63

https://hoperf.com/service/information/tool/?key=RFPDK

;---------------------------------------
;  CMT2119A Configuration File
;  Configuration File
;  2025.10.04 16:44
;---------------------------------------
;  Mode                = Advanced
;  Part Number         = CMT2119A
;  Frequency           = 433.50 MHz
;  Modulation          = OOK
;  Symbol Rate         = 0.5-30.0 ksps
;  Tx Power            = +10 dBm
;  Deviation           = NA
;  PA Ramping Time     = 1024 us
;  Xtal Cload          = 15.00 pF
;  Data Representation = NA
;  Tx Start by         = DATA Pin Rising Edge
;  Tx Stop by          = DATA Pin Holding Low For 20 ms
;  Increase XO Current = No
;  FILE CRC            = F334
*/
static const uint16_t CMT2119ook[21] = {
  0x007F,
  0x5400,
  0x0000,
  0x0000,
  0x0000,
  0xF000,
  0x0000,
  0xB13B,
  0x4200,
  0x0000,
  0x2401,
  0x01B0,
  0x82BA,
  0x000D,
  0xFFFF,
  0x0020,
  0x5FCE,
  0x22D6,
  0x0E13,
  0x0019,
  0x2000,
};

// Morse code patterns
typedef struct {
  uint8_t len;
  uint8_t pattern;
} morse_t;

static const morse_t morse_table[36] = {
  // A-Z
  { 2, 0b10 },    // A .-
  { 4, 0b1000 },  // B -...
  { 4, 0b1010 },  // C -.-.
  { 3, 0b100 },   // D -..
  { 1, 0b0 },     // E .
  { 4, 0b0010 },  // F ..-.
  { 3, 0b110 },   // G --.
  { 4, 0b0000 },  // H ....
  { 2, 0b00 },    // I ..
  { 4, 0b0111 },  // J .---
  { 3, 0b101 },   // K -.-
  { 4, 0b0100 },  // L .-..
  { 2, 0b11 },    // M --
  { 2, 0b10 },    // N -.
  { 3, 0b111 },   // O ---
  { 4, 0b0110 },  // P .--.
  { 4, 0b1101 },  // Q --.-
  { 3, 0b010 },   // R .-.
  { 3, 0b000 },   // S ...
  { 1, 0b1 },     // T -
  { 3, 0b001 },   // U ..-
  { 4, 0b0001 },  // V ...-
  { 3, 0b011 },   // W .--
  { 4, 0b1001 },  // X -..-
  { 4, 0b1011 },  // Y -.--
  { 4, 0b1100 },  // Z --..
  // 0-9
  { 5, 0b11111 },  // 0 -----
  { 5, 0b01111 },  // 1 .----
  { 5, 0b00111 },  // 2 ..---
  { 5, 0b00011 },  // 3 ...--
  { 5, 0b00001 },  // 4 ....-
  { 5, 0b00000 },  // 5 .....
  { 5, 0b10000 },  // 6 -....
  { 5, 0b11000 },  // 7 --...
  { 5, 0b11100 },  // 8 ---..
  { 5, 0b11110 },  // 9 ----.
};

void CMT2119AInit(void) {
  pinMode(TWICLK, OUTPUT);
  digitalWrite(TWICLK, HIGH);
  pinMode(TWIDAT, OUTPUT);
  digitalWrite(TWIDAT, LOW);
  // Enable internal pullups for TWI communication
  digitalWrite(TWICLK, HIGH);  // Pullup already set via OUTPUT HIGH
}

void CMT2119ASetDefault(void) {
  for (int i = 0; i < 21; i++) {
    TWI_RAM1(i, CMT2119ook[i]);
  }
  CMT2119ASetFrequency(0);
  CMT2119AUpdate();
}

double CMT2119AGetPfd(void) {
  double pfd = refOsc / 131072.0;
  return pfd;
}

void CMT2119ASetFrequency(double direct) {
  bool freqOK = false;

  double freq;
  double pfd;
  uint8_t prescale15;
  uint8_t prescale2;
  double n;
  char resp;

  pfd = CMT2119AGetPfd();

  freqOK = true;

  if (freq <= 320.0) {
    prescale15 = 1;
    prescale2 = 1;
  } else if (freq <= 480.0) {
    prescale15 = 0;
    prescale2 = 1;
  } else if (freq <= 640.0) {
    prescale15 = 1;
    prescale2 = 0;
  } else {
    prescale15 = 0;
    prescale2 = 0;
  }

  if (prescale15) TWI_RAM1(6, 0x0001);
  if (prescale2) TWI_RAM1(1, 0x5400);

  if (prescale15) freq = freq * 1.5;
  if (prescale2) freq = freq * 2.0;

  //frequency
  uint32_t pll = round((freq / pfd) / 2) * 2;  //round to nearest even number
  TWI_RAM1(7, pll & 0xfffe);                   //lsb must always be zero.
  uint16_t pllh = (pll >> 8) & 0xFF00;
  TWI_RAM1(8, pllh);
  TWI_RAM1(9, 0);
}

void TWI_reset(void) {
  digitalWrite(TWIDAT, LOW);
  digitalWrite(TWICLK, HIGH);
  delayMicroseconds(1);

  for (uint8_t i = 0; i < 32; ++i) {
    digitalWrite(TWICLK, LOW);
    delayMicroseconds(1);
    digitalWrite(TWICLK, HIGH);
    delayMicroseconds(1);
  }
  TWI_WRREG(0x0d, 0x00);
}

void TWI_Write(uint8_t x) {
  digitalWrite(TWICLK, HIGH);
  digitalWrite(TWIDAT, LOW);
  for (uint8_t i = 0; i < 8; ++i) {
    digitalWrite(TWICLK, HIGH);
    if (x & 0x80) digitalWrite(TWIDAT, HIGH);
    else digitalWrite(TWIDAT, LOW);
    delayMicroseconds(1);
    digitalWrite(TWICLK, LOW);
    delayMicroseconds(1);
    x <<= 1;
  }
  digitalWrite(TWICLK, HIGH);
  digitalWrite(TWIDAT, LOW);
}

void TWI_WRREG(uint8_t addr, uint8_t data) {
  TWI_Write(0x80 | (addr & 0x3f));
  TWI_Write(data);
}


void TWI_RAM1(uint8_t addr, uint16_t data) {
  TWI_WRREG(0x18, addr);
  TWI_WRREG(0x19, data & 0xff);
  TWI_WRREG(0x1A, data >> 8);
  TWI_WRREG(0x25, 0x01);
}

void CMT2119AUpdate(void) {
  TWI_reset();            //step 1
  TWI_WRREG(0x3d, 0x01);  //step 2 send SOFT_RST
  delay(2);

  //some proprietary command preamble from the datasheet
  TWI_WRREG(0x02, 0x78);  //Open LDO & Osc step 3

  TWI_WRREG(0x2F, 0x80);  //vActiveRegister step 4
  TWI_WRREG(0x35, 0xCA);
  TWI_WRREG(0x36, 0xEB);
  TWI_WRREG(0x37, 0x37);
  TWI_WRREG(0x38, 0x82);

  TWI_WRREG(0x12, 0x10);  //vEnableRegMode step 5
  TWI_WRREG(0x12, 0x00);
  TWI_WRREG(0x24, 0x07);
  TWI_WRREG(0x1D, 0x20);

  //program the default RAM config by RFPDK generated setup
  //TWI_RAM(chanData[channel].reg,21); //step 6
  for (int i = 0; i < 21; i++) {
    TWI_RAM1(i, CMT2119ook[i]);
  }

  TWI_WRREG(0x0D, 0x02);  //step 7 send the TWI_OFF command. Control reverts to simple DAT signals

  digitalWrite(TWIDAT, HIGH);  //output on
  delay(2);
}

void tx_on(void) {
  digitalWrite(TWIDAT, HIGH);
}

void tx_off(void) {
  digitalWrite(TWIDAT, LOW);
}

void send_dot(void) {
  tx_on();
  delay(DOT_MS);
  tx_off();
  delay(SYMBOL_SPACE_MS);
}

void send_dash(void) {
  tx_on();
  delay(DASH_MS);
  tx_off();
  delay(SYMBOL_SPACE_MS);
}

void send_char(char c) {
  uint8_t idx;

  // Convert to uppercase
  if (c >= 'a' && c <= 'z') {
    c = c - 'a' + 'A';
  }

  // Get index
  if (c >= 'A' && c <= 'Z') {
    idx = c - 'A';
  } else if (c >= '0' && c <= '9') {
    idx = c - '0' + 26;
  } else if (c == ' ') {
    delay(WORD_SPACE_MS - CHAR_SPACE_MS);
    return;
  } else {
    return;  // Unknown character
  }

  morse_t m = morse_table[idx];

  // Send morse pattern
  for (int8_t i = m.len - 1; i >= 0; i--) {
    if (m.pattern & (1 << i)) {
      send_dash();
    } else {
      send_dot();
    }
  }

  delay(CHAR_SPACE_MS - SYMBOL_SPACE_MS);
}

void send_message(const char* msg) {
  while (*msg) {
    send_char(*msg);
    msg++;
  }
}

void TWI_EEPROM_SETUP(void) {
  TWI_WRREG(0x02, 0x3B);
  TWI_WRREG(0x2F, 0x80);
  TWI_WRREG(0x3F, 0x01);
  TWI_WRREG(0x16, 0x31);
  TWI_WRREG(0x35, 0xCA);
  TWI_WRREG(0x36, 0xEB);
  TWI_WRREG(0x37, 0x37);
  TWI_WRREG(0x38, 0x82);
}

void TWI_EEPROM_END(void) {
  TWI_WRREG(0x16, 0x30);
  TWI_WRREG(0x3F, 0x00);
  TWI_WRREG(0x0C, 0x27);
  TWI_WRREG(0x2F, 0x00);
  TWI_WRREG(0x02, 0x7F);
  TWI_WRREG(0x0C, 0x00);
  TWI_WRREG(0x3D, 0x01);  //SOFT_RESET
}

uint8_t TWI_RDREG(uint8_t addr) {
  TWI_Write(0xc0 | (addr & 0x3f));
  return TWI_Read();
}

uint8_t TWI_Read(void) {
  uint8_t r = 0;
  pinMode(TWIDAT, INPUT_PULLUP);
  digitalWrite(TWICLK, HIGH);
  for (uint8_t i = 0; i < 8; ++i) {
    digitalWrite(TWICLK, HIGH);
    delayMicroseconds(1);
    r <<= 1;
    if (digitalRead(TWIDAT)) r |= 1;
    digitalWrite(TWICLK, LOW);
    delayMicroseconds(1);
  }
  digitalWrite(TWICLK, HIGH);
  pinMode(TWIDAT, OUTPUT);
  digitalWrite(TWIDAT, LOW);
  return r;
}

void TWI_EEPROM_ERASE(uint8_t add) {
  uint8_t resp;
  TWI_WRREG(0x17, add);   //Set the EEPROM Address
  TWI_WRREG(0x16, 0x39);  //start the erase
  do                      //wait till the erase has completed
  {
    delay(1);
    resp = TWI_RDREG(0x1F);
  } while ((resp & 0x08) == 0);
  TWI_WRREG(0x16, 0x31);  //end the erase
}

void TWI_EEPROM_WRITE(uint8_t add, uint16_t dat) {
  uint8_t resp;
  TWI_WRREG(0x17, add);         //Set the EEPROM Address
  TWI_WRREG(0x19, dat & 0xFF);  //Set the EEPROM Low Byte
  TWI_WRREG(0x1A, dat >> 8);    //Set the EEPROM High Byte
  TWI_WRREG(0x16, 0x35);        //start the write
  do                            //wait till the erase has completed
  {
    delay(1);
    resp = TWI_RDREG(0x1F);
  } while ((resp & 0x08) == 0);
  TWI_WRREG(0x16, 0x31);  //end the write
}

uint16_t TWI_EEPROM_READ(uint8_t add) {
  uint8_t resp;
  uint16_t val;
  TWI_WRREG(0x17, add);   //Set the EEPROM Address
  TWI_WRREG(0x16, 0x33);  //start the read
  do                      //wait till the erase has completed
  {
    delay(1);
    resp = TWI_RDREG(0x1F);
  } while ((resp & 0x08) == 0);
  val = (TWI_RDREG(0x1C) << 8) + TWI_RDREG(0x1B);
  TWI_WRREG(0x16, 0x31);  //end the read
  return val;
}

void CMT2119A_EEPROM_BURN(void) {
  Serial.println("Burn and Verify Start");
  TWI_reset();
  TWI_reset();
  TWI_EEPROM_SETUP();
  for (int r = 0; r < 0x15; r++)  //erase and write EEPROM values 0x00 - 0x14
  {
    TWI_EEPROM_ERASE(r);
    if (r < 21) {
      TWI_EEPROM_WRITE(r, CMT2119ook[r]);
    } else {
      TWI_EEPROM_WRITE(r, 0);
    }
  }

  for (int r = 0; r < 0x15; r++)  //verify the EEPROM values 0x00 - 0x14
  {
    uint16_t expected = (r < 21) ? CMT2119ook[r] : 0;
    uint16_t val = TWI_EEPROM_READ(r);
    if (val != expected) {
      Serial.print("Verify Error at address = ");
      Serial.print(r, HEX);
      Serial.print(" Expected = ");
      Serial.print(expected, HEX);
      Serial.print(" Value = ");
      Serial.println(val, HEX);
    }
  }
  TWI_EEPROM_END();
  Serial.println("Burn and Verify Complete");

  Serial.println("Resetting from CMT2119A EEPROM");
  CMT2119A_RESET();
  digitalWrite(TWIDAT, HIGH);
}

void CMT2119A_RESET(void) {
  TWI_reset();            //step 1
  TWI_WRREG(0x3d, 0x01);  //step 2 send SOFT_RST
  delay(2);
  TWI_WRREG(0x0D, 0x02);  //step 7 send the TWI_OFF command. Control reverts to simple DAT signals
}

void setup() {
  Serial.begin(115200);
  while (!Serial)
    ;

  Serial.println("CMT2119A OOK CW Transmitter");

  CMT2119AInit();
  CMT2119AUpdate();
  CMT2119A_EEPROM_BURN();
  CMT2119ASetDefault();

  Serial.println("Initialized. Starting transmission...");
}

void loop() {
  send_message("CQ CQ CQ DE A TEST MESSAGE");
  tx_off();
  delay(2000);  // Pause between transmissions
}
```

References:

- https://github.com/g4eml/RP2040_Synth
