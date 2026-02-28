# Configuration

The data generator uses YAML config files with a config hierarchy and CLI overrides. All paths are relative to `$NAVARENA_DATA_DIR`.

## Config Hierarchy

1. **Main config** - User-provided full config (e.g. `examples/pointnav_example.yaml`)
2. **defaults/env/{env_type}.yaml** - Environment defaults (e.g. `gs.yaml`)
3. **defaults/task/{task_type}.yaml** - Task defaults (e.g. `pointnav.yaml`)
4. **defaults/planner.yaml** - Trajectory planner defaults

User config wins; missing fields are merged from the above defaults.

## Config Structure

```
configs/
├── defaults/
│   ├── env/
│   │   ├── gs.yaml
│   │   ├── habitat.yaml
│   │   └── isaac.yaml
│   ├── task/
│   │   ├── pointnav.yaml
│   │   ├── imagenav.yaml
│   │   ├── objectnav.yaml
│   │   └── vln.yaml
│   └── planner.yaml
└── examples/
    ├── pointnav_example.yaml
    ├── imagenav_example.yaml
    ├── objectnav_example.yaml
    ├── vln_zh_example.yaml
    └── ...
```

## Example Configs

### PointNav

```yaml
env_type: gs
scene_path: sage-3d/00666b7a

env_config:
  z_coordinate: 0.0
  robot_radius: 0.4
  max_linear_velocity: 0.5
  max_angular_velocity: 1.0

task_type: pointnav
num_episodes: 1000
split: train

task_config:
  start_constraints:
    sampler: grid
    grid_spacing: 0.5
    max_start_points: null

  goal_constraints:
    sampler: grid
    grid_spacing: 0.5
    require_navigable_path: true

  trajectory_constraints:
    min_geodesic_distance: 0.5
    max_geodesic_distance: 30.0
    require_gt_path: true

dataset_name: navarena_dataset_v1
```

### VLN (Chinese Instructions)

```yaml
env_type: gs
scene_path: x2robot/17dc3367

env_config:
  z_coordinate: 0.0
  robot_radius: 0.4

task_type: vln
num_episodes: 100
split: train

task_config:
  start_constraints:
    sampler: grid
    grid_spacing: 0.5
  goal_constraints:
    sampler: grid
    grid_spacing: 0.5
  trajectory_constraints:
    min_geodesic_distance: 5.0
    max_geodesic_distance: 12.0

  instruction_type: simple_direction   # simple_direction / path_based / object_goal
  language: zh-CN
  num_instructions_per_episode: 1

dataset_name: navarena_vln_zh
```

## Parameter Reference

### Top-Level

| Parameter | Description | Default |
|-----------|-------------|---------|
| `env_type` | Environment type: gs / habitat / isaac | `gs` |
| `scene_path` | Scene path, e.g. `x2robot/17dc3367` | Required |
| `task_type` | Task type: pointnav / imagenav / objectnav / vln | `pointnav` |
| `num_episodes` | Number of episodes to generate | `100` |
| `split` | Data split: train / val_seen / val_unseen / test | `train` |
| `dataset_name` | Dataset name, output under `datasets/{dataset_name}/` | `navarena_dataset_v1` |

### env_config

| Parameter | Description | Default |
|-----------|-------------|---------|
| `z_coordinate` | Fixed height | `0.0` |
| `robot_radius` | Collision radius (meters) | `0.4` |
| `max_linear_velocity` | Max linear velocity (m/s) | `0.5` |
| `max_angular_velocity` | Max angular velocity (rad/s) | `1.0` |
| `max_linear_accel` | Max linear acceleration | `0.3` |
| `max_angular_accel` | Max angular acceleration | `2.0` |
| `max_jerk` | Max jerk | `0.5` |
| `max_lateral_accel` | Max lateral acceleration | `0.3` |
| `dt` | Time step (seconds) | `0.333` |
| `goal_tolerance` | Goal tolerance (meters) | `0.3` |

### task_config

#### start_constraints

| Parameter | Description | Default |
|-----------|-------------|---------|
| `sampler` | Sampler: grid | `grid` |
| `grid_spacing` | Grid spacing (meters) | `0.5` |
| `max_start_points` | Max start points, null = unlimited | `null` |
| `rotation_num` | Orientations per point | `6` |

#### goal_constraints

| Parameter | Description | Default |
|-----------|-------------|---------|
| `sampler` | Sampler: grid | `grid` |
| `grid_spacing` | Grid spacing (meters) | `0.5` |
| `rotation_num` | Orientations per goal | `6` |
| `require_navigable_path` | Goal must have navigable path from start | `true` |

#### trajectory_constraints

| Parameter | Description | Default |
|-----------|-------------|---------|
| `min_geodesic_distance` | Min geodesic distance (meters) | `0.5` |
| `max_geodesic_distance` | Max geodesic distance (meters) | `30.0` |
| `require_gt_path` | Require valid GT path | `true` |

#### VLN-specific

| Parameter | Description | Default |
|-----------|-------------|---------|
| `instruction_type` | simple_direction / path_based / object_goal | Required |
| `language` | zh-CN / en-US | - |
| `num_instructions_per_episode` | Instructions per episode | `1` |

### planner_config (optional)

Configure via `task_config.planner_config` or `defaults/planner.yaml`; passed to the trajectory planner.

## Multi-File Merge

Use `GeneratorConfig.from_files()` or `--env-config` / `--task-config` to merge fragments:

```bash
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml \
    --env-config my_env.yaml --task-config my_task.yaml
```

## CLI Overrides

```bash
# Config file
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml

# CLI only
python scripts/generate_data.py --env gs --task pointnav \
    --scene x2robot/17dc3367 --num-episodes 100

# Parallel
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml \
    --parallel --num-workers 4 --batch-size 20

# Resume from checkpoint
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml --resume

# Append mode
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml --append
```

!!! tip "Next Steps"
    - View full CLI parameters in **[Batch Processing](batch-processing.md)**
    - Learn **[Asset Preprocessing](../asset-preprocessing/)** for scene preparation
