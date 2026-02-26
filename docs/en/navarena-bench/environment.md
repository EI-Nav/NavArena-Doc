# Environment Module

The environment module provides the navigation simulation interface, including 3D Gaussian Splatting rendering and occupancy grid collision detection.

## Overview

The environment module is a core component of the evaluation framework, responsible for:

- **Scene Rendering** - Render scenes with 3D GS technology
- **Collision Detection** - Collision detection based on occupancy grid map
- **State Management** - Robot position, orientation, etc.
- **Goal Validation** - Check if goal is reached

## 3D GS Environment

### GaussianSplattingEnv

`GaussianSplattingEnv` is the environment implementation based on 3D Gaussian Splatting.

#### Initialization

```python
from navarena_bench.env import Env
from navarena_bench.configs.env_config import EnvCfg, GSEnvConfig
from navarena_bench.configs.eval_config import TaskCfg

env_config = EnvCfg(
    env_type="gs",
    env_settings=GSEnvConfig(
        scene_dir="/path/to/scenes",
        camera_config="/path/to/camera.yaml",
        enable_occupancy=True,
        success_distance=0.5
    )
)

task_config = TaskCfg(
    task_type="pointnav",
    task_settings={"success_distance": 0.5}
)

env = Env.init(env_config, task_config)
```

#### Configuration Parameters

```yaml
env:
  env_type: "gs"
  env_settings:
    camera_config: "${NAVARENA_DATA_DIR}/shared/camera.yaml"
    enable_occupancy: true
    success_distance: 0.5
    rotation_threshold: 0.2
    gpu_id: null                            # GPU ID (null=auto)
    enable_depth: true                      # Enable depth map
    enable_rgb: true                        # Enable RGB image
    camera_names: ["face", "left", "right"] # Camera names
    image_width: 640                        # Image width
    image_height: 480                       # Image height
```

### Main Methods

#### reset()

Reset environment for a new episode.

```python
episode = {
    "episode_id": "train_000001",
    "scene_path": "x2robot/17dc3367",
    "task_type": "pointnav",
    "start_state": {
        "position": [0.0, 0.0, 0.0],
        "rotation": [0.0, 0.0, 0.0, 1.0]
    },
    "goals": [{"goal_type": "position", "position": [5.0, 0.0, 0.0]}]
}

observation = env.reset(episode)
```

**Returns**: Initial observation dict with:
- `rgb`: RGB image dict (by camera name)
- `depth`: Depth map dict (optional)
- `position`: Current position [x, y, z]
- `rotation`: Current orientation (quaternion)

#### step()

Execute one action step.

```python
action = {
    "x": 0.5,      # Forward distance (meters)
    "y": 0.0,      # Lateral distance (meters)
    "yaw": 0.1     # Rotation angle (radians)
}

observation, reward, done, info = env.step(action)
```

**Parameters**:
- `action`: Action dict
  - `x`: Forward/backward distance (meters)
  - `y`: Lateral distance (meters)
  - `yaw`: Rotation angle (radians)

**Returns**:
- `observation`: New observation
- `reward`: Reward value (currently unused)
- `done`: Whether episode is done
- `info`: Info dict

#### get_info()

Get current environment info.

```python
info = env.get_info()
# {
#     "success": False,
#     "distance_to_goal": 2.5,
#     "path_length": 3.0,
#     "geodesic_distance": 2.0,
#     "collision": False
# }
```

**Returns**: Info dict with:
- `success`: Whether goal reached
- `distance_to_goal`: Distance to goal
- `path_length`: Path length traveled
- `geodesic_distance`: Shortest path length to goal
- `collision`: Whether collision occurred

## Occupancy Grid

The environment uses occupancy grid maps for collision detection.

### Loading Occupancy Grid

Occupancy grid is loaded from the scene PGM map:

```python
# Auto-loaded from scene directory
# {scene_dir}/nav_map.pgm
# {scene_dir}/nav_map.yaml
```

### Collision Detection

Collision is checked automatically:

```python
# Auto-detected during step()
observation, reward, done, info = env.step(action)

if info.get("collision"):
    print("Collision detected!")
```

### Occupancy Grid Config

PGM map config format:

```yaml
image: nav_map.pgm
resolution: 0.05
origin: [-10.0, -10.0, 0.0]
negate: 0
occupied_thresh: 0.65
free_thresh: 0.25
```

## Camera Configuration

The environment supports multi-camera configuration.

### Camera Config File

```yaml
cameras:
  face:
    intrinsic:
      fx: 320.0
      fy: 320.0
      cx: 320.0
      cy: 240.0
    extrinsic:
      translation: [0.0, 0.0, 0.0]
      rotation: [1.0, 0.0, 0.0, 0.0]
    image_size: [640, 480]
  
  left:
    intrinsic:
      fx: 320.0
      fy: 320.0
      cx: 320.0
      cy: 240.0
    extrinsic:
      translation: [0.1, 0.0, 0.0]
      rotation: [0.707, 0.0, 0.707, 0.0]
    image_size: [640, 480]
```

### Multi-Camera Observations

The environment returns multi-camera observations:

```python
observation = env.reset(episode)

# RGB images
rgb_face = observation["rgb"]["face"]
rgb_left = observation["rgb"]["left"]
rgb_right = observation["rgb"]["right"]

# Depth (if enabled)
if "depth" in observation:
    depth_face = observation["depth"]["face"]
```

## Scene Management

### Scene Directory Structure (V1 Asset Format)

The environment loads the V1 unified asset format, aligned with asset preprocessing output:

```
{dataset}/{scene_id}/
├── manifest.json          # required
├── nav_map.pgm            # required
├── nav_map.yaml           # required
├── aligned.ply            # for rendering
├── nav_mask.png          # optional
└── labels.json           # optional
```

### Robot State Management

The environment manages robot state (position, rotation, yaw), updated in `step()` from actions and exposed via `get_info()` for path length, distance to goal, etc.

### Legacy Scene Metadata

Legacy scene metadata format (for reference):

```json
{
  "scene_id": "scene_001",
  "pgm_file": "nav_map.pgm",
  "yaml_file": "scene_001_transformed.yaml",
  "ply_file": "scene_001_transformed.ply",
  "ground_height": -0.9,
  "is_normalized": true
}
```

## Goal Validation

The environment supports multiple goal types:

### PointNav Goals

```python
episode = {
    "goals": [
        {
            "position": [5.0, 0.0, 0.0],
            "rotation": [1.0, 0.0, 0.0, 0.0]  # optional
        }
    ]
}
```

### ObjectNav Goals

```python
episode = {
    "goals": [
        {
            "position": [5.0, 0.0, 0.0],
            "object_category": "bed"
        }
    ]
}
```

### ImageNav Goals

```python
episode = {
    "goals": [
        {
            "position": [5.0, 0.0, 0.0],
            "rotation": [1.0, 0.0, 0.0, 0.0],  # required
            "image": "/path/to/goal_image.jpg"  # optional
        }
    ]
}
```

## Performance Tuning

### GPU Settings

```yaml
env_settings:
  gpu_id: 0  # Specify GPU, or null for auto
```

### Rendering Optimization

```yaml
env_settings:
  enable_depth: false  # Disable depth for performance
  image_width: 480     # Lower resolution
  image_height: 360
```

### Occupancy Grid Optimization

```yaml
env_settings:
  enable_occupancy: true  # Required for collision detection
```

## FAQ

!!! question "Scene load failed"
    Check scene directory structure and that required metadata files exist.

!!! question "Inaccurate collision detection"
    Check PGM map generation and verify `occupied_thresh` and `free_thresh`.

!!! question "Slow rendering"
    Lower image resolution or disable depth; use GPU acceleration.

!!! question "Multi-camera config error"
    Ensure camera config format is correct and intrinsics/extrinsics are set.

## Next Steps

- Learn how to configure the **[Agent Module](agents.md)**
- View **[Evaluator Module](evaluators.md)** usage
- Learn how to **[Extend the Framework](extending.md)**
