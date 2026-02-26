# 评测框架 API

评测框架的完整 API 参考文档。

## Evaluator

评测器基类。

### 类定义

```python
class Evaluator(ABC):
    evaluators = {}
    
    def __init__(self, config: EvalCfg):
        """
        初始化评测器。
        
        Args:
            config: 评测配置
        """
```

### 类方法

#### register()

注册评测器类。

```python
@classmethod
def register(cls, eval_type: str):
    """
    注册评测器类。
    
    Args:
        eval_type: 评测器类型标识符
    
    Returns:
        装饰器函数
    """
```

#### init()

创建评测器实例。

```python
@classmethod
def init(cls, config: EvalCfg) -> 'Evaluator':
    """
    创建评测器实例。
    
    Args:
        config: 评测配置
    
    Returns:
        评测器实例
    """
```

### 方法

#### evaluate()

运行评测。

```python
def evaluate(self) -> Dict[str, Any]:
    """
    运行评测。
    
    Returns:
        评测结果字典
    """
```

#### eval_episode()

评测单个 episode。

```python
def eval_episode(self, episode: Dict[str, Any]) -> Dict[str, Any]:
    """
    评测单个 episode。
    
    Args:
        episode: Episode 数据
    
    Returns:
        Episode 结果
    """
```

## Env

环境基类。

### 类定义

```python
class Env(ABC):
    envs = {}
    
    def __init__(self, env_config: EnvCfg, task_config: TaskCfg):
        """
        初始化环境。
        
        Args:
            env_config: 环境配置
            task_config: 任务配置
        """
```

### 类方法

#### register()

注册环境类。

```python
@classmethod
def register(cls, env_type: str):
    """
    注册环境类。
    
    Args:
        env_type: 环境类型标识符
    """
```

#### init()

创建环境实例。

```python
@classmethod
def init(cls, env_config: EnvCfg, task_config: TaskCfg) -> 'Env':
    """
    创建环境实例。
    
    Args:
        env_config: 环境配置
        task_config: 任务配置
    
    Returns:
        环境实例
    """
```

### 方法

#### reset()

重置环境。

```python
def reset(self, episode: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    重置环境到新的 episode。
    
    Args:
        episode: Episode 数据
    
    Returns:
        初始观测
    """
```

#### step()

执行一步。

```python
def step(self, action: Dict[str, Any]) -> Tuple[Dict, float, bool, Dict]:
    """
    执行一步动作。
    
    Args:
        action: 动作字典
    
    Returns:
        (observation, reward, done, info)
    """
```

#### get_info()

获取环境信息。

```python
def get_info(self) -> Dict[str, Any]:
    """
    获取当前环境信息。
    
    Returns:
        信息字典
    """
```

## Agent

智能体基类。

### 类定义

```python
class Agent(ABC):
    agents = {}
    
    def __init__(self, config: AgentCfg):
        """
        初始化智能体。
        
        Args:
            config: 智能体配置
        """
```

### 类方法

#### register()

注册智能体类。

```python
@classmethod
def register(cls, agent_type: str):
    """
    注册智能体类。
    
    Args:
        agent_type: 智能体类型标识符
    """
```

#### init()

创建智能体实例。

```python
@classmethod
def init(cls, config: AgentCfg) -> 'Agent':
    """
    创建智能体实例。
    
    Args:
        config: 智能体配置
    
    Returns:
        智能体实例
    """
```

### 方法

#### reset()

重置智能体。

```python
def reset(self, episode: Optional[Dict[str, Any]] = None):
    """
    重置智能体状态。
    
    Args:
        episode: Episode 数据（可选）
    """
```

#### act()

生成动作。

```python
def act(self, observation: Dict[str, Any]) -> Dict[str, Any]:
    """
    根据观测生成动作。
    
    Args:
        observation: 观测字典
    
    Returns:
        动作字典 {"x": float, "y": float, "yaw": float}
    """
```

#### close()

关闭智能体。

```python
def close(self):
    """关闭智能体，释放资源"""
```

## Dataset

数据集基类。

### 类定义

```python
class Dataset(ABC):
    datasets = {}
    
    def __init__(self, config: Dict[str, Any]):
        """
        初始化数据集。
        
        Args:
            config: 数据集配置字典（含 dataset_type、dataset_path 等）
        """
```

### 方法

#### __iter__()

迭代数据集。

```python
def __iter__(self) -> Iterator[Dict[str, Any]]:
    """迭代数据集"""
```

#### __len__()

获取数据集大小。

```python
def __len__(self) -> int:
    """获取数据集大小"""
```

## Metric

指标基类。

### 类定义

```python
class Metric(ABC):
    metrics = {}
    
    def __init__(self, **kwargs):
        """初始化指标"""
```

### 类方法

#### register()

注册指标类。

```python
@classmethod
def register(cls, metric_name: str):
    """
    注册指标类。
    
    Args:
        metric_name: 指标名称
    """
```

#### init()

创建指标实例。

```python
@classmethod
def init(cls, metric_name: str, **kwargs) -> 'Metric':
    """
    创建指标实例。
    
    Args:
        metric_name: 指标名称
        **kwargs: 指标参数
    
    Returns:
        指标实例
    """
```

### 方法

#### update()

更新指标。

```python
def update(self, episode_result: Dict[str, Any]):
    """
    更新指标值。
    
    Args:
        episode_result: Episode 结果
    """
```

#### compute()

计算指标值。

```python
def compute(self) -> float:
    """
    计算最终指标值。
    
    Returns:
        指标值
    """
```

#### reset()

重置指标。

```python
def reset(self):
    """重置指标状态"""
```

## 配置类

所有配置类继承自 `navarena_core.config.BaseConfig`，支持 `from_yaml()`、`to_dict()`、`save_yaml()` 等方法。

### EvalCfg

评测配置。

```python
@dataclass
class EvalCfg(BaseConfig):
    eval_type: str = ""  # "pointnav", "objectnav", "imagenav", "vln"
    run_id: str = ""     # 默认自动生成时间戳
    env: EnvCfg = field(default_factory=EnvCfg)
    agent: AgentCfg = field(default_factory=AgentCfg)
    task: TaskCfg = field(default_factory=TaskCfg)
    dataset: Optional[Dict[str, Any]] = None  # 数据集配置字典
    eval_settings: Dict[str, Any] = field(default_factory=dict)
```

`eval_settings` 默认包含：`num_episodes`、`max_steps_per_episode`、`save_trajectories`、`output_path`。

### EnvCfg

环境配置。

```python
@dataclass
class EnvCfg(BaseConfig):
    env_type: str = ""
    env_settings: Dict[str, Any] = field(default_factory=dict)
```

### GSEnvConfig

3D GS 环境配置（用于 `env_settings`）。

```python
@dataclass
class GSEnvConfig(BaseConfig):
    camera_config: str = ""
    enable_occupancy: bool = True
    success_distance: float = 0.5
    rotation_threshold: float = 0.2
    gpu_id: Optional[int] = None
    enable_depth: bool = True
    enable_rgb: bool = True
    camera_names: list = field(default_factory=lambda: ["face", "left", "right"])
    image_width: int = 640
    image_height: int = 480
```

### AgentCfg

智能体配置。模型相关参数（如 `checkpoint_path`、`remote_url`）通过 `model_settings` 传入。

```python
@dataclass
class AgentCfg(BaseConfig):
    agent_type: str = ""
    model_settings: Dict[str, Any] = field(default_factory=dict)
    device: Optional[str] = None  # "cuda", "cpu", 或 null 自动检测
```

### TaskCfg

任务配置。

```python
@dataclass
class TaskCfg(BaseConfig):
    task_type: str = ""  # "pointnav", "objectnav", "imagenav"
```

## 工具函数

### get_logger()

获取日志记录器。

```python
def get_logger(name: str) -> logging.Logger:
    """
    获取日志记录器。
    
    Args:
        name: 日志记录器名称
    
    Returns:
        日志记录器实例
    """
```

## 异常类

### EvaluationError

评测异常。

```python
class EvaluationError(Exception):
    pass
```

### EnvironmentError

环境异常。

```python
class EnvironmentError(EvaluationError):
    pass
```

### AgentError

智能体异常。

```python
class AgentError(EvaluationError):
    pass
```
