# Contributing to Ambastha-Diagrams

Thank you for your interest in contributing to Ambastha-Diagrams! We are building a high-performance, modular diagramming ecosystem, and we welcome contributions from developers, designers, and documenters.

## Getting Started

To get started, please ensure you have **Node.js (v16+)** installed.

1. **Fork the repository** to your GitHub account.
2. **Clone the fork** to your local machine.
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Run the local environment:**
   We use a local editor to test the engine. You can open `diagram-engine-vscode/web/index.html` in your browser to see your changes reflected in real-time.

## Project Structure

This project is divided into two primary workspaces:

- **/diagram-engine**: The core parsing, layout, and visualization engine. This is a framework-agnostic library written in pure JavaScript.
- **/diagram-engine-vscode**: The VS Code extension that wraps the core engine to provide a native IDE experience.

## Ways to Contribute

### 1. The Diagram Registry (Good for beginners)

We are constantly expanding our diagram support. You can add new diagram types (e.g., Kanban, State Diagrams) by creating a new registration module in `registry/`.

- Look at existing files in `registry/` to see the pattern.
- Create a new example in `registry/examples.json` to showcase your diagram.

### 2. Feature Enhancements

We are always looking to improve performance.

- Do you have an idea to optimize our SVG rendering paths?
- Can you add new shape support (e.g., diamonds, cylinders)?
- Check the [Issues](https://github.com/Sudhanshu-Ambastha/Ambastha-Diagrams/issues) tab for tickets labeled `good first issue`.

### 3. Reporting Bugs

When reporting a bug, please include:

- **Reproduction Steps:** A clear description of the input that caused the issue.
- **Environment:** Are you using the VS Code Extension or the web editor?
- **Screenshots/Logs:** Any errors shown in the VS Code Developer Tools console.

## Development Workflow

- **Branching:** Please create a new branch for each feature or bug fix (e.g., `feature/add-kanban-support` or `fix/rendering-issue`).
- **Pull Requests:**
  - Ensure your code follows the existing style (Vanilla JS, modular ESM).
  - Link any relevant issues in your PR description.
  - If you’ve added a new feature, please update the corresponding `examples.json` file.

## Need Help?

If you have questions, feel free to open a [Discussion](https://github.com/Sudhanshu-Ambastha/Ambastha-Diagrams/discussions) or reach out by opening an Issue. We are happy to help you get started!

---

_By contributing to this project, you agree that your contributions will be licensed under the project's [Apache-2.0 license](./LICENSE)._
