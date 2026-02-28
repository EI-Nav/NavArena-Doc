# 具身导航训练数据格式

本文档定义了具身导航训练数据的目录结构、元数据文件格式和 Parquet 数据格式（v1.0.0）。

!!! tip "评测数据格式"
    若只需了解评测框架（navarena-bench）所需的 Episode 与轨迹格式，可参阅 [评测数据格式](eval-data-format.md)，其中定义了精简的评测专用规范。

## 1. 数据目录结构

所有路径相对于环境变量 `$NAVARENA_DATA_DIR`（必须设置）。

```
$NAVARENA_DATA_DIR/
├── assets/                              # 场景资产（navarena-forge 预处理输出）
│   └── {group}/{scene_id}/
├── datasets/                            # 生成的数据集（navarena-gen 输出）
│   └── {dataset_name}/
│       ├── dataset_meta.json            # 数据集级别元数据
│       └── {scene_path}/                # 如 x2robot/17dc3367 或 sage-3d/00666b7a
│           ├── scene_meta.json          # 场景元数据
│           └── {task_type}/             # pointnav/imagenav/objectnav/vln
│               ├── meta/
│               │   ├── info.json        # 任务级元信息
│               │   └── episodes.parquet # 合并后的 Episode 索引（所有 chunk）
│               ├── data/
│               │   └── chunk-NNN/       # 分块存储（默认每块 1000 episodes）
│               │       ├── trajectories.parquet  # GT 轨迹
│               │       └── episodes.parquet       # 每块 Episode 元数据（增量写入）
│               ├── goal_images/         # 目标图像（仅 imagenav，可选）
│               │   └── {episode_id}_goal.jpg
│               └── rendered_videos/     # 渲染视频（可选，支持多相机）
│                   └── {episode_id}/
│                       ├── rgb/                      # 单相机模式
│                       └── {camera_name}/           # 多相机模式
│                           ├── rgb/
│                           └── depth/ (可选)
└── shared/                              # 共享配置（相机等）
```

**目录结构说明**：
- **Parquet 格式**：Episode 元数据和 GT 轨迹均以 Parquet 格式存储，格式版本 1.0.0
- **分块存储**：轨迹按 chunk 分块写入，默认每块 1000 个 episode，支持流式生成和断点续传
- **scene_path**：通常为 `{group}/{scene_id}`，如 `x2robot/17dc3367`

## 2. 元数据文件格式

### 2.1 数据集元数据 (dataset_meta.json)

位于 `$NAVARENA_DATA_DIR/datasets/{dataset_name}/dataset_meta.json`：

```json
{
  "dataset_name": "navarena_dataset_v1",
  "format_version": "1.0.0",
  "created_date": "2026-01-26 10:30:00",
  "updated_date": "2026-01-26 15:00:00",
  "scene_ids": ["17dc3367", "00666b7a"],
  "scene_paths": ["x2robot/17dc3367", "sage-3d/00666b7a"],
  "task_types": ["pointnav", "imagenav", "objectnav", "vln"]
}
```

### 2.2 场景元数据 (scene_meta.json)

位于 `$NAVARENA_DATA_DIR/datasets/{dataset_name}/{scene_path}/scene_meta.json`：

```json
{
  "scene_id": "17dc3367",
  "scene_path": "x2robot/17dc3367",
  "navigable_area": 45.6,
  "num_objects": 25,
  "task_types": ["pointnav", "imagenav"],
  "created_date": "2026-01-26 10:30:00",
  "updated_date": "2026-01-26 15:00:00",
  "source": {
    "dataset": "InteriorGS",
    "original_id": "17dc3367",
    "original_name": "room_01"
  }
}
```

### 2.3 任务级元信息 (meta/info.json)

位于 `{task_dir}/meta/info.json`：

```json
{
  "dataset_name": "navarena_dataset_v1",
  "scene_path": "x2robot/17dc3367",
  "task_type": "pointnav",
  "split": "train",
  "num_episodes": 5000,
  "num_chunks": 5,
  "chunk_size": 1000,
  "format_version": "1.0.0",
  "created_date": "2026-01-26 10:30:00",
  "generation_runs": [...]
}
```

## 3. Parquet 格式说明

### 3.1 Episode 元数据 Schema (episodes.parquet)

`meta/episodes.parquet` 和 `data/chunk-NNN/episodes.parquet` 使用相同 Schema：

| 字段 | 类型 | 说明 |
|------|------|------|
| episode_id | string | 唯一标识符，格式 `{split}_{序号}` 如 `train_000001` |
| chunk_index | int32 | 轨迹所属 chunk 索引 |
| scene_path | string | 场景路径，如 `x2robot/17dc3367` |
| task_type | string | 任务类型：pointnav / imagenav / objectnav / vln |
| split | string | 数据划分：train / val_seen / val_unseen / test |
| start_position_x, start_position_y, start_position_z | float64 | 起始位置 [x, y, z] |
| start_rotation_qx, qy, qz, qw | float64 | 起始朝向四元数 [qx, qy, qz, qw] |
| goal_type | string | 目标类型：position / image / object |
| goal_position_x, goal_position_y, goal_position_z | float64 | 目标位置 [x, y, z] |
| goal_rotation_qx, qy, qz, qw | float64 | 目标朝向四元数 |
| geodesic_distance | float32 | 测地线距离（米） |
| euclidean_distance | float32 | 欧几里得距离（米） |
| num_steps | int32 | GT 轨迹步数 |
| total_time | float32 | 总时间（秒） |
| avg_speed | float32 | 平均速度（米/秒） |
| max_speed | float32 | 最大速度（米/秒） |
| goal_image_path | string | 目标图像路径（imagenav 使用） |
| instruction_text | string | 自然语言指令（VLN 使用） |

### 3.2 轨迹 Schema (trajectories.parquet)

`data/chunk-NNN/trajectories.parquet` 存储 GT 轨迹步骤：

| 字段 | 类型 | 说明 |
|------|------|------|
| episode_id | string | 所属 episode ID |
| step | int32 | 步骤序号，从 0 开始 |
| timestamp | float64 | 时间戳（秒） |
| position_x, position_y, position_z | float64 | 位置 [x, y, z] |
| rotation_qx, qy, qz, qw | float64 | 朝向四元数 [qx, qy, qz, qw] |
| action | string | 动作名称，如 start / forward / turn / stop |
| action_id | int8 | 动作 ID |
| linear_velocity | float32 | 线速度（米/秒） |
| angular_velocity | float32 | 角速度（弧度/秒） |
| linear_velocity_x, linear_velocity_y | float32 | 线速度分量 |
| angular_acceleration | float32 | 角加速度（弧度/秒²） |
| curvature | float32 | 曲率（1/米） |

### 3.3 轨迹与 Episode 关联

- 每个 episode 的 `chunk_index` 指明其 GT 轨迹所在的 chunk
- 在 `data/chunk-{N}/trajectories.parquet` 中按 `episode_id` 过滤即可得到该 episode 的完整轨迹

## 4. Episode 逻辑结构（概念层）

在应用层，Episode 可理解为以下结构（Parquet 读取后还原为 `Episode` 对象）：

### 4.1 必需字段

```python
{
  "episode_id": "train_000001",
  "scene_path": "x2robot/17dc3367",
  "task_type": "pointnav",
  "start_state": {
    "position": [x, y, z],
    "rotation": [qx, qy, qz, qw]  # 四元数
  },
  "goals": [...]  # 至少一个目标
}
```

### 4.2 Goals 格式（按 goal_type）

**Position（点导航）**：
```json
{
  "goal_type": "position",
  "position": [x, y, z],
  "rotation": [qx, qy, qz, qw]
}
```

**Image（图像导航）**：
```json
{
  "goal_type": "image",
  "image_goal": { "image_path": "goal_images/train_000001_goal.jpg" },
  "position": [x, y, z],
  "rotation": [qx, qy, qz, qw]
}
```

**Object（物体导航）**：
```json
{
  "goal_type": "object",
  "object_category": "table",
  "object_id": "table_0",
  "position": [x, y, z]
}
```

### 4.3 Instructions（VLN）

```json
{
  "instruction_text": "走到走廊尽头，左转找到桌子",
  "language": "zh-CN"
}
```

### 4.4 GT Path 统计

```json
{
  "stats": {
    "geodesic_distance": 5.83,
    "num_steps": 12,
    "euclidean_distance": 5.2,
    "total_time": 11.66,
    "avg_speed": 0.5,
    "max_speed": 0.6
  }
}
```

## 5. 读取数据

使用 `navarena_core.data.parquet_io.ParquetDatasetReader`：

```python
from navarena_core.data.parquet_io import ParquetDatasetReader

task_dir = "$NAVARENA_DATA_DIR/datasets/navarena_dataset_v1/x2robot/17dc3367/pointnav"
reader = ParquetDatasetReader(task_dir)

# 读取所有 episodes
episodes = reader.read_episodes()

# 读取指定 episode 的 GT 轨迹
trajectory = reader.read_trajectory("train_000001")
```

## 6. 完整目录示例

```
$NAVARENA_DATA_DIR/
├── assets/
│   └── x2robot/
│       └── 17dc3367/
│           ├── manifest.json
│           ├── aligned.ply
│           ├── nav_map.pgm
│           ├── nav_map.yaml
│           ├── nav_mask.png
│           └── labels.json
└── datasets/
    └── navarena_dataset_v1/
        ├── dataset_meta.json
        └── x2robot/
            └── 17dc3367/
                ├── scene_meta.json
                ├── pointnav/
                │   ├── meta/
                │   │   ├── info.json
                │   │   └── episodes.parquet
                │   └── data/
                │       ├── chunk-000/
                │       │   ├── trajectories.parquet
                │       │   └── episodes.parquet
                │       └── chunk-001/
                │           ├── trajectories.parquet
                │           └── episodes.parquet
                ├── imagenav/
                │   ├── meta/
                │   ├── data/
                │   └── goal_images/
                │       ├── train_000000_goal.jpg
                │       └── ...
                └── vln/
                    ├── meta/
                    └── data/
```

## 7. 注意事项

1. **环境变量**：必须设置 `NAVARENA_DATA_DIR` 作为数据根目录
2. **四元数顺序**：统一使用 `[qx, qy, qz, qw]`（ROS/SciPy 兼容）
3. **Episode ID**：格式 `{split}_{序号}`，在任务目录内唯一
4. **元数据自动维护**：`dataset_meta.json`、`scene_meta.json`、`meta/info.json` 在数据生成时自动创建和更新
5. **断点续传**：生成器使用轻量级 checkpoint（`.{split}_checkpoint.json`）支持崩溃恢复
6. **goal_images 与 rendered_videos**：为可选目录，路径与 episode_id 关联

## 8. 使用示例

### 8.1 数据生成

```bash
cd navarena-gen
export NAVARENA_DATA_DIR=/path/to/data

# 使用配置文件
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml

# 命令行参数
python scripts/generate_data.py --env gs --task pointnav \
    --scene x2robot/17dc3367 --num-episodes 1000
```

### 8.2 启动 Web 查看器

```bash
cd navarena-gen
python scripts/run_viewer.py
# 数据目录通过 $NAVARENA_DATA_DIR 自动解析
```
