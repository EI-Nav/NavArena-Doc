# Data Generator API

Complete API reference for the Data Generator.

## VLNDataPipeline

Pipeline main class that orchestrates all stages.

### Class Definition

```python
class VLNDataPipeline:
    def __init__(
        self,
        config_path: str,
        use_labels_file: bool = False,
        previous_output_dir: Optional[str] = None
    ):
        """
        Initialize Pipeline.
        
        Args:
            config_path: Path to Pipeline config file
            use_labels_file: Whether to use labels.json
            previous_output_dir: Output directory from previous run (for Stage 6)
        """
```

### Methods

#### run()

Run Pipeline or selected stages.

```python
def run(self, stages: Optional[list] = None) -> PipelineResults:
    """
    Run Pipeline.
    
    Args:
        stages: List of stages to run, e.g. ['stage1', 'stage2']
                If None, run all stages
    
    Returns:
        PipelineResults object
    """
```

### Usage Example

```python
from src.pipeline.navarena_gen import VLNDataPipeline

# Create Pipeline
pipeline = VLNDataPipeline("configs/main/pipeline.yaml")

# Run all stages
results = pipeline.run()

# Run selected stages
results = pipeline.run(stages=['stage1', 'stage2', 'stage3'])
```

## SceneMetadata

Scene metadata class.

### Class Definition

```python
class SceneMetadata:
    def __init__(self, scene_directory: str):
        """
        Initialize scene metadata.
        
        Args:
            scene_directory: Path to scene directory
        """
```

### Attributes

- `pgm_file`: Path to PGM map file
- `yaml_file`: Path to YAML config file
- `ply_file`: Path to PLY point cloud file
- `ground_height`: Ground height
- `is_normalized`: Whether scene is normalized

## TargetSampler

Target sampler.

### Class Definition

```python
class TargetSampler:
    def __init__(
        self,
        pgm_map: np.ndarray,
        mask: np.ndarray,
        resolution: float,
        origin: List[float],
        free_thresh: float,
        occupied_thresh: float
    ):
        """
        Initialize sampler.
        
        Args:
            pgm_map: PGM map array
            mask: Region mask
            resolution: Map resolution
            origin: Map origin
            free_thresh: Free space threshold
            occupied_thresh: Occupied space threshold
        """
```

### Methods

#### sample_targets()

Sample target points.

```python
def sample_targets(
    self,
    target_count: int,
    clearance_radius: float,
    min_distance: float,
    max_distance: float,
    max_attempts: int = 10000
) -> List[SampledTarget]:
    """
    Sample target points.
    
    Args:
        target_count: Number of targets
        clearance_radius: Safety radius
        min_distance: Minimum distance
        max_distance: Maximum distance
        max_attempts: Maximum attempts
    
    Returns:
        List of sampled targets
    """
```

## SemanticDetector

Semantic detector.

### Class Definition

```python
class SemanticDetector:
    def __init__(
        self,
        yolo_model_path: str,
        sam_model_path: str,
        confidence_threshold: float = 0.5
    ):
        """
        Initialize detector.
        
        Args:
            yolo_model_path: Path to YOLO model
            sam_model_path: Path to SAM model
            confidence_threshold: Confidence threshold
        """
```

### Methods

#### detect()

Detect semantic objects.

```python
def detect(
    self,
    images: List[np.ndarray],
    camera_poses: List[Dict]
) -> List[Detection3D]:
    """
    Detect semantic objects.
    
    Args:
        images: Image list
        camera_poses: Camera pose list
    
    Returns:
        List of 3D detections
    """
```

## PathPlanner

Path planner.

### Class Definition

```python
class PathPlanner:
    def __init__(
        self,
        pgm_map: np.ndarray,
        resolution: float,
        origin: List[float],
        obstacle_clearance: float = 0.3
    ):
        """
        Initialize planner.
        
        Args:
            pgm_map: PGM map
            resolution: Map resolution
            origin: Map origin
            obstacle_clearance: Obstacle clearance distance
        """
```

### Methods

#### plan_path()

Plan path.

```python
def plan_path(
    self,
    start: Tuple[float, float],
    goal: Tuple[float, float]
) -> List[Tuple[float, float]]:
    """
    Plan path from start to goal.
    
    Args:
        start: Start coordinates (x, y)
        goal: Goal coordinates (x, y)
    
    Returns:
        List of path waypoints
    """
```

## Utility Functions

### load_scene_metadata()

Load scene metadata.

```python
def load_scene_metadata(scene_directory: str) -> Dict[str, Any]:
    """
    Load scene metadata.
    
    Args:
        scene_directory: Path to scene directory
    
    Returns:
        Metadata dictionary
    """
```

### sample_navigation_targets()

Sample navigation targets.

```python
def sample_navigation_targets(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sample navigation targets.
    
    Args:
        config: Configuration dictionary
    
    Returns:
        Result dictionary
    """
```

### detect_semantic_objects()

Detect semantic objects.

```python
def detect_semantic_objects(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Detect semantic objects.
    
    Args:
        config: Configuration dictionary
    
    Returns:
        Detection result dictionary
    """
```

### plan_navigation_paths()

Plan navigation paths.

```python
def plan_navigation_paths(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Plan navigation paths.
    
    Args:
        config: Configuration dictionary
    
    Returns:
        Planning result dictionary
    """
```

## Configuration Classes

### PipelineConfig

Pipeline configuration.

```python
@dataclass
class PipelineConfig:
    scene_directory: str
    camera_config: str
    base_output_directory: str
    data_collection_mode: str
    nav_type: str
```

### StageConfig

Stage configuration base class.

```python
class StageConfig:
    pass
```

## Data Classes

### PipelineResults

Pipeline execution results.

```python
@dataclass
class PipelineResults:
    status: str
    stage_results: Dict[str, Dict]
    stage_timings: Dict[str, float]
    error: Optional[str] = None
    
    def add_stage_result(self, stage_name: str, result: Dict):
        """Add stage result"""
        
    def get_stage_result(self, stage_name: str) -> Optional[Dict]:
        """Get stage result"""
        
    def is_stage_successful(self, stage_name: str) -> bool:
        """Check if stage succeeded"""
```

## Exception Classes

### PipelineError

Base Pipeline exception.

```python
class PipelineError(Exception):
    pass
```

### StageError

Stage execution exception.

```python
class StageError(PipelineError):
    pass
```
