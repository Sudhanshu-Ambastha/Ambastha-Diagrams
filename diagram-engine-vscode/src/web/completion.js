import * as vscode from "vscode";
import templates from "./examples.json";

function buildDocumentation(key, template) {
  const descriptions = {
    flowchart: "Visualize processes and decision flows.",
    sequence: "Show interactions between actors over time.",
    class: "Model object-oriented class structures.",
    gantt: "Plan and track project timelines.",
    kanban: "Manage work items across status columns.",
    usecase: "Describe system actors and their use cases.",
    pert: "Estimate project schedules with uncertainty.",
    cpm: "Find the critical path through a project network.",
  };

  const md = new vscode.MarkdownString("", true);
  md.isTrusted = true;
  md.supportThemeIcons = true;

  const desc = descriptions[key] ?? "Ambastha Diagram snippet.";
  md.appendMarkdown(`**${key.toUpperCase()}** — ${desc}\n\n`);
  md.appendCodeblock(template, "abd");

  return md;
}

function buildItems(isBlank) {
  return Object.entries(templates).map(([key, template]) => {
    const item = new vscode.CompletionItem(
      `📊 ${key}`,
      isBlank
        ? vscode.CompletionItemKind.File
        : vscode.CompletionItemKind.Snippet,
    );

    item.filterText = key;
    item.detail = `Ambastha · ${key} diagram`;
    item.sortText = isBlank ? `0_${key}` : `9_${key}`;
    item.insertText = new vscode.SnippetString(template);
    item.documentation = buildDocumentation(key, template);
    item.commitCharacters = [];
    item.keepWhitespace = false;

    return item;
  });
}

export function registerCompletionProvider() {
  const provider = vscode.languages.registerCompletionItemProvider(
    "abd",
    {
      provideCompletionItems(document, position) {
        const isBlank = document.getText().trim() === "";
        return buildItems(isBlank);
      },
    },
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  );

  return provider;
}

export function registerBlankFileWatcher(context) {
  const triggerIfBlank = (document) => {
    if (!document) return;
    if (document.languageId !== "abd" && !document.fileName.endsWith(".abd"))
      return;
    if (document.getText().trim() !== "") return;

    setTimeout(() => {
      vscode.commands.executeCommand("editor.action.triggerSuggest");
    }, 300);
  };

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(triggerIfBlank),
  );

  if (vscode.window.activeTextEditor) {
    triggerIfBlank(vscode.window.activeTextEditor.document);
  }
}
