# 具身导航评测数据格式

本文档定义评测框架（navarena-bench）所需的 Episode 与轨迹格式。**Episode 核心字段、Goals、Instructions、GT Path、GT 轨迹文件格式**与 [导航训练数据格式](nav-data-format.md) 完全一致，本文档仅说明评测数据的差异与组织方式。

!!! info "与训练数据的关系"
    评测数据格式与 [训练数据格式](nav-data-format.md) 使用**同一套 Parquet 格式**。训练数据由 navarena-gen 生成，含 goal_images、rendered_videos 等附加文件；评测框架从 `meta/episodes.parquet` 和 `data/chunk-NNN/trajectories.parquet` 加载 Episode 与 GT 轨迹。

## 1. 与训练格式的主要区别

| 维度 | 训练数据（navarena-gen 输出） | 评测数据（navarena-bench 输入） |
|------|------------------------------|----------------------------------|
| 存储格式 | Parquet v1.0.0 | 与训练相同，Parquet |
| 目录结构 | `datasets/{name}/{scene_path}/{task_type}/` | 同上 |
| 元数据 | meta/info.json、dataset_meta.json、scene_meta.json | 同上 |
| Episode 字段 | 参见 [nav-data-format](nav-data-format.md) | 与训练一致 |
| 附加文件 | goal_images、rendered_videos（可选） | ImageNav 需 goal_images |

## 2. 数据加载方式

评测时，配置中的 `dataset_path` 需指向**任务目录**（即包含 `meta/`、`data/` 的目录），例如：

`$NAVARENA_DATA_DIR/datasets/navarena_dataset_v1/x2robot/17dc3367/pointnav`

评测框架通过 `ParquetDatasetReader` 从该任务目录加载数据：

```python
from navarena_core.data.parquet_io import ParquetDatasetReader

task_dir = "$NAVARENA_DATA_DIR/datasets/{dataset_name}/{scene_path}/{task_type}"
reader = ParquetDatasetReader(task_dir)
episodes = reader.read_episodes()
# 轨迹按 episode_id 从 data/chunk-NNN/trajectories.parquet 读取
trajectory = reader.read_trajectory("train_000001")
```

## 3. Episode 字段

### 3.1 评测框架所需字段一览

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `episode_id` | string | 是 | 唯一标识，格式 `{split}_{序号}` |
| `scene_path` | string | 是 | 场景路径，格式 `{group}/{scene_id}`，如 x2robot/17dc3367 |
| `task_type` | string | 是 | `pointnav` \| `imagenav` \| `objectnav` \| `vln` |
| `start_state` | object | 是 | `{position: [x,y,z], rotation: [qx,qy,qz,qw]}` |
| `goals` | array | 是 | 至少一个目标，见下表 goal_type |
| `instructions` | array | VLN 必需 | `[{instruction_text, language}]` |
| `gt_path` / `chunk_index` | object / int32 | 可选 | Parquet 格式中通过 chunk_index 关联轨迹 |

### 3.2 各任务类型的 Goals 必需字段

| 任务类型 | goal_type | Goals 必需字段 |
|----------|-----------|----------------|
| PointNav | `position` | `position` |
| ImageNav | `image` | `image_goal.image_path`，`position`（用于评估） |
| ObjectNav | `object` | `object_category`，`position`（用于评估） |
| VLN | `position` | `position`，外加 episode 级 `instructions` |

完整字段定义详见 [导航训练数据格式](nav-data-format.md) 第 4–8 章。

## 4. 最小可用 Episode 示例

以下为 PointNav 的最小评测 Episode，可直接用于构造评测数据：

```json
{
  "episode_id": "eval_000001",
  "scene_path": "x2robot/17dc3367",
  "task_type": "pointnav",
  "start_state": {
    "position": [0.0, 0.0, 0.0],
    "rotation": [0.0, 0.0, 0.0, 1.0]
  },
  "goals": [
    {
      "goal_type": "position",
      "position": [5.0, 0.0, 0.0],
      "rotation": [0.0, 0.0, 0.383, 0.924]
    }
  ]
}
```

## 5. scene_path 解析规则

评测框架将 `scene_path` 解析为 V1 资产目录的绝对路径：

```
绝对路径 = $NAVARENA_DATA_DIR/assets/{scene_path}
```

例如 `scene_path: "x2robot/17dc3367"` 对应 `$NAVARENA_DATA_DIR/assets/x2robot/17dc3367/`，该目录需包含 `manifest.json`、`aligned.ply`、`nav_map.pgm`、`nav_map.yaml` 等 V1 资产文件。

## 6. 评测数据文件组织结构

评测数据与训练数据共享目录结构，使用 Parquet 格式：

```text
$NAVARENA_DATA_DIR/
├── datasets/
│   └── {dataset_name}/
│       └── {scene_path}/            # 如 x2robot/17dc3367
│           └── {task_type}/
│               ├── meta/
│               │   ├── info.json
│               │   └── episodes.parquet
│               ├── data/
│               │   └── chunk-NNN/
│               │       ├── trajectories.parquet
│               │       └── episodes.parquet
│               └── goal_images/     # ImageNav 必需（可选目录）
└── assets/                          # V1 场景资产
```

## 7. 完整示例

PointNav、ImageNav、ObjectNav、VLN 的 Episode 逻辑结构见 [训练数据格式](nav-data-format.md) 第 4 章。

## 8. 注意事项

- 所有路径使用相对路径，需按上述目录组织。
- 确保 `scene_path` 对应的 V1 资产目录存在且完整。
