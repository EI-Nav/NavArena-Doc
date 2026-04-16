# Agent connection (WebSocket)

navarena-bench does **not** ship an in-tree `navarena_bench.agent` package. The evaluation driver connects to your policy through **[navarena-server](https://github.com/EI-Nav/NavArena-Server)** using **WebSocket + msgpack**: the **bench is the client**, your process is the **server**.

Full SDK reference: **[Model Server SDK](../navarena-server/index.md)**.

## Roles

| Component | Role |
|-----------|------|
| **navarena-bench** | Loads episodes, steps the simulator, sends observations, receives actions, writes `results.json` |
| **navarena-server** | `NavigationModelServer` + `serve()` — listens on `ws://host:port`, implements `predict()` |
| **Your model** | Inside the server process; anything that can return waypoint or velocity actions |

## Configure the bench

Point `server` in your YAML to the agent URL (must match `eval_settings.action_space` — see [Model Server SDK](../navarena-server/index.md#action-spaces)):

```yaml
server:
  url: "ws://localhost:8765"
  timeout: 30.0
  image_format: "jpeg"   # or "png"; must match what you negotiate in practice

eval_settings:
  action_space: "waypoint"   # or "velocity"
```

CLI override replaces the entire `server` block with defaults for unspecified fields — prefer editing YAML if you rely on non-default `timeout` / `image_format`:

```bash
navarena-bench-eval --config navarena-bench/configs/eval/default_eval.yaml --server-url ws://127.0.0.1:9000
```

## Lifecycle (high level)

1. Bench connects WebSocket to `server.url`.
2. For each episode: **EPISODE_START** with task metadata → loop **OBSERVATION** / **ACTION** → **EPISODE_END** with summary fields.
3. Observations include multi-camera RGB (and optional depth), pose, and task-specific fields (`goal_category` for ObjectNav, `goal_image` for ImageNav, etc.).

## Observation pose

Position is a 3-vector; rotation is a quaternion **`[x, y, z, w]`** in environment/bench paths (aligned with `GaussianSplattingEnv`).

## Batch inference

If your model supports batched GPU inference across parallel episodes, override `batch_predict` on `NavigationModelServer`. The bench can run `batch_size > 1` when configured; see the server package README patterns in [Model Server SDK](../navarena-server/index.md#batch-mode).

## Dependencies

- **Hard dependency**: `navarena-server` (declared in `navarena-bench` `pyproject.toml`).
- Install agent side: `pip install -e navarena-server` (standalone clone) or via the NavArena workspace `uv sync`.

## FAQ

!!! question "Connection refused / timeout"
    Start your agent server **before** `navarena-bench-eval`. Check firewall and that `server.url` matches `host:port`.

!!! question "Action space mismatch"
    `eval_settings.action_space` must match what your `predict()` returns (`waypoint` vs `velocity`).

!!! question "Where is RemoteAgent / HTTP?"
    Not used. Use WebSocket only.

**See also**: [Evaluators](evaluators.md) · [Environment](environment.md) · [Model Server SDK](../navarena-server/index.md)
