# Environment module

The **`gs`** environment (`GaussianSplattingEnv`) renders RGB (+ optional depth) with 3D Gaussian Splatting, maintains robot pose on the **XY plane**, and reports **collision** and **path length** from an occupancy grid. It does **not** decide task success — evaluators interpret `info` and observations.

!!! note "Yaw-only 2D navigation"
    The GS env updates **x, y, yaw** only; pitch/roll are not used for stepping. This matches the design described in the upstream bench README.

## Class and registration

- Registered name: **`gs`** (`@Env.register("gs")`).
- Constructed via `Env.init(env_cfg, task_cfg)` with `env_type: "gs"`.

## Configuration (`GSEnvConfig`)

Scene geometry is **not** a single `scene_dir` field on the config: each **episode** carries `scene_path` (and assets resolve under `$NAVARENA_DATA_DIR`). Relevant `env_settings` keys:

| Field | Role |
|-------|------|
| `camera_config` | Path to intrinsics/extrinsics YAML |
| `enable_occupancy` | Use nav map for collision |
| `success_distance` | Geometric success radius (meters); also used for metric defaults |
| `rotation_threshold` | Rotation tolerance where applicable (radians) |
| `robot_radius` | Footprint inflation for occupancy collision (meters), default `0.4` |
| `gpu_id` | Optional GPU index |
| `enable_depth` / `enable_rgb` | Render toggles |
| `camera_names` | List of camera frame ids (defaults `face`, `left`, `right`; eval YAMLs often use e.g. `camera_head_front_color_optical_frame`) |
| `image_width` / `image_height` | Rendering resolution |

Example (abbreviated):

```yaml
env:
  env_type: "gs"
  env_settings:
    camera_config: "${NAVARENA_DATA_DIR}/shared/camera.yaml"
    enable_occupancy: true
    success_distance: 0.5
    robot_radius: 0.4
    enable_depth: false
    enable_rgb: true
    camera_names: ["camera_head_front_color_optical_frame"]
    image_width: 640
    image_height: 480
```

## `reset` / `step`

- **`reset(episode)`** — Loads scene from episode `scene_path`, places robot, returns first observation dict with `rgb` (per camera), `position`, `rotation` (quaternion **`[x, y, z, w]`**), etc.
- **`step(action)`** — Applies low-level controller for waypoint or velocity actions (depending on runner + `action_space`). Returns `observation`, `reward` (unused), `done`, `info`.

## `get_info()` (environment facts)

Typical keys (see `navarena_bench.env.gs_env.GaussianSplattingEnv.get_info`):

- `episode_step`, `path_length`
- `robot_position`, `robot_rotation`, `robot_yaw`
- `collision` — last-step collision flag
- `position_goal_distance`, `position_goal_start_distance`, optional `position_goal_rotation_error` — geometry anchors for goal-based tasks
- `occupancy_grid` — serialized grid info when enabled

There is **no** generic `success` or `geodesic_distance` key here — success is determined by the **evaluator** from protocol + `info` + optional **verifier**.

## Occupancy and maps

Maps load from each scene’s V1 layout (`nav_map.pgm`, `nav_map.yaml`) under the resolved asset directory. See [3D GS asset specification](../definitions/gs-assets.md).

## Goals in episodes

- **PointNav** — Position (and optional rotation) goals.
- **ObjectNav** — Category / instance fields as in Parquet episodes; verifier may use observations.
- **ImageNav** — Use structured fields such as `image_goal` / `image_path` as produced by navarena-gen (see [evaluation data format](../definitions/eval-data-format.md)); do not rely on a loose `"image"`-only field.

## Performance

Lower resolution, disable depth, or pin `gpu_id` to reduce load.

**See also**: [Agent connection](agents.md) · [Evaluators](evaluators.md) · [Extending](extending.md)
