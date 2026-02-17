# CLI Commands

Asset preprocessing exposes a command-line interface via `navarena_forge`. From the `NavArena-Forge` directory, run `python -m navarena_forge`.

## Command Overview

| Command | Description |
|---------|-------------|
| `run-pipeline` | Run full pipeline on one scene |
| `batch` | Batch process multiple scenes |
| `run-step` | Run a single step |
| `list-steps` | List all registered steps |
| `migrate` | Migrate legacy format to V1 |
| `compress` | Batch convert PLY to .splat |
| `convert-labels` | Convert labels.json to V1 format |

---

## run-pipeline

Run the full pipeline on a single scene directory.

```bash
python -m navarena_forge run-pipeline \
    --config pipeline.yaml \
    --scene-dir /path/to/scene \
    --source-dataset InteriorGS
```

### Arguments

| Argument | Description |
|----------|-------------|
| `--config` | **Required**, pipeline YAML config path |
| `--scene-dir` | Scene directory path |
| `--input-ply` | Override input PLY path |
| `--transformed-output` | Override normalized output path |
| `--source-dataset` | Source dataset name for manifest and scene_id |
| `--source-subset` | Source subset (optional) |

---

## batch

Batch-run the pipeline on all subdirectories under `--scenes-root`.

```bash
python -m navarena_forge batch \
    --scenes-root /path/to/scenes \
    --config pipeline.yaml \
    --source-dataset scannetpp
```

### Arguments

| Argument | Description |
|----------|-------------|
| `--scenes-root` | **Required**, root directory of scenes |
| `--config` | **Required**, pipeline config |
| `--force` | Re-process already-completed scenes |
| `--start` | Start scene name (inclusive) |
| `--end` | End scene name (inclusive) |
| `--source-dataset` | Source dataset name |
| `--source-subset` | Source subset |

Completed scenes (with `aligned.ply`, `nav_map.pgm`, `nav_map.yaml`) are skipped unless `--force` is used.

---

## run-step

Run a single step only.

```bash
python -m navarena_forge run-step coordinate_normalize \
    --config coordinate_normalize.yaml \
    --scene-dir /path/to/scene
```

### Arguments

| Argument | Description |
|----------|-------------|
| `step_name` | Step name (e.g. `coordinate_normalize`) |
| `--config` | Step-level YAML config |
| `--scene-dir` | Scene directory |

---

## list-steps

List all registered processing steps.

```bash
python -m navarena_forge list-steps
```

Example output:

```
  - coordinate_normalize
  - pcd_to_map
  - valid_region_estimate
  - compress_ply
```

---

## migrate

Copy existing scenes into a new V1 directory with standard filenames and manifest.json.

```bash
python -m navarena_forge migrate \
    --scenes-root /path/to/old/scenes \
    --output-root /path/to/navarena_assets \
    --source-dataset InteriorGS
```

### Arguments

| Argument | Description |
|----------|-------------|
| `--scenes-root` | **Required**, source scene root |
| `--output-root` | **Required**, destination V1 assets root |
| `--source-dataset` | **Required**, source dataset name |
| `--dry-run` | Print planned changes only, do not copy |
| `--start` / `--end` | Scene name range |

---

## compress

Batch-convert PLY files to compressed.splat in a V1 assets directory.

```bash
python -m navarena_forge compress \
    --assets-root /path/to/navarena_assets \
    --dataset scenesplat
```

### Arguments

| Argument | Description |
|----------|-------------|
| `--assets-root` | **Required**, V1 assets root |
| `--dataset` | Dataset subdirectory; if empty, scan assets-root |
| `--opacity-threshold` | Prune low-opacity Gaussians (default -5.0) |
| `--no-sort` | Disable importance-based sorting |
| `--force` | Overwrite existing .splat |
| `--dry-run` | Print plan only, do not write |

---

## convert-labels

Convert labels.json from legacy format to V1.

### Single File

```bash
python -m navarena_forge convert-labels \
    --input /path/to/labels.json \
    [--output /path/to/output.json]
```

### Batch

```bash
python -m navarena_forge convert-labels \
    --assets-root /path/to/navarena_assets \
    --dataset x2robot
```

---

## Global Options

All commands support:

- `-v` / `--verbose` — Enable debug logging

## Next Steps

- Use the **[Web Viewer](web-viewer.md)** to browse processed assets
