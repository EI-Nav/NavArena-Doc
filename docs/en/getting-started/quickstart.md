# Quickstart

This tutorial helps you get started quickly with the three core modules of the NavArena embodied navigation infrastructure: **Asset Preprocessing**, **Data Generator**, and **Evaluation Framework**.

## Asset Preprocessing Quickstart

Before data generation, raw 3DGS scenes must be converted to the V1 unified asset format.

### 1. Prepare Raw Scenes

Ensure you have raw 3D Gaussian Splatting PLY point cloud files, e.g.:

```
/path/to/scenes/
└── 17dc3367/
    └── scene.ply   # or any .ply file
```

### 2. Run Pipeline on a Single Scene

```bash
cd navarena-forge
python -m navarena_forge run-pipeline \
    --config navarena_forge/configs/pipeline.yaml \
    --scene-dir /path/to/scenes/17dc3367 \
    --source-dataset x2robot
```

### 3. Batch Process Multiple Scenes

```bash
python -m navarena_forge batch \
    --scenes-root /path/to/scenes \
    --config navarena_forge/configs/pipeline.yaml \
    --source-dataset x2robot
```

### 4. View Output

After the pipeline completes, each scene will have V1-format assets:

```
{output_root}/{scene_id}/
├── manifest.json
├── source.ply
├── aligned.ply
├── nav_map.pgm
├── nav_map.yaml
├── nav_mask.png
└── compressed.splat  # optional
```

## Data Generator Quickstart

### 1. Prepare V1 Asset Scenes

Ensure asset preprocessing is done; V1 assets should be under `$NAVARENA_DATA_DIR/assets/`, e.g.:

```
$NAVARENA_DATA_DIR/assets/x2robot/17dc3367/
├── manifest.json
├── aligned.ply
├── nav_map.pgm
├── nav_map.yaml
└── nav_mask.png
```

### 2. Configure Generation Task

Edit `configs/examples/pointnav_example.yaml`:

```yaml
env_type: gs
scene_path: x2robot/17dc3367  # relative to $NAVARENA_DATA_DIR/assets/

task_type: pointnav
num_episodes: 10
split: train

task_config:
  min_distance: 5.0
  max_distance: 12.0
  grid_spacing: 1.0
```

### 3. Run Data Generation

```bash
cd navarena-gen
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml
```

### 4. Parallel Generation

```bash
python scripts/generate_data.py --config configs/examples/vln_zh_example.yaml \
    --parallel --num-workers 4 --io-workers 8
```

### 5. View Output

After generation, the output directory structure:

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
            └── rendered_videos/   # optional, requires separate rendering
```

## Evaluation Framework Quickstart

### 1. Prepare Episode Data

Episodes must follow the standard format with `start_state` and `scene_path`:

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

Quaternion format is `[qx, qy, qz, qw]`.

### 2. Configure Evaluation

Edit `configs/eval/default_eval.yaml`:

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

### 3. Run Evaluation

```bash
cd navarena-bench
python scripts/eval.py --config configs/eval/default_eval.yaml
```

Or use the CLI entry point:

```bash
navarena-bench-eval --config configs/eval/default_eval.yaml
```

### 4. Override Config with Command-Line Arguments

```bash
python scripts/eval.py --config configs/eval/default_eval.yaml \
    --num-episodes 50 \
    --output-dir ./my_results
```

### 5. Generate Replay Video

After evaluation, generate replay videos:

```bash
# Single episode replay
python scripts/replay_eval.py \
    --episode train_000001 \
    --results eval_results/ \
    --output replay.mp4

# Batch replay all episodes
python scripts/replay_eval.py \
    --results eval_results/ \
    --output replay_videos/
```

## Complete Workflow Example

### From Asset Preprocessing to Evaluation

```bash
# 1. Asset preprocessing (raw PLY -> V1 format)
cd navarena-forge
python -m navarena_forge run-pipeline \
    --config navarena_forge/configs/pipeline.yaml \
    --scene-dir /path/to/raw_scenes/17dc3367 \
    --source-dataset x2robot

# 2. Data generation (generate Episodes)
cd ../navarena-gen
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml

# 3. Run evaluation
cd ../navarena-bench
python scripts/eval.py --config configs/eval/default_eval.yaml

# 4. Generate replay
python scripts/replay_eval.py --results eval_results/ --output replay.mp4
```

## Common Use Cases

### Case 1: Quick Single-Scene Test

```bash
# Data generation
cd navarena-gen
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml --num-episodes 5

# Evaluation
cd navarena-bench
python scripts/eval.py --config configs/eval/default_eval.yaml --num-episodes 10
```

### Case 2: Batch Preprocessing Multiple Scenes

```bash
cd navarena-forge
python -m navarena_forge batch \
    --scenes-root /path/to/raw_scenes \
    --config navarena_forge/configs/pipeline.yaml \
    --source-dataset x2robot
```

### Case 3: Using Remote Agent

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

### Case 4: Using ViNT Agent

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

## Best Practices

!!! tip "Performance Optimization"
    - **Data Generation**: Use `--parallel --num-workers 4` for multi-process generation
    - **Evaluation**: For large numbers of episodes, consider batch processing and saving intermediate results

!!! info "Debugging Tips"
    - Set `num_episodes` to a small value for quick tests
    - Enable `save_trajectories: true` to save trajectory data for analysis

!!! note "Data Management"
    - Regularly clean old data in output directories
    - Create separate config files for different scenes
    - Ensure `NAVARENA_DATA_DIR` is set correctly

!!! warning "Error Handling"
    - Check if GPU memory is sufficient
    - Ensure V1 asset format is complete (manifest.json, nav_map.pgm, etc.)
    - Verify episode JSON format meets requirements

!!! tip "Next Steps"
    - Deep dive into **[Data Generator Pipeline](../data-generator/pipeline.md)** stages
    - Learn how to **[configure the evaluation framework](../navarena-bench/overview.md)**
    - See **[API Reference](../api/reference.md)** for more details
    - Read **[Extending Guide](../navarena-bench/extending.md)** to learn how to customize functionality
