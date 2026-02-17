# Evaluation Framework API

Complete API reference for the Evaluation Framework.

## Evaluator

Evaluator base class.

### Class Definition

```python
class Evaluator(ABC):
    evaluators = {}
    
    def __init__(self, config: EvalCfg):
        """
        Initialize evaluator.
        
        Args:
            config: Evaluation configuration
        """
```

### Class Methods

#### register()

Register evaluator class.

```python
@classmethod
def register(cls, eval_type: str):
    """
    Register evaluator class.
    
    Args:
        eval_type: Evaluator type identifier
    
    Returns:
        Decorator function
    """
```

#### init()

Create evaluator instance.

```python
@classmethod
def init(cls, config: EvalCfg) -> 'Evaluator':
    """
    Create evaluator instance.
    
    Args:
        config: Evaluation configuration
    
    Returns:
        Evaluator instance
    """
```

### Methods

#### evaluate()

Run evaluation.

```python
def evaluate(self) -> Dict[str, Any]:
    """
    Run evaluation.
    
    Returns:
        Evaluation result dictionary
    """
```

#### eval_episode()

Evaluate single episode.

```python
def eval_episode(self, episode: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluate single episode.
    
    Args:
        episode: Episode data
    
    Returns:
        Episode result
    """
```

## Env

Environment base class.

### Class Definition

```python
class Env(ABC):
    envs = {}
    
    def __init__(self, env_config: EnvCfg, task_config: TaskCfg):
        """
        Initialize environment.
        
        Args:
            env_config: Environment configuration
            task_config: Task configuration
        """
```

### Class Methods

#### register()

Register environment class.

```python
@classmethod
def register(cls, env_type: str):
    """
    Register environment class.
    
    Args:
        env_type: Environment type identifier
    """
```

#### init()

Create environment instance.

```python
@classmethod
def init(cls, env_config: EnvCfg, task_config: TaskCfg) -> 'Env':
    """
    Create environment instance.
    
    Args:
        env_config: Environment configuration
        task_config: Task configuration
    
    Returns:
        Environment instance
    """
```

### Methods

#### reset()

Reset environment.

```python
def reset(self, episode: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Reset environment for new episode.
    
    Args:
        episode: Episode data
    
    Returns:
        Initial observation
    """
```

#### step()

Execute one step.

```python
def step(self, action: Dict[str, Any]) -> Tuple[Dict, float, bool, Dict]:
    """
    Execute one action step.
    
    Args:
        action: Action dictionary
    
    Returns:
        (observation, reward, done, info)
    """
```

#### get_info()

Get environment info.

```python
def get_info(self) -> Dict[str, Any]:
    """
    Get current environment info.
    
    Returns:
        Info dictionary
    """
```

## Agent

Agent base class.

### Class Definition

```python
class Agent(ABC):
    agents = {}
    
    def __init__(self, config: AgentCfg):
        """
        Initialize agent.
        
        Args:
            config: Agent configuration
        """
```

### Class Methods

#### register()

Register agent class.

```python
@classmethod
def register(cls, agent_type: str):
    """
    Register agent class.
    
    Args:
        agent_type: Agent type identifier
    """
```

#### init()

Create agent instance.

```python
@classmethod
def init(cls, config: AgentCfg) -> 'Agent':
    """
    Create agent instance.
    
    Args:
        config: Agent configuration
    
    Returns:
        Agent instance
    """
```

### Methods

#### reset()

Reset agent.

```python
def reset(self, episode: Optional[Dict[str, Any]] = None):
    """
    Reset agent state.
    
    Args:
        episode: Episode data (optional)
    """
```

#### act()

Generate action.

```python
def act(self, observation: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate action from observation.
    
    Args:
        observation: Observation dictionary
    
    Returns:
        Action dictionary {"x": float, "y": float, "yaw": float}
    """
```

#### close()

Close agent.

```python
def close(self):
    """Close agent and release resources"""
```

## Dataset

Dataset base class.

### Class Definition

```python
class Dataset(ABC):
    datasets = {}
    
    def __init__(self, config: DatasetCfg):
        """
        Initialize dataset.
        
        Args:
            config: Dataset configuration
        """
```

### Methods

#### __iter__()

Iterate over dataset.

```python
def __iter__(self) -> Iterator[Dict[str, Any]]:
    """Iterate over dataset"""
```

#### __len__()

Get dataset size.

```python
def __len__(self) -> int:
    """Get dataset size"""
```

## Metric

Metric base class.

### Class Definition

```python
class Metric(ABC):
    metrics = {}
    
    def __init__(self, **kwargs):
        """Initialize metric"""
```

### Class Methods

#### register()

Register metric class.

```python
@classmethod
def register(cls, metric_name: str):
    """
    Register metric class.
    
    Args:
        metric_name: Metric name
    """
```

#### init()

Create metric instance.

```python
@classmethod
def init(cls, metric_name: str, **kwargs) -> 'Metric':
    """
    Create metric instance.
    
    Args:
        metric_name: Metric name
        **kwargs: Metric parameters
    
    Returns:
        Metric instance
    """
```

### Methods

#### update()

Update metric.

```python
def update(self, episode_result: Dict[str, Any]):
    """
    Update metric value.
    
    Args:
        episode_result: Episode result
    """
```

#### compute()

Compute metric value.

```python
def compute(self) -> float:
    """
    Compute final metric value.
    
    Returns:
        Metric value
    """
```

#### reset()

Reset metric.

```python
def reset(self):
    """Reset metric state"""
```

## Configuration Classes

### EvalCfg

Evaluation configuration.

```python
@dataclass
class EvalCfg:
    eval_type: str
    env: EnvCfg
    agent: AgentCfg
    task: TaskCfg
    dataset: DatasetCfg
    eval_settings: Dict[str, Any]
```

### EnvCfg

Environment configuration.

```python
@dataclass
class EnvCfg:
    env_type: str
    env_settings: Dict[str, Any]
```

### AgentCfg

Agent configuration.

```python
@dataclass
class AgentCfg:
    agent_type: str
    model_path: Optional[str]
    model_settings: Dict[str, Any]
    device: Optional[str]
```

### TaskCfg

Task configuration.

```python
@dataclass
class TaskCfg:
    task_type: str
    task_settings: Dict[str, Any]
```

### DatasetCfg

Dataset configuration.

```python
@dataclass
class DatasetCfg:
    dataset_type: str
    dataset_path: str
    shuffle: bool
```

## Utility Functions

### get_logger()

Get logger instance.

```python
def get_logger(name: str) -> logging.Logger:
    """
    Get logger instance.
    
    Args:
        name: Logger name
    
    Returns:
        Logger instance
    """
```

## Exception Classes

### EvaluationError

Evaluation exception.

```python
class EvaluationError(Exception):
    pass
```

### EnvironmentError

Environment exception.

```python
class EnvironmentError(EvaluationError):
    pass
```

### AgentError

Agent exception.

```python
class AgentError(EvaluationError):
    pass
```
