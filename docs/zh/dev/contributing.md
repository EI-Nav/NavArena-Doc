# 贡献指南

本指南说明如何参与 NavArena 的代码和文档贡献。

## 仓库说明

NavArena 针对不同贡献类型使用不同仓库：

| 类型 | 仓库 | URL |
|------|------|-----|
| **代码**（core、forge、gen、bench） | NavArena | https://github.com/EI-Nav/NavArena |
| **文档**（本站点） | NavArena-Doc | https://github.com/EI-Nav/NavArena-Doc |

- **代码贡献** → Fork 主仓库 NavArena 并提交 PR
- **文档贡献** → Fork 文档仓库 NavArena-Doc 并提交 PR

## 代码贡献

### 开发环境搭建

1. 克隆主仓库：`git clone https://github.com/EI-Nav/NavArena.git`
2. 按照 [安装指南](../getting-started/installation.md) 搭建开发环境（建议贡献者使用第三节：手动安装）
3. 以可编辑模式安装：`pip install -e "navarena-core[rendering,export]"`，其他子包按需安装

### 提交流程

1. Fork [NavArena](https://github.com/EI-Nav/NavArena) 仓库
2. 创建分支：`git checkout -b feature/your-topic` 或 `fix/your-issue`
3. 提交时使用清晰的 commit 信息（如 `feat: add X`、`fix: resolve Y`）
4. 运行测试：`make test`（如项目提供）
5. 向主分支发起 Pull Request

### 代码风格与 Lint

- 格式化代码：`make format`
- 运行 Linter：`make lint`
- 更多命令见项目根目录的 `Makefile`

## 文档贡献

### 开发环境搭建

1. 克隆文档仓库：`git clone https://github.com/EI-Nav/NavArena-Doc.git`
2. 安装依赖：`pip install -r requirements.txt`
3. 本地预览：`mkdocs serve`，访问 http://127.0.0.1:8000

### 文档结构

- `docs/zh/` —— 简体中文
- `docs/en/` —— 英文

新增或修改文档时，请同步更新 zh 与 en 中的对应文件。

### 提交流程

1. Fork [NavArena-Doc](https://github.com/EI-Nav/NavArena-Doc) 仓库
2. 创建分支：`git checkout -b docs/your-topic`
3. 修改并验证：`mkdocs serve`
4. 提交并发起 Pull Request
