# Architecture Design

NavArena’s workspace includes **shared libraries**, **asset tooling**, **dataset generation**, a **WebSocket agent SDK**, and **evaluation**.

## Components

```mermaid
flowchart TB
    classDef core   fill:#FFF7ED,stroke:#F97316,stroke-width:1.5px,color:#7C2D12,font-weight:600
    classDef forge  fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A5F
    classDef gen    fill:#F0FDFA,stroke:#0D9488,stroke-width:1.5px,color:#0F4C43
    classDef bench  fill:#F5F3FF,stroke:#7C3AED,stroke-width:1.5px,color:#3B1F6E
    classDef srv    fill:#ECFDF5,stroke:#059669,stroke-width:1.5px,color:#064E3B

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
        Env[Env]:::bench
        Metrics[Metrics]:::bench
    end

    subgraph Server[navarena-server]
        WS[WebSocket SDK]:::srv
    end
    
    Core --> Forge
    Core --> Gen
    Core --> Bench
    Forge --> Gen
    Gen --> Bench
    Server --> Bench
```

| Project | Responsibility | Dependencies |
|---------|----------------|--------------|
| **navarena-core** | Config, Parquet episode model, GS rendering utilities, path resolution | — |
| **navarena-forge** | PLY → V1 assets | navarena-core |
| **navarena-gen** | Multi-task Parquet datasets | navarena-core, V1 assets |
| **navarena-server** | Agent WebSocket server SDK | numpy, msgpack, websockets |
| **navarena-bench** | Task protocols, GS env, metrics, `results.json` | navarena-core, navarena-server, episodes |

Policies run **outside** the bench repo — implement `NavigationModelServer` and point bench `server.url` at your process.

## Data flow

```mermaid
flowchart LR
    A["Raw PLY"] --> B[navarena-forge]
    B --> C["V1 assets"]
    C --> D[navarena-gen]
    D --> E["Parquet datasets"]
    E --> F[navarena-bench]
    S[navarena-server agent] --> F
    F --> G["results.json"]
```

## Technology stack

| Layer | Technology |
|-------|------------|
| Workspace | uv, optional conda (`environment.yml`) |
| Rendering | gsplat / navarena-core GS helpers |
| Data | PyArrow, Parquet, NumPy |
| Config | YAML + dataclass-style configs (`navarena_core.config`) |
| Agent I/O | WebSocket, msgpack |

## Extension points

- **navarena-forge**: `ProcessingStep` registry  
- **navarena-gen**: generators, envs, instruction strategies  
- **navarena-bench**: `Env`, `Evaluator`, `GoalVerifier`, `Metric`, `Dataset` entry points  
- **navarena-server**: subclass `NavigationModelServer`

See [Extending](../navarena-bench/extending.md).
