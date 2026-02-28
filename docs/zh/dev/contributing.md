# 贡献指南

感谢您对 NavArena 文档的贡献！本指南说明如何参与文档的维护与改进。

## 开发环境搭建

1. 克隆仓库：`git clone https://github.com/EI-Nav/NavArena-Doc.git`
2. 安装依赖：`pip install -r requirements.txt`
3. 本地预览：`mkdocs serve`，访问 http://127.0.0.1:8000

## 文档结构

- `docs/zh/` —— 简体中文
- `docs/en/` —— 英文

新增或修改文档时，请同步更新 zh 与 en 中的对应文件。

## 提交流程

1. Fork 本仓库
2. 创建分支：`git checkout -b docs/your-topic`
3. 修改并验证：`mkdocs serve`
4. 提交并发起 Pull Request
