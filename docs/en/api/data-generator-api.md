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

Generate episodes.

```python
def generate(self, env: BaseSimEnv, num_episodes: int) -> List[Episode]:
    """
    Generate specified number of episodes.
    
    Args:
        env: Simulation environment instance
        num_episodes: Number of episodes to generate
    
    Returns:
        List of Episode objects
    """
```

#### generate_parallel()

Generate episodes in parallel.

```python
def generate_parallel(
    self,
    env: BaseSimEnv,
    num_episodes: int,
    num_workers: int = 4
) -> List[Episode]:
    """
    Generate episodes in parallel using multiple worker processes.
    
    Args:
        env: Simulation environment instance
        num_episodes: Number of episodes to generate
        num_workers: Number of worker processes
    
    Returns:
        List of Episode objects
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

def sample_navigable_point(self) -> NavPoint:
    """Sample point in navigable region"""

def generate_grid_points(self, spacing: float) -> List[NavPoint]:
    """Generate navigable points on grid"""

def get_shortest_path(self, start: NavPoint, goal: NavPoint) -> Optional[List[NavPoint]]:
    """Compute shortest path"""

def plan_full_trajectory(
    self,
    path: List[NavPoint],
    planner_config: Optional[Dict] = None
) -> List[TrajectoryStep]:
    """Plan full trajectory (including velocity, actions)"""

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
        allow_diagonal: bool = True
    ):
        """
        Args:
            pgm_map: PGM occupancy map
            resolution: Map resolution (meters per pixel)
            origin: Map origin [x, y, theta]
            free_thresh: Free space threshold
            occupied_thresh: Occupied space threshold
            robot_radius: Robot radius
            heuristic_weight: Heuristic weight
            allow_diagonal: Allow diagonal movement
        """
```

### Methods

#### plan()

```python
def plan(
    self,
    start: Tuple[float, float],
    goal: Tuple[float, float]
) -> Optional[List[Tuple[float, float]]]:
    """
    Plan path from start to goal.
    
    Args:
        start: Start (x, y) in world coordinates
        goal: Goal (x, y) in world coordinates
    
    Returns:
        Path point list, or None if no path
    """
```

---

## TwoStageTrajectoryPlanner

Two-stage trajectory planner: global A* + local smoothing (MPC/DWA/TEB).

### Class Definition

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
        """Initialize trajectory planner"""
```

### Methods

#### plan()

```python
def plan(
    self,
    path: List[Tuple[float, float]],
    start_rotation: float,
    goal_rotation: Optional[float] = None
) -> List[TrajectoryStep]:
    """
    Plan full trajectory (with velocity, actions) from path.
    
    Args:
        path: List of 2D path points
        start_rotation: Start orientation (radians)
        goal_rotation: Goal orientation (optional)
    
    Returns:
        List of TrajectoryStep
    """
```

---

## DatasetWriter

Dataset writer that serializes Episodes to JSON.

### Static Methods

#### write_dataset()

```python
@staticmethod
def write_dataset(
    dataset: VLNDataset,
    output_path: str,
    indent: int = 2,
    ensure_ascii: bool = False
) -> None:
    """Write VLNDataset to JSON file"""
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
    """Write Episode list to JSON file"""
```

---

## TrajectoryWriter

GT trajectory file writer.

### Static Methods

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
    """Write GT trajectory to JSON file"""
```

#### get_trajectory_filename()

```python
@staticmethod
def get_trajectory_filename(episode_id: str) -> str:
    """Generate trajectory filename, e.g. train_000001_gt.json"""
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

def validate(self) -> None:
    """Validate configuration"""

def get_resolved_scene_path(self) -> str:
    """Return absolute path to scene assets"""

def get_scene_id(self) -> str:
    """Get scene_id from manifest.json"""

def get_output_base_dir(self) -> str:
    """Return output base directory (including task_type)"""

def get_dataset_root(self) -> str:
    """Return dataset root directory"""
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
env = BaseSimEnv.init(config.env_type, config)
scene_info = env.load_scene(config.get_resolved_scene_path())

# Create generator
generator = BaseGenerator.init(config.task_type, config)

# Generate episodes
episodes = generator.generate(env, config.num_episodes)

# Write data
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
