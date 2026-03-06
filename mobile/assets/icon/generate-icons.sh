#!/bin/bash
# Generate app icons for iOS and Android from icon.svg
# Requires: rsvg-convert (librsvg) or Inkscape
# Usage: ./generate-icons.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SVG="$SCRIPT_DIR/icon.svg"

# iOS sizes (AppIcon.appiconset)
IOS_DIR="$SCRIPT_DIR/ios"
mkdir -p "$IOS_DIR"

IOS_SIZES=(20 29 40 58 60 76 80 87 120 152 167 180 1024)
for size in "${IOS_SIZES[@]}"; do
  echo "Generating iOS icon ${size}x${size}..."
  rsvg-convert -w "$size" -h "$size" "$SVG" > "$IOS_DIR/icon-${size}.png"
done

# Android sizes (mipmap)
declare -A ANDROID_SIZES=(
  ["mdpi"]=48
  ["hdpi"]=72
  ["xhdpi"]=96
  ["xxhdpi"]=144
  ["xxxhdpi"]=192
)

ANDROID_DIR="$SCRIPT_DIR/android"
mkdir -p "$ANDROID_DIR"

for density in "${!ANDROID_SIZES[@]}"; do
  size=${ANDROID_SIZES[$density]}
  echo "Generating Android icon ${density} (${size}x${size})..."
  rsvg-convert -w "$size" -h "$size" "$SVG" > "$ANDROID_DIR/mipmap-${density}.png"
done

echo "Done! Icons generated in:"
echo "  iOS:     $IOS_DIR/"
echo "  Android: $ANDROID_DIR/"
