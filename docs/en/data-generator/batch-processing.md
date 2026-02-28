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
    --parallel --num-workers 4 --batch-size 20
```

### Parallel and Chunking Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--parallel` | Enable parallel episode generation | `false` |
| `--num-workers` | Worker process count | `4` |
| `--batch-size` | Episodes per batch per worker | `20` |
| `--chunk-size` | Episodes per Parquet chunk | `1000` |

## Resume and Append Modes

- **`--resume`**: Resume from checkpoint. If `.{split}_checkpoint.json` exists, continue from last progress and skip completed episodes.
- **`--append`**: Append to existing dataset. Reads `meta/episodes.parquet`; new episode IDs start from max index + 1.
- **`--checkpoint-interval`**: Save checkpoint every N episodes (default 50).

```bash
# Resume after crash
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml --resume

# Append 500 episodes to existing dataset
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml \
    --num-episodes 500 --append
```

## Resumable Processing

- Output is organized by scene_path and task_type
- Use `--resume` to recover from checkpoint
- Use `--append` to add to existing dataset

## Trajectory Rendering

After generation, render with `render_episodes.py`. All paths resolve under `$NAVARENA_DATA_DIR`:

```bash
# Shorthand via --task (auto-derives data paths and camera config)
python scripts/render_episodes.py --scene x2robot/17dc3367 --task imagenav

# Render trajectories for other task types
python scripts/render_episodes.py --scene x2robot/17dc3367 --task pointnav

# Explicit task dir (relative to $NAVARENA_DATA_DIR/datasets/, contains meta/ and data/)
python scripts/render_episodes.py --scene x2robot/17dc3367 \
    --dataset-name navarena_dataset_v1 --task pointnav
```

## Data Validation

Paths are relative to `$NAVARENA_DATA_DIR/datasets/`:

```bash
# Shorthand via --scene + --task
python scripts/validate_data.py --scene x2robot/17dc3367 --task pointnav

# Via --scene + --task + --dataset-name
python scripts/validate_data.py --scene x2robot/17dc3367 --task pointnav --dataset-name navarena_dataset_v1

# Validate all datasets in directory
python scripts/validate_data.py navarena_dataset_v1/ --all

# Check if referenced files exist
python scripts/validate_data.py --scene x2robot/17dc3367 --task pointnav --check-files

# Verbose output
python scripts/validate_data.py --scene x2robot/17dc3367 --task pointnav --verbose
```

## Web Viewer

```bash
python scripts/run_viewer.py --data-dir $NAVARENA_DATA_DIR/datasets
```

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--data-dir` | Data directory path | - |
| `--port` | Backend service port | `5000` |
| `--skip-frontend` | Start backend only | `false` |
| `--skip-backend` | Start frontend only | `false` |

## Output Structure

All paths relative to `$NAVARENA_DATA_DIR/datasets/`:

```
{dataset_name}/
├── dataset_meta.json
└── {scene_path}/
    ├── scene_meta.json
    └── {task_type}/
        ├── meta/
        │   ├── info.json
        │   └── episodes.parquet
        ├── data/
        │   └── chunk-NNN/
        │       ├── trajectories.parquet
        │       └── episodes.parquet
        ├── goal_images/        # ImageNav (optional)
        └── rendered_videos/    # optional
```

## FAQ

!!! question "Scene not preprocessed"
    Ensure scenes are in V1 format via [Asset Preprocessing](../asset-preprocessing/) (manifest.json, nav_map.pgm, etc.).

!!! question "ObjectNav has no objects"
    Scene needs labels.json from asset preprocessing or semantic detection.

!!! question "Parallel out of memory"
    Reduce `--num-workers` or `task_config.max_start_points`.

!!! tip "Next Steps"
    - See **[Configuration](configuration.md)**
    - Learn **[Asset Preprocessing](../asset-preprocessing/)**
