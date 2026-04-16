# CLI Commands

Run from the **NavArena repo root** (or `navarena-forge/`) with the `navarena` environment:

```bash
python -m navarena_forge <command> ...
```

Use **repository-relative** config paths, e.g. `navarena_forge/configs/pipeline.yaml`.

## Command overview

| Command | Description |
|---------|-------------|
| `run-pipeline` | Full default pipeline on one scene |
| `batch` | Batch over many scene directories |
| `run-step` | Single step |
| `list-steps` | List registered steps (includes `compress_ply`) |
| `migrate` | Copy legacy trees into V1 layout |
| `compress` | Batch PLY → `compressed.splat` |
| `convert-labels` | Normalize `labels.json` |

---

## run-pipeline

```bash
python -m navarena_forge run-pipeline \
  --config navarena_forge/configs/pipeline.yaml \
  --scene-dir /path/to/scene \
  --source-dataset InteriorGS
```

| Argument | Description |
|----------|-------------|
| `--config` | **Required** — pipeline YAML |
| `--scene-dir` | Scene directory |
| `--input-ply` | Override input PLY |
| `--transformed-output` | Override normalized output |
| `--source-dataset` | Dataset name for manifest / hashing |
| `--source-subset` | Optional subset tag |

---

## batch

```bash
python -m navarena_forge batch \
  --scenes-root /path/to/scenes \
  --config navarena_forge/configs/pipeline.yaml \
  --source-dataset scannetpp
```

| Argument | Description |
|----------|-------------|
| `--scenes-root` | **Required** |
| `--config` | **Required** |
| `--force` | Re-process completed scenes |
| `--start` / `--end` | Optional scene name range |
| `--source-dataset` | Dataset name |
| `--source-subset` | Optional subset |

Scenes that already have `aligned.ply` + `nav_map.pgm` + `nav_map.yaml` are skipped unless `--force`.

---

## run-step

```bash
python -m navarena_forge run-step coordinate_normalize \
  --config navarena_forge/configs/coordinate_normalize.yaml \
  --scene-dir /path/to/scene
```

`--config` may be omitted only if the step tolerates empty params (advanced).

---

## list-steps

```bash
python -m navarena_forge list-steps
```

---

## migrate

```bash
python -m navarena_forge migrate \
  --scenes-root /path/to/old/scenes \
  --output-root /path/to/navarena_assets \
  --source-dataset InteriorGS \
  --source-subset my_subset
```

| Argument | Description |
|----------|-------------|
| `--source-subset` | Optional; recorded in provenance when set |
| `--dry-run` | Plan only |
| `--start` / `--end` | Scene name range |

---

## compress

```bash
python -m navarena_forge compress \
  --assets-root /path/to/navarena_assets \
  --dataset scenesplat \
  --start scene_a --end scene_z
```

| Argument | Description |
|----------|-------------|
| `--start` / `--end` | Optional inclusive scene name range |
| `--force` | Overwrite existing `.splat` |
| `--dry-run` | Plan only |
| (others) | `--opacity-threshold`, `--no-sort` — see `--help` |

---

## convert-labels

**Single file**

```bash
python -m navarena_forge convert-labels \
  --input /path/to/labels.json \
  --output /path/to/out.json
```

**Batch**

```bash
python -m navarena_forge convert-labels \
  --assets-root "$NAVARENA_DATA_DIR/assets" \
  --dataset x2robot \
  --force --dry-run
```

| Argument | Description |
|----------|-------------|
| `--force` | Re-convert even if already V1 |
| `--dry-run` | Validate only |
| `--start` / `--end` | Scene range in batch mode |

---

## Global options

`-v` / `--verbose` — debug logging

**See also**: [Web Viewer](web-viewer.md)
