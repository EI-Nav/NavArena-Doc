# Web 查看器

资产预处理项目包含一个基于 FastAPI 的 3DGS Web 查看器，用于在浏览器中浏览已处理的场景资产。

## 功能概述

- **WebGL 3DGS 渲染** - 使用 GaussianSplats3D 等库在浏览器中渲染场景
- **数据集 / 场景浏览** - 按数据集浏览所有包含 `compressed.splat` 的场景
- **REST API** - 提供场景列表、元数据、splat 文件、缩略图等接口

## 启动方式

```bash
cd navarena-forge
python -m web_viewer.main --assets-dir /path/to/navarena_assets --port 41005
```

### 参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--assets-dir` | V1 资产根目录 | `/x2robot_v2/share/navarena-bench/navarena_assets` |
| `--host` | 监听地址 | `0.0.0.0` |
| `--port` | 监听端口 | `41005` |
| `--log-level` | 日志级别 | `info` |

## 显示条件

仅包含 `compressed.splat` 的场景会在列表中显示。若需在 Web 中预览，需先运行 `compress` 命令生成该文件。

## API 接口

### 获取数据集列表

```http
GET /api/datasets
```

**响应示例：**
```json
[
  {"name": "x2robot", "scene_count": 42},
  {"name": "scenesplat", "scene_count": 15}
]
```

### 获取场景列表

```http
GET /api/datasets/{dataset}/scenes
```

**响应示例：**
```json
[
  {
    "scene_id": "17dc3367",
    "source": {},
    "map_info": {"resolution": 0.05},
    "splat_size_mb": 12.5,
    "has_labels": true,
    "has_nav_mask": true
  }
]
```

### 获取场景元数据

```http
GET /api/scenes/{dataset}/{scene_id}/metadata
```

返回完整的 manifest.json 内容。

### 获取 compressed.splat

```http
GET /api/scenes/{dataset}/{scene_id}/compressed.splat
```

用于 WebGL 客户端加载 3DGS 场景。URL 以 `.splat` 结尾便于客户端自动识别格式。

### 获取缩略图

```http
GET /api/scenes/{dataset}/{scene_id}/thumbnail
```

返回 `nav_mask.png` 作为场景缩略图。

### 获取 labels.json

```http
GET /api/scenes/{dataset}/{scene_id}/labels
```

若存在则返回 `labels.json` 内容。

## 前端页面

访问 `http://localhost:41005/` 可打开主页面，包含：

- 侧边栏：数据集与场景列表
- 主区域：WebGL 3DGS 场景渲染
- 场景元数据展示
- 轨道 / 平移 / 缩放控制

## 下一步

- 返回 **[概述](overview.md)** 了解整体架构
- 使用 **[CLI 命令](cli.md)** 处理场景
