# Navigation Training Data Format

This document defines the directory structure, metadata file format, and Episode data format for embodied navigation training data.

## 1. Data Directory Structure

```
vln_data/
├── dataset_meta.json                      # Dataset-level metadata
└── scenes/
    └── {scene_id}/                        # Organized by scene ID
        ├── scene_meta.json                # Scene metadata
        └── {task_type}/                   # pointnav/imagenav/objectnav/vln
            ├── {split}.json               # Episodes file (train.json/val.json)
            ├── gt_trajectories/           # GT trajectory files
            │   └── {split}_{idx}_gt.json
            ├── goal_images/               # Goal images (imagenav only, single camera)
            │   └── {split}_{idx}_goal.jpg
            └── rendered_videos/           # Rendered videos (multi-camera support)
                └── {split}_{idx}/
                    ├── rgb/                          # Single camera mode (backward compatible)
                    │   └── frame_*.png
                    ├── {camera_name_1}/              # Multi-camera mode
                    │   ├── rgb/
                    │   │   └── frame_*.png
                    │   └── depth/ (optional)
                    ├── {camera_name_2}/
                    │   ├── rgb/
                    │   └── depth/ (optional)
                    └── ...
```

**Directory Structure Notes**:
- **Single camera mode** (backward compatible): When using only one camera for rendering, frames are saved directly in the `rgb/` directory
- **Multi-camera mode** (≥2 cameras): Each camera's rendered output is saved in a subdirectory named after the camera

## 2. Metadata File Formats

### 2.1 Dataset Metadata (dataset_meta.json)

Located at `vln_data/dataset_meta.json`:

```json
{
  "dataset_name": "x2robot_nav",
  "version": "2.0.0",
  "created_date": "2026-01-26 10:30:00",
  "updated_date": "2026-01-26 15:00:00",
  "scene_ids": ["17dc3367", "b7c4d92e"],
  "task_types": ["pointnav", "imagenav", "objectnav"]
}
```

### 2.2 Scene Metadata (scene_meta.json)

Located at `vln_data/scenes/{scene_id}/scene_meta.json`:

```json
{
  "scene_id": "17dc3367",
  "scene_path": "nav_gs_assets/x2robot/17dc3367",
  "navigable_area": 45.6,
  "num_objects": 25,
  "task_types": ["pointnav", "imagenav"],
  "created_date": "2026-01-26 10:30:00",
  "updated_date": "2026-01-26 15:00:00"
}
```

## 3. Episodes File Format

Located at `vln_data/scenes/{scene_id}/{task_type}/{split}.json`:

```json
{
  "version": "2.0.0",
  "dataset_name": "x2robot_nav",
  "metadata": {
    "created_date": "2026-01-26 10:30:00",
    "description": "X2Robot IMAGENAV dataset",
    "task_type": "imagenav",
    "split": "train",
    "scene_id": "17dc3367",
    "scene_path": "nav_gs_assets/x2robot/17dc3367",
    "num_episodes": 50
  },
  "episodes": [...]
}
```

## 4. Episode Core Field Definitions

### 4.1 Required Fields

```json
{
  "episode_id": "string",           // Unique identifier, format: {split}_{index}, e.g. "train_000001"
  "scene_path": "string",           // Scene folder path, e.g. "nav_gs_assets/x2robot/17dc3367"
  "task_type": "string",            // Task type: "pointnav" | "imagenav" | "objectnav" | "vln"
  "start_state": {
    "position": [float, float, float],      // Start position [x, y, z]
    "rotation": [float, float, float, float] // Start rotation quaternion [qx, qy, qz, qw]
  },
  "goals": [...]                    // Goal list, at least one goal required
}
```

### 4.2 Optional Fields

```json
{
  "split": "string",                // Dataset split: "train" | "val_seen" | "val_unseen" | "test"
  "instructions": [...],            // Instruction list (required for embodied navigation tasks)
  "gt_path": {...}                  // Ground Truth trajectory info
}
```

## 5. Goals Field Format (by goal_type)

### 5.1 Position Type (Point Navigation)

```json
{
  "goal_type": "position",
  "position": [float, float, float],        // Goal position [x, y, z]
  "rotation": [float, float, float, float]  // Optional: goal orientation [qx, qy, qz, qw]
}
```

### 5.2 Image Type (Image Navigation)

```json
{
  "goal_type": "image",
  "image_goal": {
    "image_path": "string"                  // Goal image path (relative to episodes file)
  },
  "position": [float, float, float],        // Optional: ground truth position for evaluation
  "rotation": [float, float, float, float] // Optional: ground truth orientation for evaluation
}
```

**Note**: `image_path` is relative to the episodes JSON file, e.g. `goal_images/train_000001_goal.jpg`

### 5.3 Object Type (Object Navigation)

```json
{
  "goal_type": "object",
  "object_category": "string",              // Target object category, e.g. "table", "chair"
  "object_id": "string",                    // Optional: specific object instance ID, e.g. "table_0"
  "position": [float, float, float]         // Optional: object position for evaluation
}
```

## 6. Instructions Field Format (Embodied Navigation Tasks)

```json
{
  "instruction_text": "string",    // Natural language instruction
  "language": "string"             // Language code, e.g. "zh-CN", "en-US"
}
```

## 7. GT Path Field Format

```json
{
  "gt_path": {
    "trajectory_file": "string",   // GT trajectory file path (relative to episodes file), e.g. "gt_trajectories/train_000001_gt.json"
    "stats": {
      // Required statistics
      "geodesic_distance": float,  // GT path total length / geodesic distance (meters)
      "num_steps": int,            // GT trajectory step count
      
      // Recommended statistics
      "euclidean_distance": float, // Euclidean distance (meters)
      "total_time": float,         // Total time (seconds)
      
      // Optional statistics
      "num_waypoints": int,        // GT trajectory waypoint count
      "avg_speed": float,           // Average speed (m/s)
      "max_speed": float           // Maximum speed (m/s)
    }
  }
}
```

**Note**: `trajectory_file` is relative to the episodes JSON file

## 8. GT Trajectory File Format

Located at `vln_data/scenes/{scene_id}/{task_type}/gt_trajectories/{episode_id}_gt.json`:

```json
{
  "episode_id": "string",
  "trajectory": [
    {
      // Required fields
      "step": int,                                // Step index, starting from 0
      "position": [float, float, float],          // Current position [x, y, z]
      "rotation": [float, float, float, float],   // Current orientation [qx, qy, qz, qw]
      "timestamp": float,                         // Timestamp (seconds)
      "action": "string",                         // Action name, e.g. "start", "forward", "stop", "turn"
      "action_id": int,                           // Action ID
      
      // Optional dynamic info fields (backward compatible)
      "linear_velocity": float,                   // Linear velocity (m/s)
      "angular_velocity": float,                  // Angular velocity (rad/s)
      "linear_velocity_x": float,                 // X-direction linear velocity component (m/s)
      "linear_velocity_y": float,                 // Y-direction linear velocity component (m/s)
      "angular_acceleration": float,              // Angular acceleration (rad/s²)
      "curvature": float                          // Curvature (1/m)
    }
  ],
  "actions": [int],                               // Optional: action ID sequence
  "action_names": ["string"]                      // Optional: action name sequence
}
```

**Dynamic Info Fields**:
- These dynamic info fields are optional, providing detailed kinematics information for robot motion
- Only included when dynamic info was computed during trajectory generation
- Older trajectory data may not include these fields; backward compatibility is maintained

## 9. Complete Examples

### 9.1 PointNav Example

File location: `vln_data/scenes/17dc3367/pointnav/train.json`

```json
{
  "episode_id": "train_000001",
  "scene_path": "nav_gs_assets/x2robot/17dc3367",
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

### 9.2 ImageNav Example

File location: `vln_data/scenes/17dc3367/imagenav/train.json`

```json
{
  "episode_id": "train_000001",
  "scene_path": "nav_gs_assets/x2robot/17dc3367",
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

### 9.3 ObjectNav Example

File location: `vln_data/scenes/17dc3367/objectnav/train.json`

```json
{
  "episode_id": "train_000001",
  "scene_path": "nav_gs_assets/x2robot/17dc3367",
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

### 9.4 Embodied Navigation Example

File location: `vln_data/scenes/17dc3367/vln/train.json`

```json
{
  "episode_id": "train_000001",
  "scene_path": "nav_gs_assets/x2robot/17dc3367",
  "split": "train",
  "task_type": "vln",
  "start_state": {
    "position": [0.0, 0.0, 0.0],
    "rotation": [0.0, 0.0, 0.0, 1.0]
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

## 10. Complete File Organization

```
x2robot-nav/
├── vln_data/
│   ├── dataset_meta.json                    # Dataset-level metadata
│   └── scenes/
│       ├── 17dc3367/                        # Scene 1 (8-char hex scene_id)
│       │   ├── scene_meta.json              # Scene metadata
│       │   ├── pointnav/                    # PointNav task
│       │   │   ├── train.json               # Train set episodes
│       │   │   ├── val.json                 # Validation set episodes
│       │   │   ├── gt_trajectories/         # GT trajectories
│       │   │   │   ├── train_000000_gt.json
│       │   │   │   ├── train_000001_gt.json
│       │   │   │   └── ...
│       │   │   └── rendered_videos/        # Rendered videos (multi-camera support)
│       │   │       └── train_000000/
│       │   │           ├── rgb/                           # Single camera
│       │   │           └── {camera_name}/rgb/             # Multi-camera
│       │   ├── imagenav/                    # ImageNav task
│       │   │   ├── train.json
│       │   │   ├── gt_trajectories/
│       │   │   │   └── ...
│       │   │   ├── goal_images/             # Goal images
│       │   │   │   ├── train_000000_goal.jpg
│       │   │   │   ├── train_000001_goal.jpg
│       │   │   │   └── ...
│       │   │   └── rendered_videos/
│       │   │       └── ...
│       │   ├── objectnav/                   # ObjectNav task
│       │   │   └── ...
│       │   └── vln/                         # Embodied navigation task
│       │       └── ...
│       └── b7c4d92e/                        # Scene 2
│           └── ...
└── nav_gs_assets/                           # V1 unified asset format
    ├── x2robot/
    │   └── 17dc3367/                        # 8-char hex scene_id
    │       ├── manifest.json                # Scene metadata and provenance
    │       ├── aligned.ply                  # Coordinate-normalized 3DGS point cloud
    │       ├── nav_map.pgm                   # 2D occupancy grid map
    │       ├── nav_map.yaml                  # ROS-compatible map config
    │       ├── nav_mask.png                  # Navigable region mask
    │       └── labels.json                   # Semantic object annotations (optional)
    └── scannetpp/
        └── e1f0a3b5/
            └── ...
```

## 11. Notes

1. **Relative paths**: All file references (`trajectory_file`, `image_path`) use paths relative to the episodes JSON file
2. **Scene isolation**: Each scene's data is in its own directory without interference
3. **Task isolation**: Different task types for the same scene are in separate directories
4. **Episode ID format**: Format `{split}_{index}` (e.g. `train_000001`), unique within scene and task type directory
5. **Metadata auto-maintenance**: `dataset_meta.json` and `scene_meta.json` are auto-created and updated during data generation
6. **Multi-camera rendering**:
   - Trajectory video rendering supports multi-camera rendering
   - Goal images (ImageNav) still use single camera
   - Camera config managed uniformly via YAML files

## 12. Usage Examples

### 12.1 Data Generation

```bash
# Generate embodied navigation data
python scripts/generate_data.py --config configs/examples/imagenav_example.yaml
```

### 12.2 Render Goal Images (Single Camera)

```bash
# Render ImageNav task goal images (using first camera in config)
python scripts/render_episodes.py \
    --renderer gs \
    --scene nav_gs_assets/x2robot/17dc3367 \
    --episodes vln_data/scenes/17dc3367/imagenav/train.json \
    --camera-config <path_to_camera_config.yaml>
```

### 12.3 Render Trajectory Videos (Multi-Camera Support)

```bash
# Render all cameras
python scripts/render_episodes.py \
    --renderer gs \
    --scene nav_gs_assets/x2robot/17dc3367 \
    --trajectory vln_data/scenes/17dc3367/imagenav/gt_trajectories/train_000001_gt.json \
    --camera-config <path_to_camera_config.yaml>

# Render only specified cameras
python scripts/render_episodes.py \
    --renderer gs \
    --scene nav_gs_assets/x2robot/17dc3367 \
    --trajectory vln_data/scenes/17dc3367/imagenav/gt_trajectories/train_000001_gt.json \
    --camera-config <path_to_camera_config.yaml> \
    --camera-names left_gripper_camera_link camera_head_front_color_optical_frame

# Batch render trajectory videos (all cameras)
python scripts/render_episodes.py \
    --renderer gs \
    --scene nav_gs_assets/x2robot/17dc3367 \
    --trajectories-dir vln_data/scenes/17dc3367/imagenav/gt_trajectories \
    --camera-config <path_to_camera_config.yaml>

# Render with depth maps
python scripts/render_episodes.py \
    --renderer gs \
    --scene nav_gs_assets/x2robot/17dc3367 \
    --trajectory vln_data/scenes/17dc3367/imagenav/gt_trajectories/train_000001_gt.json \
    --camera-config <path_to_camera_config.yaml> \
    --rgbd
```

**Multi-camera rendering notes**:
- Default: renders all cameras in config
- Use `--camera-names` to render only specified cameras
- In multi-camera mode, each camera's output is saved in a separate subdirectory
- Single camera mode preserves backward-compatible directory structure
