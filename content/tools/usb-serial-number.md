---
title: "USB Serial Number Reader"
description: "Read and copy USB serial numbers for DDX, Pico, RP2350, RP2040 and other USB devices directly in your browser."
date: 2026-10-19
showtoc: false
---

Read a board's USB serial descriptor without installing a helper executable or
Python packages. Use desktop **Chrome or Edge** over HTTPS (or localhost for
local development). Safari and Firefox do not support WebUSB.

{{< usb-serial-number >}}

## How to use it

1. Connect your board with a data-capable USB cable.
2. Click **Choose USB device** and select the board in the browser chooser.
3. Read its serial number, product, manufacturer, and USB VID:PID. Click
   **Copy serial number** to copy the descriptor exactly as exposed by the board.
4. Choose **All authorized devices** or enter custom hexadecimal vendor/product
   IDs if the default DDX / Pico / TinyUSB display filter hides your board.

Only connected devices authorized for this site appear. Browser permissions are
separate for each site, so a board authorized on Bunzee Labs must also be
authorized here. The chooser itself is unfiltered. The page refreshes on USB
connect and disconnect events; **Refresh authorized devices** also updates it.

This uses WebUSB only. No serial port is required, and the page does not open or
claim a USB interface, send commands, reset, or flash the device. USB descriptors
stay in your browser; this page does not upload or persist them. The browser
manages site permissions. Devices must expose a serial descriptor, and browser
or operating-system restrictions may hide some devices. USB location and tty/COM
paths are not available through WebUSB.

For a [DDX firmware license](https://bunzee-labs.com/products/ddx/buy/firmware),
verify that the USB serial matches the serial reported by your DEMO firmware.
Use the DEMO firmware serial if they differ; bootloader and application serials
can differ too.

References: [WebUSB](https://developer.chrome.com/docs/capabilities/usb) and
[USBDevice descriptors](https://wicg.github.io/webusb/#usbdevice).
