# 快速入门

本教程将通过简单的示例帮助您快速上手 NavArena 项目的两个核心组件：**数据生成器**和**评测框架**。

## 数据生成器快速入门

### 1. 准备场景数据

确保您有 3D Gaussian Splatting 场景数据，目录结构如下：

```
3d_gs_assets/
└── scene_001/
    ├── scene_001_metadata.json  # 场景元数据
    ├── scene_001.ply            # 点云文件
    └── scene_001_labels.json    # 可选：标注文件
```

### 2. 配置 Pipeline

编辑 `configs/main/pipeline.yaml`：

```yaml
input:
  scene_dir: "3d_gs_assets/scene_001"
  camera_config: "../pipeline/camera.yaml"

output:
  base_dir: "output"
  data_collection_mode: "3D_GS_MODE"
  nav_type: "obj_nav"
```

### 3. 运行完整 Pipeline

运行所有 6 个阶段：

```bash
cd NavArena-Gen
python run_pipeline.py --config configs/main/pipeline.yaml
```

### 4. 分阶段运行

如果 Stage 6 耗时较长，可以分阶段运行：

```bash
# 先运行前 5 个阶段
python run_pipeline.py --config configs/main/pipeline.yaml \
    --stages stage1 stage2 stage3 stage4 stage5

# 然后单独运行 Stage 6
python run_pipeline.py --config configs/main/pipeline.yaml \
    --stages stage6 \
    --previous-output-dir output/20260114-day-obj_nav/3D_GS_MODE/2026_01_14_15_06_scene_001
```

### 5. 使用 Labels 文件

如果场景目录中有 `labels.json` 文件，可以跳过语义检测：

```bash
python run_pipeline.py --config configs/main/pipeline.yaml --use-labels
```

### 6. 查看输出

Pipeline 完成后，输出目录结构：

```
output/
└── 20260114-day-obj_nav/
    └── 3D_GS_MODE/
        └── 2026_01_14_15_06_scene_001/
            ├── scene_metadata/
            ├── sampled_targets/
            ├── target_renders/
            ├── semantic_detections/
            ├── planned_trajectories/
            └── final_renders/
```

## 评测框架快速入门

### 1. 准备 Episode 数据

创建符合格式的 episode JSON 文件：

```json
{
  "episodes": [
    {
      "episode_id": "001",
      "scene_id": "scene_001",
      "start_position": [0.0, 0.0, 0.0],
      "start_rotation": [1.0, 0.0, 0.0, 0.0],
      "goals": [
        {
          "position": [5.0, 0.0, 0.0],
          "rotation": [1.0, 0.0, 0.0, 0.0]
        }
      ]
    }
  ]
}
```

### 2. 配置评测

编辑 `configs/eval/default_eval.yaml`：

```yaml
eval_type: "pointnav"

env:
  env_type: "gs"
  env_settings:
    scene_dir: "/path/to/scenes"
    camera_config: "/path/to/camera.yaml"
    enable_occupancy: true
    success_distance: 0.5

agent:
  agent_type: "local"
  model_path: null

dataset:
  dataset_type: "episode"
  dataset_path: "navarena_data/episodes.json"

eval_settings:
  num_episodes: 100
  output_path: "./eval_results"
  max_steps_per_episode: 500
```

### 3. 运行评测

```bash
cd NavArena-Bench
python scripts/eval.py --config configs/eval/default_eval.yaml
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
    --episode 001 \
    --results eval_results/ \
    --output replay.mp4

# 批量回放所有 episodes
python scripts/replay_eval.py \
    --results eval_results/ \
    --output replay_videos/
```

## 完整工作流程示例

### 从数据生成到评测

```bash
# 1. 生成数据
cd NavArena-Gen
python run_pipeline.py --config configs/main/pipeline.yaml

# 2. 组织数据（可选）
python organize_x2robot_data.py --output-dir output --target-dir ../NavArena-Bench/navarena_data

# 3. 运行评测
cd ../NavArena-Bench
python scripts/eval.py --config configs/eval/default_eval.yaml

# 4. 生成回放
python scripts/replay_eval.py --results eval_results/ --output replay.mp4
```

## 常见使用场景

### 场景 1: 快速测试单个场景

```bash
# 数据生成
python run_pipeline.py --config configs/main/pipeline.yaml \
    --stages stage1 stage2 stage3 stage4 stage5

# 评测
python scripts/eval.py --config configs/eval/default_eval.yaml \
    --num-episodes 10
```

### 场景 2: 批量处理多个场景

```bash
# 使用批量预处理脚本
./batch_preprocess_scenes.sh --scenes_root ./3d_gs_assets/scenes

# 批量运行 Pipeline（需要自定义脚本）
for scene in scene_001 scene_002 scene_003; do
    python run_pipeline.py --config configs/main/pipeline.yaml \
        --scene-dir "3d_gs_assets/$scene"
done
```

### 场景 3: 使用远程智能体

```yaml
# configs/eval/remote_eval.yaml
agent:
  agent_type: "remote"
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
  model_path: "/path/to/vint_model.pth"
  model_settings:
    checkpoint_path: "/path/to/checkpoint.pth"
```

```bash
python scripts/eval.py --config configs/eval/vint_eval.yaml
```

## 最佳实践

!!! tip "性能优化"
    - **数据生成**: 使用多 GPU 并行处理，合理设置 `gpu_ids` 和 `enable_parallel`
    - **评测**: 对于大量 episodes，考虑分批处理并保存中间结果
    - **Stage 6**: 单独运行 Stage 6 可以节省时间，特别是在调试时

!!! tip "调试技巧"
    - 使用 `--stages` 参数只运行需要的阶段
    - 设置 `num_episodes` 为较小值进行快速测试
    - 启用 `save_trajectories` 保存轨迹数据用于分析

!!! tip "数据管理"
    - 定期清理 `output` 目录中的旧数据
    - 使用 `organize_x2robot_data.py` 整理数据格式
    - 为不同场景创建独立的配置文件

!!! tip "错误处理"
    - 检查 GPU 内存是否足够（Stage 3 和 Stage 6 需要较多内存）
    - 确保场景元数据文件格式正确
    - 验证 episode JSON 格式是否符合要求

## 下一步

- 深入了解 **[数据生成器 Pipeline](../data-generator/pipeline.md)** 的各个阶段
- 学习如何 **[配置评测框架](../navarena-bench/overview.md)**
- 查看 **[API 参考](../api/reference.md)** 获取更多详细信息
- 阅读 **[扩展指南](../navarena-bench/extending.md)** 了解如何自定义功能
