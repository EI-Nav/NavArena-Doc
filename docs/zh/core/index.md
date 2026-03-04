# 核心库 (navarena-core)

navarena-core 是 NavArena 的共享基础库，为 forge、gen、bench 提供配置、数据模型、渲染和工具功能。

## 模块概览

| 模块 | 说明 |
|------|------|
| `config` | BaseConfig、路径解析（PathResolver）、配置加载与合并 |
| `data` | Episode、TrajectoryStep、SceneAsset、Parquet 读写、数据校验 |
| `export` | 导出器（WebDataset、LeRobot、HuggingFace） |
| `rendering` | 3D Gaussian Splatting 渲染器、四元数/矩阵工具 |
| `utils` | 文件、地图、坐标变换等工具函数 |
| `logging` | 日志配置与获取 |

## 公开 API

```python
# 包顶层
from navarena_core import __version__, BaseConfig, get_logger, setup_logging

# 配置
from navarena_core.config import (
    BaseConfig,
    load_config,
    resolve_path,
    resolve_scene_dir,
    get_assets_dir,
    get_datasets_dir,
    get_shared_dir,
)

# 数据模型
from navarena_core.data import (
    Episode,
    TrajectoryStep,
    SceneAsset,
    ParquetDatasetReader,
    ParquetEpisodeWriter,
    ParquetTrajectoryWriter,
    validate_episode,
    validate_dataset,
)
```

## 安装

作为 uv 工作空间成员，在项目根目录执行：

```bash
cd NavArena
uv sync --all-packages
```

如需单独安装（含渲染与导出可选依赖）：

```bash
pip install -e "navarena-core[rendering,export]"
```

## 使用示例

```python
from navarena_core import get_logger
from navarena_core.data import Episode, ParquetDatasetReader
from navarena_core.config.path_resolver import resolve_scene_dir

logger = get_logger(__name__)

# 解析场景路径（相对于 NAVARENA_DATA_DIR/assets/）
scene_dir = resolve_scene_dir("x2robot/17dc3367")

# 读取 Parquet 数据集（task_dir 为数据集根目录，含 meta/、data/）
task_dir = "$NAVARENA_DATA_DIR/datasets/navarena_dataset_v1/x2robot/17dc3367/pointnav"
reader = ParquetDatasetReader(task_dir)
episodes = reader.read_episodes()
```

## 相关文档

- [架构设计](../concepts/architecture.md) - 核心库与其他子项目的集成方式
- [API 参考](../api/reference.md) - 完整 API 概览
