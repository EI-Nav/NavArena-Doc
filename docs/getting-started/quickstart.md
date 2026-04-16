# Quickstart

This tutorial provides **minimal runnable examples** for the main pipeline (**forge → gen → bench**) plus pointers to **navarena-core** / **navarena-server**. For details, see each section in the User Guide.

!!! tip "Path placeholders"
    Replace `/path/to/scenes/` or `/path/to/raw_scenes/` with your actual data directory. For centralized asset management, use `$NAVARENA_DATA_DIR/assets/{dataset}/{scene_id}/` (e.g. `$NAVARENA_DATA_DIR/assets/x2robot/17dc3367/`).

## End-to-End Workflow

The preprocessing → dataset → evaluation steps run in order; each step consumes the previous artifact (raw PLY → V1 assets → Parquet episodes → `results.json`). Implement policies with **navarena-server** separately.

---

## Asset Preprocessing

**Prerequisites**: Raw 3DGS PLY files (e.g. `{scene_dir}/scene.ply`).

**Command**:

```bash
cd navarena-forge
python -m navarena_forge run-pipeline \
    --config navarena_forge/configs/pipeline.yaml \
    --scene-dir /path/to/scenes/17dc3367 \
    --source-dataset x2robot
```

**Expected output**: The pipeline writes **in-place** to `--scene-dir`: `aligned.ply`, `nav_map.pgm`, `manifest.json`, `nav_map.yaml`, `nav_mask.png`, etc.

!!! note "Asset centralization"
    Output does not automatically go to `$NAVARENA_DATA_DIR/assets/`. To centralize assets, place scene directories under `$NAVARENA_DATA_DIR/assets/` and pass the corresponding paths. For batch processing, see [Asset Preprocessing CLI](../asset-preprocessing/cli.md).

---

## Data Generation

**Prerequisites**: Completed preprocessing (V1 assets), scenes under `$NAVARENA_DATA_DIR/assets/`.

**Command**:

```bash
cd navarena-gen
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml
```

**Expected output**: Episodes and trajectories written to `$NAVARENA_DATA_DIR/datasets/` (or config-specified output path). Check for `meta/episodes.parquet` and `data/chunk-*/trajectories.parquet`.

Use `--parallel --num-workers 4 --batch-size 20` for parallel generation. See [Data Generator Configuration](../data-generator/configuration.md).

---

## Evaluation

**Prerequisites**: V1 assets + Episodes conforming to [evaluation data format](../definitions/eval-data-format.md).

**Command**:

```bash
cd navarena-bench
python -m navarena_bench.scripts.eval --config configs/eval/default_eval.yaml
```

**Expected output**: Evaluation results in `eval_results/` (or config-specified path). Metrics (SR, SPL, etc.) printed to console.

Replay: `python scripts/replay_eval.py --results eval_results/ --output replay.mp4`. See [Evaluators](../navarena-bench/evaluators.md).

---

!!! tip "Next Steps"
    - See [User Guide](../guide/) for the full workflow
    - Dive into [Data Generator Pipeline](../data-generator/pipeline.md), [Evaluation Framework](../navarena-bench/), [Extending Guide](../navarena-bench/extending.md)
