# LiveTalk Docker Image
# Real-time talking avatar via video diffusion (GAIR-NLP/LiveTalk)
# Requires: NVIDIA GPU with 24GB+ VRAM, NVIDIA Container Toolkit

FROM nvidia/cuda:12.4.1-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    CUDA_HOME=/usr/local/cuda \
    TORCH_CUDA_ARCH_LIST="8.0;8.6;8.9;9.0"

# Optional: HuggingFace token for gated model downloads
ARG HF_TOKEN=""

# ── System dependencies + Python 3.10 ────────────────────────────────────────

RUN apt-get update && apt-get install -y --no-install-recommends \
        git ffmpeg build-essential software-properties-common \
        curl wget ca-certificates \
    && add-apt-repository ppa:deadsnakes/ppa \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        python3.10 python3.10-dev python3.10-venv python3.10-distutils \
    && curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10 \
    && update-alternatives --install /usr/bin/python  python  /usr/bin/python3.10 1 \
    && update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Clone LiveTalk + OmniAvatar, apply patches ───────────────────────────────

RUN git clone https://github.com/GAIR-NLP/livetalk.git . \
    && git clone https://github.com/Omni-Avatar/OmniAvatar \
    && bash scripts/add_patch.sh

# ── Python dependencies ──────────────────────────────────────────────────────

# Clean up requirements.txt for Docker:
#   - nvidia-tensorrt: not needed for inference, hard to install
#   - opencv-python (non-headless): conflicts with opencv-python-headless
#   - pycuda needs CUDA stubs for linking
RUN sed -i '/nvidia-tensorrt/d' requirements.txt \
    && sed -i '/^opencv-python>=/d' requirements.txt \
    && LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/local/cuda/lib64/stubs" \
       pip install --no-cache-dir -r requirements.txt

# Flash-attention prebuilt wheel (CUDA 12, PyTorch 2.8, Python 3.10)
RUN pip install --no-cache-dir \
    https://github.com/Dao-AILab/flash-attention/releases/download/v2.8.3/flash_attn-2.8.3+cu12torch2.8cxx11abiFALSE-cp310-cp310-linux_x86_64.whl

# Install LiveTalk package
RUN python setup.py develop

# ── Download model checkpoints (baked into image) ────────────────────────────

# Only download the text encoder, VAE, and tokenizer from Wan2.1 (skips the
# DiT weights we don't use -- LiveTalk has its own fine-tuned DiT)
RUN if [ -n "$HF_TOKEN" ]; then \
        huggingface-cli login --token "$HF_TOKEN"; \
    fi \
    && huggingface-cli download Wan-AI/Wan2.1-T2V-1.3B \
        --include "*.pth" "google/**" \
        --local-dir pretrained_checkpoints/Wan2.1-T2V-1.3B \
    && huggingface-cli download GAIR/LiveTalk-1.3B-V0.1 \
        --local-dir pretrained_checkpoints/LiveTalk-1.3B-V0.1 \
    && huggingface-cli download facebook/wav2vec2-base-960h \
        --local-dir pretrained_checkpoints/wav2vec2

# ── Entrypoint ────────────────────────────────────────────────────────────────

COPY entrypoint.sh server.py /app/
RUN chmod +x /app/entrypoint.sh && mkdir -p /app/output

EXPOSE 7860

ENTRYPOINT ["/app/entrypoint.sh"]
