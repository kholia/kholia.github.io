---
title: "Easy and Quick Thermal Simulation of PCBs (2027)"
date: 2026-11-27
tags:
- Keysight ADS
- ADS
- Thermal Simulation
- RF Hacking
- Amateur Radio
---

ADS 2027.x remains the best for easy and quick thermal simulation of PCBs.

I badly want to use a (F)OSS solution (like https://github.com/wayri/SPIKE) but
we don't seem to be there yet.

For background, see my [earlier article on thermal simulation of PCBs]({{< relref "Easy-Quick-Thermal-Simulation-of-PCBs.md" >}}).

Here is the DDX 27.15 board under examination for `thermal bugs`.

![ADS screenshot 0](/images/ADS-2027-0.png)
![ADS screenshot 1](/images/ADS-2027-1.png)
![ADS screenshot 2](/images/ADS-2027-2.png)
![ADS screenshot 3](/images/ADS-2027-3.png)
![ADS screenshot 4](/images/ADS-2027-4.png)

Once we add more heat sources (those LDOs...):

![ADS screenshot 0 - more heat sources](/images/ADS-2027-U1-More-Heat-Sources-0.png)

As you can see, the TCXO cutout region is unaffected thermally now.

For RF designs where frequency stability matters, thermal simulation is not
optional - it's essential.

Quick ADS reference:

```
❯ cat /etc/os-release
NAME="Omarchy"
PRETTY_NAME="Omarchy"
ID=omarchy
ID_LIKE=arch
BUILD_ID="4.5.0"
VERSION_ID="4.5.0"
ANSI_COLOR="38;2;158;206;106"
HOME_URL="https://omarchy.org/"
DOCUMENTATION_URL="https://learn.omacom.io/2/the-omarchy-manual"
SUPPORT_URL="https://discord.gg/tXFUdasqhY"
BUG_REPORT_URL="https://github.com/omacom/omarchy/issues"
LOGO=omarchy

sudo pacman -S ksh -y
```

```
$ cat ads.sh
export ADS_LICENSE_FILE=27009@localhost
export EMPRO_LICENSE_FILE=27009@localhost
export GENESYS_LICENSE_FILE=27009@localhost
export ICCAP_LICENSE_FILE=27009@localhost
export MBP_LICENSE_FILE=27009@localhost
export MQA_LICENSE_FILE=27009@localhost
export SYSTEMVUE_LICENSE_FILE=27009@localhost
export WAFERPRO_LICENSE_FILE=27009@localhost
export GOLDENGATE_LICENSE_FILE=27009@localhost

/usr/local/ADS2027/Licensing/2026.3/linux_x86_64/bin/lmgrd -c agileesofd.lic -l license.log &

/usr/local/ADS2027/bin/ads
```

Process:

1. Export ODB++ file from KiCad ≥ 10.

2. Ensure NPTH holes are NOT included (temporarily modify footprints if required).

   Easier hack: Use our [remove_npth.py](/files/remove_npth.py) script to remove NPTH holes!

3. Create a new workspace in ADS and import the ODB++ file.

4. From the ADS layout window, launch SIPro / PIPro.

5. Define heat sources and power dissipation values for relevant components.

6. Click Run - and you're done.

Even complex multi-layer boards converge quickly without manual meshing or
solver tuning. The whole process takes less than 5 minutes and gives back
immediately actionable results!
