# 架构设计

本文档说明 NavArena 的整体架构、四子项目关系、数据流与技术栈。

## 四子项目关系

```mermaid
flowchart TB
    classDef core   fill:#FFF7ED,stroke:#F97316,stroke-width:1.5px,color:#7C2D12,font-weight:600
    classDef forge  fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A5F
    classDef gen    fill:#F0FDFA,stroke:#0D9488,stroke-width:1.5px,color:#0F4C43
    classDef bench  fill:#F5F3FF,stroke:#7C3AED,stroke-width:1.5px,color:#3B1F6E

    subgraph Core[navarena-core]
        Rendering[rendering]:::core
        Utils[utils]:::core
        Config[config]:::core
        Data[data]:::core
    end
    
    subgraph Forge[navarena-forge]
        Pipeline[Pipeline]:::forge
        Steps[ProcessingStep]:::forge
    end
    
    subgraph Gen[navarena-gen]
        Generators[generators]:::gen
        Envs[envs]:::gen
        Planning[planning]:::gen
    end
    
    subgraph Bench[navarena-bench]
        Evaluator[Evaluator]:::bench
        Agent[Agent]:::bench
        Env[Env]:::bench
    end
    
    Core --> Forge
    Core --> Gen
    Core --> Bench
    Forge --> Gen
    Gen --> Bench
```

| 项目 | 职责 | 依赖 |
|------|------|------|
| **navarena-core** | 共享核心库：渲染（gsplat）、配置管理、数据结构、工具函数 | - |
| **navarena-forge** | 资产预处理：PLY → V1 格式（坐标归一化、占据栅格、可导航区域） | navarena-core |
| **navarena-gen** | 数据生成：多任务 Episode 生成（PointNav、VLN 等）、Parquet 写入 | navarena-core、V1 资产 |
| **navarena-bench** | 评测框架：3D GS 环境、智能体驱动、指标计算、回放 | navarena-core、V1 资产、Episode 数据 |

## 数据流

```mermaid
flowchart LR
    classDef data    fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A5F
    classDef module  fill:#F0FDFA,stroke:#0D9488,stroke-width:1.5px,color:#0F4C43,font-weight:600
    classDef output  fill:#F5F3FF,stroke:#7C3AED,stroke-width:1.5px,color:#3B1F6E

    A["Raw PLY\nInteriorGS / ScanNet++"]:::data --> B[navarena-forge]:::module
    B --> C["V1 资产\nassets/"]:::data
    C --> D[navarena-gen]:::module
    D --> E["Parquet 数据集\ndatasets/"]:::data
    E --> F[navarena-bench]:::module
    F --> G["评测结果\nMetrics / Replay"]:::output
```

1. **资产预处理**：原始 3DGS PLY 经过 `coordinate_normalize` → `pcd_to_map` → `valid_region_estimate` → `compress_ply`，产出 `manifest.json`、`aligned.ply`、`nav_map.pgm`、`nav_mask.png` 等。
2. **数据生成**：从 V1 资产加载场景，采样起点与目标，规划 A* 轨迹，可选生成 VLN 指令，写入 Parquet。
3. **评测**：加载 Episode，在 3D GS 环境中驱动智能体导航，计算 SR、SPL、NE 等指标，可选生成回放视频。

## 技术栈

| 层级 | 技术 |
|------|------|
| **工作空间** | uv workspace（Python 依赖管理） |
| **渲染** | gsplat（3D Gaussian Splatting）、PIL |
| **数据结构** | PyArrow / Parquet、NumPy、PyTorch |
| **配置** | YAML、Pydantic |
| **文档** | MkDocs Material、i18n 多语言 |

## 扩展点

各模块均采用注册机制，便于扩展：

- **navarena-forge**：`@StepRegistry.register` 注册新 Pipeline 步骤
- **navarena-gen**：`BaseGenerator`、`BaseSimEnv`、`BaseInstructionGenerator` 注册新任务、环境、指令类型
- **navarena-bench**：`Evaluator`、`Env`、`Agent`、`Metric` 注册新评测器、环境、智能体、指标

详见 [扩展指南](../navarena-bench/extending.md)。
