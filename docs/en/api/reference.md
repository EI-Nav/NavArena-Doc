# API Reference

This document provides API reference for the NavArena project. The project consists of two core sub-projects: Data Generator and Evaluation Framework.

## Data Generator API

For the complete Data Generator API, see [Data Generator API](data-generator-api.md).

### Main Classes

- `VLNDataPipeline` - Pipeline main class
- `SceneMetadata` - Scene metadata class
- `TargetSampler` - Target sampler
- `SemanticDetector` - Semantic detector
- `PathPlanner` - Path planner

## Evaluation Framework API

For the complete Evaluation Framework API, see [Evaluation Framework API](x2robot-nav-api.md).

### Main Classes

- `Evaluator` - Evaluator base class
- `Env` - Environment base class
- `Agent` - Agent base class
- `Dataset` - Dataset base class
- `Metric` - Metric base class

## Quick Reference

### Data Generator

```python
from src.pipeline.vln_data_generator import VLNDataPipeline

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
from x2robot_nav.evaluator import Evaluator
from x2robot_nav.configs.eval_config import EvalCfg

# Create evaluator
config = EvalCfg.from_yaml("configs/eval/default_eval.yaml")
evaluator = Evaluator.init(config)

# Run evaluation
results = evaluator.evaluate()
```

## Full Documentation

- [Data Generator API](data-generator-api.md) - Complete Data Generator API
- [Evaluation Framework API](x2robot-nav-api.md) - Complete Evaluation Framework API
