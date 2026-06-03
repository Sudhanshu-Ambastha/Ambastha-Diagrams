# Contributing to Ambastha-Diagrams

Thank you for your interest in contributing to **Ambastha-Diagrams**!
We are building a **high-performance, modular diagramming ecosystem** focused on architectural clarity, performance, and a consistent, intuitive DSL.

---

# 🚀 Getting Started

Before you begin, ensure you have **Node.js (v16+)** installed.

### 1. Fork the Repository

Fork the repository to your GitHub account.

### 2. Clone Your Fork

Clone your fork locally:

```bash
git clone https://github.com/Sudhanshu-Ambastha/Ambastha-Diagrams.git
cd Ambastha-Diagrams
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Local Environment

Open:

```txt
diagram-engine-vscode/web/index.html
```

in your browser to preview changes in real time.

---

# 🧩 Project Structure

### `/diagram-engine`

The core parsing, layout, and visualization engine.

- Framework-agnostic
- Pure Vanilla JavaScript
- Modular ESM architecture

### `/diagram-engine-vscode`

The VS Code extension layer wrapping the core engine to provide a native IDE experience.

---

# 🏛️ Design Standards & Approval

Before implementing a **new diagram type** or **major feature**, please open a **Discussion** proposing the DSL syntax.

We follow a strict **Language-First** design philosophy.

## Syntax Review

All new syntax must follow existing grammar patterns and design conventions.

Examples:

- Entity → Relation → Entity
- Consistent declarative semantics
- Predictable, low-ambiguity grammar

New syntax must be reviewed and approved by maintainers **before implementation begins**.

## Zero-Dependency Core

We strongly prefer a **lean, portable engine**.

Pull requests introducing non-essential third-party dependencies may be rejected.

## Visual Regression Safety

For new rendering logic or diagram types, include:

- Sample syntax input
- Expected rendered output / screenshots

We use visual verification practices to help preserve rendering consistency.

---

# Ways to Contribute

## 1. 📦 The Diagram Registry

Expand the ecosystem by contributing new diagram modules inside `registry/`.

To get started:

- Study existing implementations in `registry/`.
- Follow established architecture and syntax patterns.
- Update `registry/examples.json` to showcase your contribution.

---

## 2. ✨ Feature Enhancements

Help improve the **"Silent Builder"** engine.

Contribution areas include:

- Optimize **SVG rendering paths** or **layout algorithms**.
- Add support for **new geometric shapes** or rendering primitives.
- Explore the **Issues** tab for **`good first issue`** labels.

---

## 3. 🐛 Reporting Bugs

Please include the following when reporting issues.

### Reproduction Steps

Provide the **exact input syntax** used to reproduce the behavior.

### Environment

Specify where the issue occurred:

- VS Code Extension
- Web Editor
- Other supported environment

### Logs / Errors

Include relevant debugging information when available:

- Developer Tools console output
- Stack traces
- Parsing or rendering errors

---

# 🛠 Development Workflow

## Branching

Use descriptive branch names.

Examples:

```txt
feature/add-kanban-support
fix/rendering-overlap
perf/optimize-layout-engine
```

## Pull Requests

Before opening a PR, ensure that you:

- Follow **Modular ESM** and **Vanilla JS** standards.
- Link relevant **Issues** in your PR description.
- Update `examples.json` when adding features or syntax changes.

## Known Issues & Limitations

Before reporting or implementing a fix, check whether the behavior is already documented under **Known Limitations** in `README.md`.

---

# ❓ Need Help?

Questions, ideas, or implementation discussions are welcome.

You can:

- Open a **Discussion** for community conversation.
- Create an **Issue** for bugs, questions, or feature requests.

---

# 📜 Contribution License

By contributing to this project, you agree that your contributions will be licensed under the project's **Apache-2.0** license.
