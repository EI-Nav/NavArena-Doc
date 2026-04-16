# Web Viewer

FastAPI service + static page for browsing **V1** assets that include **`compressed.splat`**.

## Starting the viewer

From `navarena-forge/`:

```bash
python -m web_viewer.main --port 41005
python -m web_viewer   # equivalent if package exposes __main__
```

| Argument | Default |
|----------|---------|
| `--assets-dir` | **`$NAVARENA_DATA_DIR/assets`** via `navarena_core.config.path_resolver.get_assets_dir()` when omitted |
| `--host` | `0.0.0.0` |
| `--port` | `41005` |
| `--log-level` | `info` |

Only scenes with **`compressed.splat`** appear in the browser list — run **`compress`** first if needed.

## API summary

### Datasets and scenes

```http
GET /api/datasets
GET /api/datasets/{dataset}/scenes
```

Scene list entries include: `scene_id`, `source`, `map_info`, `splat_size_mb`, `has_labels`, **`has_label_sources`**, **`label_source_count`**, `has_nav_mask`.

### Scene payload

```http
GET /api/scenes/{dataset}/{scene_id}/metadata
GET /api/scenes/{dataset}/{scene_id}/compressed.splat
GET /api/scenes/{dataset}/{scene_id}/thumbnail
GET /api/scenes/{dataset}/{scene_id}/labels
```

### Label sources (read/write)

```http
GET  /api/scenes/{dataset}/{scene_id}/label-sources
GET  /api/scenes/{dataset}/{scene_id}/labels/{source_name}
PUT  /api/scenes/{dataset}/{scene_id}/labels/{source_name}
DELETE /api/scenes/{dataset}/{scene_id}/labels/{source_name}
```

- `source_name == "default"` maps to the root `labels.json` and is **read-only** for PUT/DELETE.

### Reviews

```http
GET /api/scenes/{dataset}/{scene_id}/reviews/{source_name}
PUT /api/scenes/{dataset}/{scene_id}/reviews/{source_name}
```

### UI

`GET /` serves the single-page viewer (`static/index.html`).

## Ops

Optional helper: `web_viewer/service.sh` in the forge repo for process management.

**See also**: [Overview](index.md) · [CLI Commands](cli.md)
