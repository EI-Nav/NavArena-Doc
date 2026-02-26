# 回放模块

回放模块提供评测结果的回放和可视化功能，支持轨迹渲染、观测渲染和信息面板显示。

## 概述

回放模块用于：

- **轨迹可视化** - 在地图上显示导航轨迹
- **观测回放** - 回放每个步骤的观测图像
- **信息面板** - 显示评测指标和状态信息
- **视频生成** - 生成回放视频文件

### 核心组件

- **DataRecorder** - 评测时录制 Episode 数据（轨迹、观测、动作）
- **ReplayLoader** - 加载录制的回放数据
- **VideoReplayer** - 生成可视化视频，组合轨迹与观测
- **Renderers** - trajectory_renderer、observation_renderer、info_panel_renderer

## 回放数据格式

回放数据保存在评测结果目录中：

```
eval_results/
├── episode_001/
│   ├── replay_data.json      # 回放数据
│   ├── trajectory.json        # 轨迹数据
│   └── observations/          # 观测图像
│       ├── step_000_rgb.png
│       ├── step_001_rgb.png
│       └── ...
└── ...
```

### 回放数据 JSON

```json
{
  "episode_id": "001",
  "scene_id": "scene_001",
  "start_position": [0.0, 0.0, 0.0],
  "start_rotation": [1.0, 0.0, 0.0, 0.0],
  "goal_position": [5.0, 0.0, 0.0],
  "trajectory": [
    {
      "step": 0,
      "position": [0.0, 0.0, 0.0],
      "rotation": [1.0, 0.0, 0.0, 0.0],
      "action": {"x": 0.5, "y": 0.0, "yaw": 0.0}
    }
  ],
  "observations": [
    {
      "step": 0,
      "rgb": {
        "face": "base64_encoded_image",
        "left": "base64_encoded_image",
        "right": "base64_encoded_image"
      }
    }
  ],
  "metadata": {
    "success": true,
    "path_length": 4.2,
    "geodesic_distance": 3.0,
    "num_steps": 42
  }
}
```

## 使用回放工具

### 命令行工具

#### 单个 Episode 回放

```bash
python scripts/replay_eval.py \
    --episode 001 \
    --results eval_results/ \
    --output replay.mp4
```

#### 批量回放

```bash
python scripts/replay_eval.py \
    --results eval_results/ \
    --output replay_videos/
```

#### 自定义参数

```bash
python scripts/replay_eval.py \
    --episode 001 \
    --results eval_results/ \
    --output replay.mp4 \
    --fps 15 \
    --resolution 1920x1080
```

### 命令行参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--episode EPISODE_ID` | Episode ID（单个回放） | - |
| `--results RESULTS_DIR` | 评测结果目录 | `./eval_results` |
| `--output OUTPUT_PATH` | 输出路径 | `./replay.mp4` |
| `--fps FPS` | 视频帧率 | `15` |
| `--resolution WIDTHxHEIGHT` | 视频分辨率 | `1920x1080` |
| `--show-trajectory` | 显示轨迹 | `true` |
| `--show-info` | 显示信息面板 | `true` |

## Python API

### 基本使用

```python
from navarena_bench.replay import BaseReplayer
from navarena_bench.replay.loader import ReplayLoader

# 加载回放数据
loader = ReplayLoader("eval_results/episode_001")
replay_data = loader.load()

# 创建回放器
replayer = BaseReplayer.init("video", loader)

# 生成回放视频
replayer.replay(output_path="replay.mp4")
```

### 自定义回放器

```python
from navarena_bench.replay.base import BaseReplayer
from navarena_bench.replay.loader import ReplayLoader

@BaseReplayer.register("my_replayer")
class MyReplayer(BaseReplayer):
    def __init__(self, loader, **kwargs):
        super().__init__(loader, **kwargs)
        # 初始化
        
    def replay(self, output_path):
        """生成回放"""
        # 实现回放逻辑
        pass
```

## 回放渲染器

### TrajectoryRenderer

轨迹渲染器，在地图上绘制导航轨迹。

```python
from navarena_bench.replay.renderers.trajectory_renderer import TrajectoryRenderer

renderer = TrajectoryRenderer(
    pgm_map_path="scene_001_transformed.pgm",
    yaml_config_path="scene_001_transformed.yaml"
)

image = renderer.render(
    trajectory=trajectory,
    start_position=start_pos,
    goal_position=goal_pos
)
```

### ObservationRenderer

观测渲染器，渲染观测图像。

```python
from navarena_bench.replay.renderers.observation_renderer import ObservationRenderer

renderer = ObservationRenderer()

image = renderer.render(
    observations=observations,
    camera_names=["face", "left", "right"]
)
```

### InfoPanelRenderer

信息面板渲染器，显示评测信息。

```python
from navarena_bench.replay.renderers.info_panel_renderer import InfoPanelRenderer

renderer = InfoPanelRenderer()

image = renderer.render(
    metadata={
        "success": True,
        "path_length": 4.2,
        "geodesic_distance": 3.0,
        "num_steps": 42
    }
)
```

## 回放视频格式

回放视频包含以下内容：

1. **轨迹视图** - 左上角，显示地图和轨迹
2. **观测视图** - 右上角，显示多相机观测
3. **信息面板** - 底部，显示评测指标

### 视频布局

```
┌─────────────────┬─────────────────┐
│                 │                 │
│   轨迹视图      │   观测视图      │
│   (地图+轨迹)   │   (多相机)      │
│                 │                 │
├─────────────────┴─────────────────┤
│           信息面板                  │
│   Success: ✓  Path Length: 4.2m    │
└─────────────────────────────────────┘
```

## 配置回放

### 回放配置

```yaml
replay:
  fps: 15
  resolution: [1920, 1080]
  show_trajectory: true
  show_observations: true
  show_info_panel: true
  trajectory_style:
    line_color: [255, 0, 0]
    line_width: 2
    start_marker: "circle"
    goal_marker: "star"
```

## 常见问题

!!! question "回放数据不存在"
    确保评测时启用了轨迹保存 (`save_trajectories: true`)。

!!! question "视频生成失败"
    检查输出路径权限，确保有足够的磁盘空间。

!!! question "轨迹显示不正确"
    验证 PGM 地图文件是否存在，检查坐标变换是否正确。

!!! question "观测图像缺失"
    确保评测时保存了观测图像，检查图像路径是否正确。

!!! tip "下一步"
    - 学习如何 **[扩展框架](extending.md)**
    - 查看 **[评测器模块](evaluators.md)** 的使用方法
    - 了解 **[环境模块](environment.md)** 的详细说明
