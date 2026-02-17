# 安装指南

本页面将指导您完成 NavArena 项目的安装和配置过程。NavArena 项目包含三个子项目：**资产预处理** (NavArena-Forge)、**数据生成器** (NavArena-Gen) 和 **评测框架** (NavArena-Bench)。

## 系统要求

在开始安装之前，请确保您的系统满足以下要求：

| 要求 | 最低版本 | 推荐版本 |
|------|---------|---------|
| Python | 3.9+ | 3.10+ |
| CUDA | 11.0+ | 12.1+ |
| GPU | 支持 CUDA 的 NVIDIA GPU | - |
| 操作系统 | Linux | Ubuntu 20.04+ |

!!! warning "GPU 要求"
    两个项目都需要 CUDA 支持的 GPU 才能正常运行。请确保您的系统已正确安装 CUDA 驱动。

## 数据生成器安装

### 1. 创建虚拟环境

```bash
conda create -n navarena_gen python=3.9
conda activate navarena_gen
```

### 2. 安装基础依赖

```bash
cd NavArena-Gen
pip install -r requirements.txt
```

### 3. 安装 CLIP

```bash
pip install git+https://github.com/ultralytics/CLIP.git
```

!!! note "首次运行"
    第一次运行 Pipeline 时，gsplat 需要进行一些编译，这可能需要几分钟时间。

### 4. 验证安装

```bash
python run_pipeline.py --help
```

如果看到帮助信息，说明安装成功。

## 评测框架安装

### 1. 创建虚拟环境

```bash
conda create -n navarena_bench python=3.10
conda activate navarena_bench
```

### 2. 安装 PyTorch

```bash
# PyTorch (CUDA 12.1)
pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1 \
    --index-url https://download.pytorch.org/whl/cu121
```

### 3. 安装基础依赖

```bash
cd NavArena-Bench
pip install pyyaml pytest requests plyfile gsplat scipy skan \
    -i https://mirrors.cloud.aliyuncs.com/pypi/simple \
    --trusted-host mirrors.cloud.aliyuncs.com
```

### 4. 安装 ViNT 智能体依赖（可选）

如果您需要使用 ViNT/GNM/NoMaD 智能体：

```bash
# 克隆 visualnav-transformer 仓库（与 NavArena-Bench 并列）
git clone ssh://git@gitlab.zbl.local:50022/jake/visualnav-transformer.git

# 安装额外依赖
pip install wandb warmup_scheduler diffusers efficientnet_pytorch \
    einops vit_pytorch lmdb prettytable matplotlib opencv-python \
    fastapi uvicorn imageio "imageio[ffmpeg]"

# 安装 diffusion_policy
pip install -e visualnav-transformer/src/diffusion_policy/
```

!!! tip "可选依赖"
    如果不使用 ViNT 智能体，可以跳过步骤 4。

### 5. 安装项目

```bash
pip install -e .
```

### 6. 验证安装

```bash
python scripts/eval.py --help
```

如果看到帮助信息，说明安装成功。

## 完整安装流程

如果您需要同时安装两个项目，可以按以下步骤操作：

```bash
# 1. 创建主环境
conda create -n navarena python=3.10
conda activate navarena

# 2. 安装 PyTorch
pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1 \
    --index-url https://download.pytorch.org/whl/cu121

# 3. 安装数据生成器依赖
cd NavArena-Gen
pip install -r requirements.txt
pip install git+https://github.com/ultralytics/CLIP.git
cd ..

# 4. 安装评测框架依赖
cd NavArena-Bench
pip install pyyaml pytest requests plyfile gsplat scipy skan \
    -i https://mirrors.cloud.aliyuncs.com/pypi/simple \
    --trusted-host mirrors.cloud.aliyuncs.com
pip install -e .
cd ..
```

## 配置环境变量

### CUDA 设置

确保 CUDA 环境变量正确设置：

```bash
export CUDA_HOME=/usr/local/cuda
export PATH=$CUDA_HOME/bin:$PATH
export LD_LIBRARY_PATH=$CUDA_HOME/lib64:$LD_LIBRARY_PATH
```

### Python 路径

如果需要在不同项目间共享代码，可以设置 PYTHONPATH：

```bash
export PYTHONPATH=/path/to/NavArena-Gen:$PYTHONPATH
export PYTHONPATH=/path/to/NavArena-Bench:$PYTHONPATH
```

## 常见问题

!!! question "权限错误"
    如果遇到权限相关的错误，尝试使用 `--user` 标志：
    ```bash
    pip install --user -r requirements.txt
    ```

!!! question "CUDA 版本不匹配"
    确保安装的 PyTorch 版本与您的 CUDA 版本匹配。可以使用以下命令检查：
    ```bash
    python -c "import torch; print(torch.cuda.is_available()); print(torch.version.cuda)"
    ```

!!! question "依赖冲突"
    建议为每个项目使用独立的虚拟环境来避免依赖冲突：
    ```bash
    # 数据生成器
    conda create -n navarena_gen python=3.9
    conda activate navarena_gen
    # ... 安装数据生成器依赖
    
    # 评测框架
    conda create -n navarena_bench python=3.10
    conda activate navarena_bench
    # ... 安装评测框架依赖
    ```

!!! question "网络问题"
    如果遇到网络问题，可以使用国内镜像：
    ```bash
    pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
    ```

!!! question "gsplat 编译失败"
    如果 gsplat 编译失败，请确保：
    1. 已安装正确版本的 CUDA
    2. 已安装 C++ 编译器（gcc/g++）
    3. 有足够的磁盘空间（编译需要临时空间）

## 下一步

安装完成后，继续阅读：

- **[快速入门](quickstart.md)** - 了解如何使用两个项目
- **[数据生成器概述](../data-generator/overview.md)** - 深入了解数据生成流程
- **[评测框架概述](../navarena-bench/overview.md)** - 了解评测框架架构
