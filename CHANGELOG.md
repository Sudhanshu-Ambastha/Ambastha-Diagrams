# Changelog

All notable changes to Ambastha Diagrams will be documented here.

## [1.1.0] - 2026-06-03

### Added

- **Entity Relationship Diagrams (ERD):** Added full support for ERD notation, including PK/FK attributes, cardinality, and access specifiers.

- **State Machine Diagrams:** Added support for complex state modeling, including composite states, choices, forks, joins, and shallow history.

- **Extension Enhancements:** Added comprehensive template documentation for all diagram types for the npm package and VS Code extension.

### Fixed

- **Sequence Rendering:** Resolved rendering bugs for sequence diagrams within the IDE/VS Code extension environment.

- **Diagram Stability:** General bug fixes and rendering improvements across previous diagram implementations (flowchart, class, planning diagrams).

## [1.0.1] - 2026-05-26

### Fixed

- **Documentation:** Added missing README and package metadata to ensure proper npm distribution.

## [1.0.0] - 2026-05-26

### Added

- Live preview panel for `.abd` files with zoom, pan, and fit controls
- Export to SVG and PNG from the preview toolbar
- Syntax highlighting for all diagram types
- IntelliSense completions with example templates on blank files
- Keyboard shortcut `Ctrl+Shift+V` / `Cmd+Shift+V` to open preview
- Support for 7 diagram types: flowchart, sequence, class, CPM, PERT, gantt, kanban, usecase
- Works in both VS Code Desktop and VS Code Web (vscode.dev)
