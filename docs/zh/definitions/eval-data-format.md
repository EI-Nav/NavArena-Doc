# 具身导航评测数据格式

本文档定义了具身导航评测数据的 Episode 格式和轨迹数据格式。

## 一、顶层数据集格式

```json
{
  "version": "1.0.0",
  "dataset_name": "x2robot_nav",
  "metadata": {
    "created_date": "2026-01-14",
    "description": "X2Robot通用具身导航数据集",
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
  "scene_path": "string",           // 场景文件夹路径，如 "3d_gs_assets/x2robot/scene_001"
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
  "instructions": [...],            // 指令列表（具身导航任务必需）
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

## 四、Instructions 字段格式（具身导航任务）

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
      "num_waypoints": int,        // GT轨迹路点数量
      
      // 可选统计指标
      "avg_speed": float,               // 平均速度（米/秒）
      "max_speed": float                // 最大速度（米/秒）
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
  "episode_id": "pointnav_001",
  "scene_path": "3d_gs_assets/x2robot/scene_001",
  "split": "train",
  "task_type": "pointnav",
  "start_state": {
    "position": [0.0, 0.0, 0.0],
    "rotation": [1.0, 0.0, 0.0, 0.0]
  },
  "goals": [
    {
      "goal_type": "position",
      "position": [5.0, 3.0, 0.0],
      "rotation": [float, float, float, float]  // 可选：目标朝向 [qx, qy, qz, qw]
    }
  ],
  "gt_path": {
    "trajectory_file": "gt_trajectories/pointnav_001_gt.json",
    "stats": {
      "geodesic_distance": 5.83,
      "num_waypoints": 12,
    }
  }
}
```

### 7.2 ImageNav 示例

```json
{
  "episode_id": "imagenav_001",
  "scene_path": "3d_gs_assets/x2robot/scene_001",
  "split": "train",
  "task_type": "imagenav",
  "start_state": {
    "position": [-6.0, -1.58, 0.0],
    "rotation": [0.924, 0.0, 0.0, 0.383]
  },
  "goals": [
    {
      "goal_type": "image",
      "image_goal": {
        "image_path": "goal_images/target_001.jpg"
      },
      "position": [-0.9, -0.5, 0.0],
      "rotation": [0.924, 0.0, 0.0, -0.383]
    }
  ],
  "gt_path": {
    "trajectory_file": "gt_trajectories/imagenav_001_gt.json",
    "stats": {
      "geodesic_distance": 6.2,
      "num_waypoints": 15,
    }
  }
}
```

### 7.3 ObjectNav 示例

```json
{
  "episode_id": "objectnav_001",
  "scene_path": "3d_gs_assets/x2robot/scene_001",
  "split": "train",
  "task_type": "objectnav",
  "start_state": {
    "position": [-6.0, -1.58, 0.0],
    "rotation": [0.924, 0.0, 0.0, 0.383]
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
    "trajectory_file": "gt_trajectories/objectnav_001_gt.json",
    "stats": {
      "geodesic_distance": 4.5,
      "num_waypoints": 10,
    }
  }
}
```

### 7.4 具身导航示例

```json
{
  "episode_id": "vln_001",
  "scene_path": "3d_gs_assets/x2robot/scene_001",
  "split": "train",
  "task_type": "vln",
  "start_state": {
    "position": [0.0, 0.0, 0.0],
    "rotation": [1.0, 0.0, 0.0, 0.0]
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
    "trajectory_file": "gt_trajectories/vln_001_gt.json",
    "stats": {
      "geodesic_distance": 7.8,
      "num_waypoints": 30,
    }
  }
}
```

## 八、文件组织结构

```bash
x2robot-nav/
├── vln_data/
│   ├── pointnav_episodes.json       # PointNav任务数据
│   ├── imagenav_episodes.json       # ImageNav任务数据
│   ├── objectnav_episodes.json      # ObjectNav任务数据
│   ├── vln_episodes.json            # 具身导航任务数据
│   ├── goal_images/                 # 目标图像文件夹
│   │   ├── target_001.jpg
│   │   └── ...
│   └── gt_trajectories/             # GT轨迹文件夹
│       ├── train_001_gt.json
│       ├── train_002_gt.json
│       └── ...
└── 3d_gs_assets/
    └── x2robot/
        └── scene_001/
            ├── scene_001_transformed.ply
            ├── scene_001_transformed.pgm
            ├── scene_001_transformed.yaml
            ├── scene_001_labels.json
            ├── scene_001_metadata.json
            └── scene_001_transformed_mask_*.png
```

## 九、注意事项

- 涉及到的所有路径都使用相对路径，因此数据文件必须按照**第八节**进行组织。
