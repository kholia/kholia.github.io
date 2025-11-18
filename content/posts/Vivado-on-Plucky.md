---
title: "Running Vivado 2025.1 on Ubuntu 25.04 (plucky)"
date: 2025-09-21
tags:
- FPGA toolchain
- FPGA

---

### Notes to get Vivado 2025.1 running on Ubuntu 25.04 (plucky) Linux distribution.

Original reference: https://pavel-demin.github.io/qmtech-xc7z020-notes/led-blinker-77-76/

Install dependencies:

```
sudo apt-get update

sudo apt-get --no-install-recommends install \
  bc binfmt-support bison build-essential ca-certificates curl \
  debootstrap device-tree-compiler dosfstools flex fontconfig git \
  libncurses-dev libssl-dev libtinfo6 parted qemu-user-static \
  squashfs-tools u-boot-tools x11-utils xvfb zerofree zip
```

Hack deps a bit:

```
sudo ln -s /lib/x86_64-linux-gnu/libtinfo.so.6 /lib/x86_64-linux-gnu/libtinfo.so.5
```

You can now go ahead and run the Vivado installer.

### Enable FPGA fabric consumption statistics

Use the following patch:

```git diff
diff --git a/scripts/core.tcl b/scripts/core.tcl
index 583de1b..79e3ae4 100644
--- a/scripts/core.tcl
+++ b/scripts/core.tcl
@@ -3,7 +3,7 @@ set core_name [lindex $argv 0]

 set part_name [lindex $argv 1]

-file delete -force tmp/cores/$core_name tmp/cores/$core_name.cache tmp/cores/$core_name.hw tmp/cores/$core_name.ip_user_files tmp/cores/$core_name.sim tmp/cores/$core_name.xpr
+file delete -force tmp/cores/$core_name tmp/cores/$core_name.cache tmp/cores/$core_name.hw tmp/cores/$core_name.ip_user_files tmp/cores/$core_name.sim

 create_project -part $part_name $core_name tmp/cores
```

```
user@system:~/repos/qmtech-xc7z020-notes$ source ~/Xilinx/2025.1/Vivado/settings64.sh
user@system:~/repos/qmtech-xc7z020-notes$ make NAME=sdr_receiver_ft8_77_76 bit
...

$ vivado -mode tcl
...
Vivado% open_project tmp/sdr_receiver_ft8_77_76.xpr

Vivado% synth_design

Vivado% report_utilization
Copyright 1986-2022 Xilinx, Inc. All Rights Reserved. Copyright 2022-2025 Advanced Micro Devices, Inc. All Rights Reserved.
---------------------------------------------------------------------------------------------------------------------------------------------
| Tool Version : Vivado v.2025.1 (lin64) Build 6140274 Wed May 21 22:58:25 MDT 2025
| Date         : Sun Sep 21 13:49:17 2025
| Host         : system running 64-bit Ubuntu 25.04
| Command      : report_utilization
| Design       : system_wrapper
| Device       : xc7z020clg484-1
| Speed File   : -1
| Design State : Synthesized
---------------------------------------------------------------------------------------------------------------------------------------------

Utilization Design Information

Table of Contents
-----------------
1. Slice Logic
1.1 Summary of Registers by Type
2. Memory
3. DSP
4. IO and GT Specific
5. Clocking
6. Specific Feature
7. Primitives
8. Black Boxes
9. Instantiated Netlists

1. Slice Logic
--------------

+----------------------------+-------+-------+------------+-----------+-------+
|          Site Type         |  Used | Fixed | Prohibited | Available | Util% |
+----------------------------+-------+-------+------------+-----------+-------+
| Slice LUTs*                | 35992 |     0 |          0 |     53200 | 67.65 |
|   LUT as Logic             | 31140 |     0 |          0 |     53200 | 58.53 |
|   LUT as Memory            |  4852 |     0 |          0 |     17400 | 27.89 |
|     LUT as Distributed RAM |   228 |     0 |            |           |       |
|     LUT as Shift Register  |  4624 |     0 |            |           |       |
| Slice Registers            | 38984 |     0 |          0 |    106400 | 36.64 |
|   Register as Flip Flop    | 38984 |     0 |          0 |    106400 | 36.64 |
|   Register as Latch        |     0 |     0 |          0 |    106400 |  0.00 |
| F7 Muxes                   |   560 |     0 |          0 |     26600 |  2.11 |
| F8 Muxes                   |     0 |     0 |          0 |     13300 |  0.00 |
+----------------------------+-------+-------+------------+-----------+-------+
* Warning! The Final LUT count, after physical optimizations and full implementation, is typically lower. Run opt_design after synthesis, if not already completed, for a more realistic count.
Warning! LUT value is adjusted to account for LUT combining.
Warning! For any ECO changes, please run place_design if there are unplaced instances


1.1 Summary of Registers by Type
--------------------------------

+-------+--------------+-------------+--------------+
| Total | Clock Enable | Synchronous | Asynchronous |
+-------+--------------+-------------+--------------+
| 0     |            _ |           - |            - |
| 0     |            _ |           - |          Set |
| 0     |            _ |           - |        Reset |
| 0     |            _ |         Set |            - |
| 0     |            _ |       Reset |            - |
| 0     |          Yes |           - |            - |
| 0     |          Yes |           - |          Set |
| 0     |          Yes |           - |        Reset |
| 441   |          Yes |         Set |            - |
| 38543 |          Yes |       Reset |            - |
+-------+--------------+-------------+--------------+


2. Memory
---------

+-------------------+------+-------+------------+-----------+-------+
|     Site Type     | Used | Fixed | Prohibited | Available | Util% |
+-------------------+------+-------+------------+-----------+-------+
| Block RAM Tile    |   87 |     0 |          0 |       140 | 62.14 |
|   RAMB36/FIFO*    |   77 |     0 |          0 |       140 | 55.00 |
|     RAMB36E1 only |   77 |       |            |           |       |
|   RAMB18          |   20 |     0 |          0 |       280 |  7.14 |
|     RAMB18E1 only |   20 |       |            |           |       |
+-------------------+------+-------+------------+-----------+-------+
* Note: Each Block RAM Tile only has one FIFO logic available and therefore can accommodate only one FIFO36E1 or one FIFO18E1. However, if a FIFO18E1 occupies a Block RAM Tile, that tile can still accommodate a RAMB18E1


3. DSP
------

+----------------+------+-------+------------+-----------+-------+
|    Site Type   | Used | Fixed | Prohibited | Available | Util% |
+----------------+------+-------+------------+-----------+-------+
| DSPs           |   87 |     0 |          0 |       220 | 39.55 |
|   DSP48E1 only |   87 |       |            |           |       |
+----------------+------+-------+------------+-----------+-------+


4. IO and GT Specific
---------------------

+-----------------------------+------+-------+------------+-----------+--------+
|          Site Type          | Used | Fixed | Prohibited | Available |  Util% |
+-----------------------------+------+-------+------------+-----------+--------+
| Bonded IOB                  |   22 |    22 |          0 |       200 |  11.00 |
|   IOB Master Pads           |   11 |       |            |           |        |
|   IOB Slave Pads            |   11 |       |            |           |        |
| Bonded IPADs                |    0 |     0 |          0 |         2 |   0.00 |
| Bonded IOPADs               |  130 |   130 |          0 |       130 | 100.00 |
| PHY_CONTROL                 |    0 |     0 |          0 |         4 |   0.00 |
| PHASER_REF                  |    0 |     0 |          0 |         4 |   0.00 |
| OUT_FIFO                    |    0 |     0 |          0 |        16 |   0.00 |
| IN_FIFO                     |    0 |     0 |          0 |        16 |   0.00 |
| IDELAYCTRL                  |    0 |     0 |          0 |         4 |   0.00 |
| IBUFDS                      |    8 |     8 |          0 |       192 |   4.17 |
| PHASER_OUT/PHASER_OUT_PHY   |    0 |     0 |          0 |        16 |   0.00 |
| PHASER_IN/PHASER_IN_PHY     |    0 |     0 |          0 |        16 |   0.00 |
| IDELAYE2/IDELAYE2_FINEDELAY |    0 |     0 |          0 |       200 |   0.00 |
| ILOGIC                      |    7 |     7 |          0 |       200 |   3.50 |
|   IFF_IDDR_Register         |    7 |     7 |            |           |        |
| OLOGIC                      |    0 |     0 |          0 |       200 |   0.00 |
+-----------------------------+------+-------+------------+-----------+--------+


5. Clocking
-----------

+------------+------+-------+------------+-----------+-------+
|  Site Type | Used | Fixed | Prohibited | Available | Util% |
+------------+------+-------+------------+-----------+-------+
| BUFGCTRL   |    3 |     0 |          0 |        32 |  9.38 |
| BUFIO      |    0 |     0 |          0 |        16 |  0.00 |
| MMCME2_ADV |    0 |     0 |          0 |         4 |  0.00 |
| PLLE2_ADV  |    1 |     0 |          0 |         4 | 25.00 |
| BUFMRCE    |    0 |     0 |          0 |         8 |  0.00 |
| BUFHCE     |    0 |     0 |          0 |        72 |  0.00 |
| BUFR       |    0 |     0 |          0 |        16 |  0.00 |
+------------+------+-------+------------+-----------+-------+


6. Specific Feature
-------------------

+-------------+------+-------+------------+-----------+-------+
|  Site Type  | Used | Fixed | Prohibited | Available | Util% |
+-------------+------+-------+------------+-----------+-------+
| BSCANE2     |    0 |     0 |          0 |         4 |  0.00 |
| CAPTUREE2   |    0 |     0 |          0 |         1 |  0.00 |
| DNA_PORT    |    0 |     0 |          0 |         1 |  0.00 |
| EFUSE_USR   |    0 |     0 |          0 |         1 |  0.00 |
| FRAME_ECCE2 |    0 |     0 |          0 |         1 |  0.00 |
| ICAPE2      |    0 |     0 |          0 |         2 |  0.00 |
| STARTUPE2   |    0 |     0 |          0 |         1 |  0.00 |
| XADC        |    0 |     0 |          0 |         1 |  0.00 |
+-------------+------+-------+------------+-----------+-------+


7. Primitives
-------------

+-----------+-------+----------------------+
|  Ref Name |  Used |  Functional Category |
+-----------+-------+----------------------+
| FDRE      | 38543 |         Flop & Latch |
| LUT6      | 13222 |                  LUT |
| LUT2      | 10550 |                  LUT |
| SRL16E    |  3820 |   Distributed Memory |
| LUT3      |  3616 |                  LUT |
| CARRY4    |  3460 |           CarryLogic |
| LUT4      |  3334 |                  LUT |
| LUT1      |  1584 |                  LUT |
| LUT5      |  1315 |                  LUT |
| SRLC32E   |   804 |   Distributed Memory |
| MUXF7     |   560 |                MuxFx |
| FDSE      |   441 |         Flop & Latch |
| RAMD64E   |   228 |   Distributed Memory |
| BIBUF     |   130 |                   IO |
| DSP48E1   |    87 |     Block Arithmetic |
| RAMB36E1  |    77 |         Block Memory |
| RAMB18E1  |    20 |         Block Memory |
| IBUFDS    |     8 |                   IO |
| IDDR      |     7 |                   IO |
| OBUF      |     4 |                   IO |
| BUFG      |     3 |                Clock |
| PS7       |     1 | Specialized Resource |
| PLLE2_ADV |     1 |                Clock |
| OBUFT     |     1 |                   IO |
| IBUF      |     1 |                   IO |
+-----------+-------+----------------------+


8. Black Boxes
--------------

+----------+------+
| Ref Name | Used |
+----------+------+


9. Instantiated Netlists
------------------------

+----------+------+
| Ref Name | Used |
+----------+------+
```

### Bonus notes for EDGE ZYNQ SoC FPGA Development Board

See https://gist.github.com/rikka0w0/24b58b54473227502fa0334bbe75c3c1 hack to let Vivado see the FPGA on this board using the onboard programmer.

```
user@system:~/repos/openFPGALoader$ sudo ./openFPGALoader -c ft2232 --detect
empty
Jtag frequency : requested 6.00MHz    -> real 6.00MHz
index 0:
	idcode   0x4ba00477
	type     ARM cortex A9
	irlength 4
index 1:
	idcode 0x3727093
	manufacturer xilinx
	family zynq
	model  xc7z020
	irlength 6
```

```
sudo udevadm control --reload-rules && sudo udevadm trigger
```

You can use https://github.com/trabucayre/openFPGALoader to quickly check that the board (+ FPGA) is being detected.

### Bonus FPGA challenge

Instead of the usual `blinky` challenge, can we get https://github.com/pavel-demin/qmtech-xc7z020-notes/blob/main/cores/dds.v running on various different 'cheap' FPGA boards?
