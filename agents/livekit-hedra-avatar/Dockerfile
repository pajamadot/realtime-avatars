# This is an example Dockerfile that builds a minimal container for running LK Agents
# For more information on the build process, see https://docs.livekit.io/agents/ops/deployment/builds/
# syntax=docker/dockerfile:1

# Use a Python base image with broad wheel support for ML deps (onnxruntime, etc).
# livekit-agents supports <3.14; we default to 3.12 for better ecosystem compatibility.
ARG PYTHON_VERSION=3.12
FROM python:${PYTHON_VERSION}-slim AS base

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

# Disable pip version check to speed up builds
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Create a non-privileged user that the app will run under.
# See https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#user
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/app" \
    --shell "/sbin/nologin" \
    --uid "${UID}" \
    appuser

#
# NOTE: We intentionally avoid installing compilers/build-essential by default.
# Most dependencies ship manylinux wheels, which keeps the image much smaller and faster to deploy.

# Create a new directory for our application code
# And set it as the working directory
WORKDIR /app

# Copy just the dependency files first, for more efficient layer caching
COPY requirements.txt ./

# Install Python dependencies using pip
# --no-cache-dir ensures we don't use the system cache
RUN pip install --no-cache-dir -r requirements.txt

# Copy all remaining pplication files into the container
# This includes source code, configuration files, and dependency specifications
# (Excludes files specified in .dockerignore)
COPY . .

# Change ownership of all app files to the non-privileged user
# This ensures the application can read/write files as needed
RUN chown -R appuser:appuser /app

# Switch to the non-privileged user for all subsequent operations
# This improves security by not running as root
USER appuser

# Pre-download any ML models or files the agent needs
# This ensures the container is ready to run immediately without downloading
# dependencies at runtime, which improves startup time and reliability
RUN python agent.py download-files

# Run the application
# The "start" command tells the worker to connect to LiveKit and begin waiting for jobs.
CMD ["python", "agent.py", "start"]
