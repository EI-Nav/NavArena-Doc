# Navigation Training Data Format

This document defines the directory structure, metadata file format, and Parquet data format (v1.0.0) for embodied navigation training data.

!!! tip "Evaluation Data Format"
    For the Episode and trajectory format required by the evaluation framework (navarena-bench), see the [evaluation data format](eval-data-format.md), which defines a concise evaluation-specific specification.

## 1. Data Directory Structure

All paths are relative to the `$NAVARENA_DATA_DIR` environment variable (must be set).

```
$NAVARENA_DATA_DIR/
├── assets/                              # Scene assets (navarena-forge preprocessing output)
│   └── {group}/{scene_id}/
├── datasets/                            # Generated datasets (navarena-gen output)
│   └── {dataset_name}/
│       ├── dataset_meta.json           # Dataset-level metadata
│       └── {scene_path}/                # e.g. x2robot/17dc3367 or sage-3d/00666b7a
│           ├── scene_meta.json         # Scene metadata
│           └── {task_type}/             # pointnav/gridtraj/imagenav/objectnav/vln
│               ├── meta/
│               │   ├── info.json       # Task-level metadata
│               │   └── episodes.parquet # Consolidated episode index (all chunks)
│               ├── data/
│               │   └── chunk-XXXXXX/   # Chunked storage (e.g. chunk-000000, default 1000 episodes per chunk)
│               │       ├── trajectories.parquet  # GT trajectories
│               │       └── episodes.parquet      # Per-chunk episode metadata (incremental)
│               ├── goal_images/        # Goal images (imagenav only, optional)
│               │   └── {episode_id}_goal.jpg
│               └── videos/             # Rendered outputs (optional, multi-camera support)
│                   ├── goal_images/                # ImageNav goal images (PNG)
│                   ├── goal_depth/                 # ImageNav goal depth (PNG, optional)
│                   └── chunk-XXXXXX/
│                       └── {camera_name}/
│                           ├── {episode_id}.mp4    # RGB trajectory video
│                           └── depth/ (optional)
│                               └── {episode_id}/
│                                   └── frame_XXXXXX.png
└── shared/                             # Shared configs (camera, etc.)
```

**Directory structure notes**:
- **Parquet format**: Episode metadata and GT trajectories are stored in Parquet format, version 1.0.0
- **Chunked storage**: Trajectories are written in chunks (folder names zero-padded, e.g. `chunk-000000`, `chunk-000001`; default 1000 episodes per chunk), supporting streaming generation and crash recovery
- **scene_path**: In config and paths typically `{group}/{scene_id}`, e.g. `x2robot/17dc3367`, `sage-3d/00666b7a`, `scenesplat/{scene_id}`; in metadata may be `assets/{group}/{scene_id}` (Explorer convention). The unique identity for an episode is `scene_path + task_type + split + episode_id`

## 2. Metadata File Formats

### 2.1 Dataset Metadata (dataset_meta.json)

Located at `$NAVARENA_DATA_DIR/datasets/{dataset_name}/dataset_meta.json`:

```json
{
  "dataset_name": "navarena_dataset_v1",
  "format_version": "1.0.0",
  "created_date": "2026-01-26 10:30:00",
  "updated_date": "2026-01-26 15:00:00",
  "scene_ids": ["17dc3367", "00666b7a"],
  "scene_paths": ["x2robot/17dc3367", "sage-3d/00666b7a"],
  "task_types": ["pointnav", "imagenav", "objectnav", "vln"]
}
```

### 2.2 Scene Metadata (scene_meta.json)

Located at `$NAVARENA_DATA_DIR/datasets/{dataset_name}/{scene_path}/scene_meta.json`:

```json
{
  "scene_id": "17dc3367",
  "scene_path": "x2robot/17dc3367",
  "navigable_area": 45.6,
  "num_objects": 25,
  "task_types": ["pointnav", "imagenav"],
  "created_date": "2026-01-26 10:30:00",
  "updated_date": "2026-01-26 15:00:00",
  "source": {
    "dataset": "InteriorGS",
    "original_id": "17dc3367",
    "original_name": "room_01"
  }
}
```

### 2.3 Task-Level Metadata (meta/info.json)

Located at `{task_dir}/meta/info.json`:

```json
{
  "dataset_name": "navarena_dataset_v1",
  "scene_path": "x2robot/17dc3367",
  "task_type": "pointnav",
  "split": "train",
  "num_episodes": 5000,
  "num_chunks": 5,
  "chunk_size": 1000,
  "format_version": "1.0.0",
  "created_date": "2026-01-26 10:30:00",
  "generation_runs": [...]
}
```

## 3. Parquet Format Specification

### 3.1 Episode Metadata Schema (episodes.parquet)

Both `meta/episodes.parquet` and `data/chunk-XXXXXX/episodes.parquet` use the same schema:

| Field | Type | Description |
|-------|------|-------------|
| episode_id | string | Unique identifier, format `{split}_{index}` e.g. `train_000001` |
| chunk_index | int32 | Chunk index containing the trajectory |
| scene_path | string | Scene path, e.g. `x2robot/17dc3367` |
| task_type | string | Task type: pointnav / gridtraj / imagenav / objectnav / vln |
| split | string | Data split: train / val_seen / val_unseen / test |
| start_position_x, start_position_y, start_position_z | float64 | Start position [x, y, z] |
| start_rotation_qx, qy, qz, qw | float64 | Start orientation quaternion [qx, qy, qz, qw] |
| goal_type | string | Goal type: position / image / object |
| goal_position_x, goal_position_y, goal_position_z | float64 | Goal position [x, y, z] |
| goal_rotation_qx, qy, qz, qw | float64 | Goal orientation quaternion |
| geodesic_distance | float32 | Geodesic distance (meters) |
| euclidean_distance | float32 | Euclidean distance (meters) |
| num_steps | int32 | GT trajectory step count |
| total_time | float32 | Total time (seconds) |
| avg_speed | float32 | Average speed (m/s) |
| max_speed | float32 | Maximum speed (m/s) |
| goal_image_path | string | Goal image path (imagenav) |
| instruction_text | string | Natural language instruction (VLN) |
| goal_object_category | string | ObjectNav category (when applicable) |
| goal_object_id | string | Object instance id (when applicable) |
| instruction_language | string | Instruction locale tag |
| goals_json | string | JSON array of **all** goals for the episode; preferred when present |

When `goals_json` is set, readers should deserialize it to recover multi-goal episodes. If absent, older rows fall back to the scalar `goal_*` columns (single goal).

### 3.2 Trajectory Schema (trajectories.parquet)

`data/chunk-XXXXXX/trajectories.parquet` stores GT trajectory steps:

| Field | Type | Description |
|-------|------|-------------|
| episode_id | string | Parent episode ID |
| step | int32 | Step index, starting from 0 |
| timestamp | float64 | Timestamp (seconds) |
| position_x, position_y, position_z | float64 | Position [x, y, z] |
| rotation_qx, qy, qz, qw | float64 | Orientation quaternion [qx, qy, qz, qw] |
| action | string | Action name, e.g. start / forward / turn / stop |
| action_id | int8 | Action ID |
| linear_velocity | float32 | Linear velocity (m/s) |
| angular_velocity | float32 | Angular velocity (rad/s) |
| linear_velocity_x, linear_velocity_y | float32 | Linear velocity components |
| angular_acceleration | float32 | Angular acceleration (rad/s²) |
| linear_acceleration | float32 | Linear acceleration (m/s²) |
| curvature | float32 | Curvature (1/m) |
| phase | string | Planner / controller phase label when set |

### 3.3 Trajectory–Episode Association

- Each episode's `chunk_index` indicates which chunk contains its GT trajectory
- Filter `data/chunk-{N}/trajectories.parquet` by `episode_id` to retrieve the full trajectory

## 4. Episode Logical Structure (Conceptual Layer)

At the application layer, an Episode can be understood as the following structure (restored from Parquet as an `Episode` object):

### 4.1 Required Fields

```python
{
  "episode_id": "train_000001",
  "scene_path": "x2robot/17dc3367",
  "task_type": "pointnav",
  "start_state": {
    "position": [x, y, z],
    "rotation": [qx, qy, qz, qw]  # quaternion
  },
  "goals": [...]  # at least one goal
}
```

### 4.2 Goals Format (by goal_type)

**Position (Point Navigation)**:
```json
{
  "goal_type": "position",
  "position": [x, y, z],
  "rotation": [qx, qy, qz, qw]
}
```

**Image (Image Navigation)**:
```json
{
  "goal_type": "image",
  "image_goal": { "image_path": "goal_images/train_000001_goal.jpg" },
  "position": [x, y, z],
  "rotation": [qx, qy, qz, qw]
}
```

**Object (Object Navigation)**:
```json
{
  "goal_type": "object",
  "object_category": "table",
  "object_id": "table_0",
  "position": [x, y, z]
}
```

### 4.3 Instructions (VLN)

```json
{
  "instruction_text": "Go to the end of the hallway, turn left and find the table",
  "language": "zh-CN"
}
```

The `Instruction` dataclass defaults to **`language: "zh-CN"`** in `navarena_core`; Parquet may still store other locales per row.

### 4.4 GT Path Statistics

```json
{
  "stats": {
    "geodesic_distance": 5.83,
    "num_steps": 12,
    "euclidean_distance": 5.2,
    "total_time": 11.66,
    "avg_speed": 0.5,
    "max_speed": 0.6
  }
}
```

## 5. Reading Data

Use `navarena_core.data.parquet_io.ParquetDatasetReader`:

```python
from navarena_core.data.parquet_io import ParquetDatasetReader

task_dir = "$NAVARENA_DATA_DIR/datasets/navarena_dataset_v1/x2robot/17dc3367/pointnav"
reader = ParquetDatasetReader(task_dir)

# Read all episodes
episodes = reader.read_episodes()

# Read GT trajectory for a specific episode
trajectory = reader.read_trajectory("train_000001")
```

## 6. Complete Directory Example

```
$NAVARENA_DATA_DIR/
├── assets/
│   └── x2robot/
│       └── 17dc3367/
│           ├── manifest.json
│           ├── aligned.ply
│           ├── nav_map.pgm
│           ├── nav_map.yaml
│           ├── nav_mask.png
│           └── labels.json
└── datasets/
    └── navarena_dataset_v1/
        ├── dataset_meta.json
        └── x2robot/
            └── 17dc3367/
                ├── scene_meta.json
                ├── pointnav/
                │   ├── meta/
                │   │   ├── info.json
                │   │   └── episodes.parquet
                │   └── data/
                │       ├── chunk-000000/
                │       │   ├── trajectories.parquet
                │       │   └── episodes.parquet
                │       └── chunk-000001/
                │           ├── trajectories.parquet
                │           └── episodes.parquet
                ├── imagenav/
                │   ├── meta/
                │   ├── data/
                │   └── goal_images/
                │       ├── train_000000_goal.jpg
                │       └── ...
                ├── gridtraj/
                │   ├── meta/
                │   ├── data/
                │   └── videos/
                │       └── chunk-000000/
                │           └── {camera_name}/
                │               ├── train_000000.mp4
                │               └── depth/
                │                   └── train_000000/
                │                       ├── frame_000000.png
                │                       └── ...
                └── vln/
                    ├── meta/
                    └── data/
```

## 7. Explorer-Related Files (Web Viewer)

navarena-gen's Web Explorer uses these additional files and conventions:

- **explorer_episodes.parquet**: At `$NAVARENA_DATA_DIR/datasets/{dataset_name}/explorer_episodes.parquet`, a dataset-level materialized index refreshed by the generator after writing `meta/episodes.parquet`, so Explorer avoids repeated scans of scattered `meta/*.parquet`. Key columns include `episode_uid`, `episode_id`, `scene_path`, `scene_group`, `scene_id`, `scene_relpath`, `task_type`, `split`, `trajectory_file`; `trajectory_file` points to the concrete chunk path, e.g. `{group}/{scene_id}/{task_type}/data/chunk-XXXXXX/trajectories.parquet`.
- **dataset_meta.json**: Explorer uses it first for filter options (dataset_name, scene_paths, task_types, etc.) instead of DISTINCT over the full episodes table.
- **scene_meta.json**: At `datasets/{dataset_name}/{group}/{scene_id}/scene_meta.json`; Explorer uses it for scene summaries, falling back to `assets/{group}/{scene_id}/manifest.json` if missing.
- **scene_path**: Config uses paths relative to `assets/` (e.g. `x2robot/17dc3367`); generated episode metadata may use `assets/{group}/{scene_id}` for Explorer. Stable identity in Explorer is `scene_path + task_type + split + episode_id`.

## 8. Notes

1. **Environment variable**: `NAVARENA_DATA_DIR` must be set as the data root
2. **Quaternion order**: Use `[qx, qy, qz, qw]` consistently (ROS/SciPy compatible)
3. **Episode ID**: Format `{split}_{index}`, unique within task directory
4. **Metadata auto-maintenance**: `dataset_meta.json`, `scene_meta.json`, and `meta/info.json` are auto-created and updated during data generation
5. **Crash recovery**: Generator uses a lightweight checkpoint (e.g. `.train_checkpoint.json`) for crash recovery
6. **goal_images and videos**: Optional directories; trajectory rendering writes RGB MP4 by default, and `render_episodes.py --rgbd` additionally writes depth PNG sequences

## 9. Usage Examples

Examples assume running from **NavArena project root** or **navarena-gen**; config paths (e.g. `configs/examples/...`) are relative to the current working directory.

### 9.1 Data Generation

```bash
cd NavArena  # or cd navarena-gen
export NAVARENA_DATA_DIR=/path/to/data

# Config file is required; task_type comes from YAML
python navarena-gen/scripts/generate_data.py --config navarena-gen/configs/examples/pointnav_example.yaml

# Optional overrides (still requires --config)
python navarena-gen/scripts/generate_data.py --config navarena-gen/configs/examples/pointnav_example.yaml \
    --scene x2robot/17dc3367 --num-episodes 1000
```

### 9.2 Trajectory RGBD Rendering

```bash
cd NavArena  # or cd navarena-gen
export NAVARENA_DATA_DIR=/path/to/data

# Keep RGB MP4 for GridTraj and additionally emit depth PNG sequences
python navarena-gen/scripts/render_episodes.py \
    --scene x2robot/17dc3367 \
    --task gridtraj \
    --rgbd
```

Example output:

```text
datasets/{dataset_name}/x2robot/17dc3367/gridtraj/videos/chunk-000000/
└── {camera_name}/
    ├── train_000000.mp4
    └── depth/
        └── train_000000/
            ├── frame_000000.png
            └── ...
```

### 9.3 Launch Web Viewer

```bash
cd NavArena
python navarena-gen/scripts/run_viewer.py
# Data directory resolved via $NAVARENA_DATA_DIR
```
