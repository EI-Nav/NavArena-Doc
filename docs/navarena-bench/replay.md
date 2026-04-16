# Replay and recorded data

Evaluation **does not** ship a `replay_eval.py` CLI or a `BaseReplayer` / `VideoReplayer` hierarchy. For analysis of saved runs, use the **`ReplayLoader`** API and the on-disk layouts produced when **recording** is enabled.

## What exists in code

- **`ReplayLoader`** (`navarena_bench.replay.loader`) — Loads per-episode replay bundles.
- **`ReplayEpisodeData` / `ReplayStepData`** — Structured in-memory view of steps.

Supported **on-disk** layouts:

1. **Current: Parquet + MP4** — Under each `episode_<id>/` directory: `metadata.parquet`, `steps.parquet`, and optionally `observations.mp4` (frames aligned to step indices).  
2. **Legacy: JSON** — `metadata.json`, `steps.json`, optional per-step image files.

Install recording extras: `pip install -e "navarena-bench[recording]"` (PyArrow, imageio/ffmpeg).

## Directory layout (typical)

```
eval_results/
├── results.json
├── checkpoint.json          # if resuming
└── episode_<episode_id>/
    ├── metadata.parquet     # or metadata.json (legacy)
    ├── steps.parquet        # or steps.json
    ├── observations.mp4     # optional; frame index == step
    ├── goal_image.png       # optional (ImageNav)
    └── ...
```

Enable trajectory / replay capture with `eval_settings.save_trajectories` / `save_replay_data` as implemented in your bench version (see `EvalCfg` and recorder modules).

## Using `ReplayLoader`

```python
from navarena_bench.replay.loader import ReplayLoader

loader = ReplayLoader("/path/to/eval_results")
episode = loader.load_episode("000123")
if episode is None:
    raise SystemExit("episode not found")

# Access steps; load a frame from observations.mp4 if present
from navarena_bench.replay.loader import ReplayLoader  # already imported
step0 = episode.steps[0]
img = loader.load_observation_image(episode, step0)
```

`load_goal_image` / `load_waypoint_image` help with ImageNav-style assets when files exist beside the episode directory.

## Hub and viewers

For interactive browsing of **`results.json`** and recorded media, install **`navarena-bench[hub]`** and run **`navarena-bench-hub`** (see [Evaluation overview](index.md)).

## FAQ

!!! question "No episode_* folders"
    Recording was disabled or the run failed before writing. Check `eval_settings` and disk permissions.

!!! question "Video codec errors"
    Ensure `imageio[ffmpeg]` is installed in the same environment as the bench.

**See also**: [Evaluators](evaluators.md) · [Evaluation overview](index.md)
