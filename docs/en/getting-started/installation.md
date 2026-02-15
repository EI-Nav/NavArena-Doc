# Installation Guide

This page guides you through the installation and configuration of the NavArena project. The project consists of two sub-projects: **Data Generator** (vln_data_generator) and **Evaluation Framework** (x2robot-nav).

## System Requirements

Before starting installation, ensure your system meets the following requirements:

| Requirement | Minimum Version | Recommended |
|-------------|------------------|-------------|
| Python | 3.9+ | 3.10+ |
| CUDA | 11.0+ | 12.1+ |
| GPU | CUDA-capable NVIDIA GPU | - |
| OS | Linux | Ubuntu 20.04+ |

!!! warning "GPU Required"
    Both projects require a CUDA-capable GPU to run properly. Ensure your system has the correct CUDA drivers installed.

## Data Generator Installation

### 1. Create Virtual Environment

```bash
conda create -n vln_data python=3.9
conda activate vln_data
```

### 2. Install Base Dependencies

```bash
cd vln_data_generator
pip install -r requirements.txt
```

### 3. Install CLIP

```bash
pip install git+https://github.com/ultralytics/CLIP.git
```

!!! note "First Run"
    On first Pipeline run, gsplat will perform some compilation, which may take a few minutes.

### 4. Verify Installation

```bash
python run_pipeline.py --help
```

If you see the help message, installation was successful.

## Evaluation Framework Installation

### 1. Create Virtual Environment

```bash
conda create -n vln_evaluator python=3.10
conda activate vln_evaluator
```

### 2. Install PyTorch

```bash
# PyTorch (CUDA 12.1)
pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1 \
    --index-url https://download.pytorch.org/whl/cu121
```

### 3. Install Base Dependencies

```bash
cd x2robot-nav
pip install pyyaml pytest requests plyfile gsplat scipy skan \
    -i https://mirrors.cloud.aliyuncs.com/pypi/simple \
    --trusted-host mirrors.cloud.aliyuncs.com
```

### 4. Install ViNT Agent Dependencies (Optional)

If you need to use ViNT/GNM/NoMaD agents:

```bash
# Clone visualnav-transformer repo (alongside x2robot-nav)
git clone ssh://git@gitlab.zbl.local:50022/jake/visualnav-transformer.git

# Install extra dependencies
pip install wandb warmup_scheduler diffusers efficientnet_pytorch \
    einops vit_pytorch lmdb prettytable matplotlib opencv-python \
    fastapi uvicorn imageio "imageio[ffmpeg]"

# Install diffusion_policy
pip install -e visualnav-transformer/src/diffusion_policy/
```

!!! tip "Optional Dependencies"
    If not using ViNT agents, you can skip step 4.

### 5. Install Project

```bash
pip install -e .
```

### 6. Verify Installation

```bash
python scripts/eval.py --help
```

If you see the help message, installation was successful.

## Full Installation Flow

If you need to install both projects simultaneously:

```bash
# 1. Create main environment
conda create -n vln python=3.10
conda activate vln

# 2. Install PyTorch
pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1 \
    --index-url https://download.pytorch.org/whl/cu121

# 3. Install Data Generator dependencies
cd vln_data_generator
pip install -r requirements.txt
pip install git+https://github.com/ultralytics/CLIP.git
cd ..

# 4. Install Evaluation Framework dependencies
cd x2robot-nav
pip install pyyaml pytest requests plyfile gsplat scipy skan \
    -i https://mirrors.cloud.aliyuncs.com/pypi/simple \
    --trusted-host mirrors.cloud.aliyuncs.com
pip install -e .
cd ..
```

## Environment Variable Configuration

### CUDA Setup

Ensure CUDA environment variables are correctly set:

```bash
export CUDA_HOME=/usr/local/cuda
export PATH=$CUDA_HOME/bin:$PATH
export LD_LIBRARY_PATH=$CUDA_HOME/lib64:$LD_LIBRARY_PATH
```

### Python Path

If you need to share code between projects, set PYTHONPATH:

```bash
export PYTHONPATH=/path/to/vln_data_generator:$PYTHONPATH
export PYTHONPATH=/path/to/x2robot-nav:$PYTHONPATH
```

## FAQ

!!! question "Permission Errors"
    If you encounter permission-related errors, try using the `--user` flag:
    ```bash
    pip install --user -r requirements.txt
    ```

!!! question "CUDA Version Mismatch"
    Ensure the installed PyTorch version matches your CUDA version. Check with:
    ```bash
    python -c "import torch; print(torch.cuda.is_available()); print(torch.version.cuda)"
    ```

!!! question "Dependency Conflicts"
    We recommend using separate virtual environments for each project to avoid dependency conflicts:
    ```bash
    # Data Generator
    conda create -n vln_data python=3.9
    conda activate vln_data
    # ... install data generator dependencies
    
    # Evaluation Framework
    conda create -n vln_evaluator python=3.10
    conda activate vln_evaluator
    # ... install evaluation framework dependencies
    ```

!!! question "Network Issues"
    If you encounter network issues, try using a mirror:
    ```bash
    pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
    ```

!!! question "gsplat Compilation Failed"
    If gsplat compilation fails, ensure:
    1. Correct CUDA version is installed
    2. C++ compiler (gcc/g++) is installed
    3. Sufficient disk space (compilation requires temporary space)

## Next Steps

After installation, continue reading:

- **[Quickstart](quickstart.md)** - Learn how to use both projects
- **[Data Generator Overview](../data-generator/overview.md)** - Deep dive into the data generation workflow
- **[Evaluation Framework Overview](../x2robot-nav/overview.md)** - Learn about the evaluation framework architecture
