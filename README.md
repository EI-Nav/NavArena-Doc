# NavArena 开发者文档 / NavArena Developer Documentation

这是 NavArena 项目的在线开发者文档，使用 MkDocs 和 Material 主题构建。

This is the online developer documentation for the NavArena project, built with MkDocs and Material theme.

## 🌐 多语言支持 / Multi-language Support

本文档支持中英双语版本：
- 🇨🇳 **中文版** - 默认语言
- 🇬🇧 **English** - English version

This documentation supports both Chinese and English:
- 🇨🇳 **Chinese** - Default language
- 🇬🇧 **English** - English version

## 快速开始

### 安装依赖

```bash
pip install -r requirements.txt
```

### 本地预览

启动本地开发服务器：

```bash
mkdocs serve
```

然后在浏览器中访问 http://127.0.0.1:8000

### 构建静态站点

```bash
mkdocs build
```

构建后的文件将输出到 `site/` 目录。

## 项目结构 / Project Structure

```
vln_dev_doc/
├── mkdocs.yml              # MkDocs 主配置文件 / Main config file
├── requirements.txt        # Python 依赖 / Python dependencies
├── README.md              # 本文件 / This file
├── docs/                  # 文档源文件 / Documentation source
│   ├── zh/               # 中文文档 / Chinese docs
│   │   ├── index.md
│   │   ├── getting-started/
│   │   ├── guide/
│   │   └── api/
│   ├── en/               # 英文文档 / English docs
│   │   ├── index.md
│   │   ├── getting-started/
│   │   ├── guide/
│   │   └── api/
│   ├── assets/           # 共享资源 / Shared assets
│   │   └── images/
│   └── stylesheets/      # 自定义样式 / Custom styles
│       └── extra.css
└── site/                 # 构建输出 / Build output (auto-generated)
```

## 功能特性

本文档站点包含以下功能：

- ✅ **多语言支持** - 中英双语切换 / Multi-language (Chinese & English)
- ✅ **响应式设计** - 完美支持桌面端和移动端 / Responsive design
- ✅ **暗色/亮色主题** - 支持主题切换 / Dark/Light theme toggle
- ✅ **全文搜索** - 内置搜索功能，支持中文分词 / Full-text search with Chinese support
- ✅ **代码高亮** - 支持多种编程语言的语法高亮 / Syntax highlighting
- ✅ **代码复制** - 一键复制代码块 / One-click code copy
- ✅ **目录导航** - 自动生成页面目录 / Auto-generated navigation
- ✅ **Mermaid 图表** - 支持流程图、时序图等 / Mermaid diagrams
- ✅ **数学公式** - 支持 LaTeX 数学公式渲染 / LaTeX math support
- ✅ **告示框** - 丰富的内容展示样式 / Rich admonitions
- ✅ **Git 修订日期** - 自动显示文档更新时间 / Git revision dates

## 编写文档 / Writing Documentation

### 添加新页面 / Adding New Pages

1. 在对应语言目录下创建新的 Markdown 文件 / Create new Markdown file in the language directory
   - 中文：`docs/zh/` / Chinese: `docs/zh/`
   - 英文：`docs/en/` / English: `docs/en/`

2. 在 `mkdocs.yml` 的 `nav` 部分添加导航链接（中文） / Add navigation link in `mkdocs.yml` (Chinese)

3. 在 i18n 插件的 `nav_translations` 中添加英文翻译 / Add English translation in i18n plugin's `nav_translations`

示例 / Example：

```yaml
nav:
  - 首页: index.md
  - 新章节:
    - 新页面: new-section/new-page.md

plugins:
  - i18n:
      languages:
        - locale: en
          nav_translations:
            新章节: New Section
            新页面: New Page
```

### Markdown 扩展语法

本站点支持丰富的 Markdown 扩展语法：

#### 告示框

```markdown
!!! note "提示"
    这是一个提示框

!!! warning "警告"
    这是一个警告框

!!! tip "技巧"
    这是一个技巧框
```

#### 代码块

````markdown
```python
def hello():
    print("Hello, World!")
```
````

#### Mermaid 图表

````markdown
```mermaid
graph LR
    A[开始] --> B[处理]
    B --> C[结束]
```
````

#### 数学公式

```markdown
行内公式：\( E = mc^2 \)

块级公式：
\[
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
\]
```

## 部署

### 部署到 GitHub Pages

```bash
mkdocs gh-deploy
```

这会自动构建站点并推送到 `gh-pages` 分支。

### 部署到 Netlify

1. 连接你的 Git 仓库到 Netlify
2. 设置构建命令：`mkdocs build`
3. 设置发布目录：`site`
4. 点击部署

### 部署到自托管服务器

```bash
# 构建站点
mkdocs build

# 将 site/ 目录内容复制到 Web 服务器
rsync -avz site/ user@server:/var/www/html/
```

## 配置说明

### 主题配置

在 `mkdocs.yml` 中配置主题选项：

```yaml
theme:
  name: material
  palette:
    primary: indigo
    accent: indigo
  features:
    - navigation.instant
    - navigation.tracking
    - search.suggest
```

### 插件配置

启用和配置插件：

```yaml
plugins:
  - search:
      lang:
        - zh
        - en
  - awesome-pages
  - git-revision-date-localized
```

### 自定义样式

编辑 `docs/stylesheets/extra.css` 添加自定义 CSS。

## 开发建议

### 文档编写规范

1. **清晰的标题层级** - 使用合适的标题级别（H1-H6）
2. **代码示例** - 为所有 API 和功能提供代码示例
3. **告示框** - 使用告示框突出重要信息
4. **链接** - 使用相对链接引用其他文档页面
5. **图片** - 图片放在 `docs/assets/images/` 目录
6. **简洁明了** - 保持文档简洁，避免冗长

### 文档测试

在提交前检查：

- ✅ 所有链接是否有效
- ✅ 代码示例是否正确
- ✅ 图片是否能正常显示
- ✅ 构建是否成功（无警告和错误）

```bash
# 检查构建
mkdocs build --strict
```

## 依赖说明 / Dependencies

主要依赖包 / Main packages：

- **mkdocs** (>=1.5.3) - 文档生成器核心 / Core documentation generator
- **mkdocs-material** (>=9.5.0) - Material 主题 / Material theme
- **mkdocs-static-i18n** (>=1.2.0) - 多语言支持 / Multi-language support
- **mkdocs-awesome-pages-plugin** - 页面自动导航 / Auto page navigation
- **mkdocs-git-revision-date-localized-plugin** - Git 修订日期 / Git revision dates
- **mkdocs-minify-plugin** - HTML 压缩 / HTML minification
- **pymdown-extensions** - Markdown 扩展语法 / Markdown extensions
- **jieba** - 中文搜索分词 / Chinese search tokenization

## 常见问题

### Q: 如何更改主题颜色？

A: 在 `mkdocs.yml` 中修改 `theme.palette.primary` 和 `theme.palette.accent`。

### Q: 如何添加自定义 JavaScript？

A: 在 `mkdocs.yml` 的 `extra_javascript` 部分添加 JS 文件路径。

### Q: 搜索不支持中文怎么办？

A: 确保安装了 `jieba` 包，并在搜索插件配置中添加了中文语言支持。

### Q: 如何启用版本管理？

A: 使用 `mike` 工具进行版本管理：

```bash
pip install mike
mike deploy --push --update-aliases 1.0 latest
```

## 资源链接

- [MkDocs 官方文档](https://www.mkdocs.org/)
- [Material for MkDocs 文档](https://squidfunk.github.io/mkdocs-material/)
- [Markdown 语法指南](https://www.markdownguide.org/)
- [Mermaid 图表文档](https://mermaid-js.github.io/)

## 许可证

本文档站点使用 MIT 许可证。

## 贡献

欢迎贡献！如果您发现文档中的错误或想要改进内容，请：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/improvement`)
3. 提交更改 (`git commit -am 'Add some improvement'`)
4. 推送到分支 (`git push origin feature/improvement`)
5. 创建 Pull Request

---

**开始编写精彩的文档吧！** 📚
