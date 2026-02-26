# 快速入门

本教程将通过简单的示例帮助您快速上手 NavArena 具身导航基础设施的三个核心模块：**资产预处理**、**数据生成器**和**评测框架**。

## 资产预处理快速入门

数据生成前，需要将原始 3DGS 场景转换为 V1 统一资产格式。

### 1. 准备原始场景

确保您有原始 3D Gaussian Splatting PLY 点云文件，例如：

```
/path/to/scenes/
└── 17dc3367/
    └── scene.ply   # 或任意 .ply 文件
```

### 2. 运行单场景 Pipeline

```bash
cd navarena-forge
python -m navarena_forge run-pipeline \
    --config navarena_forge/configs/pipeline.yaml \
    --scene-dir /path/to/scenes/17dc3367 \
    --source-dataset x2robot
```

### 3. 批量处理多场景

```bash
python -m navarena_forge batch \
    --scenes-root /path/to/scenes \
    --config navarena_forge/configs/pipeline.yaml \
    --source-dataset x2robot
```

### 4. 查看输出

Pipeline 完成后，每个场景将生成 V1 格式资产：

```
{output_root}/{scene_id}/
├── manifest.json
├── source.ply
├── aligned.ply
├── nav_map.pgm
├── nav_map.yaml
├── nav_mask.png
└── compressed.splat  # 可选
```

## 数据生成器快速入门

### 1. 准备 V1 资产场景

确保已完成资产预处理，V1 资产位于 `$NAVARENA_DATA_DIR/assets/` 下，例如：

```
$NAVARENA_DATA_DIR/assets/x2robot/17dc3367/
├── manifest.json
├── aligned.ply
├── nav_map.pgm
├── nav_map.yaml
└── nav_mask.png
```

### 2. 配置生成任务

编辑 `configs/examples/pointnav_example.yaml`：

```yaml
env_type: gs
scene_path: x2robot/17dc3367  # 相对于 $NAVARENA_DATA_DIR/assets/

task_type: pointnav
num_episodes: 10
split: train

task_config:
  min_distance: 5.0
  max_distance: 12.0
  grid_spacing: 1.0
```

### 3. 运行数据生成

```bash
cd navarena-gen
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml
```

### 4. 并行生成

```bash
python scripts/generate_data.py --config configs/examples/vln_zh_example.yaml \
    --parallel --num-workers 4 --io-workers 8
```

### 5. 查看输出

生成完成后，输出目录结构：

```
navarena_data/
├── dataset_meta.json
└── scenes/
    └── 17dc3367/
        ├── scene_meta.json
        └── pointnav/
            ├── train.json
            ├── gt_trajectories/
            │   ├── train_000000_gt.json
            │   └── ...
            └── rendered_videos/   # 可选，需单独渲染
```

## 评测框架快速入门

### 1. 准备 Episode 数据

Episode 需符合标准格式，使用 `start_state` 和 `scene_path`：

```json
{
  "version": "2.0.0",
  "metadata": {},
  "episodes": [
    {
      "episode_id": "train_000001",
      "scene_path": "x2robot/17dc3367",
      "task_type": "pointnav",
      "start_state": {
        "position": [0.0, 0.0, 0.0],
        "rotation": [0.0, 0.0, 0.0, 1.0]
      },
      "goals": [
        {
          "goal_type": "position",
          "position": [5.0, 0.0, 0.0],
          "rotation": [0.0, 0.0, 0.383, 0.924]
        }
      ]
    }
  ]
}
```

四元数格式为 `[qx, qy, qz, qw]`。

### 2. 配置评测

编辑 `configs/eval/default_eval.yaml`：

```yaml
eval_type: "pointnav"

env:
  env_type: "gs"
  env_settings:
    camera_config: "${NAVARENA_DATA_DIR}/shared/camera.yaml"
    enable_occupancy: true
    success_distance: 0.5
    camera_names: ["camera_head_front_color_optical_frame"]

agent:
  agent_type: "local"
  model_settings: {}
  device: null

task:
  task_type: "pointnav"

dataset:
  dataset_type: "episode"
  dataset_path: "vln_data/scenes/"

eval_settings:
  num_episodes: 100
  output_path: "./eval_results"
  max_steps_per_episode: 500
```

### 3. 运行评测

```bash
cd navarena-bench
python scripts/eval.py --config configs/eval/default_eval.yaml
```

或使用 CLI 入口：

```bash
navarena-bench-eval --config configs/eval/default_eval.yaml
```

### 4. 使用命令行参数覆盖配置

```bash
python scripts/eval.py --config configs/eval/default_eval.yaml \
    --num-episodes 50 \
    --output-dir ./my_results
```

### 5. 生成回放视频

评测完成后，生成回放视频：

```bash
# 单个 episode 回放
python scripts/replay_eval.py \
    --episode train_000001 \
    --results eval_results/ \
    --output replay.mp4

# 批量回放所有 episodes
python scripts/replay_eval.py \
    --results eval_results/ \
    --output replay_videos/
```

## 完整工作流程示例

### 从资产预处理到评测

```bash
# 1. 资产预处理（原始 PLY -> V1 格式）
cd navarena-forge
python -m navarena_forge run-pipeline \
    --config navarena_forge/configs/pipeline.yaml \
    --scene-dir /path/to/raw_scenes/17dc3367 \
    --source-dataset x2robot

# 2. 数据生成（生成 Episodes）
cd ../navarena-gen
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml

# 3. 运行评测
cd ../navarena-bench
python scripts/eval.py --config configs/eval/default_eval.yaml

# 4. 生成回放
python scripts/replay_eval.py --results eval_results/ --output replay.mp4
```

## 常见使用场景

### 场景 1: 快速测试单个场景

```bash
# 数据生成
cd navarena-gen
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml --num-episodes 5

# 评测
cd navarena-bench
python scripts/eval.py --config configs/eval/default_eval.yaml --num-episodes 10
```

### 场景 2: 批量预处理多个场景

```bash
cd navarena-forge
python -m navarena_forge batch \
    --scenes-root /path/to/raw_scenes \
    --config navarena_forge/configs/pipeline.yaml \
    --source-dataset x2robot
```

### 场景 3: 使用远程智能体

```yaml
# configs/eval/remote_eval.yaml
agent:
  agent_type: "remote"
  model_settings:
    remote_url: "http://localhost:8000/api/v1/navigate"
    remote_timeout: 30.0
    remote_retries: 3
```

```bash
python scripts/eval.py --config configs/eval/remote_eval.yaml
```

### 场景 4: 使用 ViNT 智能体

```yaml
# configs/eval/vint_eval.yaml
agent:
  agent_type: "vint"
  model_settings:
    checkpoint_path: "/path/to/checkpoint.pth"
```

```bash
python scripts/eval.py --config configs/eval/vint_eval.yaml
```

## 最佳实践

!!! tip "性能优化"
    - **数据生成**: 使用 `--parallel --num-workers 4` 启用多进程
    - **评测**: 对于大量 episodes，考虑分批处理并保存中间结果

!!! info "调试技巧"
    - 设置 `num_episodes` 为较小值进行快速测试
    - 启用 `save_trajectories: true` 保存轨迹数据用于分析

!!! note "数据管理"
    - 定期清理输出目录中的旧数据
    - 为不同场景创建独立的配置文件
    - 确保 `NAVARENA_DATA_DIR` 环境变量正确设置

!!! warning "错误处理"
    - 检查 GPU 内存是否足够
    - 确保 V1 资产格式完整（manifest.json、nav_map.pgm 等）
    - 验证 episode JSON 格式是否符合要求

!!! tip "下一步"
    - 深入了解 **[数据生成器 Pipeline](../data-generator/pipeline.md)** 的各个阶段
    - 学习如何 **[配置评测框架](../navarena-bench/overview.md)**
    - 查看 **[API 参考](../api/reference.md)** 获取更多详细信息
    - 阅读 **[扩展指南](../navarena-bench/extending.md)** 了解如何自定义功能
