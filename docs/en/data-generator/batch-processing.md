# Batch Processing

The data generator supports single-scene and multi-scene batch generation, parallel episode generation, and resumable runs.

## Main Scripts

| Script | Purpose |
|--------|---------|
| `scripts/generate_data.py` | Main data generation entry |
| `scripts/render_episodes.py` | Goal images and trajectory video rendering |
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

# Render GridTraj in RGBD: keep RGB MP4 and additionally write depth PNG sequences
python scripts/render_episodes.py --scene x2robot/17dc3367 --task gridtraj --rgbd

# Explicit task dir (relative to $NAVARENA_DATA_DIR/datasets/, contains meta/ and data/)
python scripts/render_episodes.py --scene x2robot/17dc3367 \
    --dataset-name navarena_dataset_v1 --task pointnav
```

## Data Validation

The repository does not ship a standalone `validate_data.py`. You can write a script that reads `meta/episodes.parquet` and `data/chunk-*/trajectories.parquet` to check consistency (e.g. episode_id mapping, trajectory step counts).

## Web Viewer

```bash
python scripts/run_viewer.py --data-dir $NAVARENA_DATA_DIR/datasets
```

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--data-dir` | Data directory path | - |
| `--backend-port` | Backend service port | `8000` |
| `--frontend-port` | Frontend service port | `5173` |
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
        └── videos/             # optional
            ├── goal_images/    # ImageNav goal images (PNG)
            ├── goal_depth/     # ImageNav goal depth (PNG, optional)
            └── chunk-XXXXXX/
                └── {camera_name}/
                    ├── {episode_id}.mp4
                    └── depth/ (optional)
                        └── {episode_id}/frame_XXXXXX.png
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
