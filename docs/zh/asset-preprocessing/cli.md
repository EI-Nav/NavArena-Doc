# CLI 命令

资产预处理通过 `gs_asset_normalizer` 模块提供命令行接口。进入 `embodied-nav-assets` 目录后，使用 `python -m gs_asset_normalizer` 调用。

## 命令概览

| 命令 | 说明 |
|------|------|
| `run-pipeline` | 单场景完整 Pipeline |
| `batch` | 批量处理多场景 |
| `run-step` | 运行单个步骤 |
| `list-steps` | 列出所有已注册步骤 |
| `migrate` | 将旧格式迁移到 V1 统一格式 |
| `compress` | 批量将 PLY 转为 .splat |
| `convert-labels` | 将 labels.json 转为 V1 格式 |

---

## run-pipeline（单场景 Pipeline）

对单个场景目录运行完整 Pipeline。

```bash
python -m gs_asset_normalizer run-pipeline \
    --config pipeline.yaml \
    --scene-dir /path/to/scene \
    --source-dataset InteriorGS
```

### 参数

| 参数 | 说明 |
|------|------|
| `--config` | **必需**，Pipeline YAML 配置路径 |
| `--scene-dir` | 场景目录路径 |
| `--input-ply` | 覆盖输入 PLY 路径 |
| `--transformed-output` | 覆盖归一化输出路径 |
| `--source-dataset` | 源数据集名称，用于生成 manifest 与 scene_id |
| `--source-subset` | 源子集（可选） |

---

## batch（批量处理）

对 `--scenes-root` 下所有子目录批量运行 Pipeline。

```bash
python -m gs_asset_normalizer batch \
    --scenes-root /path/to/scenes \
    --config pipeline.yaml \
    --source-dataset scannetpp
```

### 参数

| 参数 | 说明 |
|------|------|
| `--scenes-root` | **必需**，场景根目录 |
| `--config` | **必需**，Pipeline 配置 |
| `--force` | 强制重新处理已完成场景 |
| `--start` | 起始场景名（含） |
| `--end` | 结束场景名（含） |
| `--source-dataset` | 源数据集名称 |
| `--source-subset` | 源子集 |

已完成场景（存在 `aligned.ply`、`nav_map.pgm`、`nav_map.yaml`）会被自动跳过，除非使用 `--force`。

---

## run-step（单步运行）

仅运行指定步骤。

```bash
python -m gs_asset_normalizer run-step coordinate_normalize \
    --config coordinate_normalize.yaml \
    --scene-dir /path/to/scene
```

### 参数

| 参数 | 说明 |
|------|------|
| `step_name` | 步骤名称（如 `coordinate_normalize`） |
| `--config` | 该步骤的 YAML 配置 |
| `--scene-dir` | 场景目录 |

---

## list-steps（列出步骤）

列出所有已注册的处理步骤。

```bash
python -m gs_asset_normalizer list-steps
```

输出示例：

```
  - coordinate_normalize
  - pcd_to_map
  - valid_region_estimate
  - compress_ply
```

---

## migrate（迁移到 V1 格式）

将已有场景复制到新的 V1 目录结构，统一文件名并生成 manifest.json。

```bash
python -m gs_asset_normalizer migrate \
    --scenes-root /path/to/old/scenes \
    --output-root /path/to/nav_gs_assets \
    --source-dataset InteriorGS
```

### 参数

| 参数 | 说明 |
|------|------|
| `--scenes-root` | **必需**，源场景根目录 |
| `--output-root` | **必需**，目标 V1 资产根目录 |
| `--source-dataset` | **必需**，源数据集名称 |
| `--dry-run` | 仅打印将要执行的操作，不实际复制 |
| `--start` / `--end` | 场景名范围 |

---

## compress（批量 PLY 转 .splat）

在 V1 资产目录中批量将 PLY 转为 compressed.splat。

```bash
python -m gs_asset_normalizer compress \
    --assets-root /path/to/nav_gs_assets \
    --dataset scenesplat
```

### 参数

| 参数 | 说明 |
|------|------|
| `--assets-root` | **必需**，V1 资产根目录 |
| `--dataset` | 数据集子目录，为空则扫描 assets-root 本身 |
| `--opacity-threshold` | 低透明度剪枝阈值（默认 -5.0） |
| `--no-sort` | 禁用按重要性排序 |
| `--force` | 覆盖已有 .splat |
| `--dry-run` | 仅打印计划，不写入文件 |

---

## convert-labels（标签格式转换）

将 labels.json 从旧格式转换为 V1 格式。

### 单文件模式

```bash
python -m gs_asset_normalizer convert-labels \
    --input /path/to/labels.json \
    [--output /path/to/output.json]
```

### 批量模式

```bash
python -m gs_asset_normalizer convert-labels \
    --assets-root /path/to/nav_gs_assets \
    --dataset x2robot
```

---

## 通用选项

所有命令支持：

- `-v` / `--verbose`：启用 DEBUG 日志

## 下一步

- 使用 **[Web 查看器](web-viewer.md)** 浏览处理后的资产
