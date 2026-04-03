# Core Concepts

This document defines the core concepts, terminology, and workflows of the NavArena embodied navigation infrastructure.

## 1. NavArena Workflow

NavArena provides a complete toolchain from 3DGS scenes to navigation model evaluation:

```mermaid
flowchart LR
    subgraph Step1 [Asset Preprocessing]
        A1[Raw PLY] --> A2[navarena-forge]
        A2 --> A3[V1 Assets]
    end
    
    subgraph Step2 [Data Generation]
        B1[V1 Assets] --> B2[navarena-gen]
        B2 --> B3[Episode Data]
    end
    
    subgraph Step3 [Evaluation]
        C1[Episode Data] --> C2[navarena-bench]
        C2 --> C3[Eval Results]
    end
    
    A3 --> B1
    B3 --> C1
```

1. **Asset Preprocessing** (navarena-forge): Convert raw 3DGS PLY to V1 unified asset format
2. **Data Generation** (navarena-gen): Generate training/evaluation Episode data from V1 assets
3. **Evaluation** (navarena-bench): Evaluate navigation models in simulation

## 2. Core Terminology

| Term | Description |
|------|-------------|
| **Episode** | A complete navigation task instance with start, goal, optional instructions, and GT trajectory |
| **Scene** | A 3D scene corresponding to a V1 asset directory. Identified by `dataset/scene_id` (e.g. `x2robot/17dc3367`) |
| **V1 Asset Format** | Unified scene asset directory structure with manifest.json, aligned.ply, nav_map.pgm, nav_map.yaml, nav_mask.png, etc. |
| **GT Trajectory** | Ground Truth trajectory from start to goal, used for training and evaluation |
| **Split** | Data split: train, val_seen, val_unseen, test |
| **Task Type** | pointnav (point goal), imagenav (image goal), objectnav (object goal), vln (vision-language navigation) |
| **scene_path** | Scene relative path in form `{dataset}/{scene_id}`, relative to `$NAVARENA_DATA_DIR/assets/` |

## 3. Sub-Project Responsibilities

| Project | Responsibility |
|---------|----------------|
| **navarena-core** | Core library; rendering, planning; dependency of forge, gen, bench |
| **navarena-forge** | Asset preprocessing; converts raw 3DGS to V1 format |
| **navarena-gen** | Data generation; Episodes, GT trajectories, goal images, rendered videos |
| **navarena-bench** | Evaluation framework; loads Episodes, runs agents in 3D GS env, computes metrics |

## 4. NAVARENA_DATA_DIR Layout

```
$NAVARENA_DATA_DIR/
├── shared/                    # Shared config
│   ├── camera.yaml           # Camera config
│   └── ...
├── assets/                    # V1 format scene assets
│   ├── x2robot/
│   │   └── 17dc3367/
│   │       ├── manifest.json
│   │       ├── aligned.ply
│   │       ├── nav_map.pgm
│   │       ├── nav_map.yaml
│   │       └── nav_mask.png
│   └── scannetpp/
│       └── ...
└── datasets/                  # Generated datasets (navarena-gen output, Parquet v1.0.0)
    └── {dataset_name}/
        └── {scene_path}/     # e.g. x2robot/17dc3367
            └── {task_type}/
                ├── meta/
                │   ├── info.json
                │   └── episodes.parquet
                ├── data/
                │   └── chunk-NNN/
                │       ├── trajectories.parquet
                │       └── episodes.parquet
                └── goal_images/   # ImageNav only (optional)
```

- **assets/**: Preprocessed scenes from navarena-forge; used by navarena-gen and navarena-bench
- **datasets/**: Output from navarena-gen (chunked Parquet storage); navarena-bench loads Episodes from here

## 5. Package and Data Flow

```mermaid
flowchart TB
    classDef core   fill:#FFF7ED,stroke:#F97316,stroke-width:1.5px,color:#7C2D12,font-weight:600
    classDef forge  fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A5F
    classDef gen    fill:#F0FDFA,stroke:#0D9488,stroke-width:1.5px,color:#0F4C43
    classDef bench  fill:#F5F3FF,stroke:#7C3AED,stroke-width:1.5px,color:#3B1F6E
    classDef data   fill:#FFFBEB,stroke:#D97706,stroke-width:1.5px,color:#92400E

    subgraph Core [navarena-core]
        C[config, data, rendering, utils]:::core
    end
    
    subgraph Forge [navarena-forge]
        F[Asset Preprocessing]:::forge
    end
    
    subgraph Gen [navarena-gen]
        G[Data Generation]:::gen
    end
    
    subgraph Bench [navarena-bench]
        B[Evaluation]:::bench
    end
    
    Core --> Forge
    Core --> Gen
    Core --> Bench
    
    PLY[Raw PLY]:::data --> Forge
    Forge --> V1[V1 Assets]:::data
    V1 --> Gen
    Gen --> EP[Episode Data]:::data
    EP --> Bench
    Bench --> Results[Eval Results]:::data
```

navarena-core is the shared foundation; forge, gen, and bench each depend on it. Data flows: PLY → V1 assets (forge) → Episodes (gen) → evaluation results (bench).

## 6. Data Flow Detail

```mermaid
flowchart TB
    subgraph Input [Input]
        PLY[Raw PLY]
    end
    
    subgraph Forge [navarena-forge]
        FN[Coordinate Normalize]
        FM[Occupancy grid map]
        FV[Valid Region]
        PLY --> FN --> FM --> FV
    end
    
    subgraph Assets [V1 Assets]
        M[manifest.json]
        P[aligned.ply]
        G[nav_map.pgm]
        FV --> M
        FN --> P
        FM --> G
    end
    
    subgraph Gen [navarena-gen]
        GE[Episode Gen]
        GW[Data Write]
        Assets --> GE --> GW
    end
    
    subgraph Output [Output]
        EP[meta/episodes.parquet]
        GT[data/chunk-NNN/trajectories.parquet]
        GW --> EP
        GW --> GT
    end
    
    subgraph Bench [navarena-bench]
        BL[Load Episodes]
        BE[Run Eval]
        EP --> BL
        Assets --> BL
        BL --> BE
    end
```

## 7. Related Documentation

- [3D GS Asset Specification](gs-assets.md) - V1 asset format details
- [Navigation Training Data Format](nav-data-format.md) - Training data specification
- [Navigation Evaluation Data Format](eval-data-format.md) - Evaluation Episode and trajectory format
