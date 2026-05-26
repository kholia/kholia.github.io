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
