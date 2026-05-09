# Ambastha Diagrams Live Previewer 🎨🚀

An ultra-lightweight, lightning-fast extension providing comprehensive syntax highlighting, auto-completion, and native live-updating previews for Ambastha Diagram (`.abd`) files directly inside Visual Studio Code.

---

## ✨ Features

- **High-Fidelity Rendering:** Instantly parse and preview Use Case, Gantt, Kanban, Flowcharts, Pert, and CPM diagrams.
- **Smart Language Integration:** Full TextMate token highlighting explicitly mapped for diagram syntax layouts.
- **Live Interactive Synchronization:** View your visual architectural updates instantly alongside your workspace workspace text inputs.
- **Vector File Exports:** Ship your optimized layouts directly into crisp vector-graphic payloads (`.svg` or `.png`).

---

## ⌨️ Keyboard Shortcuts & Menus

| Action                         | Shortcut Key                   | Active Context Condition           |
| :----------------------------- | :----------------------------- | :--------------------------------- |
| **Open Interactive Preview**   | `Ctrl+Shift+V` / `Cmd+Shift+V` | Only inside active `.abd` files    |
| **Open Preview to Side Panel** | Via Top Title Menu Bar Button  | Editor focused on an `.abd` script |

---

## 🛠️ Contribution Commands

Open the **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type `Ambastha Diagrams:` to discover all built-in layout management commands:

- `Ambastha Diagrams: Open Preview`
- `Ambastha Diagrams: Open Preview to the Side`
- `Ambastha Diagrams: Export as SVG`
- `Ambastha Diagrams: Export as PNG`

---

## ⚙️ Settings Configuration

This extension provides custom properties available inside your standard VS Code global JSON `settings.json` workspace preferences:

- `ambastha.registryUrl`: _String (Default: `""`)_ — Assign a URL path string pointing to a custom, remote diagram configuration JSON manifest. Leave empty to use the robust bundled engine library defaults.

---

## 📄 Extension License

Distributed under the **Apache License, Version 2.0**. See the accompanying `LICENSE` file template inside the directory layout footprint for explicit usage regulations.
