#!/usr/bin/env bash
##############################################################################
# Gaussian Avatar — One-time setup script
#
# Downloads all required models and generates SSL certificates.
# Run this ONCE before `docker compose up --build`.
#
# Usage:
#   cd gaussian-avatar
#   bash scripts/setup.sh
#
# Requirements:
#   - git, git-lfs, wget, openssl
#   - ~2 GB disk space for models
##############################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MODELS_DIR="${PROJECT_DIR}/models"

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
fail()    { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Check prerequisites
for cmd in git wget openssl; do
    command -v "$cmd" &>/dev/null || fail "$cmd is required but not installed."
done
git lfs install --skip-smudge &>/dev/null || true

echo ""
echo "=========================================="
echo "  Gaussian Avatar — Setup"
echo "=========================================="
echo ""

##############################################################################
# 1. Download wav2vec2-base-960h (speech feature extraction for Audio2Exp)
##############################################################################
WAV2VEC_DIR="${MODELS_DIR}/wav2vec2-base-960h"
if [ -d "$WAV2VEC_DIR" ] && [ -f "$WAV2VEC_DIR/config.json" ]; then
    info "wav2vec2-base-960h already downloaded, skipping."
else
    info "Downloading wav2vec2-base-960h (~360 MB)..."
    mkdir -p "$MODELS_DIR"

    # Try ModelScope first (faster in Asia), fallback to HuggingFace
    if git clone --depth 1 https://www.modelscope.cn/AI-ModelScope/wav2vec2-base-960h.git "$WAV2VEC_DIR" 2>/dev/null; then
        success "wav2vec2-base-960h downloaded from ModelScope."
    else
        info "ModelScope unavailable, trying HuggingFace..."
        git clone --depth 1 https://huggingface.co/facebook/wav2vec2-base-960h "$WAV2VEC_DIR" \
            || fail "Failed to download wav2vec2-base-960h from both sources."
        success "wav2vec2-base-960h downloaded from HuggingFace."
    fi
fi

##############################################################################
# 2. Download LAM Audio2Expression model (audio -> ARKit blendshapes)
##############################################################################
A2E_DIR="${MODELS_DIR}/LAM_audio2exp"
A2E_TAR="${A2E_DIR}/LAM_audio2exp_streaming.tar"
if [ -d "$A2E_DIR" ] && [ -f "$A2E_DIR/config.yaml" -o -d "$A2E_DIR/checkpoints" ]; then
    info "LAM_audio2exp already downloaded, skipping."
else
    info "Downloading LAM_audio2exp_streaming (~500 MB)..."
    mkdir -p "$A2E_DIR"
    wget -q --show-progress -O "$A2E_TAR" \
        "https://virutalbuy-public.oss-cn-hangzhou.aliyuncs.com/share/aigc3d/data/LAM/LAM_audio2exp_streaming.tar" \
        || fail "Failed to download LAM_audio2exp_streaming.tar"

    info "Extracting LAM_audio2exp_streaming..."
    tar -xf "$A2E_TAR" -C "$A2E_DIR" && rm -f "$A2E_TAR"
    success "LAM_audio2exp extracted."
fi

##############################################################################
# 3. Download SenseVoice ASR model (auto-downloaded at first run, but we
#    pre-download for faster cold start)
##############################################################################
info "SenseVoice model (iic/SenseVoiceSmall) will auto-download on first run."
info "To pre-download, run: pip install funasr && python -c \"from funasr import AutoModel; AutoModel(model='iic/SenseVoiceSmall')\""

##############################################################################
# 4. Generate self-signed SSL certificates (required for WebRTC)
##############################################################################
SSL_DIR="${PROJECT_DIR}/ssl_certs"
if [ -f "$SSL_DIR/localhost.crt" ] && [ -f "$SSL_DIR/localhost.key" ]; then
    info "SSL certificates already exist, skipping."
else
    info "Generating self-signed SSL certificates..."
    mkdir -p "$SSL_DIR"
    openssl req -x509 -newkey rsa:2048 \
        -keyout "$SSL_DIR/localhost.key" \
        -out "$SSL_DIR/localhost.crt" \
        -days 365 -nodes \
        -subj "/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
    success "SSL certificates generated at ssl_certs/"
fi

##############################################################################
# 5. Create coturn config (TURN server for WebRTC NAT traversal)
##############################################################################
COTURN_DIR="${PROJECT_DIR}/coturn-data"
COTURN_CONF="${COTURN_DIR}/turnserver.conf"
if [ -f "$COTURN_CONF" ]; then
    info "coturn config already exists, skipping."
else
    info "Creating coturn configuration..."
    mkdir -p "$COTURN_DIR"
    cat > "$COTURN_CONF" << 'TURNEOF'
# TURN server configuration
listening-port=3478
tls-listening-port=5349
fingerprint
lt-cred-mech
user=avatar:avatar123
realm=gaussian-avatar
cert=/etc/turn_cert.pem
pkey=/etc/turn_key.pem
log-file=stdout
no-cli
TURNEOF
    success "coturn config created at coturn-data/turnserver.conf"
fi

##############################################################################
# 6. Create .env from template if missing
##############################################################################
if [ ! -f "${PROJECT_DIR}/.env" ]; then
    info "Creating .env from .env.example..."
    cp "${PROJECT_DIR}/.env.example" "${PROJECT_DIR}/.env"
    echo ""
    echo -e "${RED}IMPORTANT: Edit .env and add your API keys before running!${NC}"
    echo ""
else
    info ".env already exists."
fi

##############################################################################
# Done
##############################################################################
echo ""
echo "=========================================="
echo "  Setup complete!"
echo "=========================================="
echo ""
echo "Models directory: ${MODELS_DIR}"
echo "SSL certs:        ${SSL_DIR}"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your API keys (OPENAI_API_KEY)"
echo "  2. docker compose up --build"
echo "  3. Open https://localhost:8282"
echo ""
