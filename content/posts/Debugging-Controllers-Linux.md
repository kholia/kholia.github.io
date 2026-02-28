---
title: Debugging gaming pads on Linux
date: 2025-09-29
tags:
- Self-Note
- Notes
- Debugging
- Gaming
- Emulation
- Hacking
- RE
- Reversing
- Reverse Engineering
---

While running https://github.com/fhoedemakers/pico-infonesPlus, I found that my SNES gaming pad was not fully supported.

Specifically, the UP/DOWN and LEFT/RIGHT keys were not working.

Let's debug this a bit:

Plug in the gaming pad on a Linux box and run the following command (`hidraw5` will need to be changed as needed):

```bash
$ lsusb
...
Bus 001 Device 063: ID 0810:e501 Personal Communication Systems, Inc. SNES Gamepad
```

```bash
$ sudo hexdump -C /dev/hidraw5
...
00004a50  01 80 80 7f 7f 0f 00 00  01 80 80 7f 00 0f 00 00  |................|
00004a60  01 80 80 7f 00 0f 00 00  01 80 80 7f 00 0f 00 00  |................|
*
00004a80  01 80 80 7f 7f 0f 00 00  01 80 80 7f 7f 0f 00 00  |................|
```

This is what I see when pressing the `UP` key.

The byte pattern at `byte 5` position is changing (`00` to `7f` pattern).

Let's check the `pico-infonesPlus` code for handling NES / SNES controllers:

```cpp
$ vim pico_shared/hid_app.cpp
...
(r->byte7 & MantaPadReport::Button::START ? io::GamePadState::Button::START : 0) |
(r->byte7 & MantaPadReport::Button::SELECT ? io::GamePadState::Button::SELECT : 0) |
(r->byte2 == MantaPadReport::Button::UP ? io::GamePadState::Button::UP : 0) |
(r->byte2 == MantaPadReport::Button::DOWN ? io::GamePadState::Button::DOWN : 0) |
(r->byte1 == MantaPadReport::Button::LEFT ? io::GamePadState::Button::LEFT : 0) |
(r->byte1 == MantaPadReport::Button::RIGHT ? io::GamePadState::Button::RIGHT : 0);
```

The existing code is checking for changes at `byte 2` position instead of `byte 5` position!

To get UP DOWN keys to work, we can simply apply the following patch:

```diff
- (r->byte2 == MantaPadReport::Button::UP ? io::GamePadState::Button::UP : 0) |
- (r->byte2 == MantaPadReport::Button::DOWN ? io::GamePadState::Button::DOWN : 0) |
+ (r->byte5 == MantaPadReport::Button::UP ? io::GamePadState::Button::UP : 0) |
+ (r->byte5 == MantaPadReport::Button::DOWN ? io::GamePadState::Button::DOWN : 0) |
```

Similarly we can debug other gaming pad keys as well.

Sample controller image:

![Sample controller image](/images/SNES-Pad.jpg)

References:

- https://github.com/fhoedemakers/pico_shared/pull/37
