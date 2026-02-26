# 数据生成器 API

数据生成器的完整 API 参考文档。数据生成器（navarena-gen）基于注册机制，提供多任务 Episode 生成、仿真环境、路径规划与数据写入等核心功能。

## BaseGenerator

生成器基类，按任务类型（pointnav、imagenav、objectnav、vln）生成 Episode 数据。

### 类定义

```python
from navarena_gen.generators.base import BaseGenerator

class BaseGenerator(ABC):
    _registry: Dict[str, Type["BaseGenerator"]] = {}
```

### 类方法

#### register()

注册生成器类。

```python
@classmethod
def register(cls, task_type: str):
    """
    注册生成器类。
    
    Args:
        task_type: 任务类型标识符 ("pointnav", "imagenav", "objectnav", "vln")
    """
```

#### init()

创建生成器实例。

```python
@classmethod
def init(cls, task_type: str, config) -> "BaseGenerator":
    """
    根据任务类型创建生成器实例。
    
    Args:
        task_type: 任务类型
        config: GeneratorConfig 配置对象
    
    Returns:
        生成器实例
    """
```

### 方法

#### generate()

生成 episodes。

```python
def generate(self, env: BaseSimEnv, num_episodes: int) -> List[Episode]:
    """
    生成指定数量的 episodes。
    
    Args:
        env: 仿真环境实例
        num_episodes: 要生成的 episode 数量
    
    Returns:
        Episode 对象列表
    """
```

#### generate_parallel()

并行生成 episodes。

```python
def generate_parallel(
    self,
    env: BaseSimEnv,
    num_episodes: int,
    num_workers: int = 4
) -> List[Episode]:
    """
    使用多进程并行生成 episodes。
    
    Args:
        env: 仿真环境实例
        num_episodes: 要生成的 episode 数量
        num_workers: 工作进程数
    
    Returns:
        Episode 对象列表
    """
```

### 已注册子类

| 注册名 | 类名 | 说明 |
|--------|------|------|
| `pointnav` | `PointNavGenerator` | 点目标导航 |
| `imagenav` | `ImageNavGenerator` | 图像目标导航 |
| `objectnav` | `ObjectNavGenerator` | 物体目标导航 |
| `vln` | `VLNGenerator` | 视觉语言导航 |

---

## BaseSimEnv

仿真环境基类，提供与具体实现（3D GS / Habitat / Isaac）无关的统一接口。

### 类定义

```python
from navarena_gen.envs.base import BaseSimEnv

class BaseSimEnv(ABC):
    _registry: Dict[str, Type["BaseSimEnv"]] = {}
```

### 类方法

#### init()

创建环境实例。

```python
@classmethod
def init(cls, env_type: str, config) -> "BaseSimEnv":
    """
    根据类型创建环境实例。
    
    Args:
        env_type: 环境类型 ("gs", "habitat", "isaac")
        config: 配置对象
    
    Returns:
        环境实例
    """
```

### 主要方法

```python
def load_scene(self, scene_path: str) -> SceneInfo:
    """加载场景"""

def get_scene_info(self) -> SceneInfo:
    """获取当前场景信息"""

def sample_navigable_point(self) -> NavPoint:
    """在可导航区域内采样点"""

def generate_grid_points(self, spacing: float) -> List[NavPoint]:
    """按网格间距生成可导航点"""

def get_shortest_path(self, start: NavPoint, goal: NavPoint) -> Optional[List[NavPoint]]:
    """计算最短路径"""

def plan_full_trajectory(
    self,
    path: List[NavPoint],
    planner_config: Optional[Dict] = None
) -> List[TrajectoryStep]:
    """规划完整轨迹（含速度、动作等）"""

def get_objects(self) -> List[Dict]:
    """获取场景中的物体列表（ObjectNav 用）"""
```

### 已注册子类

| 注册名 | 类名 | 说明 |
|--------|------|------|
| `gs` | `GSSimEnv` | 3D Gaussian Splatting 仿真环境（已实现） |
| `habitat` | `HabitatSimEnv` | Habitat 环境（占位） |
| `isaac` | `IsaacSimEnv` | Isaac Sim 环境（占位） |

---

## BaseInstructionGenerator

指令生成器基类，为 VLN 任务生成自然语言指令。采用 Strategy 模式。

### 类定义

```python
from navarena_gen.generators.instructions.base import BaseInstructionGenerator

class BaseInstructionGenerator(ABC):
    _registry: Dict[str, Type["BaseInstructionGenerator"]] = {}
```

### 类方法

#### init()

创建指令生成器实例。

```python
@classmethod
def init(cls, instruction_type: str, config) -> "BaseInstructionGenerator":
    """
    根据类型创建指令生成器。
    
    Args:
        instruction_type: 指令类型 ("simple_direction", "path_based", "object_goal")
        config: 配置字典
    
    Returns:
        指令生成器实例
    """
```

### 已注册子类

| 注册名 | 类名 | 说明 |
|--------|------|------|
| `simple_direction` | `SimpleDirectionInstructionGenerator` | 方向 + 距离指令 |
| `path_based` | `PathBasedInstructionGenerator` | 基于路径的分步指令 |
| `object_goal` | `ObjectGoalInstructionGenerator` | 物体目标指令（"找到xxx"） |

---

## GridAStarPlanner

全局 A* 路径规划器，基于占据栅格地图。

### 类定义

```python
from navarena_gen.planning.global_planner import GridAStarPlanner

class GridAStarPlanner:
    def __init__(
        self,
        pgm_map: np.ndarray,
        resolution: float,
        origin: List[float],
        free_thresh: float,
        occupied_thresh: float,
        robot_radius: float,
        heuristic_weight: float = 1.0,
        allow_diagonal: bool = True
    ):
        """
        Args:
            pgm_map: PGM 占据栅格地图
            resolution: 地图分辨率（米/像素）
            origin: 地图原点 [x, y, theta]
            free_thresh: 自由空间阈值
            occupied_thresh: 占据空间阈值
            robot_radius: 机器人半径
            heuristic_weight: 启发式权重
            allow_diagonal: 是否允许对角移动
        """
```

### 方法

#### plan()

```python
def plan(
    self,
    start: Tuple[float, float],
    goal: Tuple[float, float]
) -> Optional[List[Tuple[float, float]]]:
    """
    规划从起点到目标的路径。
    
    Args:
        start: 起点 (x, y) 世界坐标
        goal: 目标 (x, y) 世界坐标
    
    Returns:
        路径点列表，或 None 表示无路径
    """
```

---

## TwoStageTrajectoryPlanner

两阶段轨迹规划器：全局 A* + 局部平滑（MPC/DWA/TEB）。

### 类定义

```python
from navarena_gen.planning.trajectory_planner import TwoStageTrajectoryPlanner

class TwoStageTrajectoryPlanner:
    def __init__(
        self,
        astar: GridAStarPlanner,
        robot_config: RobotConfig,
        local_planner: str = "mpc",  # "mpc" | "dwa" | "teb"
        **kwargs
    ):
        """初始化轨迹规划器"""
```

### 方法

#### plan()

```python
def plan(
    self,
    path: List[Tuple[float, float]],
    start_rotation: float,
    goal_rotation: Optional[float] = None
) -> List[TrajectoryStep]:
    """
    将路径规划为完整轨迹（含速度、动作）。
    
    Args:
        path: 2D 路径点列表
        start_rotation: 起点朝向（弧度）
        goal_rotation: 目标朝向（可选）
    
    Returns:
        TrajectoryStep 列表
    """
```

---

## DatasetWriter

数据集写入器，将 Episode 序列化为 JSON。

### 静态方法

#### write_dataset()

```python
@staticmethod
def write_dataset(
    dataset: VLNDataset,
    output_path: str,
    indent: int = 2,
    ensure_ascii: bool = False
) -> None:
    """将 VLNDataset 写入 JSON 文件"""
```

#### write_episodes()

```python
@staticmethod
def write_episodes(
    episodes: List[Episode],
    output_path: str,
    dataset_name: str = "navarena_vln",
    version: str = "1.0.0",
    metadata: Dict[str, Any] = None,
    indent: int = 2,
    ensure_ascii: bool = False
) -> None:
    """将 Episode 列表写入 JSON 文件"""
```

---

## TrajectoryWriter

GT 轨迹文件写入器。

### 静态方法

#### write_trajectory()

```python
@staticmethod
def write_trajectory(
    episode_id: str,
    trajectory: List[TrajectoryStep],
    output_path: str,
    actions: List[int] = None,
    action_names: List[str] = None,
    indent: int = 2,
    ensure_ascii: bool = False
) -> None:
    """将 GT 轨迹写入 JSON 文件"""
```

#### get_trajectory_filename()

```python
@staticmethod
def get_trajectory_filename(episode_id: str) -> str:
    """生成轨迹文件名，如 train_000001_gt.json"""
```

---

## GeneratorConfig

数据生成配置类，继承自 `navarena_core.config.BaseConfig`。

### 类定义

```python
from navarena_gen.config.base_config import GeneratorConfig

@dataclass
class GeneratorConfig(BaseConfig):
    env_type: str = "gs"
    scene_path: str = ""
    task_type: str = "pointnav"
    num_episodes: int = 100
    split: str = "train"
    dataset_name: str = "navarena_vln"
    env_config: Dict[str, Any] = field(default_factory=dict)
    task_config: Dict[str, Any] = field(default_factory=dict)
```

### 方法

```python
@classmethod
def from_yaml(cls, path, **overrides) -> "GeneratorConfig":
    """从 YAML 文件加载配置"""

def validate(self) -> None:
    """验证配置有效性"""

def get_resolved_scene_path(self) -> str:
    """返回场景资产的绝对路径"""

def get_scene_id(self) -> str:
    """从 manifest.json 获取 scene_id"""

def get_output_base_dir(self) -> str:
    """返回输出基础目录（含 task_type）"""

def get_dataset_root(self) -> str:
    """返回数据集根目录"""
```

---

## 使用示例

```python
from navarena_gen.config.base_config import GeneratorConfig
from navarena_gen.envs.base import BaseSimEnv
from navarena_gen.generators.base import BaseGenerator
from navarena_gen.data.writer import DatasetWriter, TrajectoryWriter

# 加载配置
config = GeneratorConfig.from_yaml("configs/examples/pointnav_example.yaml")
config.validate()

# 创建环境
env = BaseSimEnv.init(config.env_type, config)
scene_info = env.load_scene(config.get_resolved_scene_path())

# 创建生成器
generator = BaseGenerator.init(config.task_type, config)

# 生成 episodes
episodes = generator.generate(env, config.num_episodes)

# 写入数据
output_path = config.get_output_base_dir()
DatasetWriter.write_episodes(
    episodes,
    f"{output_path}/{config.split}.json",
    dataset_name=config.dataset_name,
    metadata={"scene_id": scene_info.scene_id}
)

for ep in episodes:
    if ep.gt_path and ep.gt_path.trajectory:
        traj_path = f"{output_path}/gt_trajectories/{TrajectoryWriter.get_trajectory_filename(ep.episode_id)}"
        TrajectoryWriter.write_trajectory(ep.episode_id, ep.gt_path.trajectory, traj_path)
```
