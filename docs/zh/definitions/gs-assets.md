# 3D GS 资产规范

本文档定义了用于具身导航的 3D Gaussian Splatting 场景资产的统一目录结构、文件格式和元数据规范。

## 1. 目录结构

```
nav_gs_assets/
├── SPEC.md                           # 本规范文档
├── {dataset}/                        # 数据集分组目录
│   └── {scene_id}/                   # 8 位 UUID 短码
│       ├── manifest.json             # 场景元数据与溯源（必需）
│       ├── source.ply                # 原始 3DGS 点云（必需）
│       ├── aligned.ply               # 坐标归一化后的 3DGS 点云（必需）
│       ├── nav_map.pgm               # 2D 占据栅格地图（必需）
│       ├── nav_map.yaml              # ROS 兼容地图配置（必需）
│       ├── nav_mask.png              # 有效区域掩码（必需）
│       ├── labels.json               # 语义物体标注（可选）
│       ├── structure.json            # 户型平面图数据（可选）
│       └── compressed.splat          # 压缩版 .splat 二进制（可选）
```

### 数据集枚举值

| dataset | 说明 |
|---------|------|
| `InteriorGS` | InteriorGS 合成室内场景 |
| `scannetpp` | ScanNet++ 真实扫描场景 |
| `hypersim` | Hypersim 合成场景 |
| `replica` | Replica 合成场景 |
| `scenesplat` | SceneSplat 预训练 3DGS 场景 |
| `x2robot` | 自有机器人扫描场景 |

### 文件命名规则

- 所有文件使用 **固定语义化名字**，不以 scene_id 为前缀
- 场景目录名即 scene_id（8 位 hex），不在文件名中重复 ID
- 不使用时间戳后缀

## 2. Scene ID 生成规则

Scene ID 由 `dataset` 和原始名称确定性生成，保证同一输入永远映射到同一 ID：

```python
import hashlib

def generate_scene_id(original_name: str, dataset: str) -> str:
    """确定性生成 8 位 hex scene_id。"""
    raw = f"{dataset}:{original_name}"
    return hashlib.sha256(raw.encode()).hexdigest()[:8]
```

- 输入格式：`"{dataset}:{original_name}"`
- 输出：SHA-256 前 8 位 hex（约 4.3 亿种组合）
- 碰撞处理：如果发生碰撞（概率 < 0.0001%），扩展到前 12 位

## 3. manifest.json Schema

```json
{
  "schema_version": "1.0",
  "scene_id": "a3f8b21c",

  "source": {
    "dataset": "InteriorGS",
    "subset": null,
    "original_id": "0001_839920",
    "original_name": "0001_839920",
    "url": null,
    "license": null
  },

  "files": {
    "source_ply": "source.ply",
    "aligned_ply": "aligned.ply",
    "nav_map": "nav_map.pgm",
    "nav_map_config": "nav_map.yaml",
    "nav_mask": "nav_mask.png",
    "labels": "labels.json",
    "structure": "structure.json",
    "compressed_ply": "compressed.splat"
  },

  "map_info": {
    "resolution": 0.05,
    "origin": [-7.61, -2.89, 0.0],
    "size": [288, 351]
  },

  "nav_region": {
    "area_m2": 45.2,
    "method": "alpha_shapes",
    "params": {"alpha": 0.6, "dbscan_eps": 5.0}
  },

  "processing": {
    "normalizer_version": "1.0.0",
    "processed_at": "2026-02-10T11:06:07Z",
    "normalized": true,
    "extrinsic_matrix": [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ],
    "steps": [
      {"name": "coordinate_normalize", "status": "success", "duration_s": 2.3},
      {"name": "pcd_to_map", "status": "success", "duration_s": 1.1},
      {"name": "valid_region_estimate", "status": "success", "duration_s": 0.8}
    ]
  },

  "tags": [],
  "created_at": "2026-02-10T11:00:14Z",
  "updated_at": "2026-02-10T11:06:07Z"
}
```

### 字段说明

#### source（溯源，必填）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `dataset` | string | 是 | 来源数据集枚举值 |
| `subset` | string\|null | 否 | 子数据集标识（如 `scannetpp_v2_mcmc_1.5M_3dgs`） |
| `original_id` | string | 是 | 场景在原始数据集中的 ID |
| `original_name` | string | 是 | 原始目录名（完整保留，用于反向查找） |
| `url` | string\|null | 否 | 原始数据下载链接 |
| `license` | string\|null | 否 | 数据许可证标识 |

#### files（文件清单，必填）

| 字段 | 类型 | 说明 |
|------|------|------|
| `source_ply` | string\|null | 原始 3DGS PLY（未归一化） |
| `aligned_ply` | string\|null | 归一化后的 3DGS PLY（地面 Z=0） |
| `nav_map` | string\|null | PGM 占据栅格地图 |
| `nav_map_config` | string\|null | YAML 地图配置 |
| `nav_mask` | string\|null | 有效区域掩码 PNG |
| `labels` | string\|null | 语义标注 JSON |
| `structure` | string\|null | 户型图 JSON |
| `compressed_ply` | string\|null | 压缩版 .splat 二进制（Web 查看器用） |

所有路径均为 **相对于场景目录** 的相对路径。值为 `null` 表示该文件不存在。

#### processing（处理摘要）

| 字段 | 类型 | 说明 |
|------|------|------|
| `normalizer_version` | string | gs_asset_normalizer 版本 |
| `processed_at` | string | ISO 8601 处理完成时间 |
| `normalized` | bool | 是否已完成坐标归一化 |
| `extrinsic_matrix` | array | 4x4 齐次变换矩阵（source → aligned） |
| `steps` | array | 各步骤执行摘要 |

#### map_info（地图元数据）

| 字段 | 类型 | 说明 |
|------|------|------|
| `resolution` | float | 米/像素 |
| `origin` | [float, float, float] | 地图原点世界坐标 [x, y, z] |
| `size` | [int, int] | 地图尺寸 [width, height] 像素 |

#### nav_region（有效区域摘要）

| 字段 | 类型 | 说明 |
|------|------|------|
| `area_m2` | float | 有效区域面积（平方米） |
| `method` | string | 区域估计算法 |
| `params` | object | 算法参数 |

## 4. 文件格式

### source.ply / aligned.ply

3D Gaussian Splatting PLY 文件（binary_little_endian）。

必需属性：
- `x`, `y`, `z` — 位置
- `f_dc_0`, `f_dc_1`, `f_dc_2` — 球谐系数
- `opacity` — 不透明度
- `scale_0`, `scale_1`, `scale_2` — 高斯尺度
- `rot_0`, `rot_1`, `rot_2`, `rot_3` — 旋转四元数

`aligned.ply` 的坐标系约定：地面对齐 Z=0，Z 轴朝上。

### nav_map.pgm

PGM P5 (binary) 格式灰度图。

- 像素值 0 = 占据（黑色）
- 像素值 255 = 自由空间（白色）
- 图像垂直翻转以匹配 ROS 约定

### nav_map.yaml

ROS 兼容地图配置文件：

```yaml
image: nav_map.pgm
resolution: 0.05
origin: [-7.61, -2.89, 0.0]
negate: 0
occupied_thresh: 0.65
free_thresh: 0.25
```

`image` 字段固定为 `nav_map.pgm`。

### nav_mask.png

灰度 PNG 图像，与 `nav_map.pgm` 尺寸一致。

- 非零像素 = 有效区域
- 零像素 = 无效区域

### labels.json

```json
{
  "schema_version": "1.0",
  "labels": [
    {
      "instance_id": "bed_0",
      "category": "bed",
      "position": [1.23, 4.56, 0.0],
      "bounding_box": null,
      "confidence": 1.0,
      "source": "ground_truth"
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `instance_id` | string | 实例唯一标识 |
| `category` | string | 物体类别名 |
| `position` | [float, float, float] | 世界坐标 [x, y, z] |
| `bounding_box` | object\|null | 可选 3D 包围盒 `{"min": [x,y,z], "max": [x,y,z]}` |
| `confidence` | float | 置信度（ground truth 为 1.0） |
| `source` | string | 标注来源（`ground_truth` / `model_predicted`） |

### compressed.splat

紧凑的 3D Gaussian Splatting 二进制格式，每个 Gaussian 占用 32 字节（little-endian），兼容 Web 查看器（antimatter15/splat、gsplat.js、GaussianSplats3D 等）。

**字段布局**（每个 Gaussian 32 字节）：

| 字段 | 类型 | 字节数 | 说明 |
|------|------|--------|------|
| x, y, z | 3 × float32 | 12 | 世界坐标位置 |
| scale_x, scale_y, scale_z | 3 × float32 | 12 | Gaussian 尺度（`exp(raw_scale)`） |
| r, g, b, a | 4 × uint8 | 4 | 颜色（RGB）和不透明度（alpha） |
| rot_0, rot_1, rot_2, rot_3 | 4 × uint8 | 4 | 归一化四元数（量化到 [0, 255]） |

**数据处理规则**：

- **颜色转换**：从球谐系数（SH DC）转换为 RGB：`RGB = clip((0.5 + SH_C0 * f_dc) * 255)`，其中 `SH_C0 = 0.28209479177387814`
- **不透明度**：从原始 logit 值转换为 alpha：`alpha = clip(sigmoid(opacity) * 255)`
- **旋转量化**：四元数归一化后映射到 [0, 255]：`rot_u8 = clip(rot_normalized * 128 + 128)`
- **排序**：按重要性（volume × opacity）降序排列，用于渐进式加载

**生成方式**：

由 `gs_asset_normalizer` 的 `compress_ply` 步骤从 `aligned.ply` 生成。可选配置低透明度 Gaussian 剪枝（默认阈值 sigmoid(-5) ≈ 0.007）。
