# 具身导航训练数据格式

本文档定义了具身导航训练数据的目录结构、元数据文件格式和 Episode 数据格式。

!!! tip "评测数据格式"
    若只需了解评测框架（navarena-bench）所需的 Episode 与轨迹格式，可参阅 [评测数据格式](eval-data-format.md)，其中定义了精简的评测专用规范。

## 1. 数据目录结构

```
navarena_data/
├── dataset_meta.json                      # 数据集级别元数据
└── scenes/
    └── {scene_id}/                        # 按场景ID组织
        ├── scene_meta.json                # 场景元数据
        └── {task_type}/                   # pointnav/imagenav/objectnav/vln
            ├── {split}.json               # episodes文件 (train.json/val.json)
            ├── gt_trajectories/           # GT轨迹文件
            │   └── {split}_{idx}_gt.json
            ├── goal_images/               # 目标图像（仅 imagenav，单相机）
            │   └── {split}_{idx}_goal.jpg
            └── rendered_videos/           # 渲染视频（支持多相机）
                └── {split}_{idx}/
                    ├── rgb/                          # 单相机模式（向后兼容）
                    │   └── frame_*.png
                    ├── {camera_name_1}/              # 多相机模式
                    │   ├── rgb/
                    │   │   └── frame_*.png
                    │   └── depth/ (可选)
                    ├── {camera_name_2}/
                    │   ├── rgb/
                    │   └── depth/ (可选)
                    └── ...
```

**目录结构说明**：
- **单相机模式**（向后兼容）：当只使用一个相机渲染时，帧直接保存在 `rgb/` 目录
- **多相机模式**（≥2个相机）：每个相机的渲染结果保存在以相机名命名的子目录中

## 2. 元数据文件格式

### 2.1 数据集元数据 (dataset_meta.json)

位于 `navarena_data/dataset_meta.json`：

```json
{
  "dataset_name": "navarena_bench",
  "version": "2.0.0",
  "created_date": "2026-01-26 10:30:00",
  "updated_date": "2026-01-26 15:00:00",
  "scene_ids": ["17dc3367", "b7c4d92e"],
  "task_types": ["pointnav", "imagenav", "objectnav"]
}
```

### 2.2 场景元数据 (scene_meta.json)

位于 `navarena_data/scenes/{scene_id}/scene_meta.json`：

```json
{
  "scene_id": "17dc3367",
  "scene_path": "navarena_assets/x2robot/17dc3367",
  "navigable_area": 45.6,
  "num_objects": 25,
  "task_types": ["pointnav", "imagenav"],
  "created_date": "2026-01-26 10:30:00",
  "updated_date": "2026-01-26 15:00:00"
}
```

## 3. Episodes 文件格式

位于 `navarena_data/scenes/{scene_id}/{task_type}/{split}.json`：

```json
{
  "version": "2.0.0",
  "dataset_name": "navarena_bench",
  "metadata": {
    "created_date": "2026-01-26 10:30:00",
    "description": "NavArena IMAGENAV dataset",
    "task_type": "imagenav",
    "split": "train",
    "scene_id": "17dc3367",
    "scene_path": "navarena_assets/x2robot/17dc3367",
    "num_episodes": 50
  },
  "episodes": [...]
}
```

## 4. Episode 核心字段定义

### 4.1 必需字段

```json
{
  "episode_id": "string",           // 唯一标识符，格式：{split}_{序号}，如 "train_000001"
  "scene_path": "string",           // 场景文件夹路径，如 "navarena_assets/x2robot/17dc3367"
  "task_type": "string",            // 任务类型："pointnav" | "imagenav" | "objectnav" | "vln"
  "start_state": {
    "position": [float, float, float],      // 起始位置 [x, y, z]
    "rotation": [float, float, float, float] // 起始旋转四元数 [qx, qy, qz, qw]
  },
  "goals": [...]                    // 目标列表，至少包含一个目标
}
```

### 4.2 可选字段

```json
{
  "split": "string",                // 数据集划分："train" | "val_seen" | "val_unseen" | "test"
  "instructions": [...],            // 指令列表（VLN 任务必需）
  "gt_path": {...}                  // Ground Truth 轨迹信息
}
```

## 5. Goals 字段格式（根据 goal_type）

### 5.1 Position 类型（点导航）

```json
{
  "goal_type": "position",
  "position": [float, float, float],        // 目标位置 [x, y, z]
  "rotation": [float, float, float, float]  // 可选：目标朝向 [qx, qy, qz, qw]
}
```

### 5.2 Image 类型（图像导航）

```json
{
  "goal_type": "image",
  "image_goal": {
    "image_path": "string"                  // 目标图像路径（相对于episodes文件）
  },
  "position": [float, float, float],        // 可选：用于评估的真实位置
  "rotation": [float, float, float, float]  // 可选：用于评估的真实朝向
}
```

**注意**: `image_path` 是相对于 episodes JSON 文件的路径，例如 `goal_images/train_000001_goal.jpg`

### 5.3 Object 类型（物体导航）

```json
{
  "goal_type": "object",
  "object_category": "string",              // 目标物体类别，如 "table", "chair"
  "object_id": "string",                    // 可选：具体物体实例ID，如 "table_0"
  "position": [float, float, float]         // 可选：用于评估的物体位置
}
```

## 6. Instructions 字段格式（VLN 任务）

```json
{
  "instruction_text": "string",    // 自然语言指令
  "language": "string"             // 语言代码，如 "zh-CN", "en-US"
}
```

## 7. GT Path 字段格式

```json
{
  "gt_path": {
    "trajectory_file": "string",   // GT轨迹文件路径（相对于episodes文件），如 "gt_trajectories/train_000001_gt.json"
    "stats": {
      // 必需统计指标
      "geodesic_distance": float,  // GT路径总长度/测地线距离（米）
      "num_steps": int,            // GT轨迹步数
      
      // 推荐统计指标
      "euclidean_distance": float, // 欧几里得距离（米）
      "total_time": float,         // 总时间（秒）
      
      // 可选统计指标
      "num_waypoints": int,        // GT轨迹路点数量
      "avg_speed": float,          // 平均速度（米/秒）
      "max_speed": float           // 最大速度（米/秒）
    }
  }
}
```

**注意**: `trajectory_file` 是相对于 episodes JSON 文件的路径

## 8. GT 轨迹文件格式

位于 `navarena_data/scenes/{scene_id}/{task_type}/gt_trajectories/{episode_id}_gt.json`：

```json
{
  "episode_id": "string",
  "trajectory": [
    {
      // 必需字段
      "step": int,                                // 步骤序号，从0开始
      "position": [float, float, float],          // 当前位置 [x, y, z]
      "rotation": [float, float, float, float],   // 当前朝向 [qx, qy, qz, qw]
      "timestamp": float,                         // 时间戳（秒）
      "action": "string",                         // 动作名称，如 "start", "forward", "stop", "turn"
      "action_id": int,                           // 动作ID
      
      // 可选动态信息字段（向后兼容）
      "linear_velocity": float,                   // 线速度（米/秒）
      "angular_velocity": float,                  // 角速度（弧度/秒）
      "linear_velocity_x": float,                 // x 方向线速度分量（米/秒）
      "linear_velocity_y": float,                 // y 方向线速度分量（米/秒）
      "angular_acceleration": float,              // 角加速度（弧度/秒²）
      "curvature": float                          // 曲率（1/米）
    }
  ],
  "actions": [int],                               // 可选：动作ID序列
  "action_names": ["string"]                      // 可选：动作名称序列
}
```

**动态信息字段说明**：
- 这些动态信息字段是可选的，用于提供机器人运动的详细动力学信息
- 只有在轨迹生成时计算了动态信息时才会包含这些字段
- 旧版本的轨迹数据可能不包含这些字段，保持向后兼容

## 9. 完整示例

### 9.1 PointNav 示例

文件位置: `navarena_data/scenes/17dc3367/pointnav/train.json`

```json
{
  "episode_id": "train_000001",
  "scene_path": "navarena_assets/x2robot/17dc3367",
  "split": "train",
  "task_type": "pointnav",
  "start_state": {
    "position": [0.0, 0.0, 0.0],
    "rotation": [0.0, 0.0, 0.0, 1.0]
  },
  "goals": [
    {
      "goal_type": "position",
      "position": [5.0, 3.0, 0.0],
      "rotation": [0.0, 0.0, 0.383, 0.924]
    }
  ],
  "gt_path": {
    "trajectory_file": "gt_trajectories/train_000001_gt.json",
    "stats": {
      "geodesic_distance": 5.83,
      "num_steps": 12,
      "euclidean_distance": 5.2,
      "total_time": 11.66
    }
  }
}
```

### 9.2 ImageNav 示例

文件位置: `navarena_data/scenes/17dc3367/imagenav/train.json`

```json
{
  "episode_id": "train_000001",
  "scene_path": "navarena_assets/x2robot/17dc3367",
  "split": "train",
  "task_type": "imagenav",
  "start_state": {
    "position": [-6.0, -1.58, 0.0],
    "rotation": [0.0, 0.0, 0.383, 0.924]
  },
  "goals": [
    {
      "goal_type": "image",
      "image_goal": {
        "image_path": "goal_images/train_000001_goal.jpg"
      },
      "position": [-0.9, -0.5, 0.0],
      "rotation": [0.0, 0.0, -0.383, 0.924]
    }
  ],
  "gt_path": {
    "trajectory_file": "gt_trajectories/train_000001_gt.json",
    "stats": {
      "geodesic_distance": 6.2,
      "num_steps": 15,
      "euclidean_distance": 5.5,
      "total_time": 12.4
    }
  }
}
```

### 9.3 ObjectNav 示例

文件位置: `navarena_data/scenes/17dc3367/objectnav/train.json`

```json
{
  "episode_id": "train_000001",
  "scene_path": "navarena_assets/x2robot/17dc3367",
  "split": "train",
  "task_type": "objectnav",
  "start_state": {
    "position": [-6.0, -1.58, 0.0],
    "rotation": [0.0, 0.0, 0.383, 0.924]
  },
  "goals": [
    {
      "goal_type": "object",
      "object_category": "table",
      "object_id": "table_0",
      "position": [-2.78, -1.57, -0.50]
    }
  ],
  "gt_path": {
    "trajectory_file": "gt_trajectories/train_000001_gt.json",
    "stats": {
      "geodesic_distance": 4.5,
      "num_steps": 10,
      "euclidean_distance": 3.8,
      "total_time": 9.0
    }
  }
}
```

### 9.4 VLN 示例

文件位置: `navarena_data/scenes/17dc3367/vln/train.json`

```json
{
  "episode_id": "train_000001",
  "scene_path": "navarena_assets/x2robot/17dc3367",
  "split": "train",
  "task_type": "vln",
  "start_state": {
    "position": [0.0, 0.0, 0.0],
    "rotation": [0.0, 0.0, 0.0, 1.0]
  },
  "instructions": [
    {
      "instruction_text": "走到走廊尽头，左转找到桌子",
      "language": "zh-CN"
    },
    {
      "instruction_text": "Go to the end of the hallway, turn left and find the table",
      "language": "en-US"
    }
  ],
  "goals": [
    {
      "goal_type": "position",
      "position": [5.0, 3.0, 0.0]
    }
  ],
  "gt_path": {
    "trajectory_file": "gt_trajectories/train_000001_gt.json",
    "stats": {
      "geodesic_distance": 7.8,
      "num_steps": 30,
      "euclidean_distance": 6.5,
      "total_time": 15.6
    }
  }
}
```

## 10. 完整文件组织结构

```
navarena-bench/
├── navarena_data/
│   ├── dataset_meta.json                    # 数据集级别元数据
│   └── scenes/
│       ├── 17dc3367/                        # 场景1（8位hex scene_id）
│       │   ├── scene_meta.json              # 场景元数据
│       │   ├── pointnav/                    # PointNav 任务
│       │   │   ├── train.json               # 训练集 episodes
│       │   │   ├── val.json                 # 验证集 episodes
│       │   │   ├── gt_trajectories/         # GT 轨迹
│       │   │   │   ├── train_000000_gt.json
│       │   │   │   ├── train_000001_gt.json
│       │   │   │   └── ...
│       │   │   └── rendered_videos/         # 渲染视频（支持多相机）
│       │   │       └── train_000000/
│       │   │           ├── rgb/                           # 单相机
│       │   │           └── {camera_name}/rgb/             # 多相机
│       │   ├── imagenav/                    # ImageNav 任务
│       │   │   ├── train.json
│       │   │   ├── gt_trajectories/
│       │   │   │   └── ...
│       │   │   ├── goal_images/             # 目标图像
│       │   │   │   ├── train_000000_goal.jpg
│       │   │   │   ├── train_000001_goal.jpg
│       │   │   │   └── ...
│       │   │   └── rendered_videos/
│       │   │       └── ...
│       │   ├── objectnav/                   # ObjectNav 任务
│       │   │   └── ...
│       │   └── vln/                         # VLN 任务
│       │       └── ...
│       └── b7c4d92e/                        # 场景2
│           └── ...
└── navarena_assets/                           # V1 统一资产格式
    ├── x2robot/
    │   └── 17dc3367/                        # 8位hex scene_id
    │       ├── manifest.json                # 场景元数据与溯源
    │       ├── aligned.ply                  # 坐标归一化后的 3DGS 点云
    │       ├── nav_map.pgm                  # 2D 占据栅格地图
    │       ├── nav_map.yaml                 # ROS 兼容地图配置
    │       ├── nav_mask.png                 # 可通行区域掩码
    │       └── labels.json                  # 语义物体标注（可选）
    └── scannetpp/
        └── e1f0a3b5/
            └── ...
```

## 11. 注意事项

1. **相对路径**: 所有文件引用（`trajectory_file`, `image_path`）都使用相对于 episodes JSON 文件的相对路径
2. **场景隔离**: 每个场景的数据都在独立目录下，不会互相干扰
3. **任务隔离**: 同一场景的不同任务类型也在独立目录下
4. **Episode ID 格式**: 格式为 `{split}_{序号}`（如 `train_000001`），在场景和任务类型目录内唯一
5. **元数据自动维护**: `dataset_meta.json` 和 `scene_meta.json` 会在数据生成时自动创建和更新
6. **多相机渲染**: 
   - 轨迹视频渲染支持多相机同时渲染
   - 目标图像（ImageNav）仍然使用单相机
   - 相机配置通过 YAML 文件统一管理

## 12. 使用示例

### 12.1 数据生成

```bash
# 生成 VLN 数据
python scripts/generate_data.py --config configs/examples/imagenav_example.yaml
```

### 12.2 渲染目标图像（单相机）

所有路径基于 `$NAVARENA_DATA_DIR` 自动解析，`--camera-config` 默认为 `shared/camera.yaml`。

```bash
# 使用 --task 快捷方式（自动推导 episodes 路径和相机配置）
python scripts/render_episodes.py --scene x2robot/17dc3367 --task imagenav

# 显式指定 episodes 文件（相对于 $NAVARENA_DATA_DIR/datasets/）
python scripts/render_episodes.py --scene x2robot/17dc3367 \
    --episodes navarena_vln/x2robot/17dc3367/imagenav/train.json
```

### 12.3 渲染轨迹视频（多相机支持）

```bash
# 使用 --task 快捷方式批量渲染轨迹（所有相机）
python scripts/render_episodes.py --scene x2robot/17dc3367 --task pointnav

# 渲染单个轨迹
python scripts/render_episodes.py --scene x2robot/17dc3367 \
    --trajectory navarena_vln/x2robot/17dc3367/imagenav/gt_trajectories/train_000001_gt.json

# 只渲染指定相机
python scripts/render_episodes.py --scene x2robot/17dc3367 --task imagenav \
    --camera-names left_gripper_camera_link camera_head_front_color_optical_frame

# 使用自定义相机配置（相对于 $NAVARENA_DATA_DIR/shared/）
python scripts/render_episodes.py --scene x2robot/17dc3367 --task imagenav \
    --camera-config camera_v2.yaml

# 同时渲染深度图
python scripts/render_episodes.py --scene x2robot/17dc3367 --task imagenav --rgbd
```

**多相机渲染说明**：
- 默认渲染配置文件中的所有相机
- 使用 `--camera-names` 参数可以只渲染指定的相机
- 多相机模式下，每个相机的渲染结果保存在独立的子目录中
