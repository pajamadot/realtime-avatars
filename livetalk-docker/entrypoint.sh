#!/bin/bash
set -e

cd /app
export PYTHONPATH="/app:${PYTHONPATH:-}"
export CONFIG="${CONFIG:-configs/causal_inference.yaml}"

if [ "$1" = "infer" ]; then
    # Batch mode: docker compose run livetalk infer [extra args...]
    shift
    echo "=== LiveTalk Batch Inference ==="
    python scripts/inference_example.py \
        --config "$CONFIG" \
        --output_path /app/output/output_video.mp4 \
        "$@"
    echo "=== Done ==="
else
    # Default: web server on port 7860
    echo "=== Starting LiveTalk Web Server ==="
    exec python /app/server.py
fi
