#!/bin/bash
set -e

SERVER_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SERVER_DIR"

PAPER_VERSION="${PAPER_VERSION:-1.21.1}"
PAPER_BUILD="${PAPER_BUILD:-latest}"
MEMORY="${MEMORY:-2G}"
JAR="paper.jar"

echo "=== Paper + Geyser Minecraft Server ==="
echo "Server dir: $SERVER_DIR"
echo "Memory: $MEMORY"

if [ ! -f "$JAR" ]; then
  echo "Downloading PaperMC $PAPER_VERSION..."
  BUILD=$(curl -s "https://api.papermc.io/v2/projects/paper/versions/$PAPER_VERSION/builds" \
    | python3 -c "import sys,json; builds=json.load(sys.stdin)['builds']; print(builds[-1]['build'])")
  DOWNLOAD_URL="https://api.papermc.io/v2/projects/paper/versions/$PAPER_VERSION/builds/$BUILD/downloads/paper-$PAPER_VERSION-$BUILD.jar"
  echo "Downloading from: $DOWNLOAD_URL"
  curl -L -o "$JAR" "$DOWNLOAD_URL"
  echo "Downloaded PaperMC successfully."
fi

if [ ! -d "plugins/GeyserMC" ]; then
  echo "Downloading Geyser-Spigot plugin..."
  mkdir -p plugins
  GEYSER_URL=$(curl -s "https://api.geysermc.org/v2/projects/geyser/versions/latest/builds/latest" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['downloads']['spigot']['url'])" 2>/dev/null \
    || echo "https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest/downloads/spigot")
  curl -L -o plugins/Geyser-Spigot.jar "$GEYSER_URL"
  echo "Downloaded Geyser-Spigot successfully."
fi

if [ ! -d "plugins/floodgate" ]; then
  echo "Downloading Floodgate plugin..."
  FLOODGATE_URL=$(curl -s "https://api.geysermc.org/v2/projects/floodgate/versions/latest/builds/latest" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['downloads']['spigot']['url'])" 2>/dev/null \
    || echo "https://download.geysermc.org/v2/projects/floodgate/versions/latest/builds/latest/downloads/spigot")
  curl -L -o plugins/Floodgate-Spigot.jar "$FLOODGATE_URL"
  echo "Downloaded Floodgate successfully."
fi

if [ ! -f "eula.txt" ]; then
  echo "eula=true" > eula.txt
  echo "EULA accepted."
fi

echo "Starting server..."
exec java \
  -Xms512M \
  -Xmx"$MEMORY" \
  -XX:+UseG1GC \
  -XX:+ParallelRefProcEnabled \
  -XX:MaxGCPauseMillis=200 \
  -XX:+UnlockExperimentalVMOptions \
  -XX:+DisableExplicitGC \
  -XX:+AlwaysPreTouch \
  -XX:G1NewSizePercent=30 \
  -XX:G1MaxNewSizePercent=40 \
  -XX:G1HeapRegionSize=8M \
  -XX:G1ReservePercent=20 \
  -XX:G1HeapWastePercent=5 \
  -XX:G1MixedGCCountTarget=4 \
  -XX:InitiatingHeapOccupancyPercent=15 \
  -XX:G1MixedGCLiveThresholdPercent=90 \
  -XX:G1RSetUpdatingPauseTimePercent=5 \
  -XX:SurvivorRatio=32 \
  -XX:+PerfDisableSharedMem \
  -XX:MaxTenuringThreshold=1 \
  -Dusing.aikars.flags=https://mcflags.emc.gs \
  -Daikars.new.flags=true \
  -jar "$JAR" --nogui
