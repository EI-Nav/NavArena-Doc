# Pipeline stages

These are **logical** stages implemented across `navarena_gen` modules (there is no separate `navarena_gen/stages/` package). Flow: **env init → episode generation → (VLN) instructions → Parquet write → optional rendering**.

## Stage 1: Environment initialization

Load the V1 scene under `$NAVARENA_DATA_DIR/assets/{scene_path}`:

- `manifest.json`, `nav_map.pgm`, `nav_map.yaml`
- Optional `nav_mask.png`, `labels.json`

Initialize the GS simulation backend and, for tasks that need shortest paths, the **grid + A\*** planner.

## Stage 2: Episode generation

Task-specific **generators** (under `navarena_gen/generators/`) produce starts, goals, and `gt_path`.

### PointNav, ImageNav, ObjectNav, VLN

Typical pattern:

1. Sample valid starts (grid / constraints).  
2. Sample goals with distance constraints.  
3. Plan a **GT trajectory** (e.g. global planning + smoothing) subject to `trajectory_constraints`.

### GridTraj

**GridTraj does not follow the same “random start + random goal + A\* between them” story.** It enumerates collision-free grid points from the environment and writes a **single** episode trajectory that visits those points in generation order (no extra inter-point planner). Do not apply the generic “two-stage A\*” description to GridTraj.

## Stage 3: Instruction generation (VLN)

For `task_type: vln`, instruction generators (e.g. `simple_direction`, `path_based`, `object_goal`) attach natural-language instructions. Languages are selected via config (`zh-CN`, `en-US`, …).

| Strategy | Role |
|----------|------|
| `simple_direction` | Coarse direction + distance style text |
| `path_based` | Instructions aligned with path structure |
| `object_goal` | Object-centric wording when goals are object-based |

## Stage 4: Data writing

Streaming writes to:

- `meta/episodes.parquet`, `meta/info.json`
- `data/chunk-XXXXXX/trajectories.parquet` (and per-chunk episode metadata as implemented)

Chunk directory names use **zero-padded** indices (e.g. 6 digits) — see `navarena_core.data.parquet_io` for the canonical pattern.

Checkpoint file `.{split}_checkpoint.json` supports `--resume`.

## Stage 5: Rendering (optional)

Run **`scripts/render_episodes.py`** separately. Outputs typically live under the task directory in **`videos/`** (e.g. goal images, per-episode MP4s). Paths may include `videos/goal_images/` for ImageNav.

---

```mermaid
graph LR
    E1[EnvInit] --> E2[EpisodeGen]
    E2 --> E3[InstructionGen]
    E3 --> E4[DataWrite]
    E4 -.optional.-> E5[Render]
```

**See also**: [Configuration](configuration.md) · [Batch Processing](batch-processing.md) · [Navigation Training Data Format](../definitions/nav-data-format.md)
