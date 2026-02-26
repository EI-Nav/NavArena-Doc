# Extending Guide

This document explains how to extend the evaluation framework with new environments, agents, evaluators, and metrics.

## Extension Overview

The framework uses a registration mechanism to add new components:

- **New Environment** - Subclass `Env` and register
- **New Agent** - Subclass `Agent` and register
- **New Evaluator** - Subclass `Evaluator` and register
- **New Metric** - Subclass `Metric` and register
- **New Replayer** - Subclass `BaseReplayer` and register

## Extending the Environment

### 1. Create Environment Class

```python
from navarena_bench.env.base import Env
from navarena_bench.configs.env_config import EnvCfg
from navarena_bench.configs.eval_config import TaskCfg

@Env.register("my_env")
class MyEnvironment(Env):
    def __init__(self, env_config: EnvCfg, task_config: TaskCfg):
        super().__init__(env_config, task_config)
        # Initialize environment
        
    def reset(self, episode=None):
        """Reset environment"""
        # Reset logic
        observation = {
            "rgb": {"camera": self._render()},
            "position": self.robot_position,
            "rotation": self.robot_rotation
        }
        return observation
    
    def step(self, action):
        """Execute one step"""
        # Step logic
        self._update_state(action)
        observation = self._get_observation()
        done = self._check_done()
        info = self._get_info()
        return observation, 0.0, done, info
    
    def get_info(self):
        """Get environment info"""
        return {
            "success": self._check_success(),
            "distance_to_goal": self._compute_distance()
        }
```

### 2. Use New Environment

```yaml
env:
  env_type: "my_env"
  env_settings:
    # Custom config
    my_setting: value
```

```python
# Import new environment so it registers
import my_environment_module

env = Env.init(env_config, task_config)
```

## Extending the Agent

### 1. Create Agent Class

```python
from navarena_bench.agent.base import Agent
from navarena_bench.configs.agent_config import AgentCfg

@Agent.register("my_agent")
class MyAgent(Agent):
    def __init__(self, config: AgentCfg):
        super().__init__(config)
        # Load model
        self.model = self._load_model(config.model_path)
        
    def reset(self, episode=None):
        """Reset agent state"""
        self.state = self.model.initial_state()
        
    def act(self, observation):
        """Generate action"""
        # Preprocess observation
        processed_obs = self._preprocess(observation)
        
        # Model inference
        action = self.model.predict(processed_obs, self.state)
        
        # Update state
        self.state = self.model.update_state(self.state, action)
        
        return {
            "x": action[0],
            "y": action[1],
            "yaw": action[2]
        }
    
    def close(self):
        """Release resources"""
        del self.model
```

### 2. Use New Agent

```yaml
agent:
  agent_type: "my_agent"
  model_path: "/path/to/model.pth"
  model_settings:
    # Custom settings
    my_setting: value
```

```python
# Import new agent so it registers
import my_agent_module

agent = Agent.init(config)
```

## Extending the Evaluator

### 1. Create Evaluator Class

```python
from navarena_bench.evaluator.base import Evaluator
from navarena_bench.configs.eval_config import EvalCfg

@Evaluator.register("my_eval")
class MyEvaluator(Evaluator):
    def __init__(self, config: EvalCfg):
        super().__init__(config)
        # Initialize custom metrics
        self.custom_metric = CustomMetric()
        
    def eval_episode(self, episode):
        """Evaluate single episode"""
        # Reset environment
        observation = self.env.reset(episode)
        
        # Reset agent
        self.agent.reset(episode)
        
        # Run episode
        trajectory = []
        done = False
        while not done:
            action = self.agent.act(observation)
            observation, reward, done, info = self.env.step(action)
            trajectory.append({
                "position": info["position"],
                "action": action
            })
        
        # Compute metrics
        result = {
            "episode_id": episode["episode_id"],
            "success": info["success"],
            "custom_metric": self.custom_metric.compute(trajectory)
        }
        
        return result
```

### 2. Use New Evaluator

```yaml
eval_type: "my_eval"
```

```python
# Import new evaluator so it registers
import my_evaluator_module

evaluator = Evaluator.init(config)
```

## Extending Metrics

### 1. Create Metric Class

```python
from navarena_bench.metrics.base import Metric

@Metric.register("my_metric")
class MyMetric(Metric):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.values = []
        
    def update(self, episode_result):
        """Update metric value"""
        value = self._compute_value(episode_result)
        self.values.append(value)
        
    def compute(self):
        """Compute final metric value"""
        return sum(self.values) / len(self.values)
    
    def reset(self):
        """Reset metric"""
        self.values = []
```

### 2. Use New Metric

```python
from navarena_bench.metrics import Metric

metric = Metric.init("my_metric", param1=value1)
metric.update(episode_result)
result = metric.compute()
```

## Extending the Replayer

### 1. Create Replayer Class

```python
from navarena_bench.replay.base import BaseReplayer
from navarena_bench.replay.loader import ReplayLoader

@BaseReplayer.register("my_replayer")
class MyReplayer(BaseReplayer):
    def __init__(self, loader: ReplayLoader, **kwargs):
        super().__init__(loader, **kwargs)
        # Initialize renderers
        
    def replay(self, output_path):
        """Generate replay"""
        replay_data = self.loader.load()
        
        # Render each frame
        frames = []
        for step_data in replay_data["trajectory"]:
            frame = self._render_frame(step_data)
            frames.append(frame)
        
        # Save video
        self._save_video(frames, output_path)
```

### 2. Use New Replayer

```python
from navarena_bench.replay import BaseReplayer

replayer = BaseReplayer.init("my_replayer", loader)
replayer.replay("output.mp4")
```

## Best Practices

### 1. Follow Interface Convention

Implement all required methods:

```python
class MyComponent(BaseComponent):
    def __init__(self, config):
        super().__init__(config)
        # Initialize
        
    # Implement all required methods
    def required_method_1(self):
        pass
    
    def required_method_2(self):
        pass
```

### 2. Use Configuration System

Use the config system for parameters:

```python
class MyComponent(BaseComponent):
    def __init__(self, config):
        super().__init__(config)
        # Read params from config
        self.param1 = config.settings.get("param1", default_value)
```

### 3. Error Handling

Add appropriate error handling:

```python
def act(self, observation):
    try:
        # Processing logic
        action = self._compute_action(observation)
        return action
    except Exception as e:
        self.logger.error(f"Action computation failed: {e}")
        # Return default action
        return {"x": 0.0, "y": 0.0, "yaw": 0.0}
```

### 4. Logging

Use logging for debugging:

```python
from navarena_core.logging import get_logger

class MyComponent(BaseComponent):
    def __init__(self, config):
        super().__init__(config)
        self.logger = get_logger(__name__)
        
    def some_method(self):
        self.logger.info("Processing...")
        # Processing logic
        self.logger.debug(f"Result: {result}")
```

## Testing Extensions

### Unit Tests

```python
import pytest
from navarena_bench.agent import Agent
from navarena_bench.configs.agent_config import AgentCfg

def test_my_agent():
    config = AgentCfg(
        agent_type="my_agent",
        model_path="/path/to/model.pth"
    )
    
    agent = Agent.init(config)
    
    # Test reset
    agent.reset()
    
    # Test act
    observation = {
        "rgb": {"camera": np.zeros((480, 640, 3))},
        "position": [0, 0, 0],
        "rotation": [1, 0, 0, 0]
    }
    action = agent.act(observation)
    
    assert "x" in action
    assert "y" in action
    assert "yaw" in action
```

## FAQ

!!! question "Registration failed"
    Ensure you use the `@Component.register("name")` decorator and the name is unique.

!!! question "Import error"
    Import the extension class before creating instances, or use an `import` to trigger registration.

!!! question "Config mismatch"
    Check config format and that all required fields exist.

!!! question "Incomplete interface"
    Implement all required methods; refer to base class docs.

## Next Steps

- View the **[Environment Module](environment.md)** in detail
- Learn about the **[Agent Module](agents.md)**
- Learn **[Evaluator Module](evaluators.md)** functionality
