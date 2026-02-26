# 环境模块

环境模块提供导航仿真的接口，包括 3D Gaussian Splatting 渲染和占据栅格碰撞检测。

## 概述

环境模块是评测框架的核心组件之一，负责：

- **场景渲染** - 使用 3D GS 技术渲染场景
- **碰撞检测** - 基于占据栅格地图进行碰撞检测
- **状态管理** - 管理机器人位置、朝向等状态
- **目标验证** - 验证是否到达目标

## 3D GS 环境

### GaussianSplattingEnv

`GaussianSplattingEnv` 是基于 3D Gaussian Splatting 的环境实现。

#### 初始化

```python
from navarena_bench.env import Env
from navarena_bench.configs.env_config import EnvCfg, GSEnvConfig
from navarena_bench.configs.eval_config import TaskCfg

env_config = EnvCfg(
    env_type="gs",
    env_settings=GSEnvConfig(
        scene_dir="/path/to/scenes",
        camera_config="/path/to/camera.yaml",
        enable_occupancy=True,
        success_distance=0.5
    )
)

task_config = TaskCfg(
    task_type="pointnav",
    task_settings={"success_distance": 0.5}
)

env = Env.init(env_config, task_config)
```

#### 配置参数

```yaml
env:
  env_type: "gs"
  env_settings:
    camera_config: "${NAVARENA_DATA_DIR}/shared/camera.yaml"
    enable_occupancy: true
    success_distance: 0.5
    rotation_threshold: 0.2           # 朝向成功判定阈值（弧度）
    gpu_id: null
    enable_depth: true                      # 启用深度图
    enable_rgb: true                        # 启用 RGB 图像
    camera_names: ["face", "left", "right"] # 相机名称列表
    image_width: 640                        # 图像宽度
    image_height: 480                       # 图像高度
```

### 主要方法

#### reset()

重置环境到新的 episode。

```python
episode = {
    "episode_id": "train_000001",
    "scene_path": "x2robot/17dc3367",
    "task_type": "pointnav",
    "start_state": {
        "position": [0.0, 0.0, 0.0],
        "rotation": [0.0, 0.0, 0.0, 1.0]
    },
    "goals": [{"goal_type": "position", "position": [5.0, 0.0, 0.0]}]
}

observation = env.reset(episode)
```

**返回**: 初始观测字典，包含：
- `rgb`: RGB 图像字典（按相机名称）
- `depth`: 深度图字典（可选）
- `position`: 当前位置 [x, y, z]
- `rotation`: 当前朝向（四元数）

#### step()

执行一步动作。

```python
action = {
    "x": 0.5,      # 前进距离（米）
    "y": 0.0,      # 左右移动（米）
    "yaw": 0.1     # 旋转角度（弧度）
}

observation, reward, done, info = env.step(action)
```

**参数**:
- `action`: 动作字典
  - `x`: 前进/后退距离（米）
  - `y`: 左右移动距离（米）
  - `yaw`: 旋转角度（弧度）

**返回**:
- `observation`: 新的观测
- `reward`: 奖励值（当前未使用）
- `done`: 是否结束
- `info`: 信息字典

#### get_info()

获取当前环境信息。

```python
info = env.get_info()
# {
#     "success": False,
#     "distance_to_goal": 2.5,
#     "path_length": 3.0,
#     "geodesic_distance": 2.0,
#     "collision": False
# }
```

**返回**: 信息字典，包含：
- `success`: 是否成功到达目标
- `distance_to_goal`: 到目标的距离
- `path_length`: 已走路径长度
- `geodesic_distance`: 到目标的最短路径长度
- `collision`: 是否发生碰撞

## 占据栅格

环境使用占据栅格地图进行碰撞检测。

### 加载占据栅格

占据栅格从场景的 PGM 地图文件加载：

```python
# 自动从 V1 资产目录加载
# {scene_dir}/nav_map.pgm
# {scene_dir}/nav_map.yaml
```

### 碰撞检测

环境自动进行碰撞检测：

```python
# 在执行 step() 时自动检测
observation, reward, done, info = env.step(action)

if info.get("collision"):
    print("发生碰撞！")
```

### 占据栅格配置

PGM 地图配置文件格式：

```yaml
image: nav_map.pgm
resolution: 0.05
origin: [-10.0, -10.0, 0.0]
negate: 0
occupied_thresh: 0.65
free_thresh: 0.25
```

## 相机配置

环境支持多相机配置。

### 相机配置文件

```yaml
cameras:
  face:
    intrinsic:
      fx: 320.0
      fy: 320.0
      cx: 320.0
      cy: 240.0
    extrinsic:
      translation: [0.0, 0.0, 0.0]
      rotation: [1.0, 0.0, 0.0, 0.0]
    image_size: [640, 480]
  
  left:
    intrinsic:
      fx: 320.0
      fy: 320.0
      cx: 320.0
      cy: 240.0
    extrinsic:
      translation: [0.1, 0.0, 0.0]
      rotation: [0.707, 0.0, 0.707, 0.0]
    image_size: [640, 480]
```

### 多相机观测

环境返回多相机观测：

```python
observation = env.reset(episode)

# RGB 图像
rgb_face = observation["rgb"]["face"]
rgb_left = observation["rgb"]["left"]
rgb_right = observation["rgb"]["right"]

# 深度图（如果启用）
if "depth" in observation:
    depth_face = observation["depth"]["face"]
```

## 场景管理

### 场景目录结构（V1 资产格式）

环境加载 V1 统一资产格式，与资产预处理输出一致：

```
{dataset}/{scene_id}/
├── manifest.json          # 必需
├── nav_map.pgm            # 必需
├── nav_map.yaml           # 必需
├── aligned.ply            # 渲染用
├── nav_mask.png           # 可选
└── labels.json            # 可选
```

### 机器人状态管理

环境管理机器人状态（position、rotation、yaw），在 `step()` 中根据动作更新，并通过 `get_info()` 暴露路径长度、到目标距离等。

## 目标验证

环境支持多种目标类型：

### PointNav 目标

```python
episode = {
    "goals": [
        {
            "position": [5.0, 0.0, 0.0],
            "rotation": [1.0, 0.0, 0.0, 0.0]  # 可选
        }
    ]
}
```

### ObjectNav 目标

```python
episode = {
    "goals": [
        {
            "position": [5.0, 0.0, 0.0],
            "object_category": "bed"
        }
    ]
}
```

### ImageNav 目标

```python
episode = {
    "goals": [
        {
            "position": [5.0, 0.0, 0.0],
            "rotation": [1.0, 0.0, 0.0, 0.0],  # 必需
            "image": "/path/to/goal_image.jpg"  # 可选
        }
    ]
}
```

## 性能优化

### GPU 设置

```yaml
env_settings:
  gpu_id: 0  # 指定 GPU，或 null 自动选择
```

### 渲染优化

```yaml
env_settings:
  enable_depth: false  # 禁用深度图以提升性能
  image_width: 480     # 降低分辨率
  image_height: 360
```

### 占据栅格优化

```yaml
env_settings:
  enable_occupancy: true  # 必需用于碰撞检测
```

## 常见问题

!!! question "场景加载失败"
    检查场景目录结构是否正确，确保包含必需的元数据文件。

!!! question "碰撞检测不准确"
    检查 PGM 地图文件是否正确生成，验证 `occupied_thresh` 和 `free_thresh` 参数。

!!! question "渲染速度慢"
    降低图像分辨率或禁用深度图，使用 GPU 加速渲染。

!!! question "多相机配置错误"
    确保相机配置文件格式正确，检查外参和内参设置。

## 下一步

- 了解如何配置 **[智能体模块](agents.md)**
- 查看 **[评测器模块](evaluators.md)** 的使用方法
- 学习如何 **[扩展框架](extending.md)**
