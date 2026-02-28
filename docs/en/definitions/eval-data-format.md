# Navigation Evaluation Data Format

This document defines the Episode and trajectory format required by the evaluation framework (navarena-bench). **Episode core fields, Goals, Instructions, GT Path, and GT trajectory file format** are identical to the [Navigation Training Data Format](nav-data-format.md). This page only describes evaluation-specific differences and organization.

!!! info "Relationship to Training Data"
    The evaluation data format uses the **same Parquet format** as the [training data format](nav-data-format.md). Training data from navarena-gen includes goal_images, rendered_videos, etc.; the evaluation framework loads Episodes and GT trajectories from `meta/episodes.parquet` and `data/chunk-NNN/trajectories.parquet`.

## 1. Differences from Training Format

| Aspect | Training Data (navarena-gen) | Evaluation Data (navarena-bench) |
|--------|------------------------------|----------------------------------|
| Storage format | Parquet v1.0.0 | Same as training, Parquet |
| Directory structure | `datasets/{name}/{scene_path}/{task_type}/` | Same as above |
| Metadata | meta/info.json, dataset_meta.json, scene_meta.json | Same as above |
| Episode fields | See [nav-data-format](nav-data-format.md) | Same as training |
| Additional files | goal_images, rendered_videos (optional) | goal_images required for ImageNav |

## 2. Data Loading

The evaluation framework loads data via `ParquetDatasetReader`:

```python
from navarena_core.data.parquet_io import ParquetDatasetReader

task_dir = "$NAVARENA_DATA_DIR/datasets/{dataset_name}/{scene_path}/{task_type}"
reader = ParquetDatasetReader(task_dir)
episodes = reader.read_episodes()
# Trajectories read from data/chunk-NNN/trajectories.parquet by episode_id
trajectory = reader.read_trajectory("train_000001")
```

## 3. Episode Fields

### 3.1 Required Fields for Evaluation

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `episode_id` | string | Yes | Unique identifier, format `{split}_{index}` |
| `scene_path` | string | Yes | Scene path, format `{dataset}/{scene_id}` |
| `task_type` | string | Yes | `pointnav` \| `imagenav` \| `objectnav` \| `vln` |
| `start_state` | object | Yes | `{position: [x,y,z], rotation: [qx,qy,qz,qw]}` |
| `goals` | array | Yes | At least one goal; see goal_type table below |
| `instructions` | array | VLN only | `[{instruction_text, language}]` |
| `gt_path` / `chunk_index` | object / int32 | Optional | Trajectory linked via chunk_index in Parquet format |

### 3.2 Goals Required Fields by Task Type

| Task Type | goal_type | Goals Required Fields |
|-----------|-----------|------------------------|
| PointNav | `position` | `position` |
| ImageNav | `image` | `image_goal.image_path`, `position` (for evaluation) |
| ObjectNav | `object` | `object_category`, `position` (for evaluation) |
| VLN | `position` | `position`, plus episode-level `instructions` |

Full field definitions are in [Navigation Training Data Format](nav-data-format.md) Sections 4–8.

## 4. Minimal Episode Example

A minimal PointNav evaluation Episode:

```json
{
  "episode_id": "eval_000001",
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
```

## 5. scene_path Resolution

The framework resolves `scene_path` to the absolute V1 asset directory:

```
absolute_path = $NAVARENA_DATA_DIR/assets/{scene_path}
```

E.g. `scene_path: "x2robot/17dc3367"` maps to `$NAVARENA_DATA_DIR/assets/x2robot/17dc3367/`, which must contain manifest.json, aligned.ply, nav_map.pgm, nav_map.yaml, etc.

## 6. Evaluation Data File Organization

Evaluation data shares the same directory structure as training data, using Parquet format:

```text
$NAVARENA_DATA_DIR/
├── datasets/
│   └── {dataset_name}/
│       └── {scene_path}/             # e.g. x2robot/17dc3367
│           └── {task_type}/
│               ├── meta/
│               │   ├── info.json
│               │   └── episodes.parquet
│               ├── data/
│               │   └── chunk-NNN/
│               │       ├── trajectories.parquet
│               │       └── episodes.parquet
│               └── goal_images/      # Required for ImageNav (optional dir)
└── assets/                           # V1 scene assets
```

## 7. Complete Examples

PointNav, ImageNav, ObjectNav, and VLN Episode logical structure is in [Training Data Format](nav-data-format.md) Section 4.

## 8. Notes

- All paths use relative paths; organize data as shown above.
- Ensure the V1 asset directory for `scene_path` exists and is complete.
