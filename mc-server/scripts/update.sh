#!/bin/bash
set -e

SERVER_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SERVER_DIR"

PAPER_VERSION="${PAPER_VERSION:-1.21.1}"

echo "=== Updating PaperMC to latest build for $PAPER_VERSION ==="
BUILD=$(curl -s "https://api.papermc.io/v2/projects/paper/versions/$PAPER_VERSION/builds" \
  | python3 -c "import sys,json; builds=json.load(sys.stdin)['builds']; print(builds[-1]['build'])")

DOWNLOAD_URL="https://api.papermc.io/v2/projects/paper/versions/$PAPER_VERSION/builds/$BUILD/downloads/paper-$PAPER_VERSION-$BUILD.jar"

echo "Downloading PaperMC build $BUILD..."
curl -L -o paper.jar "$DOWNLOAD_URL"
echo "PaperMC updated to build $BUILD."

echo ""
echo "=== Updating Geyser-Spigot ==="
GEYSER_URL="https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest/downloads/spigot"
curl -L -o plugins/Geyser-Spigot.jar "$GEYSER_URL"
echo "Geyser updated."

echo ""
echo "=== Updating Floodgate-Spigot ==="
FLOODGATE_URL="https://download.geysermc.org/v2/projects/floodgate/versions/latest/builds/latest/downloads/spigot"
curl -L -o plugins/Floodgate-Spigot.jar "$FLOODGATE_URL"
echo "Floodgate updated."

echo ""
echo "All components updated! Restart the server to apply changes."
