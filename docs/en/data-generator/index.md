# Data Generator Overview

The Data Generator (navarena-gen) is a multi-task Vision-Language Navigation (VLN) data generation framework for PointNav, ImageNav, ObjectNav, and VLN tasks. It generates high-quality Episode data from 3D Gaussian Splatting scenes using grid sampling, path planning, and instruction generation.

!!! info "Prerequisites"
    Before using the Data Generator, complete [asset preprocessing](../asset-preprocessing/) to convert raw 3DGS scenes to V1 unified asset format (manifest.json, nav_map.pgm, etc.). V1 assets should be located under `$NAVARENA_DATA_DIR/assets/`.

## Core Features

- **Multi-Task Support** - PointNav, ImageNav, ObjectNav, VLN
- **Multi-Environment Support** - 3D Gaussian Splatting (implemented), Habitat / Isaac (placeholder)
- **V1 Asset Format** - Reads unified `navarena_assets` (manifest.json, nav_map.pgm, etc.)
- **Flexible Instruction Generation** - Strategy pattern: simple_direction, path_based, object_goal; Chinese and English
- **Parallel Processing** - Multi-worker episode generation
- **Crash Recovery** - Lightweight checkpoint, resume from last progress after crash
- **Web Viewer** - Interactive data browsing

## Architecture

```mermaid
flowchart TB
    subgraph Input[Input]
        Scene[V1 Asset Scene]
        Config[YAML Config]
    end
    
    subgraph Core[Core Flow]
        Env[Env Init]
        Gen[Episode Gen]
        Inst[Instruction Gen]
        Write[Data Write]
        Render[Render Optional]
        
        Env --> Gen --> Inst --> Write --> Render
    end
    
    subgraph Envs[Environment Types]
        GS[3D GS]
        Habitat[Habitat]
        Isaac[Isaac Sim]
    end
    
    subgraph Tasks[Task Types]
        PN[PointNav]
        IN[ImageNav]
        ON[ObjectNav]
        VLN[VLN]
    end
    
    Input --> Core
    Envs --> Env
    Tasks --> Gen
```

## Data Generation Flow

1. **Environment Init** - Load manifest.json, nav_map.pgm, nav_map.yaml from V1 assets; optionally labels.json, nav_mask.png
2. **Episode Generation** - Task-specific generators: grid start sampling + goal sampling + GT trajectory planning (A*)
3. **Instruction Generation** - VLN uses Strategy pattern: simple_direction / path_based / object_goal; zh-CN, en-US
4. **Data Write** - Stream to Parquet chunks (meta/episodes.parquet + data/chunk-NNN/trajectories.parquet), with checkpoint for crash recovery
5. **Rendering (Optional)** - Goal images (ImageNav), trajectory videos

## Output Structure

All paths are relative to `$NAVARENA_DATA_DIR`:

```
datasets/{dataset_name}/
├── dataset_meta.json                   # Dataset-level metadata
└── {scene_path}/                       # e.g. x2robot/17dc3367
    ├── scene_meta.json                 # Scene metadata
    └── {task_type}/                    # pointnav/imagenav/objectnav/vln
        ├── meta/
        │   ├── info.json               # Task-level metadata
        │   └── episodes.parquet        # Episode index (Parquet v1.0.0)
        ├── data/
        │   └── chunk-NNN/              # Chunked storage (default 1000 episodes/chunk)
        │       ├── trajectories.parquet
        │       └── episodes.parquet
        ├── goal_images/                # ImageNav goal images (optional)
        └── rendered_videos/            # Rendered videos (optional)
```

## Episode Format (Logical Structure)

Episodes stored in Parquet can be understood at the application layer as:

```json
{
  "episode_id": "train_000001",
  "scene_path": "x2robot/17dc3367",
  "task_type": "vln",
  "start_state": {
    "position": [1.5, -0.8, 0.0],
    "rotation": [0.0, 0.0, 0.0, 1.0]
  },
  "goals": [...],
  "instructions": [
    {"instruction_text": "Walk about 8 meters to the northeast", "language": "en-US"}
  ],
  "gt_path": {
    "stats": {"geodesic_distance": 8.0, "num_steps": 25}
  }
}
```

Actual storage: `meta/episodes.parquet` and `data/chunk-NNN/trajectories.parquet`, linked via `chunk_index`. See [Navigation Training Data Format](../definitions/nav-data-format.md) for details.

## Use Cases

1. **Training Data** - Generate Episodes for VLN models
2. **Evaluation Data** - Generate PointNav, ImageNav, ObjectNav, VLN evaluation sets
3. **Trajectory Rendering** - Visualize GT trajectories in videos

## Dependencies

The data generator depends on **asset preprocessing** output in V1 format. Use [navarena-forge](../asset-preprocessing/) first to preprocess scenes.

!!! tip "Next Steps"
    - Learn about **[Pipeline Stages](pipeline.md)**
    - See **[Configuration](configuration.md)**
    - View **[Batch Processing](batch-processing.md)**
