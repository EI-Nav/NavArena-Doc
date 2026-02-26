# Batch Processing

The data generator supports single-scene and multi-scene batch generation, parallel episode generation, and resumable runs.

## Main Scripts

| Script | Purpose |
|--------|---------|
| `scripts/generate_data.py` | Main data generation entry |
| `scripts/render_episodes.py` | Goal images and trajectory video rendering |
| `scripts/validate_data.py` | Validate generated data |
| `scripts/run_viewer.py` | Web viewer launcher |

## Single Scene

```bash
cd navarena-gen
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml
```

## Multi-Scene Batch

Loop over scenes or use a custom script:

```python
# Example: examples/usage_examples.py
import subprocess

scenes = ["17dc3367", "a1b2c3d4"]
for scene_id in scenes:
    subprocess.run([
        "python", "scripts/generate_data.py",
        "--config", "configs/examples/pointnav_example.yaml",
        "--scene", f"x2robot/{scene_id}",
    ], check=True)
```

Or run multiple times with different `scene_path` in the config.

## Parallel Episode Generation

Use `--parallel` for multi-process episode generation:

```bash
python scripts/generate_data.py \
    --config configs/examples/vln_zh_example.yaml \
    --parallel --num-workers 4 --io-workers 8
```

### Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--parallel` | Enable parallel episode generation | `false` |
| `--num-workers` | Worker process count | `4` |
| `--io-workers` | Parallel I/O threads | `8` |

## Resumable Processing

- Output is organized by scene_id and task_type
- Re-running the same scene + task may append or overwrite episodes
- Use different `split` or output dirs to separate runs

## Trajectory Rendering

After generation, render with `render_episodes.py`. All paths resolve under `$NAVARENA_DATA_DIR`:

```bash
# Shorthand via --task (auto-derives data paths and camera config)
python scripts/render_episodes.py --scene x2robot/17dc3367 --task imagenav

# Render trajectories for other task types
python scripts/render_episodes.py --scene x2robot/17dc3367 --task pointnav

# Explicit data path (relative to $NAVARENA_DATA_DIR/datasets/)
python scripts/render_episodes.py --scene x2robot/17dc3367 \
    --trajectories-dir navarena_vln/x2robot/17dc3367/imagenav/gt_trajectories
```

## Data Validation

Paths are relative to `$NAVARENA_DATA_DIR/datasets/`:

```bash
# Shorthand via --scene + --task
python scripts/validate_data.py --scene x2robot/17dc3367 --task pointnav

# Relative path
python scripts/validate_data.py navarena_vln/x2robot/17dc3367/pointnav/train.json

# Validate all JSON files in directory
python scripts/validate_data.py navarena_vln/ --all

# Check if referenced files exist
python scripts/validate_data.py --scene x2robot/17dc3367 --task pointnav --check-files

# Verbose output
python scripts/validate_data.py --scene x2robot/17dc3367 --task pointnav --verbose
```

## Web Viewer

```bash
python scripts/run_viewer.py --data-dir $NAVARENA_DATA_DIR/datasets

# Optional: --port, --skip-frontend, --skip-backend
```

## Output Structure

```
navarena_data/
├── dataset_meta.json
└── scenes/
    └── {scene_id}/
        ├── scene_meta.json
        └── {task_type}/
            ├── train.json
            ├── gt_trajectories/
            ├── goal_images/        # ImageNav
            └── rendered_videos/
```

## FAQ

!!! question "Scene not preprocessed"
    Ensure scenes are in V1 format via [Asset Preprocessing](../asset-preprocessing/overview.md) (manifest.json, nav_map.pgm, etc.).

!!! question "ObjectNav has no objects"
    Scene needs labels.json from asset preprocessing or semantic detection.

!!! question "Parallel out of memory"
    Reduce `--num-workers` or `task_config.max_start_points`.

## Next Steps

- See **[Configuration](configuration.md)**
- Learn **[Asset Preprocessing](../asset-preprocessing/overview.md)**
