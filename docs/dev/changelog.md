# Changelog

This document records version changes for the NavArena documentation site.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), versioning follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Troubleshooting page consolidating installation, data generation, and evaluation FAQs

### Changed

- Contributing guide extended with code contribution workflow and repository distinction

### Fixed

- API reference: `evaluator.evaluate()` corrected to `evaluator.eval()`
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
