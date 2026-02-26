# Configuration

The data generator uses YAML config files with a config hierarchy and CLI overrides.

## Config Hierarchy

1. **base.yaml** - Global defaults
2. **envs/*.yaml** - Environment configs (gs_env, habitat_env, isaac_env)
3. **tasks/*.yaml** - Task configs (pointnav, imagenav, objectnav, vln)
4. **examples/*.yaml** - Full example configs

## Config Structure

```
configs/
├── base.yaml
├── envs/
│   ├── gs_env.yaml
│   ├── habitat_env.yaml
│   └── isaac_env.yaml
├── tasks/
│   ├── pointnav.yaml
│   ├── imagenav.yaml
│   ├── objectnav.yaml
│   └── vln.yaml
└── examples/
    ├── pointnav_example.yaml
    ├── imagenav_example.yaml
    ├── objectnav_example.yaml
    ├── vln_zh_example.yaml
    ├── vln_en_example.yaml
    ├── vln_path_based_example.yaml
    ├── vln_object_goal_example.yaml
    ├── vln_object_goal_zh_example.yaml
    └── camera.yaml
```

## Example Configs

### PointNav

```yaml
env_type: gs
scene_path: navarena_assets/x2robot/17dc3367

env_config:
  z_coordinate: 0.0
  robot_radius: 0.4

task_type: pointnav
num_episodes: 10
split: train

task_config:
  min_distance: 5.0
  max_distance: 12.0
  grid_spacing: 1.0
  max_start_points: null
  num_goals_per_start: 1

output_dir: navarena_data
dataset_name: navarena_pointnav
```

### VLN (Chinese Instructions)

```yaml
env_type: gs
scene_path: navarena_assets/x2robot/17dc3367

env_config:
  z_coordinate: 0.0
  robot_radius: 0.4

task_type: vln
num_episodes: 5
split: train

task_config:
  min_distance: 5.0
  max_distance: 12.0
  instruction_type: simple_direction   # Required: simple_direction, path_based, object_goal
  language: zh-CN                     # zh-CN or en-US
  num_instructions_per_episode: 1

output_dir: navarena_data
dataset_name: navarena_vln_zh
```

## Parameter Reference

### env_config

| Parameter | Description | Default |
|-----------|-------------|---------|
| `z_coordinate` | Fixed height (usually 0.0) | `0.0` |
| `robot_radius` | Collision radius | `0.4` |
| `max_sampling_attempts` | Sampling retries | internal |

### task_config

| Parameter | Description | Default |
|-----------|-------------|---------|
| `min_distance` | Goal min distance (meters) | `5.0` |
| `max_distance` | Goal max distance (meters) | `12.0` |
| `grid_spacing` | Start point grid spacing (meters) | `1.0` |
| `max_start_points` | Max start points, null = unlimited | `null` |
| `max_goal_sampling_attempts` | Max goal sampling attempts per start | `1` |
| `num_goals_per_start` | Goals per start point | `1` |
| `require_gt_path` | Require valid GT path | `true` |
| `planner_config` | Trajectory planner config | `{}` |
| `instruction_type` | VLN: simple_direction / path_based / object_goal | - |
| `language` | VLN: zh-CN / en-US | - |

### Output

| Parameter | Description |
|-----------|-------------|
| `output_dir` | Output root (default navarena_data) |
| `dataset_name` | Dataset name |
| `split` | Split (train/val/test) |

## CLI Overrides

```bash
# Config file
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml

# CLI args
python scripts/generate_data.py --env gs --task pointnav \
    --scene navarena_assets/x2robot/17dc3367 --num-episodes 100

# Parallel
python scripts/generate_data.py --config configs/examples/vln_zh_example.yaml \
    --parallel --num-workers 4 --io-workers 8
```

## Next Steps

- View **[Batch Processing](batch-processing.md)**
- Learn **[Asset Preprocessing](../asset-preprocessing/overview.md)** for scene preparation
