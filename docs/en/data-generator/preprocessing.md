# Preprocessing (Moved)

Asset preprocessing is now documented in a separate section.

See:

- **[Asset Preprocessing Overview](../asset-preprocessing/overview.md)** - 3DGS scene normalization pipeline
- **[Pipeline Steps](../asset-preprocessing/pipeline-steps.md)** - Coordinate normalization, PGM generation, valid region estimation
- **[CLI Commands](../asset-preprocessing/cli.md)** - run-pipeline, batch, migrate, compress
- **[Web Viewer](../asset-preprocessing/web-viewer.md)** - 3DGS asset browser

The data generator (navarena-gen) depends on V1 format output from asset preprocessing (manifest.json, nav_map.pgm, nav_map.yaml, etc.). Use navarena-forge to preprocess scenes before generating data.
