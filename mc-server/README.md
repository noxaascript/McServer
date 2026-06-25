# Paper + Geyser Minecraft Server

A **Paper** Minecraft server with **Geyser** and **Floodgate** — lets Java and Bedrock players play together on the same server.

## Ports

| Port | Protocol | Purpose |
|------|----------|---------|
| 25565 | TCP | Java Edition clients |
| 19132 | UDP | Bedrock Edition clients (Geyser) |

## Quick Start

### Requirements
- Linux / macOS (or WSL on Windows)
- Java 21+ (`java -version`)
- `curl` and `python3` (for download scripts)
- At least 2 GB RAM free

### 1. Clone the repo

```bash
git clone https://github.com/noxaascript/McServer.git
cd McServer/mc-server
```

### 2. Make scripts executable

```bash
chmod +x scripts/*.sh
```

### 3. Start the server

```bash
./scripts/start.sh
```

The first run will automatically download:
- Latest **PaperMC** build for Minecraft 1.21.1
- Latest **Geyser-Spigot** plugin
- Latest **Floodgate-Spigot** plugin

### 4. Connect

- **Java Edition:** `your-server-ip:25565`
- **Bedrock Edition:** `your-server-ip:19132`

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MEMORY` | `2G` | Max JVM heap memory (e.g. `4G`, `8G`) |
| `PAPER_VERSION` | `1.21.1` | Minecraft version to download |

Example with custom memory:
```bash
MEMORY=4G ./scripts/start.sh
```

### Key Config Files

| File | Purpose |
|------|---------|
| `server.properties` | Core server settings (players, gamemode, ports) |
| `config/geyser/config.yml` | Geyser/Bedrock bridge settings |
| `config/paper-global.yml` | Paper global performance tuning |
| `config/paper-world-defaults.yml` | Per-world defaults (mobs, spawning, etc.) |

### Changing the Server Name / MOTD

Edit `server.properties`:
```properties
motd=Your Server Name Here
```

Edit `config/geyser/config.yml`:
```yaml
bedrock:
  motd1: "Your Server"
  motd2: "Java & Bedrock"
```

---

## Updating

To update PaperMC, Geyser, and Floodgate to their latest versions:

```bash
./scripts/update.sh
```

Then restart the server.

---

## Running in the Background

### Using `screen` (recommended)

```bash
screen -S mcserver ./scripts/start.sh
# Detach: Ctrl+A then D
# Reattach: screen -r mcserver
```

### Using `tmux`

```bash
tmux new -s mcserver
./scripts/start.sh
# Detach: Ctrl+B then D
# Reattach: tmux attach -t mcserver
```

---

## How Geyser Works

```
Bedrock Client ──UDP:19132──► Geyser Plugin ──► Paper Server ──TCP:25565──► Java Clients
```

**Geyser** translates the Bedrock protocol to Java protocol in real time. Bedrock players appear as regular players on the Java server.

**Floodgate** allows Bedrock players to join without a Java account (online-mode=false handles auth via Floodgate's own system). Java players still use their normal accounts.

---

## Recommended Hosting Specs

| Players | RAM | CPU |
|---------|-----|-----|
| 1–10 | 2 GB | 2 cores |
| 10–30 | 4 GB | 4 cores |
| 30–60 | 8 GB | 6 cores |
| 60+ | 16 GB+ | 8+ cores |

---

## Folder Structure

```
mc-server/
├── scripts/
│   ├── start.sh        # Download & start the server
│   ├── stop.sh         # Gracefully stop the server
│   └── update.sh       # Update PaperMC + plugins
├── config/
│   ├── geyser/
│   │   └── config.yml  # Geyser configuration
│   ├── paper-global.yml
│   └── paper-world-defaults.yml
├── server.properties   # Core Minecraft settings
├── eula.txt            # EULA acceptance
└── .gitignore          # Excludes JARs and world data
```
