# Configuration

YAML configs live under `navarena_forge/configs/`. The **authoritative** default pipeline is **`pipeline.yaml`** in that folder (excerpt below).

## Config files

```
navarena_forge/configs/
├── pipeline.yaml                 # Full default pipeline (3 steps)
├── coordinate_normalize.yaml    # Standalone step
├── pcd_to_map.yaml
└── valid_region_estimate.yaml
```

## `pipeline.yaml` (reference)

The shipped file includes per-step `params` matching the implementation. Summary:

### `coordinate_normalize`

| Section | Purpose |
|---------|---------|
| `input` / `output` | Paths injected per scene by CLI (`ply_file`, `transformed_output`, `ground_output`, `extrinsic_matrix_output`, `downsampled_output`) |
| `ransac` | Ground plane RANSAC (`distance_threshold`, `ransac_n`, `num_iterations`) |
| `height_range` | Ground band in meters |
| `z_filter` | `auto_estimate`, optional `z_min` / `z_max` |
| `downsampling` / `verification_downsampling` | Voxel sizes for downsampling |

### `pcd_to_map`

| Section | Purpose |
|---------|---------|
| `input` / `output` | `pcd_file`, `pgm_file`, `yaml_file` (often injected) |
| `map` | `resolution`, `margins`, **`occupied_threshold`**, **`invert`** |
| `height_filter` | `min_z`, `max_z` for projection |
| **`ground_estimation`** | `grid_size`, `z_min`, `z_max` |

### `valid_region_estimate`

| Section | Purpose |
|---------|---------|
| `input` | `pgm_file`, `yaml_file` |
| **`parameters`** | **`occupied_threshold`**, **`margin`**, **`simplify`**, **`min_area`**, `dbscan_eps`, `dbscan_min_samples`, `alpha` |
| **`output`** | `description`, `tags` |
| Mask filename | CLI injects **`mask_filename: nav_mask.png`** when running `run-pipeline` / `batch` (not always present in the static YAML) |

### Optional fourth step

**`compress_ply`** is registered but **omitted** from the default `steps:` list; use **`python -m navarena_forge compress`** or extend `pipeline.yaml` if you need PLY → `compressed.splat` inside the same DAG.

## Standalone step configs

For `run-step`, use the matching `coordinate_normalize.yaml`, `pcd_to_map.yaml`, or `valid_region_estimate.yaml` and pass `--scene-dir` so the CLI can resolve paths.

```bash
python -m navarena_forge run-step coordinate_normalize \
  --config navarena_forge/configs/coordinate_normalize.yaml \
  --scene-dir /path/to/scene
```

**See also**: [CLI Commands](cli.md)
