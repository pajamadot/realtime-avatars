##############################################################################
# Gaussian Avatar — Docker image based on OpenAvatarChat + LAM
#
# Base: NVIDIA CUDA 12.2 + cuDNN 8 + Ubuntu 22.04
# Python: 3.11 (managed via uv)
# Config: chat_with_lam.yaml (LAM Gaussian avatar, client-side rendering)
##############################################################################

FROM nvidia/cuda:12.2.2-cudnn8-devel-ubuntu22.04
LABEL maintainer="realtime-avatars"
LABEL description="OpenAvatarChat + LAM Gaussian avatar for real-time conversation"

ARG CONFIG_FILE=config/chat_with_lam.yaml
ARG OPENAVATAR_REPO=https://github.com/HumanAIGC-Engineering/OpenAvatarChat.git
ARG OPENAVATAR_BRANCH=main

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONUTF8=1

# System dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        software-properties-common \
        git git-lfs curl wget \
        libgl1 libglib2.0-0 \
        openssl ca-certificates && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        python3.11 python3.11-dev python3.11-venv python3.11-distutils && \
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1 && \
    python3.11 -m ensurepip --upgrade && \
    python3.11 -m pip install --upgrade pip && \
    git lfs install && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Clone OpenAvatarChat
ARG WORK_DIR=/app
WORKDIR ${WORK_DIR}

RUN git clone --depth 1 --branch ${OPENAVATAR_BRANCH} ${OPENAVATAR_REPO} . && \
    git submodule update --init --recursive

# Install uv and core dependencies
RUN pip install uv && \
    uv venv --python 3.11.11 && \
    uv sync --no-install-workspace

# Copy our custom config for the build-time dependency install
COPY ${CONFIG_FILE} /tmp/build_config.yaml

# Install config-specific dependencies (ASR, TTS, LLM, Avatar handlers)
RUN chmod +x scripts/pre_config_install.sh && \
    scripts/pre_config_install.sh --config /tmp/build_config.yaml && \
    uv run install.py --config /tmp/build_config.yaml --uv --skip-core && \
    chmod +x scripts/post_config_install.sh && \
    scripts/post_config_install.sh --config /tmp/build_config.yaml && \
    rm /tmp/build_config.yaml

# Models and SSL certs are mounted at runtime via docker-compose volumes
# (see docker-compose.yml)

EXPOSE 8282

ENTRYPOINT ["uv", "run", "src/demo.py"]
CMD ["--config", "config/chat_with_lam.yaml"]
