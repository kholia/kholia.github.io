#!/usr/bin/env python3
"""Remove round NPTH drills and their mechanical pins from a KiCad ODB++ ZIP."""

import argparse
import re
from decimal import Decimal, InvalidOperation
from pathlib import Path
from zipfile import BadZipFile, ZipFile


def rewrite_record(line, replacements):
    """Replace fields while preserving the original spacing and attributes."""
    fields = list(re.finditer(r"\S+", line))
    for index, value in sorted(replacements.items(), reverse=True):
        start, end = fields[index].span()
        line = line[:start] + str(value) + line[end:]
    return line


def clean_step(files, drill_files):
    eda = files["eda/data"]
    if not any(line.startswith("HDR KiCad EDA ") for line in eda):
        raise ValueError("expected a KiCad ODB++ export")
    referenced_layers = {name for line in eda if line.startswith("LYR ")
                         for name in line.lower().split()[1:]}
    holes = set()
    for path in drill_files:
        if path.split("/")[1].lower() in referenced_layers:
            raise ValueError("NPTH drill layer has EDA feature references")
        lines = files[path]
        hits = []
        counts = []
        for row, line in enumerate(lines):
            if line.startswith("F "):
                counts.append(row)
            elif line.startswith("P "):
                fields = line.split()
                holes.add((Decimal(fields[1]), Decimal(fields[2])))
                hits.append(row)
            elif line.strip() and not line.startswith(("UNITS=", "#", "$", "@", "&")):
                raise ValueError(f"unsupported drill feature in {path}: {line.strip()}")
        if len(counts) != 1 or int(lines[counts[0]].split()[1]) != len(hits):
            raise ValueError(f"inconsistent feature count in {path}")
        lines[counts[0]] = rewrite_record(lines[counts[0]], {1: 0})
        for row in hits:
            lines[row] = ""

    # Package pins are numbered by their order within the package.
    packages = {}
    package = pin = None
    for row, line in enumerate(eda):
        fields = line.split()
        if fields[:2] == ["#", "PKG"]:
            package = int(fields[2])
            packages[package] = []
            pin = None
        elif fields[:1] == ["PIN"]:
            pin = (fields[1], fields[6:8] == ["M", "H"], [row])
            packages[package].append(pin)
        elif pin and fields and fields[0] in {"CR", "RC", "SQ", "CT", "CE",
                                              "OB", "OS", "OC", "OE"}:
            pin[2].append(row)

    removed = set()
    retained = set()
    toeprints = {}
    components = {}
    for side, layer in (("T", "top"), ("B", "bot")):
        lines = files.get(f"layers/comp_+_{layer}/components", [])
        component = None
        for row, line in enumerate(lines):
            fields = line.split()
            if fields[:2] == ["#", "CMP"]:
                component = int(fields[2])
            elif fields[:1] == ["CMP"]:
                components[side, component] = int(fields[1])
            elif fields[:1] == ["TOP"]:
                package = components[side, component]
                index = int(fields[1])
                name, mechanical, _ = packages[package][index]
                if fields[8] != name:
                    raise ValueError("toeprint does not match its package pin")
                position = Decimal(fields[2]), Decimal(fields[3])
                key = side, component, index
                if mechanical and position in holes:
                    if int(fields[6]) != 0:
                        raise ValueError(f"mechanical pin {name} has a connected net")
                    removed.add((package, index))
                    toeprints[key] = None
                    lines[row] = ""
                else:
                    if position in holes:
                        raise ValueError(f"NPTH shares a position with retained pin {name}")
                    retained.add((package, index))
                    toeprints[key] = lines, row, int(fields[6]), int(fields[7])

    if removed & retained:
        raise ValueError("a shared package pin is mechanical on only some instances")

    pin_numbers = {}
    for package, pins in packages.items():
        next_index = 0
        for index, (_, _, rows) in enumerate(pins):
            if (package, index) in removed:
                for row in rows:
                    eda[row] = ""
            else:
                pin_numbers[package, index] = next_index
                next_index += 1

    # Renumber both sides of each EDA subnet/toeprint reference.
    net = -1
    seen = set()
    drop = False
    for row, line in enumerate(eda):
        fields = line.split()
        if fields[:1] == ["NET"]:
            net += 1
            old_subnet = new_subnet = 0
            drop = False
        elif fields[:1] == ["SNT"]:
            drop = False
            if fields[1] == "TOP":
                side, component, index = fields[2], int(fields[3]), int(fields[4])
                key = side, component, index
                record = toeprints[key]
                seen.add(key)
                if record is None:
                    eda[row] = ""
                    drop = True
                else:
                    lines, line_number, old_net, old_number = record
                    if (net, old_subnet) != (old_net, old_number):
                        raise ValueError("inconsistent component subnet index")
                    pin_number = pin_numbers[components[side, component], index]
                    eda[row] = rewrite_record(line, {4: pin_number})
                    lines[line_number] = rewrite_record(
                        lines[line_number], {1: pin_number, 7: new_subnet}
                    )
            old_subnet += 1
            new_subnet += not drop
        elif drop and fields[:1] == ["FID"]:
            eda[row] = ""
    if set(toeprints) != seen:
        raise ValueError("some component toeprints have no EDA subnet")

    cadnet = files["netlists/cadnet/netlist"]
    removed_points = set()
    for row, line in enumerate(cadnet):
        fields = line.split()
        if len(fields) < 4 or not fields[0].isdigit():
            continue
        position = Decimal(fields[2]), Decimal(fields[3])
        if position in holes:
            if fields[0] != "0" or Decimal(fields[1]) <= 0 or position in removed_points:
                raise ValueError("ambiguous CAD netlist record at an NPTH drill")
            cadnet[row] = ""
            removed_points.add(position)

    return len(holes), sum(record is None for record in toeprints.values())


def preprocess(source, target):
    with ZipFile(source) as original:
        names = original.namelist()
        if len(set(names)) != len(names):
            raise ValueError("archive contains duplicate paths")
        drill_layers = {}
        for name in names:
            match = re.fullmatch(
                r"((?:[^/]+/)?steps/[^/]+/)layers/drill_non-plated_[^/]+/features",
                name,
            )
            if match:
                step = match[1]
                drill_layers.setdefault(step, []).append(name.removeprefix(step))
        if not drill_layers:
            raise ValueError("no KiCad non-plated drill layer found in ODB++ ZIP")

        changes = {}
        holes = pins = 0
        for step, drill_files in drill_layers.items():
            paths = ["eda/data", "netlists/cadnet/netlist", *drill_files]
            paths += [path for path in ("layers/comp_+_top/components",
                                        "layers/comp_+_bot/components")
                      if step + path in names]
            files = {path: original.read(step + path).decode("utf-8").splitlines(True)
                     for path in paths}
            step_holes, step_pins = clean_step(files, drill_files)
            holes += step_holes
            pins += step_pins
            changes.update({step + path: "".join(lines).encode("utf-8")
                            for path, lines in files.items()})
        if not holes:
            raise ValueError("no non-plated drill hits found")

        with ZipFile(target, "x") as cleaned:
            for entry in original.infolist():
                name = entry.filename
                cleaned.writestr(entry, changes[name] if name in changes else original.read(name))
    return holes, pins


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="original KiCad ODB++ ZIP")
    parser.add_argument("target", type=Path, help="new simulation ZIP")
    args = parser.parse_args()
    try:
        holes, pins = preprocess(args.source, args.target)
    except (OSError, BadZipFile, ValueError, KeyError, IndexError, InvalidOperation) as error:
        parser.exit(1, f"{parser.prog}: {error}\n")
    print(f"Removed {holes} NPTH drill location(s) and {pins} mechanical pin(s).")
    print(args.target)


if __name__ == "__main__":
    main()
