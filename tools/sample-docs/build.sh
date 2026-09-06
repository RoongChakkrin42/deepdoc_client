#!/usr/bin/env bash
# Renders the synthetic sample reports to the PDFs served from public/samples/.
#
# The sources here are the originals; the PDFs are build output. Headless Chrome
# is used because it is the only HTML-to-PDF renderer already present on a mac
# without extra installs, and it shapes Thai text correctly.
#
# Chrome writes the PDF and then does not exit on this machine, so each render
# runs in the background and is killed once the file has stopped growing. The
# PDF is complete at that point — it ends with %%EOF before Chrome idles.
#
# Usage: tools/sample-docs/build.sh
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$SRC_DIR/../../public/samples"

[ -x "$CHROME" ] || { echo "Google Chrome not found at $CHROME" >&2; exit 1; }
mkdir -p "$OUT_DIR"

render() {
  local name="$1"
  local out="$OUT_DIR/sample-$name.pdf"
  local profile
  profile="$(mktemp -d)"

  rm -f "$out"
  "$CHROME" \
    --headless \
    --disable-gpu \
    --no-first-run \
    --no-sandbox \
    --disable-extensions \
    --disable-background-networking \
    --user-data-dir="$profile" \
    --run-all-compositor-stages-before-draw \
    --virtual-time-budget=15000 \
    --no-pdf-header-footer \
    --print-to-pdf="$out" \
    "file://$SRC_DIR/sample-$name.html" >/dev/null 2>&1 &
  local pid=$!

  # Wait for the file to appear and settle, then stop Chrome.
  local waited=0 size=0 prev=-1
  while [ "$waited" -lt 90 ]; do
    sleep 2
    waited=$((waited + 2))
    size=$(stat -f%z "$out" 2>/dev/null || echo 0)
    [ "$size" -gt 0 ] && [ "$size" -eq "$prev" ] && break
    prev=$size
  done

  kill "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true
  rm -rf "$profile"

  if [ "$size" -eq 0 ] || ! tail -c 8 "$out" | grep -q '%%EOF'; then
    echo "sample-$name.pdf did not render completely" >&2
    return 1
  fi
  echo "  sample-$name.pdf  (${size} bytes)"
}

for name in strong partial weak; do
  echo "rendering sample-$name..."
  render "$name"
done
