# 3D GS Asset Specification

This document defines the unified directory structure, file formats, and metadata specification for 3D Gaussian Splatting scene assets used in embodied navigation.

## 1. Directory Structure

```
navarena_assets/
├── SPEC.md                           # This specification document
├── {dataset}/                        # Dataset grouping directory
│   └── {scene_id}/                   # 8-character UUID short code
│       ├── manifest.json             # Scene metadata and provenance (required)
│       ├── source.ply                # Original 3DGS point cloud (required)
│       ├── aligned.ply               # Coordinate-normalized 3DGS point cloud (required)
│       ├── nav_map.pgm               # 2D occupancy grid map (required)
│       ├── nav_map.yaml              # ROS-compatible map config (required)
│       ├── nav_mask.png              # Valid region mask (required)
│       ├── labels.json               # Semantic object annotations (optional)
│       ├── structure.json            # Floor plan data (optional)
│       └── compressed.splat          # Compressed .splat binary (optional)
```

### Dataset Enumeration Values

| dataset | Description |
|---------|-------------|
| `InteriorGS` | InteriorGS synthetic indoor scenes |
| `scannetpp` | ScanNet++ real scanned scenes |
| `hypersim` | Hypersim synthetic scenes |
| `replica` | Replica synthetic scenes |
| `scenesplat` | SceneSplat pre-trained 3DGS scenes |
| `x2robot` | Custom robot scanned scenes |

### File Naming Rules

- All files use **fixed semantic names**, not prefixed with scene_id
- Scene directory name is the scene_id (8-character hex), not repeated in filenames
- No timestamp suffixes used

## 2. Scene ID Generation Rules

Scene ID is deterministically generated from `dataset` and original name, ensuring the same input always maps to the same ID:

```python
import hashlib

def generate_scene_id(original_name: str, dataset: str) -> str:
    """Deterministically generate 8-character hex scene_id."""
    raw = f"{dataset}:{original_name}"
    return hashlib.sha256(raw.encode()).hexdigest()[:8]
```

- Input format: `"{dataset}:{original_name}"`
- Output: First 8 characters of SHA-256 hex (approx. 430 million combinations)
- Collision handling: If collision occurs (probability < 0.0001%), extend to 12 characters

## 3. manifest.json Schema

```json
{
  "schema_version": "1.0",
  "scene_id": "a3f8b21c",

  "source": {
    "dataset": "InteriorGS",
    "subset": null,
    "original_id": "0001_839920",
    "original_name": "0001_839920",
    "url": null,
    "license": null
  },

  "files": {
    "source_ply": "source.ply",
    "aligned_ply": "aligned.ply",
    "nav_map": "nav_map.pgm",
    "nav_map_config": "nav_map.yaml",
    "nav_mask": "nav_mask.png",
    "labels": "labels.json",
    "structure": "structure.json",
    "compressed_ply": "compressed.splat"
  },

  "map_info": {
    "resolution": 0.05,
    "origin": [-7.61, -2.89, 0.0],
    "size": [288, 351]
  },

  "nav_region": {
    "area_m2": 45.2,
    "method": "alpha_shapes",
    "params": {"alpha": 0.6, "dbscan_eps": 5.0}
  },

  "processing": {
    "normalizer_version": "1.0.0",
    "processed_at": "2026-02-10T11:06:07Z",
    "normalized": true,
    "extrinsic_matrix": [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ],
    "steps": [
      {"name": "coordinate_normalize", "status": "success", "duration_s": 2.3},
      {"name": "pcd_to_map", "status": "success", "duration_s": 1.1},
      {"name": "valid_region_estimate", "status": "success", "duration_s": 0.8}
    ]
  },

  "tags": [],
  "created_at": "2026-02-10T11:00:14Z",
  "updated_at": "2026-02-10T11:06:07Z"
}
```

### Field Descriptions

#### source (Provenance, Required)

The `source` field in manifest.json records scene provenance; navarena-forge generates it automatically. Components such as navarena-core use this field to resolve the source dataset.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dataset` | string | Yes | Source dataset enumeration value |
| `subset` | string\|null | No | Sub-dataset identifier (e.g., `scannetpp_v2_mcmc_1.5M_3dgs`) |
| `original_id` | string | Yes | Scene ID in original dataset |
| `original_name` | string | Yes | Original directory name (preserved for reverse lookup) |
| `url` | string\|null | No | Original data download URL |
| `license` | string\|null | No | Data license identifier |

#### files (File Manifest, Required)

| Field | Type | Description |
|-------|------|-------------|
| `source_ply` | string\|null | Original 3DGS PLY (unnormalized) |
| `aligned_ply` | string\|null | Normalized 3DGS PLY (ground Z=0) |
| `nav_map` | string\|null | Occupancy grid map |
| `nav_map_config` | string\|null | YAML map config |
| `nav_mask` | string\|null | Valid region mask PNG |
| `labels` | string\|null | Semantic annotations JSON |
| `structure` | string\|null | Floor plan JSON |
| `compressed_ply` | string\|null | Compressed .splat binary (for Web viewer) |

All paths are **relative to the scene directory**. Value `null` indicates the file does not exist.

#### processing (Processing Summary)

| Field | Type | Description |
|-------|------|-------------|
| `normalizer_version` | string | navarena_forge version |
| `processed_at` | string | ISO 8601 processing completion time |
| `normalized` | bool | Whether coordinate normalization is complete |
| `extrinsic_matrix` | array | 4x4 homogeneous transformation matrix (source → aligned) |
| `steps` | array | Execution summary for each step |

#### map_info (Map Metadata)

| Field | Type | Description |
|-------|------|-------------|
| `resolution` | float | Meters per pixel |
| `origin` | [float, float, float] | Map origin world coordinates [x, y, z] |
| `size` | [int, int] | Map dimensions [width, height] in pixels |

#### nav_region (Valid Region Summary)

| Field | Type | Description |
|-------|------|-------------|
| `area_m2` | float | Valid region area in square meters |
| `method` | string | Region estimation algorithm |
| `params` | object | Algorithm parameters |

## 4. File Formats

### source.ply / aligned.ply

3D Gaussian Splatting PLY files (binary_little_endian).

Required attributes:
- `x`, `y`, `z` — Position
- `f_dc_0`, `f_dc_1`, `f_dc_2` — Spherical harmonic coefficients
- `opacity` — Opacity
- `scale_0`, `scale_1`, `scale_2` — Gaussian scale
- `rot_0`, `rot_1`, `rot_2`, `rot_3` — Rotation quaternion

`aligned.ply` coordinate convention: Ground-aligned Z=0, Z-axis up.

### nav_map.pgm

The occupancy grid map is stored as a PGM P5 (binary) grayscale image.

- Pixel value 0 = Occupied (black)
- Pixel value 255 = Free space (white)
- Image vertically flipped to match ROS convention

### nav_map.yaml

ROS-compatible map configuration file:

```yaml
image: nav_map.pgm
resolution: 0.05
origin: [-7.61, -2.89, 0.0]
negate: 0
occupied_thresh: 0.65
free_thresh: 0.25
```

The `image` field is fixed as `nav_map.pgm`.

### nav_mask.png

Grayscale PNG image, same dimensions as `nav_map.pgm`.

- Non-zero pixel = Valid region
- Zero pixel = Invalid region

### labels.json

```json
{
  "schema_version": "1.0",
  "labels": [
    {
      "instance_id": "bed_0",
      "category": "bed",
      "position": [1.23, 4.56, 0.0],
      "bounding_box": null,
      "confidence": 1.0,
      "source": "ground_truth"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `instance_id` | string | Unique instance identifier |
| `category` | string | Object category name |
| `position` | [float, float, float] | World coordinates [x, y, z] |
| `bounding_box` | object\|null | Optional 3D bounding box `{"min": [x,y,z], "max": [x,y,z]}` |
| `confidence` | float | Confidence (1.0 for ground truth) |
| `source` | string | Annotation source (`ground_truth` / `model_predicted`) |

### compressed.splat

Compact 3D Gaussian Splatting binary format, 32 bytes per Gaussian (little-endian), compatible with Web viewers (antimatter15/splat, gsplat.js, GaussianSplats3D, etc.).

**Field Layout** (32 bytes per Gaussian):

| Field | Type | Bytes | Description |
|-------|------|-------|-------------|
| x, y, z | 3 × float32 | 12 | World position |
| scale_x, scale_y, scale_z | 3 × float32 | 12 | Gaussian scale (`exp(raw_scale)`) |
| r, g, b, a | 4 × uint8 | 4 | Color (RGB) and opacity (alpha) |
| rot_0, rot_1, rot_2, rot_3 | 4 × uint8 | 4 | Normalized quaternion (quantized to [0, 255]) |

**Data Processing Rules**:

- **Color conversion**: From spherical harmonic coefficients (SH DC) to RGB: `RGB = clip((0.5 + SH_C0 * f_dc) * 255)`, where `SH_C0 = 0.28209479177387814`
- **Opacity**: From raw logit to alpha: `alpha = clip(sigmoid(opacity) * 255)`
- **Rotation quantization**: Quaternion normalized then mapped to [0, 255]: `rot_u8 = clip(rot_normalized * 128 + 128)`
- **Sorting**: Ordered by importance (volume × opacity) descending for progressive loading

**Generation**:

Generated from `aligned.ply` by the `compress_ply` step of `navarena_forge`. Optionally configure low-opacity Gaussian pruning (default threshold sigmoid(-5) ≈ 0.007).
