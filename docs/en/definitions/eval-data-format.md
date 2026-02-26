# Navigation Evaluation Data Format

This document defines the Episode and trajectory format required by the evaluation framework (navarena-bench). **Episode core fields, Goals, Instructions, GT Path, and GT trajectory file format** are identical to the [Navigation Training Data Format](nav-data-format.md). This page only describes evaluation-specific differences and organization.

!!! info "Relationship to Training Data"
    The evaluation data format is a **subset** of the [training data format](nav-data-format.md) Episode structure. Training data from navarena-gen includes goal_images, rendered_videos, etc.; the evaluation framework only requires Episodes JSON and gt_trajectories.

## 1. Differences from Training Format

| Aspect | Training Data (navarena-gen) | Evaluation Data (navarena-bench) |
|--------|------------------------------|----------------------------------|
| Directory structure | `scenes/{scene_id}/{task_type}/` | May be `datasets/{name}/{dataset}/{scene_id}/{task_type}/` or flat |
| Metadata | dataset_meta.json, scene_meta.json | Optional; Episodes file metadata is sufficient |
| Episode fields | Same as evaluation | Same as training; see [nav-data-format](nav-data-format.md) |
| Additional files | goal_images, rendered_videos | Only gt_trajectories required (goal_images for ImageNav) |

## 2. Top-Level Dataset Format

The top-level Episodes file structure supported by the evaluation framework:

```json
{
  "version": "1.0.0",
  "dataset_name": "navarena_bench",
  "metadata": {
    "task_types": ["pointnav", "imagenav", "objectnav", "vln"],
    "splits": ["train", "val_seen", "val_unseen", "test"]
  },
  "episodes": []
}
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
| `gt_path.trajectory_file` | string | Optional | Relative path to GT trajectory file |

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

Evaluation data is organized by scene and task type; `scene_path` is relative to `$NAVARENA_DATA_DIR/assets/`:

```text
$NAVARENA_DATA_DIR/
├── datasets/                        # Or custom data root
│   └── {dataset_name}/
│       └── {dataset}/{scene_id}/    # e.g. x2robot/17dc3367
│           └── {task_type}/
│               ├── train.json
│               ├── val.json
│               ├── gt_trajectories/
│               │   └── {split}_{idx}_gt.json
│               └── goal_images/    # Required for ImageNav
└── assets/                          # V1 scene assets
```

## 7. Complete Examples

PointNav, ImageNav, ObjectNav, and VLN Episode examples are in [Training Data Format - Complete Examples](nav-data-format.md) Section 9.

## 8. Notes

- All paths use relative paths; organize data as shown above.
- Ensure the V1 asset directory for `scene_path` exists and is complete.
