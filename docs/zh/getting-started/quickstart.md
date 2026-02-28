# 快速入门

本教程提供三个模块的**最小可运行示例**，帮助您快速验证环境。详细用法请参阅各模块用户指南。

## 资产预处理

将原始 3DGS PLY 转为 V1 格式。准备：原始 PLY 文件（如 `/path/to/scenes/17dc3367/scene.ply`）。

```bash
cd navarena-forge
python -m navarena_forge run-pipeline \
    --config navarena_forge/configs/pipeline.yaml \
    --scene-dir /path/to/scenes/17dc3367 \
    --source-dataset x2robot
```

输出位于 `$NAVARENA_DATA_DIR/assets/`。批量处理见 [资产预处理 CLI](../asset-preprocessing/cli.md)。

## 数据生成

在 V1 资产场景中生成 Episode。准备：已完成资产预处理，场景在 `$NAVARENA_DATA_DIR/assets/`。

```bash
cd navarena-gen
python scripts/generate_data.py --config configs/examples/pointnav_example.yaml
```

并行生成可使用 `--parallel --num-workers 4 --batch-size 20`。详见 [数据生成器配置](../data-generator/configuration.md)。

## 评测

在 3D GS 环境中评测导航模型。准备：V1 资产 + 符合 [评测数据格式](../definitions/eval-data-format.md) 的 Episode。

```bash
cd navarena-bench
python -m navarena_bench.scripts.eval --config configs/eval/default_eval.yaml
```

回放视频：`python scripts/replay_eval.py --results eval_results/ --output replay.mp4`。详见 [评测器模块](../navarena-bench/evaluators.md)。

!!! tip "下一步"
    - 查看 [用户指南](../guide/) 了解完整工作流
    - 深入 [数据生成器 Pipeline](../data-generator/pipeline.md)、[评测框架](../navarena-bench/)、[扩展指南](../navarena-bench/extending.md)
