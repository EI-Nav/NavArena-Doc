# 安装指南

本页面将指导您完成 NavArena 具身导航基础设施的安装和配置过程。NavArena 采用 uv 工作空间管理四个子项目：**核心库** (navarena-core)、**资产预处理** (navarena-forge)、**数据生成器** (navarena-gen) 和 **评测框架** (navarena-bench)。

## 系统要求

在开始安装之前，请确保您的系统满足以下要求：

| 要求 | 最低版本 | 推荐版本 |
|------|---------|---------|
| Python | 3.9+ | 3.10+ |
| uv | 0.4+ | 最新版 |
| CUDA | 11.0+ | 12.1+ |
| GPU | 支持 CUDA 的 NVIDIA GPU | - |
| 操作系统 | Linux | Ubuntu 20.04+ |

!!! warning "GPU 要求"
    数据生成器和评测框架需要 CUDA 支持的 GPU 才能正常运行。请确保您的系统已正确安装 CUDA 驱动。

!!! info "uv 安装"
    如未安装 uv，可通过以下方式安装：
    ```bash
    curl -LsSf https://astral.sh/uv/install.sh | sh
    ```
    或使用 pip：`pip install uv`

## 快速安装（推荐）

使用 uv 工作空间一次性安装所有子项目：

```bash
# 克隆仓库后进入项目根目录
cd NavArena

# 使用 uv 安装工作空间（会安装 navarena-core、navarena-forge、navarena-gen、navarena-bench）
uv sync --all-packages

# 或使用 Makefile
make install
```

## 分模块安装

若仅需安装部分模块，可进入对应子目录安装：

```bash
# 1. 核心库（其他子项目依赖）
cd navarena-core
pip install -e .
cd ..

# 2. 资产预处理（可选，数据生成前需对场景进行预处理）
cd navarena-forge
pip install -e .
cd ..

# 3. 数据生成器（依赖 navarena-core[rendering]）
cd navarena-gen
pip install -e .
cd ..

# 4. 评测框架（依赖 navarena-core[rendering]）
cd navarena-bench
pip install -e .
cd ..
```

## 验证安装

```bash
# 数据生成器
cd navarena-gen && python scripts/generate_data.py --help

# 评测框架
cd navarena-bench && python scripts/eval.py --help
# 或使用 CLI 入口
navarena-bench-eval --help

# 资产预处理
cd navarena-forge && python -m navarena_forge list-steps
```

若看到帮助信息，说明安装成功。

## 配置环境变量

### NAVARENA_DATA_DIR

NavArena 使用 `NAVARENA_DATA_DIR` 作为数据根目录。共享资源（如相机配置、资产）应放在 `shared/` 子目录下：

```bash
export NAVARENA_DATA_DIR=/path/to/your/navarena_data
# 目录结构建议：
# $NAVARENA_DATA_DIR/
# ├── shared/           # 共享资源
# │   ├── camera.yaml   # 相机配置
# │   └── ...
# └── assets/           # V1 格式场景资产
#     ├── x2robot/
#     │   └── 17dc3367/
#     └── ...
```

### CUDA 设置

确保 CUDA 环境变量正确设置：

```bash
export CUDA_HOME=/usr/local/cuda
export PATH=$CUDA_HOME/bin:$PATH
export LD_LIBRARY_PATH=$CUDA_HOME/lib64:$LD_LIBRARY_PATH
```

## 可选依赖

### ViNT/GNM/NoMaD 智能体（评测框架）

如需使用 ViNT、GNM 或 NoMaD 等预训练导航智能体，需单独安装 visualnav-transformer 项目及其依赖：

```bash
# 克隆 visualnav-transformer 仓库（与 navarena-bench 并列）
git clone <visualnav-transformer-repo-url>

# 安装额外依赖
pip install wandb warmup_scheduler diffusers efficientnet_pytorch \
    einops vit_pytorch lmdb prettytable matplotlib opencv-python \
    fastapi uvicorn imageio "imageio[ffmpeg]"

# 安装 diffusion_policy
pip install -e visualnav-transformer/src/diffusion_policy/
```

!!! tip "可选依赖"
    若不使用 ViNT 系列智能体，可跳过上述步骤。LocalAgent、RemoteAgent、LanguageNavAgent 等无需额外依赖。

### 数据生成器可选功能

```bash
cd navarena-gen

# 语义检测（ObjectNav 使用 labels.json 时可选）
pip install -e ".[detection]"

# Web 查看器
pip install -e ".[web]"
```

### 资产预处理 Web 查看器

```bash
cd navarena-forge
pip install -e ".[web]"
```

## 常见问题

!!! question "权限错误"
    若遇到权限相关错误，可尝试使用 `--user` 标志：
    ```bash
    pip install --user -e .
    ```

!!! question "CUDA 版本不匹配"
    确保安装的 PyTorch 版本与 CUDA 版本匹配：
    ```bash
    python -c "import torch; print(torch.cuda.is_available()); print(torch.version.cuda)"
    ```

!!! question "gsplat 编译失败"
    若 gsplat 编译失败，请确保：
    1. 已安装正确版本的 CUDA
    2. 已安装 C++ 编译器（gcc/g++）
    3. 有足够的磁盘空间（编译需要临时空间）

!!! question "网络问题"
    若遇到网络问题，可使用国内镜像：
    ```bash
    uv pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -e .
    ```

!!! note "首次运行"
    首次运行数据生成或评测时，gsplat 可能需进行编译，可能需要数分钟。

!!! tip "下一步"
    安装完成后，继续阅读：
    - **[快速入门](quickstart.md)** - 了解如何使用各模块
    - **[数据生成器概述](../data-generator/overview.md)** - 深入了解数据生成流程
    - **[评测框架概述](../navarena-bench/overview.md)** - 了解评测框架架构
