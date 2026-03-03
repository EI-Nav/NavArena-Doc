# Quickstart

This tutorial provides **minimal runnable examples** for the three modules to help you verify your setup. For detailed usage, see each module's user guide.

## Asset Preprocessing

Convert raw 3DGS PLY to V1 format. Prerequisites: raw PLY files (e.g. `/path/to/scenes/17dc3367/scene.ply`).

```bash
cd navarena-forge
python -m navarena_forge run-pipeline \
    --config navarena_forge/configs/pipeline.yaml \
    --scene-dir /path/to/scenes/17dc3367 \
    --source-dataset x2robot
```

Output is **written in-place** to the directory specified by `--scene-dir` (aligned.ply, nav_map.pgm, manifest.json, etc.). It does not automatically go to `$NAVARENA_DATA_DIR/assets/`. To centralize assets, place scene directories under `$NAVARENA_DATA_DIR/assets/` and pass the corresponding paths. For batch processing, see [Asset Preprocessing CLI](../asset-preprocessing/cli.md).

## Data Generation

Generate Episodes in V1 asset scenes. Prerequisites: completed preprocessing, scenes under `$NAVARENA_DATA_DIR/assets/`.

```bash
cd navarena-gen
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml
```

Use `--parallel --num-workers 4 --batch-size 20` for parallel generation. See [Data Generator Configuration](../data-generator/configuration.md).

## Evaluation

Evaluate navigation models in the 3D GS environment. Prerequisites: V1 assets + Episodes conforming to [evaluation data format](../definitions/eval-data-format.md).

```bash
cd navarena-bench
python -m navarena_bench.scripts.eval --config configs/eval/default_eval.yaml
```

Replay: `python scripts/replay_eval.py --results eval_results/ --output replay.mp4`. See [Evaluators](../navarena-bench/evaluators.md).

!!! tip "Next Steps"
    - See [User Guide](../guide/) for the full workflow
    - Dive into [Data Generator Pipeline](../data-generator/pipeline.md), [Evaluation Framework](../navarena-bench/), [Extending Guide](../navarena-bench/extending.md)
