# 预处理说明（已迁移）

资产预处理功能已拆分为独立的文档章节。

请参阅：

- **[资产预处理概述](../asset-preprocessing/overview.md)** - 3DGS 场景标准化 Pipeline 说明
- **[Pipeline 步骤](../asset-preprocessing/pipeline-steps.md)** - 坐标归一化、PGM 生成、可导航区域估计等
- **[CLI 命令](../asset-preprocessing/cli.md)** - run-pipeline、batch、migrate、compress 等
- **[Web 查看器](../asset-preprocessing/web-viewer.md)** - 3DGS 资产浏览

数据生成器（NavArena-Gen）依赖资产预处理输出的 V1 格式（manifest.json、nav_map.pgm、nav_map.yaml 等）。在生成数据前，请先使用 NavArena-Forge 完成场景预处理。
