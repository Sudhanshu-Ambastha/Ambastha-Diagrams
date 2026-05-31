# Ambastha-Diagrams

A high-performance, modular diagram rendering ecosystem designed for headless SVG generation and serverless integration. The project is structured as a multi-package architecture, decoupling the core rendering logic from the diagram registry and user-facing editor.

## Overview

`Ambastha-Diagrams` provides a lightweight, zero-dependency alternative for generating structural diagrams. By utilizing native SVG and standard ECMAScript Modules (ESM), it offers high-speed rendering with minimal memory overhead, suitable for both client-side and server-side environments.

## Dual-Categorization Logic

Unlike traditional tools that treat all diagrams as manual drawing tasks, this engine categorizes visualization into two distinct workflows:

1. **Deterministic (Data-Driven):** For diagrams where the layout is a result of mathematical constraints (e.g., CPM, PERT, Sequence). The user provides the raw data and dependencies; the engine automatically calculates the Critical Path, time-scales, and optimal routing.
2. **Declarative (Structure-Driven):** For diagrams where the user defines the visual relationship and hierarchy (e.g., Use Case, Flowcharts). The engine ensures structural integrity and consistent styling without "fussy" syntax or manual coordinate management.

## Why Ambastha-Diagrams?

| Feature         | Ambastha-Diagrams            | Legacy / Generalist Tools       |
| --------------- | ---------------------------- | ------------------------------- |
| **Runtime**     | Vanilla JS (Zero-Dependency) | Requires Java / Heavy Libraries |
| **VS Code Web** | ✅ Native Support            | ❌ Often Unsupported / Breaks   |
| **Logic Depth** | Formal State Semantics       | Generic "Box Drawing"           |
| **License**     | Apache 2.0 (Permissive)      | Often Restrictive (AGPL / GPL)  |

### Key Differentiator

While many existing tools struggle with runtime bloat, heavyweight dependencies, or desktop-centric assumptions (e.g. Java-based stacks), **Ambastha-Diagrams** is designed for the **VS Code Web era**.

Our **Vanilla-First architecture** enables fast, dependency-free rendering directly in:

- 🌐 Browsers
- 🧩 VS Code Web (`vscode.dev`)
- ⚙️ Headless / serverless environments

No heavyweight external runtimes. No dependency overhead. Just lightweight, native rendering built for modern web workflows.

## Technical Specifications

- **Package Size:** ~642 KB
- **Disk Footprint:** ~1.20 MB
- **Architecture:** Modular (Core / Registry / Editor)
- **License:** Apache License 2.0
- **Environment:** Web-friendly (VS Code Web, Browser, Node.js)

## Core Features

- **Lightweight Rendering:** Optimized SVG output without external dependencies like D3.js.
- **Modular Registry:** Pluggable architecture allowing for specific diagram types to be added or removed as needed.
- **Web-First Integration:** Fully compatible with VS Code Web extensions and browser-based editors.
- **Deterministic Layouts:** Precise coordinate calculation for complex routing, including native support for self-loops and multi-dependency nodes.
- **Agent-Friendly Syntax:** A streamlined DSL designed to minimize LLM hallucinations (e.g., inconsistent colons or delimiters).

## Project Structure

- `core/`: The foundational rendering and AST parsing logic.
- `registry/`: A collection of diagram-specific implementations (CPM, PERT, Use Case) and templates.
- `editor/`: A lightweight, web-based interface for live diagram preview and editing.

## Installation & Usage

You have two ways to start diagramming with Ambastha Diagrams:

- **⚡ Quick Start (Web):** Use the **[Live Web Editor](https://sudhanshu-ambastha.github.io/Ambastha-Diagrams/editor/index.html)** to test your syntax instantly in your browser—no installation required.
- **🛠️ Professional Workflow (VS Code):** Install the **[Ambastha Diagrams VS Code Extension](https://marketplace.visualstudio.com/items?itemName=SudhanshuAmbastha.ambastha-diagrams)** for real-time previewing, full `.abd` syntax support, and a streamlined developer workflow.

## License

This project is licensed under the [![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0). See the `LICENSE` and `NOTICE` files for more information.
