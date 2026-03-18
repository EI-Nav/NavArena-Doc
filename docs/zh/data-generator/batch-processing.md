# 批量处理

数据生成器支持单场景与多场景批量生成，以及并行 Episode 生成与可恢复处理。

## 主要脚本

| 脚本 | 用途 |
|------|------|
| `scripts/generate_data.py` | 数据生成主入口 |
| `scripts/render_episodes.py` | 目标图像与轨迹视频渲染 |
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
    --parallel --num-workers 4 --batch-size 20
```

### 并行与分块参数

| 参数 | 说明 | 默认 |
|------|------|------|
| `--parallel` | 启用并行 Episode 生成 | `false` |
| `--num-workers` | 工作进程数 | `4` |
| `--batch-size` | 每进程每批 episode 数量 | `20` |
| `--chunk-size` | Parquet 每块 episode 数量 | `1000` |

## 断点续传与追加模式

- **`--resume`**：从 checkpoint 恢复。若存在 `.{split}_checkpoint.json`，则从上次进度继续，跳过已完成的 episodes。
- **`--append`**：向已有数据集追加。读取现有 `meta/episodes.parquet`，新 episode ID 从最大序号 +1 开始。
- **`--checkpoint-interval`**：每 N 个 episode 保存一次 checkpoint（默认 50）。

```bash
# 崩溃后恢复
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml --resume

# 向已有数据集追加 500 个 episode
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml \
    --num-episodes 500 --append
```

## 可恢复处理

- 输出目录按 scene_path 和 task_type 组织
- 使用 `--resume` 可从 checkpoint 恢复
- 使用 `--append` 可向已有数据集追加

## 轨迹渲染

生成完成后，可使用 `render_episodes.py` 批量渲染。所有路径基于 `$NAVARENA_DATA_DIR` 自动解析：

```bash
# 使用 --task 快捷方式（自动推导数据路径和相机配置）
python scripts/render_episodes.py --scene x2robot/17dc3367 --task imagenav

# 渲染其他任务类型的轨迹
python scripts/render_episodes.py --scene x2robot/17dc3367 --task pointnav

# 显式指定任务目录（相对于 $NAVARENA_DATA_DIR/datasets/，含 meta/ 与 data/）
python scripts/render_episodes.py --scene x2robot/17dc3367 \
    --dataset-name navarena_dataset_v1 --task pointnav
```

## 数据验证

当前仓库未提供独立的 `validate_data.py`。可自行编写脚本读取 `meta/episodes.parquet` 与 `data/chunk-*/trajectories.parquet` 做一致性检查（如 episode_id 对应、轨迹步数等）。

## Web 查看器

```bash
python scripts/run_viewer.py --data-dir $NAVARENA_DATA_DIR/datasets
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--data-dir` | 数据目录路径 | - |
| `--backend-port` | 后端服务端口 | `8000` |
| `--frontend-port` | 前端服务端口 | `5173` |
| `--skip-frontend` | 只启动后端 | `false` |
| `--skip-backend` | 只启动前端 | `false` |

## 输出目录结构

所有路径相对于 `$NAVARENA_DATA_DIR/datasets/`：

```
{dataset_name}/
├── dataset_meta.json
└── {scene_path}/
    ├── scene_meta.json
    └── {task_type}/
        ├── meta/
        │   ├── info.json
        │   └── episodes.parquet
        ├── data/
        │   └── chunk-NNN/
        │       ├── trajectories.parquet
        │       └── episodes.parquet
        ├── goal_images/        # ImageNav（可选）
        └── rendered_videos/    # 可选
```

## 常见问题

!!! question "场景未预处理"
    确保场景已通过 [资产预处理](../asset-preprocessing/) 生成 V1 格式（manifest.json、nav_map.pgm 等）。

!!! question "ObjectNav 无物体"
    场景需包含 `labels.json`，可由资产预处理或语义检测生成。

!!! question "并行内存不足"
    减小 `--num-workers` 或 `task_config.max_start_points`。

!!! tip "下一步"
    - 学习 **[配置说明](configuration.md)**
    - 了解 **[资产预处理](../asset-preprocessing/)** 流程
