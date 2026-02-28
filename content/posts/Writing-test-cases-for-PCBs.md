---
title: "Writing test cases for PCBs"
date: 2025-11-07
tags:
- PCBs
- KiCad
- Correctness
- PCB Testing
---

This note demonstrates a small `connectivity tester` / `check nets` program for
KiCad. This program allows doing checks like: Is the `U1:8` pin connected to
`GND`?

## Motivation

Sometimes visual errors can creep in the schematic (and the PCB subsequently).
This `connectivity tester` allows expressing the same connections in a
non-visual way (with a different probability of making errors).

The ERC and DRC checks in KiCad work great but this non-visual test assertions
provide another level of sanity checking.

These test assertions can be run automatically and more importantly
continuously to ensure that the `circuit correctness` is still fine.

Update: Yes, it support (UART and other) voltage compatibility checks now -
thanks to Akshar Vastarpara (Vicharak) for this awesome idea.

## The Code

```python
#!/usr/bin/env python3
"""
check_nets_pcbnew.py — Assert footprint pad → net mapping in a KiCad .kicad_pcb using pcbnew.

Usage:
  python3 check_nets_pcbnew.py SDR-Board.kicad_pcb --test-file pcb_tests.txt

  python check_nets_pcbnew.py /path/to/board.kicad_pcb \
    --case U1:11=GND --case J1:2=+5V

  Or with a test file:
  python check_nets_pcbnew.py /path/to/board.kicad_pcb --test-file tests.txt

  Voltage compatibility checking:
  python check_nets_pcbnew.py /path/to/board.kicad_pcb --check-voltage-compat

Test file format:
  - Positive assertion (must equal): REF:PAD=NET (e.g., U1:11=GND)
  - Negative assertion (must not equal): REF:PAD!=NET (e.g., U1:14!=GND)
  - Voltage compatibility check: REF1:PAD1<>REF2:PAD2 (e.g., U1:TX<>U2:RX)
  - Lines starting with # are comments
  - Blank lines are ignored

Voltage Level Detection:
  The script can detect voltage levels from:
  1. Net name suffixes: _5V, _3V3, _3.3V, _1V8, etc.
  2. Component properties: IO_VOLTAGE field on footprints
  3. Manual voltage specifications in test cases

Tip:
  If 'import pcbnew' fails, run this with KiCad's bundled Python or add pcbnew to PYTHONPATH.
"""

import sys
import argparse
import re

try:
    import pcbnew
except Exception as e:
    print("ERROR: Could not import pcbnew. Run from KiCad's Python or ensure pcbnew is on PYTHONPATH.")
    print(e)
    sys.exit(2)


def extract_voltage_from_net_name(net_name: str):
    """
    Extract voltage level from net name using common suffixes.
    Examples: UART_TX_5V -> 5.0, I2C_SDA_3V3 -> 3.3, SPI_CLK_1V8 -> 1.8

    Returns: voltage as float or None if not detected
    """
    if not net_name:
        return None

    # Pattern for voltage indicators: _5V, _3V3, _3.3V, _1V8, _1.8V, etc.
    # Also handles: _5v, _3v3, etc.
    patterns = [
        r'_(\d+)V(\d+)',     # _3V3, _1V8 -> 3.3, 1.8
        r'_(\d+)\.(\d+)V',   # _3.3V, _1.8V -> 3.3, 1.8
        r'_(\d+)V(?![0-9])', # _5V, _3V -> 5.0, 3.0
    ]

    net_upper = net_name.upper()

    for pattern in patterns:
        match = re.search(pattern, net_upper)
        if match:
            if len(match.groups()) == 2:
                # Format: XVY or X.YV
                return float(f"{match.group(1)}.{match.group(2)}")
            else:
                # Format: XV
                return float(match.group(1))

    return None


def get_footprint_io_voltage(fp):
    """
    Get IO voltage from footprint custom properties/fields.
    Looks for fields like 'IO_VOLTAGE', 'VCC', 'SUPPLY_VOLTAGE'

    Returns: voltage as float or None
    """
    if fp is None:
        return None

    # Check common field names
    field_names = ['IO_VOLTAGE', 'VCC', 'SUPPLY_VOLTAGE', 'VCCIO']

    for field_name in field_names:
        # Try to get the property value
        try:
            # KiCad 6+ uses GetProperty
            if hasattr(fp, 'GetProperty'):
                value = fp.GetProperty(field_name)
                if value:
                    return parse_voltage_string(value)
        except:
            pass

        # Try fields method (older KiCad or different access pattern)
        try:
            if hasattr(fp, 'GetFields'):
                fields = fp.GetFields()
                for field in fields:
                    if field.GetName() == field_name:
                        return parse_voltage_string(field.GetText())
        except:
            pass

    return None


def parse_voltage_string(text: str):
    """
    Parse a voltage value from text like '3.3V', '5V', '3V3', '1.8'
    Returns: voltage as float or None
    """
    if not text:
        return None

    text = text.strip().upper()

    # Try standard formats: 3.3V, 5V, etc.
    match = re.match(r'^(\d+\.?\d*)V?$', text)
    if match:
        return float(match.group(1))

    # Try 3V3 format
    match = re.match(r'^(\d+)V(\d+)$', text)
    if match:
        return float(f"{match.group(1)}.{match.group(2)}")

    return None


def get_pad_voltage(board, fp, pad):
    """
    Determine the voltage level of a pad by checking:
    1. Net name suffix
    2. Footprint IO_VOLTAGE property

    Returns: voltage as float or None
    """
    # First check net name
    net_name = pad_net_name(pad)
    voltage = extract_voltage_from_net_name(net_name)
    if voltage is not None:
        return voltage

    # Then check footprint properties
    voltage = get_footprint_io_voltage(fp)
    if voltage is not None:
        return voltage

    return None


def are_voltages_compatible(v1, v2, tolerance=0.1):
    """
    Check if two voltage levels are compatible.

    Args:
        v1, v2: voltages as floats (or None)
        tolerance: acceptable voltage difference

    Returns: (compatible: bool, reason: str)
    """
    if v1 is None or v2 is None:
        return True, "Unknown voltage - cannot verify compatibility"

    # Same voltage level (within tolerance)
    if abs(v1 - v2) <= tolerance:
        return True, f"Compatible: {v1}V ≈ {v2}V"

    # 5V to 3.3V is NOT safe (without level shifter)
    if v1 > v2 + tolerance:
        return False, f"UNSAFE: {v1}V output to {v2}V input (needs level shifter)"

    # 3.3V to 5V might be OK depending on input thresholds (often acceptable for CMOS)
    # But we'll flag it as a warning
    if v2 > v1 + tolerance:
        return True, f"Warning: {v1}V output to {v2}V input (verify input thresholds)"

    return True, "Compatible"


def parse_case(expr: str):
    """
    Parse a test case expression.
    'U1:11=GND' -> ('net', ref, pad, net, is_positive=True)
    'U1:14!=GND' -> ('net', ref, pad, net, is_positive=False)
    'U1:TX<>U2:RX' -> ('voltage', ref1, pad1, ref2, pad2)

    Returns: tuple with first element being test type ('net' or 'voltage')
    """
    try:
        # Check for voltage compatibility test (<>)
        if "<>" in expr:
            left, right = expr.split("<>", 1)
            ref1, pad1 = left.strip().split(":", 1)
            ref2, pad2 = right.strip().split(":", 1)
            return ('voltage', ref1.strip(), pad1.strip(), ref2.strip(), pad2.strip())
        # Check for negative assertion first (!=)
        elif "!=" in expr:
            left, net = expr.split("!=", 1)
            ref, pad = left.split(":", 1)
            return ('net', ref.strip(), pad.strip(), net.strip(), False)
        # Positive assertion (=)
        elif "=" in expr:
            left, net = expr.split("=", 1)
            ref, pad = left.split(":", 1)
            return ('net', ref.strip(), pad.strip(), net.strip(), True)
        else:
            raise ValueError("No =, !=, or <> found")
    except Exception:
        raise ValueError(f"Bad test case format: '{expr}'. Use REF:PAD=NET, REF:PAD!=NET, or REF1:PAD1<>REF2:PAD2")


def find_footprint(board, ref: str):
    # Robust across KiCad versions: iterate footprints and match reference
    for fp in board.GetFootprints():
        if fp.GetReference() == ref:
            return fp
    return None


def get_pad(fp, pad_number: str):
    # Handles both string/number pad names
    pad = fp.FindPadByNumber(str(pad_number))
    return pad


def pad_net_name(pad) -> str:
    net = pad.GetNet()
    if net:
        # Some versions include a leading slash; normalize by stripping spaces
        return net.GetNetname().strip()
    return ""


def check_all_voltage_compat(board):
    """
    Scan all nets in the board and check for voltage compatibility issues.
    Returns a list of issues, each with 'severity' and 'message'.
    """
    issues = []
    checked_nets = set()

    # Build a map of nets to pads
    net_to_pads = {}

    for fp in board.GetFootprints():
        ref = fp.GetReference()
        for pad in fp.Pads():
            net_name = pad_net_name(pad)
            if not net_name or net_name in ['GND', 'VCC', '+3V3', '+5V', '+12V']:
                # Skip power/ground nets
                continue

            if net_name not in net_to_pads:
                net_to_pads[net_name] = []

            voltage = get_pad_voltage(board, fp, pad)
            pad_num = pad.GetNumber()

            net_to_pads[net_name].append({
                'ref': ref,
                'pad': pad_num,
                'voltage': voltage,
                'fp': fp,
                'pad_obj': pad
            })

    # Check each net for voltage compatibility
    for net_name, pads in net_to_pads.items():
        if net_name in checked_nets:
            continue

        checked_nets.add(net_name)

        # Get all unique voltage levels on this net
        voltages = {}
        for pad_info in pads:
            v = pad_info['voltage']
            if v is not None:
                if v not in voltages:
                    voltages[v] = []
                voltages[v].append(pad_info)

        # If we have multiple different voltages on the same net, that's a problem
        if len(voltages) > 1:
            voltage_list = sorted(voltages.keys())
            for i, v1 in enumerate(voltage_list):
                for v2 in voltage_list[i+1:]:
                    compatible, reason = are_voltages_compatible(v1, v2)

                    # Get example pads for each voltage
                    pad1_info = voltages[v1][0]
                    pad2_info = voltages[v2][0]

                    msg = f"Net '{net_name}': {pad1_info['ref']}:{pad1_info['pad']} ({v1}V) connected to {pad2_info['ref']}:{pad2_info['pad']} ({v2}V) - {reason}"

                    if not compatible:
                        issues.append({
                            'severity': 'error',
                            'message': msg
                        })
                    elif "Warning" in reason:
                        issues.append({
                            'severity': 'warning',
                            'message': msg
                        })

    return issues


def load_test_cases_from_file(filepath: str):
    """
    Load test cases from a text file.
    Returns a list of test case strings.
    Ignores blank lines and lines starting with #.
    """
    cases = []
    try:
        with open(filepath, 'r') as f:
            for line_num, line in enumerate(f, 1):
                # Strip whitespace
                line = line.strip()
                # Skip blank lines
                if not line:
                    continue
                # Skip comments
                if line.startswith('#'):
                    continue
                # Add valid test case
                cases.append(line)
        return cases
    except FileNotFoundError:
        print(f"ERROR: Test file '{filepath}' not found.")
        sys.exit(2)
    except Exception as e:
        print(f"ERROR: Failed to read test file '{filepath}': {e}")
        sys.exit(2)


def main():
    ap = argparse.ArgumentParser(description="Assert pad → net mapping in a KiCad .kicad_pcb.")
    ap.add_argument("board", help="Path to .kicad_pcb")
    ap.add_argument("--case", action="append", default=[],
                    help="Assertion in the form REF:PAD=NET or REF1:PAD1<>REF2:PAD2. May be used multiple times.")
    ap.add_argument("--test-file", help="Path to text file containing test cases (one per line)")
    ap.add_argument("--check-voltage-compat", action="store_true",
                    help="Automatically check all connections for voltage compatibility")
    args = ap.parse_args()

    # Collect test cases from both --case arguments and --test-file
    test_cases = args.case[:]

    if args.test_file:
        file_cases = load_test_cases_from_file(args.test_file)
        test_cases.extend(file_cases)

    if not test_cases and not args.check_voltage_compat:
        print("No test cases given. Use --case, --test-file, or --check-voltage-compat.")
        print("Example: --case U1:11=GND --case J1:2=+5V")
        print("Example: --case U1:TX<>U2:RX (voltage compatibility)")
        print("Example: --test-file tests.txt")
        print("Example: --check-voltage-compat")
        return 2

    board = pcbnew.LoadBoard(args.board)
    failures = []
    warnings = []

    for expr in test_cases:
        try:
            parsed = parse_case(expr)
        except ValueError as ve:
            print(str(ve))
            return 2

        test_type = parsed[0]

        if test_type == 'net':
            # Original net connectivity test
            _, ref, padno, want_net, is_positive = parsed

            fp = find_footprint(board, ref)
            if fp is None:
                failures.append(f"[MISS] Footprint {ref} not found")
                continue

            pad = get_pad(fp, padno)
            if pad is None:
                failures.append(f"[MISS] {ref} pad {padno} not found")
                continue

            got = pad_net_name(pad) or "<no-net>"

            if is_positive:
                # Positive assertion: pad MUST be on the specified net
                if got != want_net:
                    failures.append(f"[FAIL] {ref}:{padno} expected '{want_net}', got '{got}'")
                else:
                    print(f"[PASS] {ref}:{padno} is on '{got}'")
            else:
                # Negative assertion: pad MUST NOT be on the specified net
                if got == want_net:
                    failures.append(f"[FAIL] {ref}:{padno} must NOT be on '{want_net}', but it is!")
                else:
                    print(f"[PASS] {ref}:{padno} is NOT on '{want_net}' (currently on '{got}')")

        elif test_type == 'voltage':
            # Voltage compatibility test
            _, ref1, pad1, ref2, pad2 = parsed

            fp1 = find_footprint(board, ref1)
            fp2 = find_footprint(board, ref2)

            if fp1 is None:
                failures.append(f"[MISS] Footprint {ref1} not found")
                continue
            if fp2 is None:
                failures.append(f"[MISS] Footprint {ref2} not found")
                continue

            p1 = get_pad(fp1, pad1)
            p2 = get_pad(fp2, pad2)

            if p1 is None:
                failures.append(f"[MISS] {ref1} pad {pad1} not found")
                continue
            if p2 is None:
                failures.append(f"[MISS] {ref2} pad {pad2} not found")
                continue

            # Check if they're on the same net
            net1 = pad_net_name(p1)
            net2 = pad_net_name(p2)

            if net1 != net2:
                failures.append(f"[FAIL] {ref1}:{pad1} and {ref2}:{pad2} are NOT connected ('{net1}' vs '{net2}')")
                continue

            # Get voltage levels
            v1 = get_pad_voltage(board, fp1, p1)
            v2 = get_pad_voltage(board, fp2, p2)

            compatible, reason = are_voltages_compatible(v1, v2)

            v1_str = f"{v1}V" if v1 is not None else "?"
            v2_str = f"{v2}V" if v2 is not None else "?"

            if not compatible:
                failures.append(f"[FAIL] {ref1}:{pad1} ({v1_str}) <> {ref2}:{pad2} ({v2_str}): {reason}")
            elif "Warning" in reason:
                warnings.append(f"[WARN] {ref1}:{pad1} ({v1_str}) <> {ref2}:{pad2} ({v2_str}): {reason}")
                print(f"[WARN] {ref1}:{pad1} ({v1_str}) <> {ref2}:{pad2} ({v2_str}): {reason}")
            else:
                print(f"[PASS] {ref1}:{pad1} ({v1_str}) <> {ref2}:{pad2} ({v2_str}): {reason}")

    # Auto voltage compatibility check
    if args.check_voltage_compat:
        print("\n=== Running automatic voltage compatibility scan ===")
        voltage_issues = check_all_voltage_compat(board)

        for issue in voltage_issues:
            if issue['severity'] == 'error':
                failures.append(f"[FAIL] {issue['message']}")
            elif issue['severity'] == 'warning':
                warnings.append(f"[WARN] {issue['message']}")
                print(f"[WARN] {issue['message']}")

    if failures:
        print("\n=== Connectivity check FAILED ===")
        for line in failures:
            print("  " + line)
        return 1

    if warnings:
        print(f"\n{len(warnings)} warning(s) found - please review.")

    print("\n=== Connectivity check PASSED ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

<br>

Usage:

```
$ python check_nets_pcbnew.py SDR-Board.kicad_pcb --case U4:11="Net-(CLK0-In)"
[PASS] U4:11 is on 'Net-(CLK0-In)'
Connectivity check PASSED.
```

<br>

Sample schematic:

{{< embed-pdf url="/pdfs/DDX-QSD-v15.pdf" hideLoader="true" >}}

<br>

## Example Test Cases

Here are the test cases for this `*-QSD-v15` project:

```conf
# Note: These test cases should ideally be derived from datasheets
#
# Usage: python check_nets_pcbnew.py board.kicad_pcb --test-file pcb_tests.txt --case U3:1=GND

# Power connections (7805 TO-252)
U1:1=/VIN
U1:2=GND
U1:3=+5V
U1:3!=GND

# Power connections (AMS1117 SOT-223)
U3:1=GND
U3:2=+3.3V
U3:3=5VF
U3:3!=GND

# QSD clocks derivation
U4:1=+3.3V
U4:2=/D
U4:3=/CLK0
U4:4=+3.3V
U4:5=/Q
U4:6=LO_I
U4:7=GND
U4:8=/D
U4:9=LO_Q
U4:10=+3.3V
U4:11=/CLK0
U4:12=/Q
U4:13=+3.3V
U4:14=+3.3V

# Positive assertions - these connections MUST exist
U7:4=GND
U7:5=/5VFL

# Negative assertions - prevent shorts and wrong connections
U4:14!=+5V   # 3.3V pin must NOT be on 5V rail

# Check multiple rails aren't shorted together
U3:1!=+3.3V
U3:1!=+5V

# Signal connections
J1:1=DOUT
J1:2=WSEL
J1:3=BCLK
J1:4=GND

# Data and clock lines
U7:1=BCLK
U7:2=WSEL
U7:3=DOUT
```

The test case language is decently expressive enough.

## Execution Log

```bash
$ python3 check_nets_pcbnew.py SDR-Board.kicad_pcb --test-file pcb_tests.txt
[PASS] U1:1 is on '/VIN'
[PASS] U1:2 is on 'GND'
[PASS] U1:3 is on '+5V'
[PASS] U1:3 is NOT on 'GND' (currently on '+5V')
[PASS] U3:1 is on 'GND'
[PASS] U3:2 is on '+3.3V'
[PASS] U3:3 is on '5VF'
[PASS] U3:3 is NOT on 'GND' (currently on '5VF')
[PASS] U4:1 is on '+3.3V'
[PASS] U4:2 is on '/D'
[PASS] U4:3 is on '/CLK0'
[PASS] U4:4 is on '+3.3V'
[PASS] U4:5 is on '/Q'
[PASS] U4:6 is on 'LO_I'
[PASS] U4:7 is on 'GND'
[PASS] U4:8 is on '/D'
[PASS] U4:9 is on 'LO_Q'
[PASS] U4:10 is on '+3.3V'
[PASS] U4:11 is on '/CLK0'
[PASS] U4:12 is on '/Q'
[PASS] U4:13 is on '+3.3V'
[PASS] U4:14 is on '+3.3V'
[PASS] U7:4 is on 'GND'
[PASS] U7:5 is on '/5VFL'
[PASS] U4:14 is NOT on '+5V   # 3.3V pin must NOT be on 5V rail' (currently on '+3.3V')
[PASS] U3:1 is NOT on '+3.3V' (currently on 'GND')
[PASS] U3:1 is NOT on '+5V' (currently on 'GND')
[PASS] J1:1 is on 'DOUT'
[PASS] J1:2 is on 'WSEL'
[PASS] J1:3 is on 'BCLK'
[PASS] J1:4 is on 'GND'
[PASS] U7:1 is on 'BCLK'
[PASS] U7:2 is on 'WSEL'
[PASS] U7:3 is on 'DOUT'

=== Connectivity check PASSED ===
```
