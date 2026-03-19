# Contributing Guide

This guide explains how to contribute code and documentation to NavArena.

## Repositories

NavArena uses separate repositories for different contribution types:

| Type | Repository | URL |
|------|------------|-----|
| **Code** (core, forge, gen, bench) | NavArena | https://github.com/EI-Nav/NavArena |
| **Documentation** (this site) | NavArena-Doc | https://github.com/EI-Nav/NavArena-Doc |

- **Code contributions** → Fork and PR to the main NavArena repository
- **Documentation contributions** → Fork and PR to the NavArena-Doc repository

## Code Contributions

### Development Setup

1. Clone the main repository: `git clone https://github.com/EI-Nav/NavArena.git`
2. Set up the development environment per the [Installation Guide](../getting-started/installation.md) (Section 3: Manual Installation recommended for contributors)
3. Install in editable mode: `pip install -e "navarena-core[rendering,export]"` and equivalent for other sub-packages as needed

### Submission Process

1. Fork the [NavArena](https://github.com/EI-Nav/NavArena) repository
2. Create a branch: `git checkout -b feature/your-topic` or `fix/your-issue`
3. Commit with clear messages (e.g. `feat: add X`, `fix: resolve Y`)
4. Run tests: `make test` (if available)
5. Open a Pull Request against the main branch

### Code Style and Linting

- Format code: `make format`
- Run linter: `make lint`
- See the project root `Makefile` for all available commands

## Documentation Contributions

### Development Setup

1. Clone the docs repository: `git clone https://github.com/EI-Nav/NavArena-Doc.git`
2. Install: `pip install -r requirements.txt`
3. Preview: `mkdocs serve`, open http://127.0.0.1:8000

### Document Structure

- `docs/zh/` —— Simplified Chinese
- `docs/en/` —— English

When adding or editing docs, update both zh and en accordingly.

### Submission Process

1. Fork the [NavArena-Doc](https://github.com/EI-Nav/NavArena-Doc) repository
2. Create branch: `git checkout -b docs/your-topic`
3. Edit and verify: `mkdocs serve`
4. Commit and open a Pull Request
