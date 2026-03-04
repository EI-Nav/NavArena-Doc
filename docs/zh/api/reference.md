# API 参考

本文档提供 NavArena 具身导航基础设施的 API 参考。NavArena 包含四个子项目：**核心库** (navarena-core)、**资产预处理** (navarena-forge)、**数据生成器** (navarena-gen) 和 **评测框架** (navarena-bench)。

## 核心库 API (navarena-core)

navarena-core 提供共享的配置、数据模型、渲染和工具。完整说明见 [核心库](../core/)。

### 主要导出

- `BaseConfig`、`load_config`、`resolve_path`、`resolve_scene_dir`、`get_assets_dir`、`get_datasets_dir`、`get_shared_dir` — 配置与路径解析
- `Episode`、`TrajectoryStep`、`SceneAsset`、`ParquetDatasetReader`、`ParquetEpisodeWriter`、`ParquetTrajectoryWriter`、`validate_episode`、`validate_dataset` — 数据模型与 I/O
- `get_logger`、`setup_logging` — 日志

## 数据生成器 API

数据生成器的详细 API 文档请参考 [数据生成器 API](data-generator-api.md)。

### 主要类

- `BaseGenerator` - 生成器基类，注册子类：`PointNavGenerator`、`ImageNavGenerator`、`ObjectNavGenerator`、`VLNGenerator`
- `BaseSimEnv` - 仿真环境基类，`GSSimEnv` 为 3D GS 实现
- `BaseInstructionGenerator` - 指令生成器基类（VLN），注册子类：`SimpleDirectionInstructionGenerator`、`PathBasedInstructionGenerator`、`ObjectGoalInstructionGenerator`
- `GridAStarPlanner` - 全局 A* 路径规划器
- `TwoStageTrajectoryPlanner` - 两阶段轨迹规划器（A* + 局部平滑）
- `DatasetWriter`、`TrajectoryWriter` - 数据写入器
- `GeneratorConfig` - 数据生成配置类

## 评测框架 API

评测框架的详细 API 文档请参考 [评测框架 API](navarena-bench-api.md)。

### 主要类

- `Evaluator` - 评测器基类，注册子类：`PointNavEvaluator`、`ImageNavEvaluator`、`ObjectNavEvaluator`、`VLNEvaluator`
- `Env` - 环境基类，`GaussianSplattingEnv` 为 3D GS 实现
- `Agent` - 智能体基类，注册子类：`LocalAgent`、`RemoteAgent`、`ViNTAgent`、`GNMAgent`、`NoMaDAgent`、`MultiModalNavAgent`、`LanguageNavAgent`
- `Dataset` - 数据集基类，`EpisodeDataset` 实现
- `Metric` - 指标基类，`NavigationMetrics` 实现

## 快速参考

### 数据生成器

```python
from navarena_gen.generators.base import BaseGenerator
from navarena_gen.envs.base import BaseSimEnv
from navarena_gen.config.base_config import GeneratorConfig

# 加载配置
config = GeneratorConfig.from_yaml("configs/examples/pointnav_example.yaml")

# 创建环境和生成器
env = BaseSimEnv.init(config.env_type, config.env_config)
env.load_scene(config.get_resolved_scene_path())
generator = BaseGenerator.init(config.task_type, config.task_config)

# 流式生成 episodes
for episode in generator.generate(env, config.num_episodes):
    ...
```

### 评测框架

```python
from navarena_bench.evaluator import Evaluator
from navarena_bench.configs.eval_config import EvalCfg

# 加载配置
config = EvalCfg.from_yaml("configs/eval/default_eval.yaml")

# 创建评测器
evaluator = Evaluator.init(config)

# 运行评测
results = evaluator.eval()
```

## 详细文档

- [核心库](../core/) - navarena-core 模块概览与 API
- [数据生成器 API](data-generator-api.md) - 数据生成器的完整 API 文档
- [评测框架 API](navarena-bench-api.md) - 评测框架的完整 API 文档
