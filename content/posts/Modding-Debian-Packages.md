---
title: "Modding Debian binary packages"
date: 2026-04-21
tags:
- Modding
- Patching
- deb
- Amateur Radio
---

## The problem

Debian binary packages often require dependency patching, especially when
installing on different Linux distributions.

## The script

```bash
#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <package.deb>"
    exit 1
fi

INPUT_DEB="$1"

if [ ! -f "$INPUT_DEB" ]; then
    echo "Error: File $INPUT_DEB not found."
    exit 1
fi

PACKAGE_NAME=$(basename "$INPUT_DEB" .deb)
TMP_DIR=$(mktemp -d)
OUTPUT_DEB="${PACKAGE_NAME}_no-deps.deb"

# Ensure cleanup on exit
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Extracting $INPUT_DEB..."
dpkg-deb -R "$INPUT_DEB" "$TMP_DIR" || exit 1

echo "Zapping dependencies..."
# Remove the Depends line.
# We use a regex that matches 'Depends:' at the start of the line.
sed -i '/^Depends:/d' "$TMP_DIR/DEBIAN/control"

echo "Repackaging to $OUTPUT_DEB..."
dpkg-deb --root-owner-group -b "$TMP_DIR" "$OUTPUT_DEB" || exit 1

echo "Done! Created $OUTPUT_DEB"
```

## Usage

```bash
$ ./zap-deps.sh wsjtx_3.1.0_improved_PLUS_260418_amd64.deb
Extracting wsjtx_3.1.0_improved_PLUS_260418_amd64.deb...
Zapping dependencies...
Repackaging to wsjtx_3.1.0_improved_PLUS_260418_amd64_no-deps.deb...
dpkg-deb: building package 'wsjtx' in 'wsjtx_3.1.0_improved_PLUS_260418_amd64_no-deps.deb'.
Done! Created wsjtx_3.1.0_improved_PLUS_260418_amd64_no-deps.deb
```

## Notes

Before installing the modded package run the following command.

```
sudo apt-get install wsjtx
```

With some luck, the modded package will just work 'well-enough' on unsupported distributions.
