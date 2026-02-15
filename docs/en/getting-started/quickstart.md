# Quickstart

This tutorial helps you get started quickly with the two core components of the NavArena project: **Data Generator** and **Evaluation Framework**.

## Data Generator Quickstart

### 1. Prepare Scene Data

Ensure you have 3D Gaussian Splatting scene data with the following directory structure:

```
3d_gs_assets/
└── scene_001/
    ├── scene_001_metadata.json  # Scene metadata
    ├── scene_001.ply            # Point cloud file
    └── scene_001_labels.json   # Optional: labels file
```

### 2. Configure Pipeline

Edit `configs/main/pipeline.yaml`:

```yaml
input:
  scene_dir: "3d_gs_assets/scene_001"
  camera_config: "../pipeline/camera.yaml"

output:
  base_dir: "output"
  data_collection_mode: "3D_GS_MODE"
  nav_type: "obj_nav"
```

### 3. Run Full Pipeline

Run all 6 stages:

```bash
cd vln_data_generator
python run_pipeline.py --config configs/main/pipeline.yaml
```

### 4. Run Stages Separately

If Stage 6 is time-consuming, you can run stages separately:

```bash
# Run first 5 stages
python run_pipeline.py --config configs/main/pipeline.yaml \
    --stages stage1 stage2 stage3 stage4 stage5

# Then run Stage 6 alone
python run_pipeline.py --config configs/main/pipeline.yaml \
    --stages stage6 \
    --previous-output-dir output/20260114-day-obj_nav/3D_GS_MODE/2026_01_14_15_06_scene_001
```

### 5. Using Labels File

If the scene directory contains a `labels.json` file, you can skip semantic detection:

```bash
python run_pipeline.py --config configs/main/pipeline.yaml --use-labels
```

### 6. View Output

After Pipeline completion, the output directory structure:

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

## Evaluation Framework Quickstart

### 1. Prepare Episode Data

Create an episode JSON file in the correct format:

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

### 2. Configure Evaluation

Edit `configs/eval/default_eval.yaml`:

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
  dataset_path: "vln_data/episodes.json"

eval_settings:
  num_episodes: 100
  output_path: "./eval_results"
  max_steps_per_episode: 500
```

### 3. Run Evaluation

```bash
cd x2robot-nav
python scripts/eval.py --config configs/eval/default_eval.yaml
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
    --episode 001 \
    --results eval_results/ \
    --output replay.mp4

# Batch replay all episodes
python scripts/replay_eval.py \
    --results eval_results/ \
    --output replay_videos/
```

## Complete Workflow Example

### From Data Generation to Evaluation

```bash
# 1. Generate data
cd vln_data_generator
python run_pipeline.py --config configs/main/pipeline.yaml

# 2. Organize data (optional)
python organize_x2robot_data.py --output-dir output --target-dir ../x2robot-nav/vln_data

# 3. Run evaluation
cd ../x2robot-nav
python scripts/eval.py --config configs/eval/default_eval.yaml

# 4. Generate replay
python scripts/replay_eval.py --results eval_results/ --output replay.mp4
```

## Common Use Cases

### Case 1: Quick Single-Scene Test

```bash
# Data generation
python run_pipeline.py --config configs/main/pipeline.yaml \
    --stages stage1 stage2 stage3 stage4 stage5

# Evaluation
python scripts/eval.py --config configs/eval/default_eval.yaml \
    --num-episodes 10
```

### Case 2: Batch Processing Multiple Scenes

```bash
# Use batch preprocessing script
./batch_preprocess_scenes.sh --scenes_root ./3d_gs_assets/scenes

# Batch run Pipeline (requires custom script)
for scene in scene_001 scene_002 scene_003; do
    python run_pipeline.py --config configs/main/pipeline.yaml \
        --scene-dir "3d_gs_assets/$scene"
done
```

### Case 3: Using Remote Agent

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

### Case 4: Using ViNT Agent

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

## Best Practices

!!! tip "Performance Optimization"
    - **Data Generation**: Use multi-GPU parallel processing, set `gpu_ids` and `enable_parallel` appropriately
    - **Evaluation**: For large numbers of episodes, consider batch processing and saving intermediate results
    - **Stage 6**: Running Stage 6 alone can save time, especially when debugging

!!! tip "Debugging Tips"
    - Use `--stages` to run only the needed stages
    - Set `num_episodes` to a small value for quick testing
    - Enable `save_trajectories` to save trajectory data for analysis

!!! tip "Data Management"
    - Regularly clean old data in the `output` directory
    - Use `organize_x2robot_data.py` to organize data format
    - Create separate config files for different scenes

!!! tip "Error Handling"
    - Check if GPU memory is sufficient (Stage 3 and Stage 6 require more memory)
    - Ensure scene metadata file format is correct
    - Verify episode JSON format meets requirements

## Next Steps

- Deep dive into **[Data Generator Pipeline](../data-generator/pipeline.md)** stages
- Learn how to **[configure the evaluation framework](../x2robot-nav/overview.md)**
- See **[API Reference](../api/reference.md)** for more details
- Read **[Extending Guide](../x2robot-nav/extending.md)** to learn how to customize functionality
