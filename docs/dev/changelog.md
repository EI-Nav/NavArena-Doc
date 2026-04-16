# Changelog

This document records version changes for the NavArena documentation site.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), versioning follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Documentation page **Model Server SDK** (`navarena-server`) for WebSocket agent developers
- Troubleshooting entries for WebSocket / `eval_settings.output_path`

### Changed

- **Evaluation Framework** docs rewritten for WebSocket agents, `results.json`, and current metrics (no in-tree `Agent` package)
- **Data generator** docs: GridTraj, accurate CLI (`--config` required), defaults aligned with `configs/defaults/`
- **Asset preprocessing** docs: default pipeline vs optional `compress_ply`, richer Forge/WebViewer API notes
- **Definitions / core / architecture**: Parquet columns (`goals_json`, `linear_acceleration`, `phase`), core responsibilities, five-package architecture
- **Installation**: notes on `navarena-server`, `make install` vs CUDA PyTorch
- **Contributing**: single `docs/` tree (removed obsolete bilingual directory instructions)

### Fixed

- API reference: removed obsolete Agent/VLN evaluator listings; `eval()` documented as returning None
- API reference: `evaluator.evaluate()` corrected to `evaluator.eval()` (historical)
- Installation: ViNT placeholder URL replaced with actual repository
- Installation: Added uv prerequisite warning and environment.yml + navarena-core clarification

---

## [0.1.0] - 2026-03-04

### Added

- Documentation structure optimization: restructured nav per Diataxis framework
- New section landing pages: Getting Started, User Guide, Reference, Concepts & Architecture, Developer Guide
- New architecture design document `concepts/architecture.md`
- Contributing guide and changelog
- Workflow diagram and role-based guidance on homepage

### Changed

- Specifications split into "Concepts & Architecture" and "Reference / Data Formats"
- Asset preprocessing, data generator, evaluation framework overviews converted to section indexes (index.md)
- Slimmed quickstart; detailed content moved to user guide
- Extending guide elevated to Developer Guide section

### Fixed

- Fixed multiple `overview.md` links to new paths
