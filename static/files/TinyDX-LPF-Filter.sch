<QucsStudio Schematic 5.9>
<Properties>
View=393.835,-75.1883,1740.07,783.653,1.43006,0,0
Grid=10,10,1
DataSet=*.dat
DataDisplay=*.dpl
OpenDisplay=3
showFrame=0
FrameText0=Title \n @PATH@@FILE@
FrameText1=Drawn By:
FrameText2=Date: @DATE@
FrameText3=Revision:
</Properties>
<Symbol>
</Symbol>
<Components>
Pac P1 1 530 490 18 -26 0 "1"1"50"1"0 dBm"0"1 GHz"0"26.85"0"con_2"0
GND * 1 530 520 0 0 0
GND * 1 640 520 0 0 0
GND * 1 780 520 0 0 0
GND * 1 920 520 0 0 0
GND * 1 1060 520 0 0 0
Pac P2 1 1170 490 18 -26 0 "2"1"50"1"0"0"1 GHz"0"26.85"0"con_2"0
GND * 1 1170 520 0 0 0
.SP SP1 1 530 640 0 9 0 "log"1"300kHz"1"60MHz"1"6000"1"no"0"1"0"2"0"none"0
C C1 1 640 490 17 -26 1 "100p"1"0"0""0"neutral"0"SMD0603"0
L L1 1 710 410 -26 10 0 "330n"0"0"0""0"inductor_1mH"0
C C21 1 710 370 -26 -48 0 "12p"1"0"0""0"neutral"0"SMD0603"0
C C6 1 990 370 -26 -48 0 "39p"1"0"0""0"neutral"0"SMD0603"0
C C4 1 850 370 -26 -48 0 "56p"1"0"0""0"neutral"0"SMD0603"0
C C3 1 780 490 17 -26 1 "180p"1"0"0""0"neutral"0"SMD0603"0
C C5 1 920 490 17 -26 1 "150p"1"0"0""0"neutral"0"SMD0603"0
C C7 1 1060 490 17 -26 1 "56p"1"0"0""0"neutral"0"SMD0603"0
L L2 1 850 410 -26 10 0 "270n"0"0"0""0"inductor_1mH"0
L L3 1 990 410 -26 10 0 "270n"0"0"0""0"inductor_1mH"0
</Components>
<Wires>
530 410 530 460
530 410 640 410
640 410 640 460
640 410 680 410
740 410 780 410
680 370 680 410
740 370 740 410
780 410 780 460
780 410 820 410
880 410 920 410
820 370 820 410
880 370 880 410
920 410 920 460
920 410 960 410
1020 410 1060 410
960 370 960 410
1020 370 1020 410
1060 410 1060 460
1170 410 1170 460
1060 410 1170 410
</Wires>
<Diagrams>
<Rect 1340 240 360 220 31 #c0c0c0 1 00 1 0 1 1 1 0 1 1 1 0 1 1 -1 -1 -1 "" "" "">
	<Legend 10 -100 0>
	<"dB(S[1,1])" "" #0000ff 2 3 0 0 0 0 "">
	<"dB(S[2,1])" "" #ff0000 2 3 0 0 0 0 "">
</Rect>
<Smith 1340 540 220 220 31 #c0c0c0 1 00 1 0 1 1 1 0 1 1 1 0 1 1 -1 -1 -1 "" "" "">
	<Legend 10 -100 0>
	<"S[1,1]" "" #0000ff 2 3 0 0 0 0 "">
	<"S[2,2]" "" #ff0000 2 3 0 0 0 0 "">
</Smith>
</Diagrams>
<Paintings>
Text 700 580 16 #000000 0 Cauer lowpass filter of order 7 \n 3MHz cutoff/center frequency \n impedance 50\\Omega
</Paintings>
