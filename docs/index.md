# NavArena

Embodied Navigation Infrastructure

Automated Asset Processing · Data Generation · Evaluation

[Get Started](getting-started/installation/) API Reference

## System Framework

See [Architecture](concepts/architecture.md) for a detailed system overview. (A standalone framework diagram image can be added under `docs/assets/images/` when available.)

## Who Should Read This

- **New users** → Start with [Getting Started](getting-started/installation/)
- **Data engineers** → Focus on [Asset Preprocessing](asset-preprocessing/) and [Data Generator](data-generator/)
- **Researchers** → Focus on [Evaluation Framework](navarena-bench/)
- **Developers** → See [Extending Guide](navarena-bench/extending/) and [API Reference](reference/)

## Core Modules

### Asset Preprocessing

Convert raw 3DGS scenes to standardized assets with coordinate normalization, occupancy grid map generation, valid region estimation, V1 unified format, and web viewer.

[View Docs →](asset-preprocessing/)

### Data Generator

Generate data for PointNav, ImageNav, ObjectNav, VLN and more. Multi-task pipeline, 3D GS scene rendering, and parallel episode generation.

[View Docs →](data-generator/)

### Evaluation Framework

Evaluation framework based on 3D Gaussian Splatting and occupancy grids, supporting multiple tasks and agents (ViNT, GNM, NoMaD) with replay and visualization.

[View Docs →](navarena-bench/)

## Troubleshooting & Support

- See [Troubleshooting](troubleshooting/)
- Submit an [Issue](https://github.com/EI-Nav/NavArena/issues) on GitHub

## Contributing

We welcome help in these areas:

- **Code and features**: Improvements to the core library, asset preprocessing, data generator, and evaluation framework; bug fixes, new tasks/agents/metrics, performance, and extensibility
- **Documentation and examples**: User guides and tutorials, keeping Chinese and English in sync, corrections, and best practices
- **Feedback and collaboration**: [Issues](https://github.com/EI-Nav/NavArena/issues) for bug reports, usage questions, or feature discussion

For environment setup and Fork/PR workflow, see [Contributing](dev/contributing/).

---

!!! tip "Next Steps"
    Start with the [Installation Guide](getting-started/installation/) or [Quickstart](getting-started/quickstart/) to get up and running.