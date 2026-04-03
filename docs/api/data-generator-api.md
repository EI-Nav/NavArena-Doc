# Data Generator API

Complete API reference for the Data Generator. The data generator (navarena-gen) uses a registration mechanism to provide multi-task Episode generation, simulation environments, path planning, and data writing.

## BaseGenerator

Base generator class that produces Episode data for different task types (pointnav, imagenav, objectnav, vln).

### Class Definition

```python
from navarena_gen.generators.base import BaseGenerator

class BaseGenerator(ABC):
    _registry: Dict[str, Type["BaseGenerator"]] = {}
```

### Class Methods

#### register()

Register a generator class.

```python
@classmethod
def register(cls, task_type: str):
    """
    Register generator class.
    
    Args:
        task_type: Task type identifier ("pointnav", "imagenav", "objectnav", "vln")
    """
```

#### init()

Create a generator instance.

```python
@classmethod
def init(cls, task_type: str, config) -> "BaseGenerator":
    """
    Create generator instance by task type.
    
    Args:
        task_type: Task type
        config: GeneratorConfig configuration object
    
    Returns:
        Generator instance
    """
```

### Methods

#### generate()

Stream episodes (iterator for low-memory writes).

```python
def generate(self, env: BaseSimEnv, num_episodes: int) -> Iterator[Episode]:
    """
    Yield episodes one-by-one, up to num_episodes.
    
    Args:
        env: Simulation environment instance
        num_episodes: Number of episodes to generate
    
    Yields:
        Episode objects
    """
```

#### generate_parallel()

Generate episodes in parallel (iterator).

```python
def generate_parallel(
    self,
    env: BaseSimEnv,
    num_episodes: int,
    num_workers: int = 4,
    batch_size: int = 20
) -> Iterator[Episode]:
    """
    Parallel generation with small-batch dynamic scheduling.
    
    Args:
        env: Simulation environment instance
        num_episodes: Number of episodes to generate
        num_workers: Number of worker processes
        batch_size: Episodes per batch per worker
    
    Yields:
        Episode objects
    """
```

### Registered Subclasses

| Register Name | Class Name | Description |
|---------------|------------|-------------|
| `pointnav` | `PointNavGenerator` | Point goal navigation |
| `imagenav` | `ImageNavGenerator` | Image goal navigation |
| `objectnav` | `ObjectNavGenerator` | Object goal navigation |
| `vln` | `VLNGenerator` | Vision-language navigation |

---

## BaseSimEnv

Simulation environment base class providing a unified interface independent of implementation (3D GS / Habitat / Isaac).

### Class Definition

```python
from navarena_gen.envs.base import BaseSimEnv

class BaseSimEnv(ABC):
    _registry: Dict[str, Type["BaseSimEnv"]] = {}
```

### Class Methods

#### init()

Create environment instance.

```python
@classmethod
def init(cls, env_type: str, config) -> "BaseSimEnv":
    """
    Create environment instance by type.
    
    Args:
        env_type: Environment type ("gs", "habitat", "isaac")
        config: Configuration object
    
    Returns:
        Environment instance
    """
```

### Main Methods

```python
def load_scene(self, scene_path: str) -> SceneInfo:
    """Load scene"""

def get_scene_info(self) -> SceneInfo:
    """Get current scene info"""

def is_navigable(self, position: List[float], radius: float = 0.0) -> bool:
    """Check if position is navigable"""

def sample_navigable_point(
    self,
    region_mask: Optional[Any] = None,
    max_attempts: int = 100
) -> Optional[NavPoint]:
    """Sample a navigable point"""

def get_shortest_path(
    self,
    start: List[float],
    goal: List[float]
) -> Optional[List[NavPoint]]:
    """Compute shortest path (global A* only)"""

def check_path_exists(self, start: List[float], goal: List[float]) -> bool:
    """Quickly check if feasible path exists"""

def plan_full_trajectory(
    self,
    start: List[float],
    goal: List[float],
    start_theta: Optional[float] = None,
    goal_theta: Optional[float] = None,
    planner_config: Optional[Dict] = None
) -> Optional[List[Dict]]:
    """Plan full trajectory (global A* + local smoothing + velocity planning)"""

def get_objects(self) -> List[Dict]:
    """Get object list in scene (for ObjectNav)"""
```

### Registered Subclasses

| Register Name | Class Name | Description |
|---------------|------------|-------------|
| `gs` | `GSSimEnv` | 3D Gaussian Splatting simulation (implemented) |
| `habitat` | `HabitatSimEnv` | Habitat environment (placeholder) |
| `isaac` | `IsaacSimEnv` | Isaac Sim environment (placeholder) |

---

## BaseInstructionGenerator

Instruction generator base class for VLN tasks. Uses Strategy pattern.

### Class Definition

```python
from navarena_gen.generators.instructions.base import BaseInstructionGenerator

class BaseInstructionGenerator(ABC):
    _registry: Dict[str, Type["BaseInstructionGenerator"]] = {}
```

### Class Methods

#### init()

Create instruction generator instance.

```python
@classmethod
def init(cls, instruction_type: str, config) -> "BaseInstructionGenerator":
    """
    Create instruction generator by type.
    
    Args:
        instruction_type: Instruction type ("simple_direction", "path_based", "object_goal")
        config: Configuration dict
    
    Returns:
        Instruction generator instance
    """
```

### Registered Subclasses

| Register Name | Class Name | Description |
|---------------|------------|-------------|
| `simple_direction` | `SimpleDirectionInstructionGenerator` | Direction + distance instructions |
| `path_based` | `PathBasedInstructionGenerator` | Path-based step-by-step instructions |
| `object_goal` | `ObjectGoalInstructionGenerator` | Object goal instructions ("find xxx") |

---

## GridAStarPlanner

Global A* path planner on occupancy grid maps.

### Class Definition

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
            pgm_map: Occupancy grid map
            resolution: Map resolution (meters per pixel)
            origin: Map origin [x, y, theta]
            free_thresh: Free space threshold
            occupied_thresh: Occupied space threshold
            robot_radius: Robot radius
            heuristic_weight: Heuristic weight
            allow_diagonal: Allow diagonal movement
            snap_search_radius: Max search radius (meters) for snapping invalid points
        """
```

### Methods

#### plan()

```python
def plan(
    self,
    start_world: Tuple[float, float],
    goal_world: Tuple[float, float]
) -> PlanResult:
    """
    Plan path from start to goal.
    
    Args:
        start_world: Start (x, y) in world coordinates
        goal_world: Goal (x, y) in world coordinates
    
    Returns:
        PlanResult with path, start_adjusted, goal_adjusted, actual_start, actual_goal
    """
```

`PlanResult` is a dataclass with `path`, `start_adjusted`, `goal_adjusted`, `actual_start`, `actual_goal`.

---

## TwoStageTrajectoryPlanner

Two-stage trajectory planner: global A* + local smoothing (MPC/DWA/TEB) + S-curve velocity planning.

### Class Definition

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
            config: Robot configuration
            pgm_map: Occupancy grid map
            resolution: Map resolution
            origin: Map origin
            free_thresh: Free space threshold
            occupied_thresh: Occupied space threshold
            z_coordinate: Z coordinate
            planner_config: Planner config (astar, path_smoothing)
        """
```

### Methods

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
    Plan full trajectory from start to goal.
    
    Args:
        start_world: Start (x, y) in world coordinates
        goal_world: Goal (x, y) in world coordinates
        start_theta: Start orientation (radians)
        goal_theta: Goal orientation (radians)
    
    Returns:
        List of trajectory points (position, rotation, velocity, etc.)
    """
```

---

## DatasetWriter

Episode metadata writer (Parquet format v1.0.0).

### Instance Methods

```python
ds_writer = DatasetWriter(base_dir: str)

def add_episode(self, episode: Episode, chunk_index: int) -> None:
    """Add episode metadata"""

def write(self) -> str:
    """Write meta/episodes.parquet. Returns path."""

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
    """Write meta/info.json. Returns path."""
```

### Static Methods

```python
DatasetWriter.write_checkpoint(state: CheckpointState, path: str) -> None
DatasetWriter.read_checkpoint(path: str) -> Optional[CheckpointState]
DatasetWriter.consolidate_episode_metadata(base_dir: str) -> List[Episode]
DatasetWriter.consolidate_chunks_to_meta(base_dir: str) -> str
DatasetWriter.get_max_episode_index(episodes: List[Episode], split: str) -> int
```

---

## TrajectoryWriter

GT trajectory writer (chunked Parquet format).

### Instance Methods

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
    """Buffer trajectory steps. Returns chunk index."""

def close(self) -> int:
    """Flush remaining data. Returns total chunks written."""
```

### Static Methods

```python
TrajectoryWriter.scan_existing_chunks(base_dir: str) -> int
"""Return count of fully-written chunk directories."""
```

---

## GeneratorConfig

Data generation configuration class, extending `navarena_core.config.BaseConfig`.

### Class Definition

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

### Methods

```python
@classmethod
def from_yaml(cls, path, **overrides) -> "GeneratorConfig":
    """Load config from YAML file"""

@classmethod
def from_files(
    cls,
    base_config: str,
    env_config: Optional[str] = None,
    task_config: Optional[str] = None
) -> "GeneratorConfig":
    """Load and merge from multiple YAML files"""

def validate(self) -> None:
    """Validate configuration"""

def get_resolved_scene_path(self) -> str:
    """Return absolute path to scene assets"""

def get_scene_relative_path(self) -> str:
    """Return path relative to $NAVARENA_DATA_DIR: assets/{scene_path}"""

def get_scene_id(self) -> str:
    """Get scene_id from manifest.json"""

def get_output_base_dir(self) -> str:
    """Return output base dir: datasets/{dataset_name}/{scene_path}/{task_type}"""

def get_scene_dir(self) -> str:
    """Return scene dir: datasets/{dataset_name}/{scene_path}"""

def get_dataset_root(self) -> str:
    """Return dataset root: datasets/{dataset_name}"""
```

---

## Usage Example

```python
from navarena_gen.config.base_config import GeneratorConfig
from navarena_gen.envs.base import BaseSimEnv
from navarena_gen.generators.base import BaseGenerator
from navarena_gen.data.writer import DatasetWriter, TrajectoryWriter

# Load config
config = GeneratorConfig.from_yaml("configs/examples/pointnav_example.yaml")
config.validate()

# Create environment
env = BaseSimEnv.init(config.env_type, config.env_config)
scene_info = env.load_scene(config.get_resolved_scene_path())

# Create generator and writers
generator = BaseGenerator.init(config.task_type, config.task_config)
output_dir = config.get_output_base_dir()
ds_writer = DatasetWriter(output_dir)
traj_writer = TrajectoryWriter(
    output_dir,
    chunk_size=1000,
    episode_writer=ds_writer.episode_writer,
)

# Stream generate and write to Parquet
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
