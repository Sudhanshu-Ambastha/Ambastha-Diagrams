import * as vscode from "vscode";
import { createDiagnosticEngine } from "./diagnostics.js";
import {
  registerCompletionProvider,
  registerBlankFileWatcher,
  registerClearWatcher,
} from "./completion.js";
import { PreviewPanel } from "./preview.js";

function isAbdFile(doc) {
  return doc && (doc.languageId === "abd" || doc.fileName.endsWith(".abd"));
}

export function activate(context) {
  createDiagnosticEngine(context);
  context.subscriptions.push(registerCompletionProvider());
  registerBlankFileWatcher(context);
  registerClearWatcher(context);

  context.subscriptions.push(
    vscode.commands.registerCommand("diagramEngine.openPreview", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || !isAbdFile(editor.document)) {
        vscode.window.showWarningMessage(
          "Open an .abd file first to preview it.",
        );
        return;
      }
      PreviewPanel.createOrShow(
        context,
        editor.document,
        vscode.ViewColumn.Beside,
      );
    }),

    vscode.commands.registerCommand("diagramEngine.openPreviewToSide", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || !isAbdFile(editor.document)) return;
      PreviewPanel.createOrShow(
        context,
        editor.document,
        vscode.ViewColumn.Beside,
      );
    }),

    vscode.workspace.onDidChangeTextDocument((e) => {
      if (isAbdFile(e.document)) {
        PreviewPanel.update(e.document);
      }
    }),

    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && isAbdFile(editor.document)) {
        PreviewPanel.createOrShow(
          context,
          editor.document,
          vscode.ViewColumn.Beside,
        );
      }
    }),
  );

  const current = vscode.window.activeTextEditor;
  if (current && isAbdFile(current.document)) {
    PreviewPanel.createOrShow(
      context,
      current.document,
      vscode.ViewColumn.Beside,
    );
  }
}

export function deactivate() {}
