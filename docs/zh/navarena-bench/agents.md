# 智能体模块

智能体模块提供导航模型的接口，支持多种实现方式，包括本地模型、远程服务和预训练模型。

## 概述

智能体是导航模型与评测框架之间的接口，负责：

- **接收观测** - 从环境获取观测数据
- **生成动作** - 根据观测生成导航动作
- **管理状态** - 管理模型内部状态

## 智能体类型

### LocalAgent

本地模型智能体，直接加载模型文件。

#### 配置

```yaml
agent:
  agent_type: "local"
  model_settings:
    checkpoint_path: "/path/to/model.pth"  # 模型相关参数通过 model_settings 传入
  device: null  # null = 自动检测
```

#### 使用示例

```python
from navarena_bench.agent import Agent
from navarena_bench.configs.agent_config import AgentCfg

config = AgentCfg(
    agent_type="local",
    model_settings={"checkpoint_path": "/path/to/model.pth"}
)

agent = Agent.init(config)
```

### RemoteAgent

远程服务智能体，通过 HTTP API 调用远程模型服务。

#### 配置

```yaml
agent:
  agent_type: "remote"
  model_settings:
    remote_url: "http://localhost:8000/api/v1/navigate"
    remote_timeout: 30.0
    remote_retries: 3
```

#### API 接口格式

**请求：**
```json
{
  "observation": {
    "rgb": {
      "face": "base64_encoded_image",
      "left": "base64_encoded_image",
      "right": "base64_encoded_image"
    },
    "position": [0.0, 0.0, 0.0],
    "rotation": [1.0, 0.0, 0.0, 0.0]
  },
  "goal": {
    "position": [5.0, 0.0, 0.0]
  }
}
```

**响应：**
```json
{
  "action": {
    "x": 0.5,
    "y": 0.0,
    "yaw": 0.1
  }
}
```

#### 使用示例

```python
config = AgentCfg(
    agent_type="remote",
    model_settings={
        "remote_url": "http://localhost:8000/api/v1/navigate",
        "remote_timeout": 30.0,
        "remote_retries": 3,
    }
)

agent = Agent.init(config)
```

### ViNTAgent

ViNT (Visual Navigation Transformer) 模型智能体。

#### 配置

```yaml
agent:
  agent_type: "vint"
  model_settings:
    checkpoint_path: "/path/to/checkpoint.pth"
    config_path: "/path/to/config.yaml"  # 可选
    device: "cuda:0"  # 可选
```

#### 使用示例

```python
config = AgentCfg(
    agent_type="vint",
    model_settings={
        "checkpoint_path": "/path/to/checkpoint.pth"
    }
)

agent = Agent.init(config)
```

!!! note "依赖要求"
    ViNT 智能体需要安装 visualnav-transformer 项目。

### GNMAgent

GNM (General Navigation Model) 模型智能体。

#### 配置

```yaml
agent:
  agent_type: "gnm"
  model_settings:
    checkpoint_path: "/path/to/checkpoint.pth"
```

### NoMaDAgent

NoMaD (Normalizing Flow Models for Robotic Navigation) 模型智能体。

#### 配置

```yaml
agent:
  agent_type: "nomad"
  model_settings:
    checkpoint_path: "/path/to/checkpoint.pth"
```

### MultiModalNavAgent

多模态导航智能体，支持语言、图像、物体等多种目标类型。

#### 配置

```yaml
agent:
  agent_type: "multimodal_nav"
  model_settings:
    checkpoint_path: "/path/to/model.pth"
    input_modalities: ["rgb", "depth"]  # 可选
    fusion_method: "concat"  # 可选
```

### LanguageNavAgent

语言导航智能体，用于 VLN 任务，基于 Voronoi 图进行路径规划与探索。

#### 配置

```yaml
agent:
  agent_type: "language_nav"
  model_settings:
    waypoint_tolerance: 0.3
    max_v: 0.5
    max_w: 1.0
    voronoi_closeness: 0.5
    min_voronoi_distance: 0.3
```

## 智能体接口

所有智能体都实现以下接口：

### reset()

重置智能体状态。

```python
episode = {
    "episode_id": "001",
    "goals": [{"position": [5.0, 0.0, 0.0]}]
}

agent.reset(episode)
```

### act()

根据观测生成动作。

```python
observation = {
    "rgb": {
        "face": np.array(...),  # RGB 图像
        "left": np.array(...),
        "right": np.array(...)
    },
    "position": [0.0, 0.0, 0.0],
    "rotation": [1.0, 0.0, 0.0, 0.0]
}

action = agent.act(observation)
# {
#     "x": 0.5,      # 前进距离（米）
#     "y": 0.0,      # 左右移动（米）
#     "yaw": 0.1     # 旋转角度（弧度）
# }
```

### close()

关闭智能体，释放资源。

```python
agent.close()
```

## 动作格式

所有智能体返回的动作格式统一：

```python
{
    "x": float,    # 前进/后退距离（米），正数=前进，负数=后退
    "y": float,    # 左右移动距离（米），正数=右，负数=左
    "yaw": float   # 旋转角度（弧度），正数=逆时针，负数=顺时针
}
```

## 观测格式

智能体接收的观测格式：

```python
{
    "rgb": {
        "camera_name": np.ndarray  # RGB 图像，形状 (H, W, 3)
    },
    "depth": {  # 可选
        "camera_name": np.ndarray  # 深度图，形状 (H, W)
    },
    "position": [x, y, z],  # 当前位置
    "rotation": [w, x, y, z]  # 当前朝向（四元数）
}
```

## 智能体对比

| 智能体类型 | 适用场景 | 优点 | 缺点 |
|-----------|---------|------|------|
| LocalAgent | 本地模型 | 速度快，无网络延迟 | 需要模型文件 |
| RemoteAgent | 远程服务 | 灵活，易于部署 | 网络延迟 |
| ViNTAgent | 图像目标导航 | 预训练模型 | 需要额外依赖 |
| GNMAgent | 通用导航 | 预训练模型 | 需要额外依赖 |
| NoMaDAgent | 通用导航 | 预训练模型 | 需要额外依赖 |
| MultiModalNavAgent | 多模态输入 | 支持语言/图像/物体目标 | 配置复杂 |
| LanguageNavAgent | VLN 任务 | 基于 Voronoi 路径规划 | 需语言模型 |

## 自定义智能体

### 实现自定义智能体

```python
from navarena_bench.agent.base import Agent
from navarena_bench.configs.agent_config import AgentCfg

@Agent.register("my_agent")
class MyAgent(Agent):
    def __init__(self, config: AgentCfg):
        super().__init__(config)
        # 初始化模型
        
    def reset(self, episode=None):
        """重置智能体状态"""
        # 实现重置逻辑
        pass
    
    def act(self, observation):
        """生成动作"""
        # 实现动作生成逻辑
        return {
            "x": 0.5,
            "y": 0.0,
            "yaw": 0.1
        }
    
    def close(self):
        """释放资源"""
        # 实现清理逻辑
        pass
```

### 使用自定义智能体

```yaml
agent:
  agent_type: "my_agent"
  model_settings:
    checkpoint_path: "/path/to/model.pth"
```

```python
# 确保导入自定义智能体类
import my_agent_module

agent = Agent.init(config)
```

## 常见问题

!!! question "模型加载失败"
    检查模型路径是否正确，确保模型文件存在且格式正确。

!!! question "远程服务超时"
    增加 `remote_timeout` 参数，或检查网络连接。

!!! question "动作格式错误"
    确保返回的动作字典包含 `x`、`y`、`yaw` 三个字段。

!!! question "观测格式不匹配"
    检查环境返回的观测格式是否与智能体期望的格式一致。

!!! tip "下一步"
    - 了解 **[评测器模块](evaluators.md)** 的使用方法
    - 查看 **[回放模块](replay.md)** 的功能
    - 学习如何 **[扩展框架](extending.md)**
