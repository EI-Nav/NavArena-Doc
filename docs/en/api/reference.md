# API Reference

This document provides API reference for the NavArena project. The project consists of three core sub-projects: Asset Preprocessing, Data Generator, and Evaluation Framework.

## Data Generator API

For the complete Data Generator API, see [Data Generator API](data-generator-api.md).

### Main Classes

- `VLNDataPipeline` - Pipeline main class
- `SceneMetadata` - Scene metadata class
- `TargetSampler` - Target sampler
- `SemanticDetector` - Semantic detector
- `PathPlanner` - Path planner

## Evaluation Framework API

For the complete Evaluation Framework API, see [Evaluation Framework API](navarena-bench-api.md).

### Main Classes

- `Evaluator` - Evaluator base class
- `Env` - Environment base class
- `Agent` - Agent base class
- `Dataset` - Dataset base class
- `Metric` - Metric base class

## Quick Reference

### Data Generator

```python
from src.pipeline.navarena_gen import VLNDataPipeline

# Create Pipeline
pipeline = VLNDataPipeline(
    config_path="configs/main/pipeline.yaml",
    use_labels_file=False
)

# Run Pipeline
results = pipeline.run(stages=['stage1', 'stage2', 'stage3'])
```

### Evaluation Framework

```python
from navarena_bench.evaluator import Evaluator
from navarena_bench.configs.eval_config import EvalCfg

# Create evaluator
config = EvalCfg.from_yaml("configs/eval/default_eval.yaml")
evaluator = Evaluator.init(config)

# Run evaluation
results = evaluator.evaluate()
```

## Full Documentation

- [Data Generator API](data-generator-api.md) - Complete Data Generator API
- [Evaluation Framework API](navarena-bench-api.md) - Complete Evaluation Framework API
