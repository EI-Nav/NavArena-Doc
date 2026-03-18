# 配置说明

数据生成器使用 YAML 配置文件，支持配置层级和命令行覆盖。所有路径相对于 `$NAVARENA_DATA_DIR`。

## 配置层级

1. **主配置文件** - 用户提供的完整配置（如 `examples/pointnav_example.yaml`）
2. **defaults/env/{env_type}.yaml** - 环境默认（如 `gs.yaml`）
3. **defaults/task/{task_type}.yaml** - 任务默认（如 `pointnav.yaml`）
4. **defaults/planner.yaml** - 轨迹规划器默认

用户配置优先，缺失项从上述默认文件合并。

## 配置文件结构

```
configs/
├── defaults/
│   ├── env/
│   │   └── gs.yaml                 # 当前仅实现 gs（3DGS）环境；habitat/isaac 为占位
│   ├── task/
│   │   ├── pointnav.yaml
│   │   ├── gridtraj.yaml
│   │   ├── imagenav.yaml
│   │   ├── objectnav.yaml
│   │   └── vln.yaml
│   └── planner.yaml
└── examples/
    ├── pointnav_example.yaml
    ├── gridtraj_example.yaml
    ├── imagenav_example.yaml
    ├── objectnav_example.yaml
    ├── vln_zh_example.yaml
    └── ...
```

## 示例配置

### PointNav

```yaml
env_type: gs
scene_path: sage-3d/00666b7a

env_config:
  z_coordinate: 0.0
  robot_radius: 0.4
  max_linear_velocity: 0.5
  max_angular_velocity: 1.0

task_type: pointnav
num_episodes: 1000
split: train

task_config:
  start_constraints:
    sampler: grid
    grid_spacing: 0.5
    max_start_points: null

  goal_constraints:
    sampler: grid
    grid_spacing: 0.5
    require_navigable_path: true

  trajectory_constraints:
    min_geodesic_distance: 0.5
    max_geodesic_distance: 30.0
    require_gt_path: true

dataset_name: navarena_dataset_v1
```

### VLN（中文指令）

```yaml
env_type: gs
scene_path: x2robot/17dc3367

env_config:
  z_coordinate: 0.0
  robot_radius: 0.4

task_type: vln
num_episodes: 100
split: train

task_config:
  start_constraints:
    sampler: grid
    grid_spacing: 0.5
  goal_constraints:
    sampler: grid
    grid_spacing: 0.5
  trajectory_constraints:
    min_geodesic_distance: 5.0
    max_geodesic_distance: 12.0

  instruction_type: simple_direction   # simple_direction / path_based / object_goal
  language: zh-CN
  num_instructions_per_episode: 1

dataset_name: navarena_vln_zh
```

## 参数参考

### 顶层配置

| 参数 | 说明 | 默认 |
|------|------|------|
| `env_type` | 环境类型：gs / habitat / isaac | `gs` |
| `scene_path` | 场景路径，如 `x2robot/17dc3367` | 必需 |
| `task_type` | 任务类型：pointnav / imagenav / objectnav / vln | `pointnav` |
| `num_episodes` | 生成 episode 数量 | `100` |
| `split` | 数据划分：train / val_seen / val_unseen / test | `train` |
| `dataset_name` | 数据集名称，输出到 `datasets/{dataset_name}/` | `navarena_dataset_v1` |

### env_config（环境配置）

| 参数 | 说明 | 默认 |
|------|------|------|
| `z_coordinate` | 固定高度 | `0.0` |
| `robot_radius` | 碰撞检测半径（米） | `0.4` |
| `max_linear_velocity` | 最大线速度（米/秒） | `0.5` |
| `max_angular_velocity` | 最大角速度（弧度/秒） | `1.0` |
| `max_linear_accel` | 最大线加速度 | `0.3` |
| `max_angular_accel` | 最大角加速度 | `2.0` |
| `max_jerk` | 最大 jerk | `0.5` |
| `max_lateral_accel` | 最大侧向加速度 | `0.3` |
| `dt` | 时间步长（秒） | `0.333` |
| `goal_tolerance` | 目标容差（米） | `0.3` |

### task_config（任务配置）

#### start_constraints（起点约束）

| 参数 | 说明 | 默认 |
|------|------|------|
| `sampler` | 采样器：grid | `grid` |
| `grid_spacing` | 网格间距（米） | `0.5` |
| `max_start_points` | 最大起点数量，null 表示不限制 | `null` |
| `rotation_num` | 每个点采样朝向数量 | `6` |

#### goal_constraints（目标约束）

| 参数 | 说明 | 默认 |
|------|------|------|
| `sampler` | 采样器：grid | `grid` |
| `grid_spacing` | 网格间距（米） | `0.5` |
| `rotation_num` | 每个目标采样朝向数量 | `6` |
| `require_navigable_path` | 目标需与起点有可行路径 | `true` |

#### trajectory_constraints（轨迹约束）

| 参数 | 说明 | 默认 |
|------|------|------|
| `min_geodesic_distance` | 最小测地线距离（米） | `0.5` |
| `max_geodesic_distance` | 最大测地线距离（米） | `30.0` |
| `require_gt_path` | 是否要求 GT 路径可规划 | `true` |

#### VLN 专用

| 参数 | 说明 | 默认 |
|------|------|------|
| `instruction_type` | simple_direction / path_based / object_goal | 必需 |
| `language` | zh-CN / en-US | - |
| `num_instructions_per_episode` | 每 episode 指令条数 | `1` |

### planner_config（规划器，可选）

通过 `task_config.planner_config` 或 `defaults/planner.yaml` 配置，传递给轨迹规划器。

## 多文件合并

使用 `GeneratorConfig.from_files()` 或 `--env-config` / `--task-config` 合并片段：

```bash
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml \
    --env-config my_env.yaml --task-config my_task.yaml
```

## 命令行覆盖

```bash
# 使用配置文件
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml

# 纯命令行
python scripts/generate_data.py --env gs --task pointnav \
    --scene x2robot/17dc3367 --num-episodes 100

# 并行生成
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml \
    --parallel --num-workers 4 --batch-size 20

# 断点续传
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml --resume

# 追加模式
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml --append
```

!!! tip "下一步"
    - 查看 **[批量处理](batch-processing.md)** 的完整 CLI 参数
    - 学习 **[资产预处理](../asset-preprocessing/)** 以准备场景
