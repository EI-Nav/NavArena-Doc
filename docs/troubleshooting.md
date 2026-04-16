# Troubleshooting

Common issues for NavArena installation, data generation, and evaluation.

## Installation

### gsplat Compilation Failed

1. CUDA version matches PyTorch: `python -c "import torch; print(torch.version.cuda)"`
2. C++ compiler installed: `gcc --version`
3. Enough disk space (JIT may use large temps)
4. First `import gsplat` can take minutes

### CUDA Version Mismatch

```bash
nvidia-smi
python -c "import torch; print(torch.cuda.is_available()); print(torch.version.cuda)"
```

### open3d Installation Failed

```bash
sudo apt-get install libgl1-mesa-glx libglib2.0-0
```

### Node.js / npm install Failed

```bash
conda install -c conda-forge nodejs -y
```

If `npm install` fails in `navarena-gen/web/frontend`:

```bash
cd navarena-gen/web/frontend
rm -rf node_modules package-lock.json
npm install
```

### conda env create fails (network)

Use mirrors or retry CLIP install separately. CLIP is mainly for ObjectNav-related tooling.

### Permission Errors

```bash
pip install --user -e .
```

## Data Generation

### Config or scene path not found

- `echo $NAVARENA_DATA_DIR`
- `scene_path` must match `$NAVARENA_DATA_DIR/assets/...`

### No episodes / empty output

- Assets fully preprocessed (manifest, maps)
- Enough navigable area; try smaller `num_episodes` first

## Evaluation

### Empty or missing results

- Ensure `eval_settings.output_path` exists and is writable (or pass `--output-dir`)
- Dataset path points at a task directory with `meta/` and `data/`
- For trajectory dumps, keep `save_trajectories: true` / recording extras as needed

### Agent / WebSocket connection failed

The bench talks to **`navarena-server`** over **WebSocket**, not HTTP `RemoteAgent`.

- Start your agent **before** `navarena-bench-eval`
- `server.url` in YAML must match `ws://host:port`
- If you use `--server-url`, it replaces the whole `server` block — re-check `timeout` and `image_format`

**See also**: [Evaluation overview](navarena-bench/index.md) · [Model Server SDK](navarena-server/index.md)
