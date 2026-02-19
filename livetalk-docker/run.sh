#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Building LiveTalk Docker image ==="
docker compose build

echo ""
echo "=== Starting LiveTalk Web Server ==="
mkdir -p output input
docker compose up

# docker compose up will block here until Ctrl+C
