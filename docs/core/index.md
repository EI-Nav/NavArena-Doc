# Core Library (navarena-core)

navarena-core is the shared foundation library for NavArena, providing configuration, data models, rendering, and utilities used by forge, gen, and bench.

## Module Overview

| Module | Description |
|--------|-------------|
| `config` | BaseConfig, path resolution (PathResolver), config loading and merging |
| `data` | Episode, TrajectoryStep, SceneAsset, Parquet I/O, data validation |
| `export` | Exporters (WebDataset, LeRobot, HuggingFace) |
| `rendering` | 3D Gaussian Splatting renderer, quaternion/matrix utilities |
| `utils` | File, map, coordinate transformation utilities |
| `logging` | Logging configuration and access |

## Public API

Only a **small** set of symbols is exported from `navarena_core` itself (`__version__`, `BaseConfig`, `get_logger`, `setup_logging`). Import data types from **`navarena_core.data`** (and other subpackages) explicitly.

```python
# Package top-level
from navarena_core import __version__, BaseConfig, get_logger, setup_logging

# Config
from navarena_core.config import (
    BaseConfig,
    load_config,
    resolve_path,
    resolve_scene_dir,
    get_assets_dir,
    get_datasets_dir,
    get_shared_dir,
)

# Data models
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

## Installation

As a uv workspace member, from the project root:

```bash
cd NavArena
uv sync --all-packages
```

For standalone installation (with optional rendering and export extras):

```bash
pip install -e "navarena-core[rendering,export]"
```

## Usage Example

```python
from navarena_core import get_logger
from navarena_core.data import Episode, ParquetDatasetReader
from navarena_core.config.path_resolver import resolve_scene_dir

logger = get_logger(__name__)

# Resolve scene path (relative to NAVARENA_DATA_DIR/assets/)
scene_dir = resolve_scene_dir("x2robot/17dc3367")

# Read Parquet dataset (task_dir is the dataset root, containing meta/, data/)
task_dir = "$NAVARENA_DATA_DIR/datasets/navarena_dataset_v1/x2robot/17dc3367/pointnav"
reader = ParquetDatasetReader(task_dir)
episodes = reader.read_episodes()
```

## Related Documentation

- [Architecture Design](../concepts/architecture.md) - How core integrates with other sub-projects
- [API Reference](../api/reference.md) - Full API overview
