#!/bin/bash
echo "Stopping Minecraft server..."

if [ -f "../server.pid" ]; then
  PID=$(cat ../server.pid)
  if kill -0 "$PID" 2>/dev/null; then
    kill -TERM "$PID"
    echo "Sent SIGTERM to PID $PID. Server is saving and shutting down..."
    wait "$PID" 2>/dev/null
    echo "Server stopped."
  else
    echo "No running process found for PID $PID."
  fi
  rm -f ../server.pid
else
  echo "No server.pid found. Use: screen -r mcserver  or  tmux attach -t mcserver"
fi
