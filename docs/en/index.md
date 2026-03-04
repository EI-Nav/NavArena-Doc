<div class="hero reveal">
  <!-- 底层：网格点阵纹理 -->
  <div class="hero-bg-pattern"></div>
  <!-- 中层：浮动几何体 -->
  <svg class="hero-floating-shapes" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 320" preserveAspectRatio="xMidYMid slice">
    <!-- 浮动六边形 1 -->
    <polygon class="float-shape shape-1" points="120,40 150,22 180,40 180,76 150,94 120,76" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" fill="none"/>
    <!-- 浮动六边形 2 -->
    <polygon class="float-shape shape-2" points="620,60 658,38 696,60 696,104 658,126 620,104" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" fill="none"/>
    <!-- 浮动六边形 3（大） -->
    <polygon class="float-shape shape-3" points="680,180 730,151 780,180 780,238 730,267 680,238" stroke="rgba(255,255,255,0.08)" stroke-width="2" fill="none"/>
    <!-- 浮动圆形 1 -->
    <circle class="float-shape shape-4" cx="80" cy="220" r="35" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" fill="none"/>
    <!-- 浮动圆形 2 -->
    <circle class="float-shape shape-5" cx="400" cy="30" r="20" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" fill="none"/>
  </svg>
  <!-- 上层：导航路径描绘动画 -->
  <svg class="hero-nav-path" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 320" preserveAspectRatio="xMidYMid slice">
    <circle cx="100" cy="260" r="4" fill="rgba(255,255,255,0.4)"/>
    <polyline class="draw-path" points="100,260 200,180 320,210 440,140 560,170 680,90" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="680" cy="90" r="4" fill="rgba(255,255,255,0.6)"/>
  </svg>
  <!-- 内容层 -->
  <div class="hero-content">
    <img src="../assets/images/logo.svg" alt="NavArena" class="hero-logo">
    <h1>NavArena</h1>
    <p>Embodied Navigation Infrastructure</p>
    <p class="hero-subtitle">Automated Asset Processing · Data Generation · Evaluation</p>
    <div class="hero-buttons">
      <a href="getting-started/installation/" class="md-button md-button--primary">Get Started</a>
      <a href="reference/" class="md-button">API Reference</a>
    </div>
  </div>
</div>

Welcome to NavArena documentation! NavArena provides asset automation, data generation, and navigation evaluation capabilities. This documentation includes complete usage guides, API references, and best practices.

## Workflow Overview

```mermaid
flowchart LR
    A["Raw 3DGS Scenes"] --> B["navarena-forge\nAsset Preprocessing"]
    B --> C["Standardized Assets"]
    C --> D["navarena-gen\nData Generator"]
    D --> E["Training/Eval Data"]
    E --> F["navarena-bench\nEvaluation"]
    F --> G["Metrics & Replay"]
```

## Who Should Read This

- **New users** → Start with [Getting Started](getting-started/installation/)
- **Data engineers** → Focus on [Asset Preprocessing](asset-preprocessing/) and [Data Generator](data-generator/)
- **Researchers** → Focus on [Evaluation Framework](navarena-bench/)
- **Developers** → See [Extending Guide](navarena-bench/extending/) and [API Reference](reference/)

## Core Modules

<div class="feature-grid">
  <div class="feature-card reveal">
    <div class="feature-card-icon">
      <img src="../assets/images/icon-forge.svg" alt="Asset Preprocessing">
    </div>
    <h3>Asset Preprocessing</h3>
    <p>Convert raw 3DGS scenes to standardized assets with coordinate normalization, PGM map generation, valid region estimation, V1 unified format, and web viewer.</p>
    <a href="asset-preprocessing/">View Docs →</a>
  </div>
  <div class="feature-card reveal">
    <div class="feature-card-icon">
      <img src="../assets/images/icon-gen.svg" alt="Data Generator">
    </div>
    <h3>Data Generator</h3>
    <p>Generate data for PointNav, ImageNav, ObjectNav, VLN and more. Multi-task pipeline, 3D GS scene rendering, and parallel episode generation.</p>
    <a href="data-generator/">View Docs →</a>
  </div>
  <div class="feature-card reveal">
    <div class="feature-card-icon">
      <img src="../assets/images/icon-bench.svg" alt="Evaluation Framework">
    </div>
    <h3>Evaluation Framework</h3>
    <p>Evaluation framework based on 3D Gaussian Splatting and occupancy grids, supporting multiple tasks and agents (ViNT, GNM, NoMaD) with replay and visualization.</p>
    <a href="navarena-bench/">View Docs →</a>
  </div>
</div>

## Quick Examples

=== "Asset Preprocessing"

    ```bash
    cd navarena-forge
    python -m navarena_forge batch --scenes-root /path/to/scenes \
        --config pipeline.yaml --source-dataset InteriorGS
    ```

=== "Data Generation"

    ```bash
    cd navarena-gen
    python scripts/generate_data.py --config configs/examples/pointnav_example.yaml

    # Parallel generation
    python scripts/generate_data.py --config configs/examples/vln_zh_example.yaml \
        --parallel --num-workers 4 --batch-size 20
    ```

=== "Evaluation"

    ```bash
    cd navarena-bench
    # Run evaluation
    python -m navarena_bench.scripts.eval --config configs/eval/default_eval.yaml

    # Generate replay video
    python scripts/replay_eval.py --results eval_results/ --output replay.mp4
    ```

## Getting Help

- Browse this documentation and module READMEs
- Submit an [Issue](https://github.com/EI-Nav/NavArena-Doc/issues) on GitHub

## Contributing

1. Fork this repository
2. Create a feature branch
3. Commit your changes and open a Pull Request

---

!!! tip "Next Steps"
    Start with the [Installation Guide](getting-started/installation/) or [Quickstart](getting-started/quickstart/) to get up and running.
