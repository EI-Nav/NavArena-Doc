# Configuration

YAML configs merge **user file → `defaults/env/{env_type}.yaml` → `defaults/task/{task_type}.yaml` → `defaults/planner.yaml`**. Paths are resolved from **`$NAVARENA_DATA_DIR`**.

## Config layout (repository)

```
configs/
├── defaults/
│   ├── env/gs.yaml
│   ├── task/pointnav.yaml, gridtraj.yaml, imagenav.yaml, objectnav.yaml, vln.yaml
│   └── planner.yaml
└── examples/
    ├── pointnav_example.yaml
    ├── gridtraj_example.yaml
    ├── imagenav_example.yaml
    ├── objectnav_example.yaml
    ├── vln_en_example.yaml
    ├── vln_path_based_example.yaml
    ├── vln_object_goal_example.yaml
    └── camera.yaml
```

There is **no** `vln_zh_example.yaml`; use `vln_en_example.yaml` (or another VLN example) and set `language: zh-CN` under `task_config` if you need Chinese instructions.

## Example: PointNav (aligned with `pointnav_example.yaml`)

```yaml
env_type: gs
scene_path: x2robot/17dc3367

env_config:
  z_coordinate: 0.0
  robot_radius: 0.4
  max_linear_velocity: 0.45
  max_angular_velocity: 0.8
  max_angular_accel: 0.6
  max_linear_accel: 0.25
  max_jerk: 0.4
  max_lateral_accel: 0.25
  dt: 0.05
  goal_tolerance: 0.3

task_type: pointnav
num_episodes: 1000000
split: train

task_config:
  start_constraints:
    sampler: grid
    grid_spacing: 1.0
    max_start_points: null
    rotation_num: 6
  goal_constraints:
    sampler: grid
    grid_spacing: 1.0
    rotation_num: 6
    require_navigable_path: true
  trajectory_constraints:
    min_geodesic_distance: 1.0
    max_geodesic_distance: 30.0
    require_gt_path: true

dataset_name: navarena_dataset_v1
```

## Example: VLN (English template)

Use `configs/examples/vln_en_example.yaml` or set:

```yaml
task_type: vln
task_config:
  instruction_type: simple_direction   # simple_direction | path_based | object_goal
  language: en-US                     # or zh-CN
  num_instructions_per_episode: 1
```

## Parameter reference

### Top-level

| Parameter | Description | Typical |
|-----------|-------------|---------|
| `env_type` | `gs` (supported) | `gs` |
| `scene_path` | Relative to `assets/`, e.g. `x2robot/17dc3367` | required |
| `task_type` | `pointnav` \| `gridtraj` \| `imagenav` \| `objectnav` \| `vln` | required |
| `num_episodes` | Episodes to generate | from example |
| `split` | e.g. `train`, `val_seen` | `train` |
| `dataset_name` | Output root folder name under `datasets/` | `navarena_dataset_v1` |

### `env_config` (defaults from `defaults/env/gs.yaml`)

| Parameter | Default (gs.yaml) |
|-----------|---------------------|
| `robot_radius` | `0.4` |
| `z_coordinate` | `0.0` |
| `max_linear_velocity` | `0.45` |
| `max_angular_velocity` | `0.8` |
| `max_angular_accel` | `0.6` |
| `max_linear_accel` | `0.25` |
| `max_jerk` | `0.4` |
| `max_lateral_accel` | `0.25` |
| `dt` | `0.05` |
| `goal_tolerance` | `0.3` |
| `max_sampling_attempts` | `100` |

### `task_config` (PointNav defaults from `defaults/task/pointnav.yaml`)

| Section | Notable defaults |
|---------|-------------------|
| `start_constraints` | `grid_spacing: 1.0`, `rotation_num: 6` |
| `goal_constraints` | `grid_spacing: 1.0`, `require_navigable_path: true` |
| `trajectory_constraints` | `min_geodesic_distance: 1.0`, `max_geodesic_distance: 30.0` |

VLN-specific: `instruction_type`, `language`, `num_instructions_per_episode` — see `defaults/task/vln.yaml` and examples.

## Multi-file merge

```bash
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml \
  --env-config my_env.yaml --task-config my_task.yaml
```

## CLI

**`--config` is required.** Task type always comes from the YAML (`task_type`); there is **no** `--task` flag.

```bash
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml
```

Common overrides (see `generate_data.py`):

| Argument | Purpose |
|----------|---------|
| `--scene` | Override `scene_path` |
| `--env` | Override `env_type` (`gs` / `habitat` / `isaac`) |
| `--num-episodes` | Override count |
| `--split` | Override split |
| `--dataset-name` | Override dataset folder |
| `--env-config` / `--task-config` | Merge YAML fragments |
| `--parallel` / `--num-workers` / `--batch-size` | Parallel generation |
| `--chunk-size` | Episodes per Parquet chunk |
| `--resume` / `--append` | Checkpointing |
| `--checkpoint-interval` | Save checkpoint every N episodes |

```bash
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml \
  --parallel --num-workers 4 --batch-size 20 --resume
```

**See also**: [Batch Processing](batch-processing.md) · [Asset Preprocessing](../asset-preprocessing/)
