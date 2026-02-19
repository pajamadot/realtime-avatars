# LiveTalk Docker

Self-contained Docker image for [GAIR-NLP/LiveTalk](https://github.com/GAIR-NLP/LiveTalk) -- real-time talking avatar video diffusion. Provide a reference image + audio file, get a lip-synced avatar video.

## Requirements

- NVIDIA GPU with 24GB+ VRAM (tested on RTX 3090/4090)
- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)
- Docker with Compose v2
- ~64GB RAM recommended

## Quick Start

```bash
# If any models are gated, set your HuggingFace token:
export HF_TOKEN=hf_your_token_here

# Build + start web server
bash run.sh

# Open http://localhost:7860
```

Models load at startup (~2 min). Once you see `Starting web server on http://0.0.0.0:7860`, open the URL in your browser. Upload an image + audio (or click "Use bundled example") and hit Generate.

## Batch Mode

Run inference without the web UI:

```bash
docker compose run --rm livetalk infer

# With custom input:
docker compose run --rm livetalk infer \
    --image_path /app/input/your_photo.jpg \
    --audio_path /app/input/your_audio.wav \
    --video_duration 8

# Output: output/output_video.mp4
```

## Configuration

The default config is at `configs/causal_inference.yaml` inside the image. Key parameters:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `video_duration` | 5 | Seconds (use 3n+2: 5, 8, 11, 14...) |
| `max_hw` | 720 | Resolution (720=480p, 1280=720p) |
| `fps` | 16 | Output frame rate |
| `num_steps` | 4 | Diffusion steps |

## Build Only

```bash
docker compose build
```

Build takes 20-40 minutes depending on network speed (downloads ~8GB of model checkpoints).

## Image Size

~15-20GB total (CUDA base + Python deps + model checkpoints).

## Pipeline

```
Image (JPG) + Audio (WAV 16kHz) + Text Prompt
  -> Wav2Vec2 (audio encoding)
  -> UMT5-XXL (text encoding)
  -> WanVAE (image encoding)
  -> CausalWanModel (4-step diffusion, KV-cache block-wise AR)
  -> WanVAE decode
  -> FFmpeg (merge audio + video)
  -> Output MP4
```
