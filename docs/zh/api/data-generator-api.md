# 数据生成器 API

数据生成器的完整 API 参考文档。

## VLNDataPipeline

Pipeline 主类，协调所有阶段的执行。

### 类定义

```python
class VLNDataPipeline:
    def __init__(
        self,
        config_path: str,
        use_labels_file: bool = False,
        previous_output_dir: Optional[str] = None
    ):
        """
        初始化 Pipeline。
        
        Args:
            config_path: Pipeline 配置文件路径
            use_labels_file: 是否使用 labels.json 文件
            previous_output_dir: 之前运行的输出目录（用于 Stage 6）
        """
```

### 方法

#### run()

运行 Pipeline 或选定的阶段。

```python
def run(self, stages: Optional[list] = None) -> PipelineResults:
    """
    运行 Pipeline。
    
    Args:
        stages: 要运行的阶段列表，如 ['stage1', 'stage2']
               如果为 None，运行所有阶段
    
    Returns:
        PipelineResults 对象
    """
```

### 使用示例

```python
from src.pipeline.navarena_gen import VLNDataPipeline

# 创建 Pipeline
pipeline = VLNDataPipeline("configs/main/pipeline.yaml")

# 运行所有阶段
results = pipeline.run()

# 运行选定阶段
results = pipeline.run(stages=['stage1', 'stage2', 'stage3'])
```

## SceneMetadata

场景元数据类。

### 类定义

```python
class SceneMetadata:
    def __init__(self, scene_directory: str):
        """
        初始化场景元数据。
        
        Args:
            scene_directory: 场景目录路径
        """
```

### 属性

- `pgm_file`: PGM 地图文件路径
- `yaml_file`: YAML 配置文件路径
- `ply_file`: PLY 点云文件路径
- `ground_height`: 地面高度
- `is_normalized`: 是否已归一化

## TargetSampler

目标采样器。

### 类定义

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
        初始化采样器。
        
        Args:
            pgm_map: PGM 地图数组
            mask: 区域掩码
            resolution: 地图分辨率
            origin: 地图原点
            free_thresh: 自由空间阈值
            occupied_thresh: 占据空间阈值
        """
```

### 方法

#### sample_targets()

采样目标点。

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
    采样目标点。
    
    Args:
        target_count: 目标数量
        clearance_radius: 安全半径
        min_distance: 最小距离
        max_distance: 最大距离
        max_attempts: 最大尝试次数
    
    Returns:
        采样目标列表
    """
```

## SemanticDetector

语义检测器。

### 类定义

```python
class SemanticDetector:
    def __init__(
        self,
        yolo_model_path: str,
        sam_model_path: str,
        confidence_threshold: float = 0.5
    ):
        """
        初始化检测器。
        
        Args:
            yolo_model_path: YOLO 模型路径
            sam_model_path: SAM 模型路径
            confidence_threshold: 置信度阈值
        """
```

### 方法

#### detect()

检测语义对象。

```python
def detect(
    self,
    images: List[np.ndarray],
    camera_poses: List[Dict]
) -> List[Detection3D]:
    """
    检测语义对象。
    
    Args:
        images: 图像列表
        camera_poses: 相机位姿列表
    
    Returns:
        3D 检测结果列表
    """
```

## PathPlanner

路径规划器。

### 类定义

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
        初始化规划器。
        
        Args:
            pgm_map: PGM 地图
            resolution: 地图分辨率
            origin: 地图原点
            obstacle_clearance: 障碍物安全距离
        """
```

### 方法

#### plan_path()

规划路径。

```python
def plan_path(
    self,
    start: Tuple[float, float],
    goal: Tuple[float, float]
) -> List[Tuple[float, float]]:
    """
    规划从起点到目标的路径。
    
    Args:
        start: 起点坐标 (x, y)
        goal: 目标坐标 (x, y)
    
    Returns:
        路径点列表
    """
```

## 工具函数

### load_scene_metadata()

加载场景元数据。

```python
def load_scene_metadata(scene_directory: str) -> Dict[str, Any]:
    """
    加载场景元数据。
    
    Args:
        scene_directory: 场景目录路径
    
    Returns:
        元数据字典
    """
```

### sample_navigation_targets()

采样导航目标。

```python
def sample_navigation_targets(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    采样导航目标。
    
    Args:
        config: 配置字典
    
    Returns:
        结果字典
    """
```

### detect_semantic_objects()

检测语义对象。

```python
def detect_semantic_objects(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    检测语义对象。
    
    Args:
        config: 配置字典
    
    Returns:
        检测结果字典
    """
```

### plan_navigation_paths()

规划导航路径。

```python
def plan_navigation_paths(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    规划导航路径。
    
    Args:
        config: 配置字典
    
    Returns:
        规划结果字典
    """
```

## 配置类

### PipelineConfig

Pipeline 配置类。

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

阶段配置基类。

```python
class StageConfig:
    pass
```

## 数据类

### PipelineResults

Pipeline 执行结果。

```python
@dataclass
class PipelineResults:
    status: str
    stage_results: Dict[str, Dict]
    stage_timings: Dict[str, float]
    error: Optional[str] = None
    
    def add_stage_result(self, stage_name: str, result: Dict):
        """添加阶段结果"""
        
    def get_stage_result(self, stage_name: str) -> Optional[Dict]:
        """获取阶段结果"""
        
    def is_stage_successful(self, stage_name: str) -> bool:
        """检查阶段是否成功"""
```

## 异常类

### PipelineError

Pipeline 基础异常。

```python
class PipelineError(Exception):
    pass
```

### StageError

阶段执行异常。

```python
class StageError(PipelineError):
    pass
```
