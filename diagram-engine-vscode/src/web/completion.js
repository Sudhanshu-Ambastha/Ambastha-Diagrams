import * as vscode from "vscode";
import templates from "./examples.json";

export function registerCompletionProvider() {
  return vscode.languages.registerCompletionItemProvider("abd", {
    provideCompletionItems(document, position, token, context) {
      const completions = [];
      const isBlankFile = document.getText().trim() === "";

      for (const [key, value] of Object.entries(templates)) {
        const item = new vscode.CompletionItem(
          `📊 diagram: ${key}`,
          isBlankFile
            ? vscode.CompletionItemKind.File
            : vscode.CompletionItemKind.Snippet,
        );
        item.filterText = key;
        item.sortText = isBlankFile ? `a_${key}` : `z_${key}`;
        item.insertText = new vscode.SnippetString(value);
        item.documentation = new vscode.MarkdownString(
          `Inserts a standard boilerplate code snippet structure for **${key.toUpperCase()}** diagrams.`,
        );
        completions.push(item);
      }

      return completions;
    },
  });
}
