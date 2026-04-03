# Architecture Design

This document describes NavArena's overall architecture, the four sub-projects, data flow, and technology stack.

## Four Sub-Projects Relationship

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

| Project | Responsibility | Dependencies |
|---------|----------------|--------------|
| **navarena-core** | Shared core: rendering (gsplat), config, data structures, utilities | - |
| **navarena-forge** | Asset preprocessing: PLY → V1 format (coordinate norm, occupancy grid, nav region) | navarena-core |
| **navarena-gen** | Data generation: multi-task Episode generation (PointNav, VLN, etc.), Parquet write | navarena-core, V1 assets |
| **navarena-bench** | Evaluation: 3D GS env, agent driver, metrics, replay | navarena-core, V1 assets, Episode data |

## Data Flow

```mermaid
flowchart LR
    classDef data    fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A5F
    classDef module  fill:#F0FDFA,stroke:#0D9488,stroke-width:1.5px,color:#0F4C43,font-weight:600
    classDef output  fill:#F5F3FF,stroke:#7C3AED,stroke-width:1.5px,color:#3B1F6E

    A["Raw PLY\nInteriorGS / ScanNet++"]:::data --> B[navarena-forge]:::module
    B --> C["V1 Assets\nassets/"]:::data
    C --> D[navarena-gen]:::module
    D --> E["Parquet Dataset\ndatasets/"]:::data
    E --> F[navarena-bench]:::module
    F --> G["Eval Results\nMetrics / Replay"]:::output
```

1. **Asset preprocessing**: Raw 3DGS PLY via `coordinate_normalize` → `pcd_to_map` → `valid_region_estimate` → `compress_ply`, producing `manifest.json`, `aligned.ply`, `nav_map.pgm`, `nav_mask.png`, etc.
2. **Data generation**: Load scenes from V1 assets, sample starts and goals, plan A* trajectories, optionally generate VLN instructions, write Parquet.
3. **Evaluation**: Load Episodes, drive agents in 3D GS env, compute SR, SPL, NE, optionally generate replay video.

## Technology Stack

| Layer | Technology |
|-------|-------------|
| **Workspace** | uv workspace (Python dependency management) |
| **Rendering** | gsplat (3D Gaussian Splatting), PIL |
| **Data** | PyArrow/Parquet, NumPy, PyTorch |
| **Config** | YAML, Pydantic |
| **Docs** | MkDocs Material, i18n |

## Extension Points

All modules use a registry for extensibility:

- **navarena-forge**: `@StepRegistry.register` for new Pipeline steps
- **navarena-gen**: `BaseGenerator`, `BaseSimEnv`, `BaseInstructionGenerator` for new tasks, envs, instruction types
- **navarena-bench**: `Evaluator`, `Env`, `Agent`, `Metric` for new evaluators, envs, agents, metrics

See [Extending Guide](../navarena-bench/extending.md) for details.
