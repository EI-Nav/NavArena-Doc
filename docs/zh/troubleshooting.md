# 常见问题

NavArena 安装、数据生成和评测中的常见问题及解决方案。

## 安装相关

### gsplat 编译失败

检查以下项：

1. CUDA 版本与 PyTorch 一致：`python -c "import torch; print(torch.version.cuda)"`
2. 已安装 C++ 编译器：`gcc --version`
3. 磁盘空间充足（编译需要临时空间）
4. 首次 `import gsplat` 会触发 JIT 编译，可能需数分钟

### CUDA 版本不匹配

确保 PyTorch 版本与系统 CUDA 驱动兼容：

```bash
nvidia-smi              # 查看驱动支持的最高 CUDA 版本
python -c "import torch; print(torch.cuda.is_available()); print(torch.version.cuda)"
```

驱动的 CUDA 版本必须 ≥ PyTorch 编译时的 CUDA 版本。

### open3d 安装失败

open3d 仅支持 Python 3.8-3.11，部分系统可能缺少依赖：

```bash
# Ubuntu/Debian
sudo apt-get install libgl1-mesa-glx libglib2.0-0
```

### Node.js / npm install 失败

Web Viewer 前端需要 Node.js。通过 conda 安装：

```bash
conda install -c conda-forge nodejs -y
```

若 `npm install` 失败，尝试清除缓存：

```bash
cd navarena-gen/web/frontend
rm -rf node_modules package-lock.json
npm install
```

### conda env create 因网络失败

常见原因是 GitHub 依赖（如 CLIP）下载失败。`requirements-lock.txt` 已将 CLIP 设为可选安装步骤。

国内用户可尝试镜像：

```bash
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements-lock.txt
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge/
```

若 CLIP 安装失败，可稍后重试或使用代理。CLIP 仅 ObjectNav 需要，PointNav/ImageNav/VLN 无需 CLIP。

### 权限错误

```bash
pip install --user -e .
```

## 数据生成相关

### 配置或场景路径未找到

- 确认已设置 `NAVARENA_DATA_DIR`：`echo $NAVARENA_DATA_DIR`
- 检查配置中的 `scene_path` 与实际目录 `$NAVARENA_DATA_DIR/assets/` 下结构一致
- `scene_path` 格式为 `{group}/{scene_id}`（如 `x2robot/17dc3367`，其中 group 为场景组名）

### 未生成 Episode / 输出为空

- 确认资产已完成预处理（存在 manifest.json、aligned.ply、nav_map.pgm）
- 检查场景是否有足够可导航区域；部分场景可生成点位过少
- 快速测试可减少 `num_episodes`（如 `--num-episodes 5`）

## 评测相关

### 评测结果为空

- 确认配置中的 `eval_results_dir` 存在且可写
- 检查配置中的数据集路径指向有效的 Parquet 数据
- 若需回放视频，确认评测器配置中 `save_trajectories: true`

### Agent 连接失败（RemoteAgent / ViNT）

- RemoteAgent：确保远程服务已启动且配置中的 URL 正确
- ViNT：确认已克隆 visualnav-transformer 并安装 diffusion_policy；模型权重需在 `$NAVARENA_DATA_DIR/shared/visualnav-transformer/` 下
