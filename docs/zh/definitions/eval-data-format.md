# 具身导航评测数据格式

本文档定义了具身导航评测数据的 Episode 格式和轨迹数据格式。

## 一、顶层数据集格式

```json
{
  "version": "1.0.0",
  "dataset_name": "navarena_bench",
  "metadata": {
    "created_date": "2026-01-14",
    "description": "NavArena通用具身导航数据集",
    "task_types": ["pointnav", "imagenav", "objectnav", "vln"], // 其中一种
    "total_episodes": 100,
    "splits": ["train", "val_seen", "val_unseen", "test"] // 其中一种
  },
  "episodes": [...]
}
```

## 二、Episode 核心字段定义

### 2.1 必需字段

```json
{
  "episode_id": "string",           // 唯一标识符，格式：{split}_{序号}，如 "train_001"
  "scene_path": "string",           // 场景路径，如 "x2robot/17dc3367"（相对于 $NAVARENA_DATA_DIR/assets/）
  "task_type": "string",            // 任务类型："pointnav" | "imagenav" | "objectnav" | "vln"
  "start_state": {
    "position": [float, float, float],      // 起始位置 [x, y, z]
    "rotation": [float, float, float, float] // 起始旋转四元数 [qx, qy, qz, qw]
  },
  "goals": [...]                    // 目标列表，至少包含一个目标
}
```

### 2.2 可选字段

```json
{
  "split": "string",                // 数据集划分："train" | "val_seen" | "val_unseen" | "test"
  "instructions": [...],            // 指令列表（VLN 任务必需）
  "gt_path": {...}                  // Ground Truth 轨迹信息
}
```

## 三、Goals 字段格式（根据 goal_type）

### 3.1 Position 类型（点导航）

```json
{
  "goal_type": "position",
  "position": [float, float, float],        // 目标位置 [x, y, z]
  "rotation": [float, float, float, float]  // 可选：目标朝向 [qx, qy, qz, qw]
}
```

### 3.2 Image 类型（图像导航）

```json
{
  "goal_type": "image",
  "image_goal": {
    "image_path": "string"                  // 目标图像路径
  },
  "position": [float, float, float],        // 可选：用于评估的真实位置
  "rotation": [float, float, float, float]  // 可选：用于评估的真实朝向
}
```

### 3.3 Object 类型（物体导航）

```json
{
  "goal_type": "object",
  "object_category": "string",              // 目标物体类别，如 "table", "chair"
  "object_id": "string",                    // 可选：具体物体实例ID，如 "table_0"
  "position": [float, float, float]         // 可选：用于评估的物体位置
}
```

## 四、Instructions 字段格式（VLN 任务）

```json
{
  "instruction_text": "string",    // 自然语言指令
  "language": "string"             // 语言代码，如 "zh-CN", "en-US"
}
```

## 五、GT Path 字段格式

```json
{
  "gt_path": {
    "trajectory_file": "string",   // GT轨迹文件路径，如 "gt_trajectories/train_001_gt.json"
    "stats": {
      // 必需统计指标
      "geodesic_distance": float,  // GT路径总长度/测地线距离（米）
      "num_steps": int,            // GT动作步数
      
      // 推荐统计指标
      "euclidean_distance": float,  // 欧几里得距离（米）
      "total_time": float,          // 总时间（秒）
      "num_waypoints": int,         // GT轨迹路点数量
      
      // 可选统计指标
      "avg_speed": float,           // 平均速度（米/秒）
      "max_speed": float            // 最大速度（米/秒）
    }
  }
}
```

## 六、GT 轨迹文件格式

gt_trajectories/{episode_id}_gt.json:

```json
{
  "episode_id": "string",
  "trajectory": [
    {
      "step": int,                                // 步骤序号，从0开始
      "position": [float, float, float],          // 当前位置 [x, y, z]
      "rotation": [float, float, float, float],   // 当前朝向 [qx, qy, qz, qw]
      "timestamp": float,                         // 时间戳（秒）
      "action": "string",                         // 动作名称，如 "move_forward", "turn_left"
      "action_id": int                            // 动作ID
    }
  ],
  "actions": [int],                               // 动作ID序列
  "action_names": ["string"]                      // 动作名称序列
}
```

## 七、完整示例

### 7.1 PointNav 示例

```json
{
  "episode_id": "train_000001",
  "scene_path": "x2robot/17dc3367",
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
      "rotation": [float, float, float, float]  // 可选：目标朝向 [qx, qy, qz, qw]
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

### 7.2 ImageNav 示例

```json
{
  "episode_id": "train_000001",
  "scene_path": "x2robot/17dc3367",
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

### 7.3 ObjectNav 示例

```json
{
  "episode_id": "train_000001",
  "scene_path": "x2robot/17dc3367",
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

### 7.4 VLN 示例

```json
{
  "episode_id": "train_000001",
  "scene_path": "x2robot/17dc3367",
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
      "position": [5.0, 3.0, 0.0],
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

## 八、文件组织结构

评测数据采用与训练数据一致的层级结构，按场景和任务类型组织：

```bash
$NAVARENA_DATA_DIR/
├── datasets/                        # 或自定义数据根目录
│   └── {dataset_name}/
│       └── {dataset}/{scene_id}/    # 如 x2robot/17dc3367
│           └── {task_type}/         # pointnav | imagenav | objectnav | vln
│               ├── train.json       # Episodes 文件
│               ├── val.json
│               ├── gt_trajectories/
│               │   ├── train_000000_gt.json
│               │   └── ...
│               └── goal_images/     # ImageNav 目标图像
│                   └── train_000000_goal.jpg
└── assets/                          # V1 格式场景资产
    └── x2robot/
        └── 17dc3367/
            ├── manifest.json
            ├── aligned.ply
            ├── nav_map.pgm
            ├── nav_map.yaml
            ├── nav_mask.png
            └── labels.json          # 可选
```

**说明**：`scene_path` 在 Episode 中为相对路径（如 `x2robot/17dc3367`），由评测框架根据 `$NAVARENA_DATA_DIR/assets/` 解析为完整路径。

## 九、注意事项

- 涉及到的所有路径都使用相对路径，因此数据文件必须按照**第八节**进行组织。
