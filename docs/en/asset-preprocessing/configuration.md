# Configuration

Asset preprocessing uses YAML config files. All configs live under `navarena_forge/configs/`.

## Config Structure

```
configs/
├── pipeline.yaml              # Full pipeline config
├── coordinate_normalize.yaml  # Standalone coordinate_normalize
├── pcd_to_map.yaml            # Standalone pcd_to_map
└── valid_region_estimate.yaml  # Standalone valid_region_estimate
```

## pipeline.yaml (Full Pipeline)

Defines the three core steps and their parameters. The CLI batch/run-pipeline commands inject per-scene paths automatically.

```yaml
steps:
  - name: coordinate_normalize
    enabled: true
    fatal: true
    params:
      input:
        ply_file: null       # Injected by CLI
      output:
        transformed_output: null
      ransac:
        distance_threshold: 0.02
        ransac_n: 3
        num_iterations: 1000
      height_range: [-0.05, 0.05]

  - name: pcd_to_map
    enabled: true
    fatal: true
    params:
      input:
        pcd_file: null
      output:
        pgm_file: null
        yaml_file: null
      map:
        resolution: 0.05
        margins: [1.0, 1.0, 1.0, 1.0]
      height_filter:
        min_z: 0.1
        max_z: 0.8

  - name: valid_region_estimate
    enabled: true
    fatal: false
    params:
      parameters:
        dbscan_eps: 5.0
        alpha: 0.6
```

## Parameter Reference

### coordinate_normalize

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ransac.distance_threshold` | RANSAC ground fit distance (meters) | `0.02` |
| `ransac.num_iterations` | RANSAC iterations | `1000` |
| `height_range` | Ground point Z range | `[-0.05, 0.05]` |

### pcd_to_map

| Parameter | Description | Default |
|-----------|-------------|---------|
| `map.resolution` | Map resolution (meters per pixel) | `0.05` |
| `height_filter.min_z` | Height filter lower bound | `0.1` |
| `height_filter.max_z` | Height filter upper bound | `0.8` |

### valid_region_estimate

| Parameter | Description | Default |
|-----------|-------------|---------|
| `parameters.dbscan_eps` | DBSCAN neighborhood radius (meters) | `5.0` |
| `parameters.dbscan_min_samples` | DBSCAN min samples | `1000` |
| `parameters.alpha` | Alpha Shapes parameter | `0.6` |

## Running a Single Step

With `run-step`, provide the step’s standalone config and set input/output paths explicitly:

```yaml
# coordinate_normalize.yaml
input:
  ply_file: /path/to/scene/source.ply

output:
  transformed_output: /path/to/scene/aligned.ply

ransac:
  distance_threshold: 0.02
```

```bash
python -m navarena_forge run-step coordinate_normalize \
    --config coordinate_normalize.yaml --scene-dir /path/to/scene
```

**See also**: [CLI Commands](cli.md)
