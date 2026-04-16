# Batch processing

Single-scene configs, CLI overrides, parallel workers, rendering, Explorer, and maintenance scripts.

## Main scripts

| Script | Purpose |
|--------|---------|
| `scripts/generate_data.py` | Main Parquet generation (**requires `--config`**) |
| `scripts/render_episodes.py` | Goal images + trajectory videos |
| `scripts/run_viewer.py` | Explorer UI (backend + frontend) |
| `scripts/export_data.py` | Export / packaging helpers (e.g. WebDataset, project-specific) |
| `scripts/rebuild_index.py` | Rebuild dataset indices |
| `scripts/clean_incomplete_data.py` | Remove incomplete chunks / repair state |
| `scripts/split_dataset_by_scene.py` | Split datasets by scene |
| `scripts/delete_data.py` | Delete dataset paths with safeguards |

## Single scene

From repo root (example):

```bash
conda run -n navarena python navarena-gen/scripts/generate_data.py \
  --config navarena-gen/configs/examples/pointnav_example.yaml
```

## Multi-scene batch

There is no checked-in `usage_examples.py`. Use a shell loop or a small Python script that invokes `generate_data.py` per scene with `--scene`:

```bash
for id in 17dc3367 a1b2c3d4; do
  conda run -n navarena python navarena-gen/scripts/generate_data.py \
    --config navarena-gen/configs/examples/pointnav_example.yaml \
    --scene "x2robot/${id}"
done
```

## Parallel episode generation

```bash
python scripts/generate_data.py \
  --config configs/examples/pointnav_example.yaml \
  --parallel --num-workers 4 --batch-size 20
```

| Argument | Description | Default |
|----------|-------------|---------|
| `--parallel` | Enable worker pool | off |
| `--num-workers` | Processes | `4` |
| `--batch-size` | Episodes per batch unit | `20` |
| `--chunk-size` | Episodes per Parquet chunk | `1000` |

## Resume and append

- **`--resume`** — Continue from `.{split}_checkpoint.json`  
- **`--append`** — Append to existing `meta/episodes.parquet`  
- **`--checkpoint-interval`** — Save checkpoint every N episodes (default **50**)

```bash
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml --resume
```

## Trajectory rendering

```bash
python scripts/render_episodes.py --renderer gs \
  --scene x2robot/17dc3367 --task imagenav

python scripts/render_episodes.py --scene x2robot/17dc3367 --task gridtraj --rgbd

python scripts/render_episodes.py \
  --scene x2robot/17dc3367 --dataset-name navarena_dataset_v1 --task pointnav
```

`--task` is **required** by the script (it derives paths under `$NAVARENA_DATA_DIR`).

## Web Explorer

```bash
python scripts/run_viewer.py --data-dir "$NAVARENA_DATA_DIR/datasets"
```

| Argument | Description | Default |
|----------|-------------|---------|
| `--data-dir` | Root for datasets | `$NAVARENA_DATA_DIR` if omitted |
| `--backend-port` | API port | `8000` |
| `--frontend-host` | Bind address for Vite | `0.0.0.0` |
| `--frontend-port` | Frontend port | `5173` |
| `--dataset-name` | Filter / default dataset name | (see script help) |
| `--skip-frontend` / `--skip-backend` | Start one side only | off |
| `--export-gpus` | GPUs for export pipeline | `0` |
| `--export-encode-workers` | Encoder threads (`0` = auto) | `0` |
| `--export-prefetch-workers` | Prefetch threads | `2` |

## Output layout (reminder)

Under `$NAVARENA_DATA_DIR/datasets/{dataset_name}/{scene_path}/{task_type}/`:

- `meta/`, `data/chunk-*/`  
- Optional **`videos/`** with `goal_images/`, per-chunk MP4s, etc.

## FAQ

!!! question "Scene not preprocessed"
    Run [Asset Preprocessing](../asset-preprocessing/) first.

!!! question "Parallel OOM"
    Lower `--num-workers` or reduce sampling load in `task_config`.

**See also**: [Configuration](configuration.md) · [Asset Preprocessing](../asset-preprocessing/)
