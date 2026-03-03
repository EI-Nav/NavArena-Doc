# Agent Module

The agent module provides the interface to navigation models, supporting multiple implementations including local models, remote services, and pre-trained models.

## Overview

The agent is the interface between navigation models and the evaluation framework, responsible for:

- **Receive Observations** - Get observations from the environment
- **Generate Actions** - Produce navigation actions from observations
- **Manage State** - Manage internal model state

## Agent Types

### LocalAgent

Local model agent that loads model files directly.

#### Configuration

```yaml
agent:
  agent_type: "local"
  model_settings:
    checkpoint_path: "/path/to/model.pth"
  device: null  # null = auto-detect
```

#### Usage Example

```python
from navarena_bench.agent import Agent
from navarena_bench.configs.agent_config import AgentCfg

config = AgentCfg(
    agent_type="local",
    model_settings={"checkpoint_path": "/path/to/model.pth"}
)

agent = Agent.init(config)
```

### RemoteAgent

Remote service agent that invokes a remote model via HTTP API.

#### Configuration

```yaml
agent:
  agent_type: "remote"
  model_settings:
    remote_url: "http://localhost:8000/api/v1/navigate"
    remote_timeout: 30.0
    remote_retries: 3
```

#### API Interface Format

**Request:**
```json
{
  "observation": {
    "rgb": {
      "face": "base64_encoded_image",
      "left": "base64_encoded_image",
      "right": "base64_encoded_image"
    },
    "position": [0.0, 0.0, 0.0],
    "rotation": [1.0, 0.0, 0.0, 0.0]
  },
  "goal": {
    "position": [5.0, 0.0, 0.0]
  }
}
```

**Response:**
```json
{
  "action": {
    "x": 0.5,
    "y": 0.0,
    "yaw": 0.1
  }
}
```

#### Usage Example

```python
config = AgentCfg(
    agent_type="remote",
    model_settings={
        "remote_url": "http://localhost:8000/api/v1/navigate",
        "remote_timeout": 30.0,
        "remote_retries": 3,
    }
)

agent = Agent.init(config)
```

### ViNTAgent

ViNT (Visual Navigation Transformer) model agent.

#### Configuration

```yaml
agent:
  agent_type: "vint"
  model_settings:
    checkpoint_path: "/path/to/checkpoint.pth"
    config_path: "/path/to/config.yaml"  # optional
    device: "cuda:0"  # optional
```

#### Usage Example

```python
config = AgentCfg(
    agent_type="vint",
    model_settings={
        "checkpoint_path": "/path/to/checkpoint.pth"
    }
)

agent = Agent.init(config)
```

!!! note "Dependencies"
    ViNT agent requires the visualnav-transformer project.

### GNMAgent

GNM (General Navigation Model) agent.

#### Configuration

```yaml
agent:
  agent_type: "gnm"
  model_settings:
    checkpoint_path: "/path/to/checkpoint.pth"
```

### NoMaDAgent

NoMaD (Normalizing Flow Models for Robotic Navigation) agent.

#### Configuration

```yaml
agent:
  agent_type: "nomad"
  model_settings:
    checkpoint_path: "/path/to/checkpoint.pth"
```

### MultiModalNavAgent

Multi-modal navigation agent supporting language, image, and object goal types.

#### Configuration

```yaml
agent:
  agent_type: "multimodal_nav"
  model_settings:
    checkpoint_path: "/path/to/model.pth"
    input_modalities: ["rgb", "depth"]  # optional
    fusion_method: "concat"  # optional
```

### LanguageNavAgent

Language navigation agent for VLN tasks, using Voronoi graph for path planning and exploration.

#### Configuration

```yaml
agent:
  agent_type: "language_nav"
  model_settings:
    waypoint_tolerance: 0.3
    max_v: 0.5
    max_w: 1.0
    voronoi_closeness: 0.5
    min_voronoi_distance: 0.3
```

## Agent Interface

All agents implement:

### reset()

Reset agent state.

```python
episode = {
    "episode_id": "001",
    "goals": [{"position": [5.0, 0.0, 0.0]}]
}

agent.reset(episode)
```

### act()

Generate action from observation.

```python
observation = {
    "rgb": {
        "face": np.array(...),  # RGB image
        "left": np.array(...),
        "right": np.array(...)
    },
    "position": [0.0, 0.0, 0.0],
    "rotation": [1.0, 0.0, 0.0, 0.0]
}

action = agent.act(observation)
# {
#     "x": 0.5,      # Forward distance (meters)
#     "y": 0.0,      # Lateral distance (meters)
#     "yaw": 0.1     # Rotation angle (radians)
# }
```

### close()

Close agent and release resources.

```python
agent.close()
```

## Action Format

All agents return actions in this format:

```python
{
    "x": float,    # Forward/backward (meters), positive=forward
    "y": float,    # Lateral (meters), positive=right
    "yaw": float   # Rotation (radians), positive=CCW
}
```

## Observation Format

Observations received by agents:

```python
{
    "rgb": {
        "camera_name": np.ndarray  # RGB, shape (H, W, 3)
    },
    "depth": {  # optional
        "camera_name": np.ndarray  # Depth, shape (H, W)
    },
    "position": [x, y, z],
    "rotation": [w, x, y, z]  # quaternion
}
```

## Agent Comparison

| Agent Type | Use Case | Pros | Cons |
|------------|----------|------|------|
| LocalAgent | Local models | Fast, no network latency | Requires model file |
| RemoteAgent | Remote services | Flexible, easy deploy | Network latency |
| ViNTAgent | Image goal nav | Pre-trained model | Extra dependencies |
| GNMAgent | General nav | Pre-trained model | Extra dependencies |
| NoMaDAgent | General nav | Pre-trained model | Extra dependencies |
| MultiModalNavAgent | Multi-modal input | Language/image/object goals | Complex config |
| LanguageNavAgent | VLN | Voronoi path planning | Requires language model |

## Custom Agents

### Implement Custom Agent

```python
from navarena_bench.agent.base import Agent
from navarena_bench.configs.agent_config import AgentCfg

@Agent.register("my_agent")
class MyAgent(Agent):
    def __init__(self, config: AgentCfg):
        super().__init__(config)
        # Initialize model
        
    def reset(self, episode=None):
        """Reset agent state"""
        # Reset logic
        pass
    
    def act(self, observation):
        """Generate action"""
        # Action generation logic
        return {
            "x": 0.5,
            "y": 0.0,
            "yaw": 0.1
        }
    
    def close(self):
        """Release resources"""
        # Cleanup logic
        pass
```

### Use Custom Agent

```yaml
agent:
  agent_type: "my_agent"
  model_settings:
    checkpoint_path: "/path/to/model.pth"
```

```python
# Import custom agent so it registers
import my_agent_module

agent = Agent.init(config)
```

## FAQ

!!! question "Model load failed"
    Check model path, ensure file exists and format is correct.

!!! question "Remote service timeout"
    Increase `remote_timeout` or check network connection.

!!! question "Action format error"
    Ensure action dict includes `x`, `y`, `yaw` fields.

!!! question "Observation format mismatch"
    Check that env observations match the agent’s expected format.

!!! tip "Next Steps"
    - Learn **[Evaluator Module](evaluators.md)** usage
    - View **[Replay Module](replay.md)** functionality
    - Learn how to **[Extend the Framework](extending.md)**
