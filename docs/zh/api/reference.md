# API 参考

本文档提供 VLN 项目的 API 参考。VLN 项目包含两个核心子项目：数据生成器和评测框架。

## 数据生成器 API

数据生成器的详细 API 文档请参考 [数据生成器 API](data-generator-api.md)。

### 主要类

- `VLNDataPipeline` - Pipeline 主类
- `SceneMetadata` - 场景元数据类
- `TargetSampler` - 目标采样器
- `SemanticDetector` - 语义检测器
- `PathPlanner` - 路径规划器

## 评测框架 API

评测框架的详细 API 文档请参考 [评测框架 API](x2robot-nav-api.md)。

### 主要类

- `Evaluator` - 评测器基类
- `Env` - 环境基类
- `Agent` - 智能体基类
- `Dataset` - 数据集基类
- `Metric` - 指标基类

## 快速参考

### 数据生成器

```python
from src.pipeline.vln_data_generator import VLNDataPipeline

# 创建 Pipeline
pipeline = VLNDataPipeline(
    config_path="configs/main/pipeline.yaml",
    use_labels_file=False
)

# 运行 Pipeline
results = pipeline.run(stages=['stage1', 'stage2', 'stage3'])
```

### 评测框架

```python
from x2robot_nav.evaluator import Evaluator
from x2robot_nav.configs.eval_config import EvalCfg

# 创建评测器
config = EvalCfg.from_yaml("configs/eval/default_eval.yaml")
evaluator = Evaluator.init(config)

# 运行评测
results = evaluator.evaluate()
```

## 详细文档

- [数据生成器 API](data-generator-api.md) - 数据生成器的完整 API 文档
- [评测框架 API](x2robot-nav-api.md) - 评测框架的完整 API 文档
