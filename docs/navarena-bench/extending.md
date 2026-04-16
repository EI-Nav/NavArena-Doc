# Extending NavArena-Bench

Extensions are organized around **environment facts**, **task evaluators**, **goal verifiers**, **metrics**, and **datasets**. **Agents are not registered inside bench** — implement them with **[navarena-server](../navarena-server/index.md)**.

Other NavArena packages:

- **navarena-forge** — pipeline `ProcessingStep` registration  
- **navarena-gen** — generators / envs / instruction strategies  

See the respective doc sections in this site.

---

## Evaluation framework (`navarena-bench`)

| Extension | Registration | Notes |
|-----------|--------------|--------|
| Environment | `@Env.register("name")` | Emit neutral facts only (pose, collision, distances) |
| Evaluator | `@Evaluator.register("name")` | Defines `TaskProtocol`, step logic, termination |
| Verifier | `@GoalVerifier.register("name")` | Used when success is not pure geometry |
| Metric | `@Metric.register("name")` | Declares compatible `task_type`s |
| Dataset | `Dataset.init` / `navarena.datasets` entry points | Load episodes |

### Custom evaluator (sketch)

Implement abstract methods on `Evaluator`:

- `build_protocol() -> TaskProtocol`
- `prepare_episode_context(episode, observation, recorder) -> dict`
- `evaluate_step(... ) -> EpisodeDecision | None`
- `finalize_episode(...) -> EpisodeDecision`

For a full verifier-backed evaluator sketch, follow the patterns in the **navarena-bench** source (`evaluator/` subclasses) and this site’s [Evaluators](evaluators.md) page.

### Custom verifier

Subclass `GoalVerifier` and implement `verify(observation, goal, *, info=..., episode=..., ...)`.

### Custom metric

Subclass `Metric`, set `supported_task_types`, implement `compute` / per-episode hooks as required by the base class.

### Custom environment

Subclass `Env`, register as `"my_env"`. Expose **`get_info()`** facts — not task success.

---

## Entry points (external packages)

Expose discovery without editing the bench source:

```toml
[project.entry-points."navarena.evaluators"]
mytask = "my_package.evaluator:MyTaskEvaluator"

[project.entry-points."navarena.verifiers"]
my_verifier = "my_package.verifier:MyVerifier"

[project.entry-points."navarena.envs"]
my_env = "my_package.env:MyEnv"

[project.entry-points."navarena.metrics"]
my_metric = "my_package.metrics:MyMetric"

[project.entry-points."navarena.datasets"]
my_dataset = "my_package.dataset:MyDataset"
```

Groups used by the codebase: **`navarena.evaluators`**, **`navarena.verifiers`**, **`navarena.envs`**, **`navarena.metrics`**, **`navarena.datasets`**.

There is **no** `navarena.agents` group.

---

## Testing and hygiene

- Import your module before `Evaluator.init` so decorators run.  
- Keep task types and `metrics_profile` consistent.  
- Use `navarena_core.logging.get_logger` for loggers.

**See also**: [Environment](environment.md) · [Evaluators](evaluators.md) · [Agent connection](agents.md)
