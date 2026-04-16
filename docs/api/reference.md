# API Reference

NavArena is split across **navarena-core**, **navarena-forge**, **navarena-gen**, **navarena-bench**, and **navarena-server**. This page summarizes entry points; see linked pages for detail.

## Core Library (navarena-core)

Shared configuration, Parquet I/O, episode models, GS rendering helpers. Details: [Core Library](../core/index.md).

**Imports:** most symbols come from submodules, e.g. `navarena_core.data`, `navarena_core.config` — not the package root.

- Config/path resolution: `BaseConfig`, `load_config`, `resolve_path`, `resolve_scene_dir`, `get_assets_dir`, …
- Data: `Episode`, `TrajectoryStep`, `ParquetDatasetReader`, writers, validation helpers

## Data Generator API

See [Data Generator API](data-generator-api.md).

- `BaseGenerator` — task implementations include PointNav, GridTraj, ImageNav, ObjectNav, VLN
- `BaseSimEnv`, `GSSimEnv`
- `BaseInstructionGenerator` + strategies for VLN
- Planners (`GridAStarPlanner`, two-stage smoothing) — used where applicable (**not** GridTraj whole-grid walk)
- `GeneratorConfig`, dataset writers

## Evaluation Framework API

See [Evaluation Framework API](navarena-bench-api.md).

- `Evaluator` — registered: `pointnav`, `objectnav`, `imagenav`
- `Env` — `gs` → `GaussianSplattingEnv`
- **`navarena_server`** WebSocket client inside the evaluator — no in-repo `Agent` registry
- `Metric` — multiple registered metrics (`sr`, `spl`, …) selected via profiles / `eval_settings.metrics`
- `Dataset` — Parquet episode loading

### Quick reference (bench)

```python
from navarena_bench.evaluator import Evaluator

evaluator = Evaluator.init(config)
evaluator.eval()   # returns None; read results.json under output_path
```

## Full Documentation

- [Core Library](../core/index.md)
- [Data Generator API](data-generator-api.md)
- [Evaluation Framework API](navarena-bench-api.md)
- [Model Server SDK](../navarena-server/index.md)
