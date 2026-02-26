# 配置说明

数据生成器使用 YAML 配置文件，支持配置层级和命令行覆盖。

## 配置层级

1. **base.yaml** - 全局默认配置
2. **envs/*.yaml** - 环境配置（gs_env、habitat_env、isaac_env）
3. **tasks/*.yaml** - 任务配置（pointnav、imagenav、objectnav、vln）
4. **examples/*.yaml** - 完整示例配置

## 配置文件结构

```
configs/
├── base.yaml                # 全局默认
├── envs/
│   ├── gs_env.yaml         # 3D GS 环境
│   ├── habitat_env.yaml
│   └── isaac_env.yaml
├── tasks/
│   ├── pointnav.yaml
│   ├── imagenav.yaml
│   ├── objectnav.yaml
│   └── vln.yaml
└── examples/
    ├── pointnav_example.yaml
    ├── imagenav_example.yaml
    ├── objectnav_example.yaml
    ├── vln_zh_example.yaml
    ├── vln_en_example.yaml
    ├── vln_path_based_example.yaml
    ├── vln_object_goal_example.yaml
    ├── vln_object_goal_zh_example.yaml
    └── camera.yaml
```

## 示例配置

### PointNav

```yaml
env_type: gs
scene_path: navarena_assets/x2robot/17dc3367

env_config:
  z_coordinate: 0.0
  robot_radius: 0.4

task_type: pointnav
num_episodes: 10
split: train

task_config:
  min_distance: 5.0
  max_distance: 12.0
  grid_spacing: 1.0
  max_start_points: null
  num_goals_per_start: 1

output_dir: navarena_data
dataset_name: navarena_pointnav
```

### VLN（中文指令）

```yaml
env_type: gs
scene_path: navarena_assets/x2robot/17dc3367

env_config:
  z_coordinate: 0.0
  robot_radius: 0.4

task_type: vln
num_episodes: 5
split: train

task_config:
  min_distance: 5.0
  max_distance: 12.0
  instruction_type: simple_direction   # 必需: simple_direction, path_based, object_goal
  language: zh-CN                     # zh-CN 或 en-US
  num_instructions_per_episode: 1

output_dir: navarena_data
dataset_name: navarena_vln_zh
```

## 参数参考

### env_config（环境配置）

| 参数 | 说明 | 默认 |
|------|------|------|
| `z_coordinate` | 固定高度（通常 0.0） | `0.0` |
| `robot_radius` | 碰撞检测半径 | `0.4` |
| `max_sampling_attempts` | 采样重试次数 | 内部默认 |

### task_config（任务配置）

| 参数 | 说明 | 默认 |
|------|------|------|
| `min_distance` | 目标最小距离（米） | `5.0` |
| `max_distance` | 目标最大距离（米） | `12.0` |
| `grid_spacing` | 起点网格间距（米） | `1.0` |
| `max_start_points` | 最大起点数量，null 表示不限制 | `null` |
| `max_goal_sampling_attempts` | 每起点最大目标采样尝试次数 | `1` |
| `num_goals_per_start` | 每起点生成的目标数量 | `1` |
| `require_gt_path` | 是否要求 GT 路径可规划 | `true` |
| `planner_config` | 轨迹规划器配置（传递给 plan_full_trajectory） | `{}` |
| `instruction_type` | VLN 必需：simple_direction / path_based / object_goal | - |
| `language` | VLN 语言：zh-CN / en-US | - |

### 输出配置

| 参数 | 说明 |
|------|------|
| `output_dir` | 输出根目录（默认 navarena_data） |
| `dataset_name` | 数据集名称 |
| `split` | 数据划分（train/val/test） |

## 命令行覆盖

```bash
# 使用配置文件
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml

# 命令行参数
python scripts/generate_data.py --env gs --task pointnav \
    --scene x2robot/17dc3367 --num-episodes 100

# 并行生成
python scripts/generate_data.py --config configs/examples/vln_zh_example.yaml \
    --parallel --num-workers 4 --io-workers 8
```

!!! tip "下一步"
    - 查看 **[批量处理](batch-processing.md)**
    - 学习 **[资产预处理](../asset-preprocessing/overview.md)** 以准备场景
