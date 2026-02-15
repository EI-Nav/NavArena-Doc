# Navigation Evaluation Data Format

This document defines the Episode format and trajectory data format for embodied navigation evaluation data.

## 1. Top-Level Dataset Format

```json
{
  "version": "1.0.0",
  "dataset_name": "x2robot_nav",
  "metadata": {
    "created_date": "2026-01-14",
    "description": "X2Robot general embodied navigation dataset",
    "task_types": ["pointnav", "imagenav", "objectnav", "vln"], // one of these
    "total_episodes": 100,
    "splits": ["train", "val_seen", "val_unseen", "test"] // one of these
  },
  "episodes": [...]
}
```

## 2. Episode Core Field Definitions

### 2.1 Required Fields

```json
{
  "episode_id": "string",           // Unique identifier, format: {split}_{index}, e.g. "train_001"
  "scene_path": "string",           // Scene folder path, e.g. "3d_gs_assets/x2robot/scene_001"
  "task_type": "string",            // Task type: "pointnav" | "imagenav" | "objectnav" | "vln"
  "start_state": {
    "position": [float, float, float],      // Start position [x, y, z]
    "rotation": [float, float, float, float] // Start rotation quaternion [qx, qy, qz, qw]
  },
  "goals": [...]                    // Goal list, at least one goal required
}
```

### 2.2 Optional Fields

```json
{
  "split": "string",                // Dataset split: "train" | "val_seen" | "val_unseen" | "test"
  "instructions": [...],            // Instruction list (required for embodied navigation tasks)
  "gt_path": {...}                  // Ground Truth trajectory info
}
```

## 3. Goals Field Format (by goal_type)

### 3.1 Position Type (Point Navigation)

```json
{
  "goal_type": "position",
  "position": [float, float, float],        // Goal position [x, y, z]
  "rotation": [float, float, float, float]  // Optional: goal orientation [qx, qy, qz, qw]
}
```

### 3.2 Image Type (Image Navigation)

```json
{
  "goal_type": "image",
  "image_goal": {
    "image_path": "string"                  // Goal image path
  },
  "position": [float, float, float],        // Optional: ground truth position for evaluation
  "rotation": [float, float, float, float]  // Optional: ground truth orientation for evaluation
}
```

### 3.3 Object Type (Object Navigation)

```json
{
  "goal_type": "object",
  "object_category": "string",              // Target object category, e.g. "table", "chair"
  "object_id": "string",                    // Optional: specific object instance ID, e.g. "table_0"
  "position": [float, float, float]         // Optional: object position for evaluation
}
```

## 4. Instructions Field Format (Embodied Navigation Tasks)

```json
{
  "instruction_text": "string",    // Natural language instruction
  "language": "string"             // Language code, e.g. "zh-CN", "en-US"
}
```

## 5. GT Path Field Format

```json
{
  "gt_path": {
    "trajectory_file": "string",   // GT trajectory file path, e.g. "gt_trajectories/train_001_gt.json"
    "stats": {
      // Required statistics
      "geodesic_distance": float,  // GT path total length / geodesic distance (meters)
      "num_steps": int,            // GT action step count
      
      // Recommended statistics
      "num_waypoints": int,        // GT trajectory waypoint count
      
      // Optional statistics
      "avg_speed": float,               // Average speed (m/s)
      "max_speed": float                // Maximum speed (m/s)
    }
  }
}
```

## 6. GT Trajectory File Format

gt_trajectories/{episode_id}_gt.json:

```json
{
  "episode_id": "string",
  "trajectory": [
    {
      "step": int,                                // Step index, starting from 0
      "position": [float, float, float],          // Current position [x, y, z]
      "rotation": [float, float, float, float],   // Current orientation [qx, qy, qz, qw]
      "timestamp": float,                         // Timestamp (seconds)
      "action": "string",                         // Action name, e.g. "move_forward", "turn_left"
      "action_id": int                            // Action ID
    }
  ],
  "actions": [int],                               // Action ID sequence
  "action_names": ["string"]                      // Action name sequence
}
```

## 7. Complete Examples

### 7.1 PointNav Example

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
      "rotation": [float, float, float, float]  // Optional: goal orientation [qx, qy, qz, qw]
    }
  ],
  "gt_path": {
    "trajectory_file": "gt_trajectories/pointnav_001_gt.json",
    "stats": {
      "geodesic_distance": 5.83,
      "num_waypoints": 12
    }
  }
}
```

### 7.2 ImageNav Example

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
      "num_waypoints": 15
    }
  }
}
```

### 7.3 ObjectNav Example

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
      "num_waypoints": 10
    }
  }
}
```

### 7.4 Embodied Navigation Example

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
      "instruction_text": "Go to the end of the hallway, turn left and find the table",
      "language": "en-US"
    },
    {
      "instruction_text": "走到走廊尽头，左转找到桌子",
      "language": "zh-CN"
    }
  ],
  "goals": [
    {
      "goal_type": "position",
      "position": [5.0, 3.0, 0.0]
    }
  ],
  "gt_path": {
    "trajectory_file": "gt_trajectories/vln_001_gt.json",
    "stats": {
      "geodesic_distance": 7.8,
      "num_waypoints": 30
    }
  }
}
```

## 8. File Organization

```bash
x2robot-nav/
├── vln_data/
│   ├── pointnav_episodes.json       # PointNav task data
│   ├── imagenav_episodes.json       # ImageNav task data
│   ├── objectnav_episodes.json      # ObjectNav task data
│   ├── vln_episodes.json            # Embodied navigation task data
│   ├── goal_images/                 # Goal images folder
│   │   ├── target_001.jpg
│   │   └── ...
│   └── gt_trajectories/             # GT trajectories folder
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

## 9. Notes

- All paths involved use relative paths; therefore data files must be organized according to **Section 8**.
