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

流式生成 episodes（迭代器，支持低内存写入）。

```python
def generate(self, env: BaseSimEnv, num_episodes: int) -> Iterator[Episode]:
    """
    逐个 yield episodes，最多 num_episodes 个。
    
    Args:
        env: 仿真环境实例
        num_episodes: 要生成的 episode 数量
    
    Yields:
        Episode 对象
    """
```

#### generate_parallel()

并行生成 episodes（迭代器）。

```python
def generate_parallel(
    self,
    env: BaseSimEnv,
    num_episodes: int,
    num_workers: int = 4,
    batch_size: int = 20
) -> Iterator[Episode]:
    """
    多进程并行生成，使用小批次动态调度。
    
    Args:
        env: 仿真环境实例
        num_episodes: 要生成的 episode 数量
        num_workers: 工作进程数
        batch_size: 每进程每批 episode 数量
    
    Yields:
        Episode 对象
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

def is_navigable(self, position: List[float], radius: float = 0.0) -> bool:
    """检查位置是否可导航"""

def sample_navigable_point(
    self,
    region_mask: Optional[Any] = None,
    max_attempts: int = 100
) -> Optional[NavPoint]:
    """在可导航区域内采样点"""

def get_shortest_path(
    self,
    start: List[float],   # [x, y, z]
    goal: List[float]
) -> Optional[List[NavPoint]]:
    """计算最短路径（仅全局 A*）"""

def check_path_exists(self, start: List[float], goal: List[float]) -> bool:
    """快速检查起点到终点是否存在可行路径"""

def plan_full_trajectory(
    self,
    start: List[float],
    goal: List[float],
    start_theta: Optional[float] = None,
    goal_theta: Optional[float] = None,
    planner_config: Optional[Dict] = None
) -> Optional[List[Dict]]:
    """规划完整轨迹（全局 A* + 局部平滑 + 速度规划）"""

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
        allow_diagonal: bool = True,
        snap_search_radius: float = 1.0
    ):
        """
        Args:
            pgm_map: 占据栅格地图
            resolution: 地图分辨率（米/像素）
            origin: 地图原点 [x, y, theta]
            free_thresh: 自由空间阈值
            occupied_thresh: 占据空间阈值
            robot_radius: 机器人半径
            heuristic_weight: 启发式权重
            allow_diagonal: 是否允许对角移动
            snap_search_radius: 无效点修正时的最大搜索半径（米）
        """
```

### 方法

#### plan()

```python
def plan(
    self,
    start_world: Tuple[float, float],
    goal_world: Tuple[float, float]
) -> PlanResult:
    """
    规划从起点到目标的路径。
    
    Args:
        start_world: 起点 (x, y) 世界坐标
        goal_world: 目标 (x, y) 世界坐标
    
    Returns:
        PlanResult: 含 path、start_adjusted、goal_adjusted、actual_start、actual_goal
    """
```

`PlanResult` 为 dataclass，包含 `path`、`start_adjusted`、`goal_adjusted`、`actual_start`、`actual_goal` 等字段。

---

## TwoStageTrajectoryPlanner

两阶段轨迹规划器：全局 A* + 局部平滑（MPC/DWA/TEB）+ S 曲线速度规划。

### 类定义

```python
from navarena_gen.planning.trajectory_planner import TwoStageTrajectoryPlanner, RobotConfig

class TwoStageTrajectoryPlanner:
    def __init__(
        self,
        config: RobotConfig,
        pgm_map: np.ndarray,
        resolution: float,
        origin: List[float],
        free_thresh: float,
        occupied_thresh: float,
        z_coordinate: float = -0.9,
        planner_config: Optional[Dict] = None
    ):
        """
        Args:
            config: 机器人配置（RobotConfig）
            pgm_map: 占据栅格地图
            resolution: 地图分辨率
            origin: 地图原点
            free_thresh: 自由空间阈值
            occupied_thresh: 占据空间阈值
            z_coordinate: Z 坐标
            planner_config: 规划器配置（astar、path_smoothing）
        """
```

### 方法

#### plan()

```python
def plan(
    self,
    start_world: Tuple[float, float],
    goal_world: Tuple[float, float],
    start_theta: float = 0.0,
    goal_theta: float = 0.0
) -> List[Dict]:
    """
    从起点到终点规划完整轨迹。
    
    Args:
        start_world: 起点 (x, y) 世界坐标
        goal_world: 终点 (x, y) 世界坐标
        start_theta: 起点朝向（弧度）
        goal_theta: 终点朝向（弧度）
    
    Returns:
        轨迹点列表（含 position、rotation、velocity 等）
    """
```

---

## DatasetWriter

Episode 元数据写入器（Parquet 格式 v1.0.0）。

### 实例方法

```python
ds_writer = DatasetWriter(base_dir: str)

def add_episode(self, episode: Episode, chunk_index: int) -> None:
    """添加 episode 元数据"""

def write(self) -> str:
    """写入 meta/episodes.parquet，返回路径"""

def write_info(
    self,
    *,
    dataset_name: str,
    scene_path: str,
    task_type: str,
    split: str,
    num_episodes: int,
    num_chunks: int,
    chunk_size: int = 1000,
    extra: Optional[Dict] = None
) -> str:
    """写入 meta/info.json，返回路径"""
```

### 静态方法

```python
DatasetWriter.write_checkpoint(state: CheckpointState, path: str) -> None
DatasetWriter.read_checkpoint(path: str) -> Optional[CheckpointState]
DatasetWriter.consolidate_episode_metadata(base_dir: str) -> List[Episode]
DatasetWriter.consolidate_chunks_to_meta(base_dir: str) -> str
DatasetWriter.get_max_episode_index(episodes: List[Episode], split: str) -> int
```

---

## TrajectoryWriter

GT 轨迹写入器（Parquet 分块格式）。

### 实例方法

```python
traj_writer = TrajectoryWriter(
    base_dir: str,
    chunk_size: int = 1000,
    start_chunk_index: int = 0,
    episode_writer: Optional[ParquetEpisodeWriter] = None
)

def add_episode(
    self,
    episode_id: str,
    trajectory: List[TrajectoryStep]
) -> int:
    """缓冲轨迹步骤，返回 chunk 索引"""

def close(self) -> int:
    """刷新剩余数据，返回写入的 chunk 总数"""
```

### 静态方法

```python
TrajectoryWriter.scan_existing_chunks(base_dir: str) -> int
"""返回已完整写入的 chunk 目录数量"""
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

@classmethod
def from_files(
    cls,
    base_config: str,
    env_config: Optional[str] = None,
    task_config: Optional[str] = None
) -> "GeneratorConfig":
    """从多个 YAML 文件合并加载"""

def validate(self) -> None:
    """验证配置有效性"""

def get_resolved_scene_path(self) -> str:
    """返回场景资产的绝对路径"""

def get_scene_relative_path(self) -> str:
    """返回相对于 $NAVARENA_DATA_DIR 的路径：assets/{scene_path}"""

def get_scene_id(self) -> str:
    """从 manifest.json 获取 scene_id"""

def get_output_base_dir(self) -> str:
    """返回输出基础目录：datasets/{dataset_name}/{scene_path}/{task_type}"""

def get_scene_dir(self) -> str:
    """返回数据集场景目录：datasets/{dataset_name}/{scene_path}"""

def get_dataset_root(self) -> str:
    """返回数据集根目录：datasets/{dataset_name}"""
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
env = BaseSimEnv.init(config.env_type, config.env_config)
scene_info = env.load_scene(config.get_resolved_scene_path())

# 创建生成器和写入器
generator = BaseGenerator.init(config.task_type, config.task_config)
output_dir = config.get_output_base_dir()
ds_writer = DatasetWriter(output_dir)
traj_writer = TrajectoryWriter(
    output_dir,
    chunk_size=1000,
    episode_writer=ds_writer.episode_writer,
)

# 流式生成并写入 Parquet
for episode in generator.generate(env, config.num_episodes):
    if episode.gt_path and episode.gt_path.trajectory:
        chunk_idx = traj_writer.add_episode(episode.episode_id, episode.gt_path.trajectory)
        ds_writer.add_episode(episode, chunk_index=chunk_idx)

traj_writer.close()
ds_writer.consolidate_chunks_to_meta(output_dir)
ds_writer.write_info(
    dataset_name=config.dataset_name,
    scene_path=config.get_scene_relative_path(),
    task_type=config.task_type,
    split=config.split,
    num_episodes=...,
    num_chunks=...,
    chunk_size=1000,
)
```
