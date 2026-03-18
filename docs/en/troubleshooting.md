# Troubleshooting

Common issues and solutions for NavArena installation, data generation, and evaluation.

## Installation

### gsplat Compilation Failed

If gsplat fails to compile, check:

1. CUDA version matches PyTorch: `python -c "import torch; print(torch.version.cuda)"`
2. C++ compiler is installed: `gcc --version`
3. Sufficient disk space (compilation requires temporary space)
4. First `import gsplat` triggers JIT compilation which may take several minutes

### CUDA Version Mismatch

Ensure the installed PyTorch version is compatible with your system CUDA driver:

```bash
nvidia-smi              # Check max CUDA version supported by driver
python -c "import torch; print(torch.cuda.is_available()); print(torch.version.cuda)"
```

The driver's CUDA version must be ≥ the CUDA version PyTorch was compiled with.

### open3d Installation Failed

open3d only supports Python 3.8-3.11, and some systems may lack dependencies:

```bash
# Ubuntu/Debian
sudo apt-get install libgl1-mesa-glx libglib2.0-0
```

### Node.js / npm install Failed

The Web Viewer frontend requires Node.js. Install via conda:

```bash
conda install -c conda-forge nodejs -y
```

If `npm install` fails, try clearing the cache:

```bash
cd navarena-gen/web/frontend
rm -rf node_modules package-lock.json
npm install
```

### conda env create fails due to network issues

A common cause is GitHub-based dependencies (like CLIP) failing to download. `requirements-lock.txt` has separated CLIP into an optional post-install step.

For China users, try a pip mirror:

```bash
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements-lock.txt
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge/
```

If CLIP installation fails, retry or use a proxy. CLIP is only needed for ObjectNav; PointNav/ImageNav/VLN work without it.

### Permission Errors

```bash
pip install --user -e .
```

## Data Generation

### Config or scene path not found

- Ensure `NAVARENA_DATA_DIR` is set: `echo $NAVARENA_DATA_DIR`
- Check that `scene_path` in your config matches the actual directory under `$NAVARENA_DATA_DIR/assets/`
- The config `scene_path` format is `{group}/{scene_id}` (e.g. `x2robot/17dc3367`, where group is the scene group name)

### No episodes generated / empty output

- Verify assets have completed preprocessing (manifest.json, aligned.ply, nav_map.pgm exist)
- Check that the scene has enough navigable area; some scenes may have too few valid spawn points
- Reduce `num_episodes` for a quick test (e.g. `--num-episodes 5`)

## Evaluation

### Evaluation returns empty results

- Ensure `eval_results_dir` in config exists and is writable
- Check that the dataset path in config points to valid Parquet data
- Verify `save_trajectories: true` in evaluator config if you need replay videos

### Agent connection failed (RemoteAgent / ViNT)

- For RemoteAgent: Ensure the remote service is running and the URL in config is correct
- For ViNT: Verify visualnav-transformer is cloned and diffusion_policy is installed; check that model weights are in `$NAVARENA_DATA_DIR/shared/visualnav-transformer/`
