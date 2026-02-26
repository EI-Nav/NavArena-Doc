# Web Viewer

The asset preprocessing project includes a FastAPI-based 3DGS web viewer for browsing processed scene assets in a browser.

## Overview

- **WebGL 3DGS rendering** — Render scenes in-browser (e.g. GaussianSplats3D)
- **Dataset / scene browser** — Browse all scenes with `compressed.splat`
- **REST API** — Scene lists, metadata, splat files, thumbnails

## Starting the Viewer

```bash
cd navarena-forge
python -m web_viewer.main --assets-dir /path/to/navarena_assets --port 41005
```

### Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--assets-dir` | V1 assets root directory | `/x2robot_v2/share/navarena-bench/navarena_assets` |
| `--host` | Bind address | `0.0.0.0` |
| `--port` | Bind port | `41005` |
| `--log-level` | Log level | `info` |

## Display Condition

Only scenes that have `compressed.splat` appear in the list. Run the `compress` command first if you need web preview.

## API Endpoints

### List Datasets

```http
GET /api/datasets
```

**Response example:**
```json
[
  {"name": "x2robot", "scene_count": 42},
  {"name": "scenesplat", "scene_count": 15}
]
```

### List Scenes

```http
GET /api/datasets/{dataset}/scenes
```

**Response example:**
```json
[
  {
    "scene_id": "17dc3367",
    "source": {},
    "map_info": {"resolution": 0.05},
    "splat_size_mb": 12.5,
    "has_labels": true,
    "has_nav_mask": true
  }
]
```

### Scene Metadata

```http
GET /api/scenes/{dataset}/{scene_id}/metadata
```

Returns full manifest.json.

### Get compressed.splat

```http
GET /api/scenes/{dataset}/{scene_id}/compressed.splat
```

For WebGL clients to load the 3DGS scene. URL ends with `.splat` for format auto-detection.

### Thumbnail

```http
GET /api/scenes/{dataset}/{scene_id}/thumbnail
```

Returns `nav_mask.png` as scene thumbnail.

### labels.json

```http
GET /api/scenes/{dataset}/{scene_id}/labels
```

Returns `labels.json` if present.

## Frontend

Visit `http://localhost:41005/` for:

- Sidebar: dataset and scene list
- Main area: WebGL 3DGS rendering
- Scene metadata display
- Orbit / pan / zoom controls

!!! tip "Next Steps"
    - Return to **[Overview](overview.md)** for architecture
    - Use **[CLI Commands](cli.md)** to process scenes
