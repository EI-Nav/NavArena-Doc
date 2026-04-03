# Replay Module

The replay module provides replay and visualization of evaluation results, with trajectory rendering, observation rendering, and info panel display.

## Overview

The replay module is used for:

- **Trajectory Visualization** - Display navigation trajectory on the map
- **Observation Replay** - Replay observation images per step
- **Info Panel** - Show evaluation metrics and status
- **Video Generation** - Generate replay video files

### Core Components

- **DataRecorder** - Records episode data during evaluation (trajectory, observations, actions)
- **ReplayLoader** - Loads recorded replay data
- **VideoReplayer** - Generates visualization videos combining trajectory and observations
- **Renderers** - trajectory_renderer, observation_renderer, info_panel_renderer

## Replay Data Format

Replay data is stored in the evaluation results directory:

```
eval_results/
├── episode_001/
│   ├── replay_data.json      # Replay data
│   ├── trajectory.json        # Trajectory data
│   └── observations/          # Observation images
│       ├── step_000_rgb.png
│       ├── step_001_rgb.png
│       └── ...
└── ...
```

### Replay Data JSON

```json
{
  "episode_id": "001",
  "scene_id": "scene_001",
  "start_position": [0.0, 0.0, 0.0],
  "start_rotation": [1.0, 0.0, 0.0, 0.0],
  "goal_position": [5.0, 0.0, 0.0],
  "trajectory": [
    {
      "step": 0,
      "position": [0.0, 0.0, 0.0],
      "rotation": [1.0, 0.0, 0.0, 0.0],
      "action": {"x": 0.5, "y": 0.0, "yaw": 0.0}
    }
  ],
  "observations": [
    {
      "step": 0,
      "rgb": {
        "face": "base64_encoded_image",
        "left": "base64_encoded_image",
        "right": "base64_encoded_image"
      }
    }
  ],
  "metadata": {
    "success": true,
    "path_length": 4.2,
    "geodesic_distance": 3.0,
    "num_steps": 42
  }
}
```

## Using the Replay Tool

### Command-Line Tool

#### Single Episode Replay

```bash
python scripts/replay_eval.py \
    --episode 001 \
    --results eval_results/ \
    --output replay.mp4
```

#### Batch Replay

```bash
python scripts/replay_eval.py \
    --results eval_results/ \
    --output replay_videos/
```

#### Custom Parameters

```bash
python scripts/replay_eval.py \
    --episode 001 \
    --results eval_results/ \
    --output replay.mp4 \
    --fps 15 \
    --resolution 1920x1080
```

### Command-Line Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--episode EPISODE_ID` | Episode ID (single replay) | - |
| `--results RESULTS_DIR` | Evaluation results directory | `./eval_results` |
| `--output OUTPUT_PATH` | Output path | `./replay.mp4` |
| `--fps FPS` | Video frame rate | `15` |
| `--resolution WIDTHxHEIGHT` | Video resolution | `1920x1080` |
| `--show-trajectory` | Show trajectory | `true` |
| `--show-info` | Show info panel | `true` |

## Python API

### Basic Usage

```python
from navarena_bench.replay import BaseReplayer
from navarena_bench.replay.loader import ReplayLoader

# Load replay data
loader = ReplayLoader("eval_results/episode_001")
replay_data = loader.load()

# Create replayer
replayer = BaseReplayer.init("video", loader)

# Generate replay video
replayer.replay(output_path="replay.mp4")
```

### Custom Replayer

```python
from navarena_bench.replay.base import BaseReplayer
from navarena_bench.replay.loader import ReplayLoader

@BaseReplayer.register("my_replayer")
class MyReplayer(BaseReplayer):
    def __init__(self, loader, **kwargs):
        super().__init__(loader, **kwargs)
        # Initialize
        
    def replay(self, output_path):
        """Generate replay"""
        # Replay logic
        pass
```

## Replay Renderers

### TrajectoryRenderer

Renders the navigation trajectory on the map.

```python
from navarena_bench.replay.renderers.trajectory_renderer import TrajectoryRenderer

renderer = TrajectoryRenderer(
    pgm_map_path="scene_001_transformed.pgm",
    yaml_config_path="scene_001_transformed.yaml"
)

image = renderer.render(
    trajectory=trajectory,
    start_position=start_pos,
    goal_position=goal_pos
)
```

### ObservationRenderer

Renders observation images.

```python
from navarena_bench.replay.renderers.observation_renderer import ObservationRenderer

renderer = ObservationRenderer()

image = renderer.render(
    observations=observations,
    camera_names=["face", "left", "right"]
)
```

### InfoPanelRenderer

Renders the evaluation info panel.

```python
from navarena_bench.replay.renderers.info_panel_renderer import InfoPanelRenderer

renderer = InfoPanelRenderer()

image = renderer.render(
    metadata={
        "success": True,
        "path_length": 4.2,
        "geodesic_distance": 3.0,
        "num_steps": 42
    }
)
```

## Replay Video Layout

The replay video includes:

1. **Trajectory View** - Top left: map and trajectory
2. **Observation View** - Top right: multi-camera observations
3. **Info Panel** - Bottom: evaluation metrics

### Video Layout

```
┌─────────────────┬─────────────────┐
│                 │                 │
│  Trajectory     │  Observations   │
│  (Map+Traj)     │  (Multi-cam)    │
│                 │                 │
├─────────────────┴─────────────────┤
│           Info Panel               │
│   Success: ✓  Path Length: 4.2m   │
└─────────────────────────────────────┘
```

## Replay Configuration

```yaml
replay:
  fps: 15
  resolution: [1920, 1080]
  show_trajectory: true
  show_observations: true
  show_info_panel: true
  trajectory_style:
    line_color: [255, 0, 0]
    line_width: 2
    start_marker: "circle"
    goal_marker: "star"
```

## FAQ

!!! question "Replay data not found"
    Ensure trajectory saving was enabled during evaluation (`save_trajectories: true`).

!!! question "Video generation failed"
    Check output path permissions and disk space.

!!! question "Trajectory display incorrect"
    Verify occupancy grid map file exists and coordinate transform is correct.

!!! question "Observation images missing"
    Ensure observation images were saved during evaluation and paths are correct.

**See also**: [Extending](extending.md) · [Evaluator Module](evaluators.md) · [Environment Module](environment.md)
