# 批量处理

数据生成器支持单场景与多场景批量生成，以及并行 Episode 生成与可恢复处理。

## 主要脚本

| 脚本 | 用途 |
|------|------|
| `scripts/generate_data.py` | 数据生成主入口 |
| `scripts/render_episodes.py` | 目标图像与轨迹视频渲染 |
| `scripts/validate_data.py` | 生成数据验证 |
| `scripts/run_viewer.py` | Web 查看器启动 |

## 单场景生成

```bash
cd navarena-gen
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml
```

## 多场景批量生成

通过循环或自定义脚本对多个场景依次生成：

```python
# 示例：examples/usage_examples.py
import subprocess

scenes = ["17dc3367", "a1b2c3d4"]
for scene_id in scenes:
    subprocess.run([
        "python", "scripts/generate_data.py",
        "--config", "configs/examples/pointnav_example.yaml",
        "--scene", f"x2robot/{scene_id}",
    ], check=True)
```

或修改配置文件中的 `scene_path` 后多次运行。

## 并行 Episode 生成

使用 `--parallel` 启用多进程 Episode 生成：

```bash
python scripts/generate_data.py \
    --config configs/examples/vln_zh_example.yaml \
    --parallel --num-workers 4 --io-workers 8
```

### 参数

| 参数 | 说明 | 默认 |
|------|------|------|
| `--parallel` | 启用并行 Episode 生成 | `false` |
| `--num-workers` | 工作进程数 | `4` |
| `--io-workers` | 并行 I/O 写入线程数 | `8` |

## 可恢复处理

- 输出目录按 scene_id 和 task_type 组织
- 同一 scene + task 重复运行会追加或覆盖 episodes
- 建议通过 `split` 或输出目录区分不同批次

## 轨迹渲染

生成完成后，可使用 `render_episodes.py` 批量渲染。所有路径基于 `$NAVARENA_DATA_DIR` 自动解析：

```bash
# 使用 --task 快捷方式（自动推导数据路径和相机配置）
python scripts/render_episodes.py --scene x2robot/17dc3367 --task imagenav

# 渲染其他任务类型的轨迹
python scripts/render_episodes.py --scene x2robot/17dc3367 --task pointnav

# 显式指定数据路径（相对于 $NAVARENA_DATA_DIR/datasets/）
python scripts/render_episodes.py --scene x2robot/17dc3367 \
    --trajectories-dir navarena_vln/x2robot/17dc3367/imagenav/gt_trajectories
```

## 数据验证

路径相对于 `$NAVARENA_DATA_DIR/datasets/`：

```bash
# 使用 --scene + --task 快捷方式
python scripts/validate_data.py --scene x2robot/17dc3367 --task pointnav

# 相对路径
python scripts/validate_data.py navarena_vln/x2robot/17dc3367/pointnav/train.json

# 验证目录下所有 JSON 文件
python scripts/validate_data.py navarena_vln/ --all

# 检查引用的文件是否存在
python scripts/validate_data.py --scene x2robot/17dc3367 --task pointnav --check-files

# 显示详细错误和警告
python scripts/validate_data.py --scene x2robot/17dc3367 --task pointnav --verbose
```

## Web 查看器

```bash
python scripts/run_viewer.py --data-dir $NAVARENA_DATA_DIR/datasets
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--data-dir` | 数据目录路径 | - |
| `--port` | 后端服务端口 | `5000` |
| `--skip-frontend` | 只启动后端 | `false` |
| `--skip-backend` | 只启动前端 | `false` |

## 输出目录结构

```
navarena_data/
├── dataset_meta.json
└── scenes/
    └── {scene_id}/
        ├── scene_meta.json
        └── {task_type}/
            ├── train.json
            ├── gt_trajectories/
            ├── goal_images/        # ImageNav
            └── rendered_videos/
```

## 常见问题

!!! question "场景未预处理"
    确保场景已通过 [资产预处理](../asset-preprocessing/overview.md) 生成 V1 格式（manifest.json、nav_map.pgm 等）。

!!! question "ObjectNav 无物体"
    场景需包含 `labels.json`，可由资产预处理或语义检测生成。

!!! question "并行内存不足"
    减小 `--num-workers` 或 `task_config.max_start_points`。

!!! tip "下一步"
    - 学习 **[配置说明](configuration.md)**
    - 了解 **[资产预处理](../asset-preprocessing/overview.md)** 流程
