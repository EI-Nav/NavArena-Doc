# 更新日志

本文档记录 NavArena 文档站点的版本变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 新增

- 常见问题页面：汇总安装、数据生成、评测相关 FAQ

### 变更

- 贡献指南扩展：补充代码贡献流程及仓库区分说明

### 修复

- API 参考：`evaluator.evaluate()` 更正为 `evaluator.eval()`
- 安装指南：ViNT 占位符替换为真实仓库地址
- 安装指南：新增 uv 前置条件说明及 environment.yml 与 navarena-core 澄清

---

## [0.1.0] - 2026-03-04

### 新增

- 文档结构优化：按 Diataxis 框架重组导航
- 新增快速开始、用户指南、参考手册、概念与架构、开发者指南等 Section 导引页
- 新增全局架构设计文档 `concepts/architecture.md`
- 新增贡献指南与更新日志
- 首页增加工作流架构图与角色导引

### 变更

- 规范定义拆分为「概念与架构」与「参考手册 / 数据格式」
- 资产预处理、数据生成器、评测框架的概述改为 Section Index（index.md）
- 精简快速入门，详细内容迁移至用户指南
- 扩展指南提升至开发者指南层级

### 修复

- 修复多处 `overview.md` 链接为重定向后的路径
