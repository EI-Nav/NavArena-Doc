# 配置说明

资产预处理使用 YAML 配置文件。所有配置位于 `navarena_forge/configs/` 目录。

## 配置文件结构

```
configs/
├── pipeline.yaml              # 完整 Pipeline 配置
├── coordinate_normalize.yaml  # 坐标归一化（独立运行用）
├── pcd_to_map.yaml            # 点云转地图（独立运行用）
└── valid_region_estimate.yaml  # 可导航区域估计（独立运行用）
```

## pipeline.yaml（完整 Pipeline）

定义三个核心步骤及其参数。CLI 的 `batch` 和 `run-pipeline` 会按场景自动注入路径。

```yaml
steps:
  - name: coordinate_normalize
    enabled: true
    fatal: true
    params:
      input:
        ply_file: null       # 由 CLI 注入
      output:
        transformed_output: null
      ransac:
        distance_threshold: 0.02
        ransac_n: 3
        num_iterations: 1000
      height_range: [-0.05, 0.05]

  - name: pcd_to_map
    enabled: true
    fatal: true
    params:
      input:
        pcd_file: null
      output:
        pgm_file: null
        yaml_file: null
      map:
        resolution: 0.05
        margins: [1.0, 1.0, 1.0, 1.0]
      height_filter:
        min_z: 0.1
        max_z: 0.8

  - name: valid_region_estimate
    enabled: true
    fatal: false
    params:
      parameters:
        dbscan_eps: 5.0
        alpha: 0.6
```

## 参数参考

### coordinate_normalize

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `ransac.distance_threshold` | RANSAC 地面拟合距离阈值（米） | `0.02` |
| `ransac.num_iterations` | RANSAC 迭代次数 | `1000` |
| `height_range` | 地面点 Z 范围 | `[-0.05, 0.05]` |

### pcd_to_map

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `map.resolution` | 地图分辨率（米/像素） | `0.05` |
| `height_filter.min_z` | 高度过滤下限 | `0.1` |
| `height_filter.max_z` | 高度过滤上限 | `0.8` |

### valid_region_estimate

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `parameters.dbscan_eps` | DBSCAN 邻域半径（米） | `5.0` |
| `parameters.dbscan_min_samples` | DBSCAN 最小样本数 | `1000` |
| `parameters.alpha` | Alpha Shapes 参数 | `0.6` |

## 运行单个步骤

使用 `run-step` 命令时，需提供该步骤的独立配置文件，并显式填写输入输出路径：

```yaml
# coordinate_normalize.yaml
input:
  ply_file: /path/to/scene/source.ply

output:
  transformed_output: /path/to/scene/aligned.ply

ransac:
  distance_threshold: 0.02
```

```bash
python -m navarena_forge run-step coordinate_normalize \
    --config coordinate_normalize.yaml --scene-dir /path/to/scene
```

**参见**：[CLI 命令](cli.md)
