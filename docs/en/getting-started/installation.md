# Installation Guide

This page guides you through the installation and configuration of the NavArena embodied navigation infrastructure. NavArena uses a uv workspace to manage four sub-projects: **Core Library** (navarena-core), **Asset Preprocessing** (navarena-forge), **Data Generator** (navarena-gen), and **Evaluation Framework** (navarena-bench).

## System Requirements

Before starting installation, ensure your system meets the following requirements:

| Requirement | Minimum Version | Recommended |
|-------------|------------------|-------------|
| Python | 3.9+ | 3.10+ |
| uv | 0.4+ | Latest |
| CUDA | 11.0+ | 12.1+ |
| GPU | CUDA-capable NVIDIA GPU | - |
| OS | Linux | Ubuntu 20.04+ |

!!! warning "GPU Required"
    The Data Generator and Evaluation Framework require a CUDA-capable GPU to run properly. Ensure your system has the correct CUDA drivers installed.

!!! info "Installing uv"
    If uv is not installed:
    ```bash
    curl -LsSf https://astral.sh/uv/install.sh | sh
    ```
    Or via pip: `pip install uv`

## Quick Install (Recommended)

Install all sub-projects at once using the uv workspace:

```bash
# After cloning the repo, enter the project root
cd NavArena

# Install workspace with uv (installs navarena-core, navarena-forge, navarena-gen, navarena-bench)
uv sync --all-packages

# Or use Makefile
make install
```

## Per-Module Installation

To install only specific modules, enter each sub-directory and install:

```bash
# 1. Core library (dependency for other sub-projects)
cd navarena-core
pip install -e .
cd ..

# 2. Asset preprocessing (optional, required before data generation)
cd navarena-forge
pip install -e .
cd ..

# 3. Data generator (depends on navarena-core[rendering])
cd navarena-gen
pip install -e .
cd ..

# 4. Evaluation framework (depends on navarena-core[rendering])
cd navarena-bench
pip install -e .
cd ..
```

## Verify Installation

```bash
# Data generator
cd navarena-gen && python scripts/generate_data.py --help

# Evaluation framework
cd navarena-bench && python scripts/eval.py --help
# Or use CLI entry point
navarena-bench-eval --help

# Asset preprocessing
cd navarena-forge && python -m navarena_forge list-steps
```

If you see the help output, installation was successful.

## Environment Variable Configuration

### NAVARENA_DATA_DIR

NavArena uses `NAVARENA_DATA_DIR` as the data root directory. Shared resources (e.g., camera config, assets) should reside under the `shared/` subdirectory:

```bash
export NAVARENA_DATA_DIR=/path/to/your/navarena_data
# Suggested directory structure:
# $NAVARENA_DATA_DIR/
# ├── shared/           # Shared resources
# │   ├── camera.yaml   # Camera config
# │   └── ...
# └── assets/           # V1 format scene assets
#     ├── x2robot/
#     │   └── 17dc3367/
#     └── ...
```

### CUDA Setup

Ensure CUDA environment variables are correctly set:

```bash
export CUDA_HOME=/usr/local/cuda
export PATH=$CUDA_HOME/bin:$PATH
export LD_LIBRARY_PATH=$CUDA_HOME/lib64:$LD_LIBRARY_PATH
```

## Optional Dependencies

### ViNT/GNM/NoMaD Agents (Evaluation Framework)

To use ViNT, GNM, or NoMaD pre-trained navigation agents, install the visualnav-transformer project and its dependencies:

```bash
# Clone visualnav-transformer (alongside navarena-bench)
git clone <visualnav-transformer-repo-url>

# Install extra dependencies
pip install wandb warmup_scheduler diffusers efficientnet_pytorch \
    einops vit_pytorch lmdb prettytable matplotlib opencv-python \
    fastapi uvicorn imageio "imageio[ffmpeg]"

# Install diffusion_policy
pip install -e visualnav-transformer/src/diffusion_policy/
```

!!! tip "Optional Dependencies"
    If not using ViNT-style agents, skip the above. LocalAgent, RemoteAgent, and LanguageNavAgent require no extra dependencies.

### Data Generator Optional Features

```bash
cd navarena-gen

# Semantic detection (optional when using labels.json for ObjectNav)
pip install -e ".[detection]"

# Web viewer
pip install -e ".[web]"
```

### Asset Preprocessing Web Viewer

```bash
cd navarena-forge
pip install -e ".[web]"
```

## FAQ

!!! question "Permission Errors"
    If you encounter permission-related errors, try:
    ```bash
    pip install --user -e .
    ```

!!! question "CUDA Version Mismatch"
    Ensure the installed PyTorch version matches your CUDA version:
    ```bash
    python -c "import torch; print(torch.cuda.is_available()); print(torch.version.cuda)"
    ```

!!! question "gsplat Compilation Failed"
    If gsplat fails to compile, ensure:
    1. Correct CUDA version is installed
    2. C++ compiler (gcc/g++) is installed
    3. Sufficient disk space (compilation requires temporary space)

!!! question "Network Issues"
    If you encounter network issues, use a mirror:
    ```bash
    uv pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -e .
    ```

!!! note "First Run"
    On first run of data generation or evaluation, gsplat may need to compile; this can take several minutes.

## Next Steps

After installation, continue reading:

- **[Quickstart](quickstart.md)** - Learn how to use all modules
- **[Data Generator Overview](../data-generator/overview.md)** - Deep dive into the data generation workflow
- **[Evaluation Framework Overview](../navarena-bench/overview.md)** - Learn about the evaluation framework architecture
