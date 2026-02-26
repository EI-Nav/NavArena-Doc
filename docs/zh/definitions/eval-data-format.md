# 具身导航评测数据格式

本文档定义评测框架（navarena-bench）所需的 Episode 与轨迹格式。**Episode 核心字段、Goals、Instructions、GT Path、GT 轨迹文件格式**与 [导航训练数据格式](nav-data-format.md) 完全一致，本文档仅说明评测数据的差异与组织方式。

!!! info "与训练数据的关系"
    评测数据格式是 [训练数据格式](nav-data-format.md) 中 Episode 部分的**子集**。训练数据由 navarena-gen 生成，含 goal_images、rendered_videos 等附加文件；评测框架仅需 Episodes JSON 与 gt_trajectories。

## 1. 与训练格式的主要区别

| 维度 | 训练数据（navarena-gen 输出） | 评测数据（navarena-bench 输入） |
|------|------------------------------|----------------------------------|
| 目录结构 | `scenes/{scene_id}/{task_type}/` | 可为 `datasets/{name}/{dataset}/{scene_id}/{task_type}/` 或扁平结构 |
| 元数据 | dataset_meta.json、scene_meta.json | 可选；Episodes 文件内 metadata 即可 |
| Episode 字段 | 与评测一致 | 与训练一致，参见 [nav-data-format](nav-data-format.md#4-episode) |
| 附加文件 | goal_images、rendered_videos | 仅需 gt_trajectories（ImageNav 需 goal_images） |

## 2. 顶层数据集格式

评测框架支持的 Episodes 文件顶层结构：

```json
{
  "version": "1.0.0",
  "dataset_name": "navarena_bench",
  "metadata": {
    "task_types": ["pointnav", "imagenav", "objectnav", "vln"],
    "splits": ["train", "val_seen", "val_unseen", "test"]
  },
  "episodes": []
}
```

## 3. Episode 字段

### 3.1 评测框架所需字段一览

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `episode_id` | string | 是 | 唯一标识，格式 `{split}_{序号}` |
| `scene_path` | string | 是 | 场景路径，格式 `{dataset}/{scene_id}` |
| `task_type` | string | 是 | `pointnav` \| `imagenav` \| `objectnav` \| `vln` |
| `start_state` | object | 是 | `{position: [x,y,z], rotation: [qx,qy,qz,qw]}` |
| `goals` | array | 是 | 至少一个目标，见下表 goal_type |
| `instructions` | array | VLN 必需 | `[{instruction_text, language}]` |
| `gt_path.trajectory_file` | string | 可选 | GT 轨迹文件相对路径 |

### 3.2 各任务类型的 Goals 必需字段

| 任务类型 | goal_type | Goals 必需字段 |
|----------|-----------|----------------|
| PointNav | `position` | `position` |
| ImageNav | `image` | `image_goal.image_path`，`position`（用于评估） |
| ObjectNav | `object` | `object_category`，`position`（用于评估） |
| VLN | `position` | `position`，外加 episode 级 `instructions` |

完整字段定义详见 [导航训练数据格式](nav-data-format.md) 第 4–8 章。

## 4. 最小可用 Episode 示例

以下为 PointNav 的最小评测 Episode，可直接用于构造评测数据：

```json
{
  "episode_id": "eval_000001",
  "scene_path": "x2robot/17dc3367",
  "task_type": "pointnav",
  "start_state": {
    "position": [0.0, 0.0, 0.0],
    "rotation": [0.0, 0.0, 0.0, 1.0]
  },
  "goals": [
    {
      "goal_type": "position",
      "position": [5.0, 0.0, 0.0],
      "rotation": [0.0, 0.0, 0.383, 0.924]
    }
  ]
}
```

## 5. scene_path 解析规则

评测框架将 `scene_path` 解析为 V1 资产目录的绝对路径：

```
绝对路径 = $NAVARENA_DATA_DIR/assets/{scene_path}
```

例如 `scene_path: "x2robot/17dc3367"` 对应 `$NAVARENA_DATA_DIR/assets/x2robot/17dc3367/`，该目录需包含 `manifest.json`、`aligned.ply`、`nav_map.pgm`、`nav_map.yaml` 等 V1 资产文件。

## 6. 评测数据文件组织结构

评测数据按场景和任务类型组织，`scene_path` 为相对 `$NAVARENA_DATA_DIR/assets/` 的路径：

```text
$NAVARENA_DATA_DIR/
├── datasets/                        # 或自定义数据根
│   └── {dataset_name}/
│       └── {dataset}/{scene_id}/    # 如 x2robot/17dc3367
│           └── {task_type}/
│               ├── train.json
│               ├── val.json
│               ├── gt_trajectories/
│               │   └── {split}_{idx}_gt.json
│               └── goal_images/    # ImageNav 必需
└── assets/                          # V1 场景资产
```

## 7. 完整示例

PointNav、ImageNav、ObjectNav、VLN 的 Episode 示例见 [训练数据格式 - 完整示例](nav-data-format.md) 第 9 章。

## 8. 注意事项

- 所有路径使用相对路径，需按上述目录组织。
- 确保 `scene_path` 对应的 V1 资产目录存在且完整。
