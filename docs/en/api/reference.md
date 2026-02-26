# API Reference

This document provides API reference for the NavArena embodied navigation infrastructure. NavArena consists of four sub-projects: **Core Library** (navarena-core), **Asset Preprocessing** (navarena-forge), **Data Generator** (navarena-gen), and **Evaluation Framework** (navarena-bench).

## Data Generator API

For the complete Data Generator API, see [Data Generator API](data-generator-api.md).

### Main Classes

- `BaseGenerator` - Generator base class; registered subclasses: `PointNavGenerator`, `ImageNavGenerator`, `ObjectNavGenerator`, `VLNGenerator`
- `BaseSimEnv` - Simulation environment base class; `GSSimEnv` for 3D GS
- `BaseInstructionGenerator` - Instruction generator base class (VLN); registered subclasses: `SimpleDirectionInstructionGenerator`, `PathBasedInstructionGenerator`, `ObjectGoalInstructionGenerator`
- `GridAStarPlanner` - Global A* path planner
- `TwoStageTrajectoryPlanner` - Two-stage trajectory planner (A* + local smoothing)
- `DatasetWriter`, `TrajectoryWriter` - Data writers
- `GeneratorConfig` - Data generation configuration class

## Evaluation Framework API

For the complete Evaluation Framework API, see [Evaluation Framework API](navarena-bench-api.md).

### Main Classes

- `Evaluator` - Evaluator base class; registered subclasses: `PointNavEvaluator`, `ImageNavEvaluator`, `ObjectNavEvaluator`, `VLNEvaluator`
- `Env` - Environment base class; `GaussianSplattingEnv` for 3D GS
- `Agent` - Agent base class; registered subclasses: `LocalAgent`, `RemoteAgent`, `ViNTAgent`, `GNMAgent`, `NoMaDAgent`, `MultiModalNavAgent`, `LanguageNavAgent`
- `Dataset` - Dataset base class; `EpisodeDataset` implementation
- `Metric` - Metric base class; `NavigationMetrics` implementation

## Quick Reference

### Data Generator

```python
from navarena_gen.generators.base import BaseGenerator
from navarena_gen.config.base_config import GeneratorConfig

# Load config
config = GeneratorConfig.from_yaml("configs/examples/pointnav_example.yaml")

# Create generator
generator = BaseGenerator.init(config.task_type, config)

# Generate episodes
episodes = generator.generate()
```

### Evaluation Framework

```python
from navarena_bench.evaluator import Evaluator
from navarena_bench.configs.eval_config import EvalCfg

# Load config
config = EvalCfg.from_yaml("configs/eval/default_eval.yaml")

# Create evaluator
evaluator = Evaluator.init(config)

# Run evaluation
results = evaluator.evaluate()
```

## Full Documentation

- [Data Generator API](data-generator-api.md) - Complete Data Generator API
- [Evaluation Framework API](navarena-bench-api.md) - Complete Evaluation Framework API
