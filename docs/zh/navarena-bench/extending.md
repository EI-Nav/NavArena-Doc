# 扩展指南

本文档介绍如何扩展评测框架，包括添加新的环境、智能体、评测器和指标。

## 扩展概述

评测框架采用注册机制，可以轻松添加新组件：

- **新环境** - 继承 `Env` 基类并注册
- **新智能体** - 继承 `Agent` 基类并注册
- **新评测器** - 继承 `Evaluator` 基类并注册
- **新指标** - 继承 `Metric` 基类并注册
- **新回放器** - 继承 `BaseReplayer` 基类并注册

## 扩展环境

### 1. 创建环境类

```python
from navarena_bench.env.base import Env
from navarena_bench.configs.env_config import EnvCfg
from navarena_bench.configs.eval_config import TaskCfg

@Env.register("my_env")
class MyEnvironment(Env):
    def __init__(self, env_config: EnvCfg, task_config: TaskCfg):
        super().__init__(env_config, task_config)
        # 初始化环境
        
    def reset(self, episode=None):
        """重置环境"""
        # 实现重置逻辑
        observation = {
            "rgb": {"camera": self._render()},
            "position": self.robot_position,
            "rotation": self.robot_rotation
        }
        return observation
    
    def step(self, action):
        """执行一步"""
        # 实现步进逻辑
        self._update_state(action)
        observation = self._get_observation()
        done = self._check_done()
        info = self._get_info()
        return observation, 0.0, done, info
    
    def get_info(self):
        """获取环境信息"""
        return {
            "success": self._check_success(),
            "distance_to_goal": self._compute_distance()
        }
```

### 2. 使用新环境

```yaml
env:
  env_type: "my_env"
  env_settings:
    # 自定义配置
    my_setting: value
```

```python
# 确保导入新环境类
import my_environment_module

env = Env.init(env_config, task_config)
```

## 扩展智能体

### 1. 创建智能体类

```python
from navarena_bench.agent.base import Agent
from navarena_bench.configs.agent_config import AgentCfg

@Agent.register("my_agent")
class MyAgent(Agent):
    def __init__(self, config: AgentCfg):
        super().__init__(config)
        # 加载模型
        self.model = self._load_model(config.model_path)
        
    def reset(self, episode=None):
        """重置智能体状态"""
        self.state = self.model.initial_state()
        
    def act(self, observation):
        """生成动作"""
        # 预处理观测
        processed_obs = self._preprocess(observation)
        
        # 模型推理
        action = self.model.predict(processed_obs, self.state)
        
        # 更新状态
        self.state = self.model.update_state(self.state, action)
        
        return {
            "x": action[0],
            "y": action[1],
            "yaw": action[2]
        }
    
    def close(self):
        """释放资源"""
        del self.model
```

### 2. 使用新智能体

```yaml
agent:
  agent_type: "my_agent"
  model_path: "/path/to/model.pth"
  model_settings:
    # 自定义设置
    my_setting: value
```

```python
# 确保导入新智能体类
import my_agent_module

agent = Agent.init(config)
```

## 扩展评测器

### 1. 创建评测器类

```python
from navarena_bench.evaluator.base import Evaluator
from navarena_bench.configs.eval_config import EvalCfg

@Evaluator.register("my_eval")
class MyEvaluator(Evaluator):
    def __init__(self, config: EvalCfg):
        super().__init__(config)
        # 初始化自定义指标
        self.custom_metric = CustomMetric()
        
    def eval_episode(self, episode):
        """评测单个 episode"""
        # 重置环境
        observation = self.env.reset(episode)
        
        # 重置智能体
        self.agent.reset(episode)
        
        # 运行 episode
        trajectory = []
        done = False
        while not done:
            action = self.agent.act(observation)
            observation, reward, done, info = self.env.step(action)
            trajectory.append({
                "position": info["position"],
                "action": action
            })
        
        # 计算指标
        result = {
            "episode_id": episode["episode_id"],
            "success": info["success"],
            "custom_metric": self.custom_metric.compute(trajectory)
        }
        
        return result
```

### 2. 使用新评测器

```yaml
eval_type: "my_eval"
```

```python
# 确保导入新评测器类
import my_evaluator_module

evaluator = Evaluator.init(config)
```

## 扩展指标

### 1. 创建指标类

```python
from navarena_bench.metrics.base import Metric

@Metric.register("my_metric")
class MyMetric(Metric):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.values = []
        
    def update(self, episode_result):
        """更新指标值"""
        value = self._compute_value(episode_result)
        self.values.append(value)
        
    def compute(self):
        """计算最终指标值"""
        return sum(self.values) / len(self.values)
    
    def reset(self):
        """重置指标"""
        self.values = []
```

### 2. 使用新指标

```python
from navarena_bench.metrics import Metric

metric = Metric.init("my_metric", param1=value1)
metric.update(episode_result)
result = metric.compute()
```

## 扩展回放器

### 1. 创建回放器类

```python
from navarena_bench.replay.base import BaseReplayer
from navarena_bench.replay.loader import ReplayLoader

@BaseReplayer.register("my_replayer")
class MyReplayer(BaseReplayer):
    def __init__(self, loader: ReplayLoader, **kwargs):
        super().__init__(loader, **kwargs)
        # 初始化渲染器
        
    def replay(self, output_path):
        """生成回放"""
        replay_data = self.loader.load()
        
        # 渲染每一帧
        frames = []
        for step_data in replay_data["trajectory"]:
            frame = self._render_frame(step_data)
            frames.append(frame)
        
        # 保存视频
        self._save_video(frames, output_path)
```

### 2. 使用新回放器

```python
from navarena_bench.replay import BaseReplayer

replayer = BaseReplayer.init("my_replayer", loader)
replayer.replay("output.mp4")
```

## 最佳实践

### 1. 遵循接口规范

确保实现所有必需的方法：

```python
class MyComponent(BaseComponent):
    def __init__(self, config):
        super().__init__(config)
        # 初始化
        
    # 实现所有必需方法
    def required_method_1(self):
        pass
    
    def required_method_2(self):
        pass
```

### 2. 使用配置系统

利用配置系统管理参数：

```python
class MyComponent(BaseComponent):
    def __init__(self, config):
        super().__init__(config)
        # 从配置读取参数
        self.param1 = config.settings.get("param1", default_value)
```

### 3. 错误处理

添加适当的错误处理：

```python
def act(self, observation):
    try:
        # 处理逻辑
        action = self._compute_action(observation)
        return action
    except Exception as e:
        self.logger.error(f"Action computation failed: {e}")
        # 返回默认动作
        return {"x": 0.0, "y": 0.0, "yaw": 0.0}
```

### 4. 日志记录

使用日志记录调试信息：

```python
from navarena_core.logging import get_logger

class MyComponent(BaseComponent):
    def __init__(self, config):
        super().__init__(config)
        self.logger = get_logger(__name__)
        
    def some_method(self):
        self.logger.info("Processing...")
        # 处理逻辑
        self.logger.debug(f"Result: {result}")
```

## 测试扩展

### 单元测试

```python
import pytest
from navarena_bench.agent import Agent
from navarena_bench.configs.agent_config import AgentCfg

def test_my_agent():
    config = AgentCfg(
        agent_type="my_agent",
        model_path="/path/to/model.pth"
    )
    
    agent = Agent.init(config)
    
    # 测试 reset
    agent.reset()
    
    # 测试 act
    observation = {
        "rgb": {"camera": np.zeros((480, 640, 3))},
        "position": [0, 0, 0],
        "rotation": [1, 0, 0, 0]
    }
    action = agent.act(observation)
    
    assert "x" in action
    assert "y" in action
    assert "yaw" in action
```

## 常见问题

!!! question "注册失败"
    确保使用 `@Component.register("name")` 装饰器，并且名称唯一。

!!! question "导入错误"
    确保在创建实例前导入扩展类，或使用 `import` 语句触发注册。

!!! question "配置不匹配"
    检查配置格式是否正确，确保所有必需字段存在。

!!! question "接口不完整"
    确保实现所有必需的方法，参考基类文档。

!!! tip "下一步"
    - 查看 **[环境模块](environment.md)** 的详细说明
    - 了解 **[智能体模块](agents.md)** 的使用方法
    - 学习 **[评测器模块](evaluators.md)** 的功能
