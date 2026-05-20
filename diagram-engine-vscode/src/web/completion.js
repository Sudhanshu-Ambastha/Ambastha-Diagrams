import * as vscode from "vscode";
import bundledTemplates from "./examples.json";

let _registry = null;

async function loadRegistry(context) {
  if (_registry) return _registry;
  const config = vscode.workspace.getConfiguration("ambastha");
  const remoteUrl = config.get("registryUrl");

  if (remoteUrl) {
    try {
      const res = await fetch(remoteUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        _registry = normalizeRegistry(data);
        console.log("[ABD] Registry loaded from remote:", remoteUrl);
        return _registry;
      }
    } catch (err) {
      console.warn(
        "[ABD] Remote registry fetch failed, using bundled:",
        err.message,
      );
    }
  }

  _registry = normalizeRegistry(bundledTemplates);
  console.log(
    "[ABD] Registry loaded from bundle, diagrams:",
    Object.keys(_registry),
  );
  return _registry;
}

function normalizeRegistry(raw) {
  const out = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") {
      out[key] = { template: value, description: "", category: "general" };
    } else {
      out[key] = {
        template: value.template ?? "",
        description: value.description ?? "",
        category: value.category ?? "general",
      };
    }
  }
  return out;
}

let _cachedRegistry = null;

export function registerCompletionProvider(context) {
  loadRegistry(context).then((r) => {
    _cachedRegistry = r;
  });

  return vscode.languages.registerCompletionItemProvider(
    { language: "abd", scheme: "*" },
    {
      async provideCompletionItems(document, position) {
        if (position.line !== 0) return new vscode.CompletionList([], false);

        const registry = _cachedRegistry ?? (await loadRegistry(context));

        const lineText = document
          .lineAt(0)
          .text.slice(0, position.character)
          .trim()
          .toLowerCase();

        const keys = Object.keys(registry);
        const matched =
          lineText === "" ? keys : keys.filter((k) => k.startsWith(lineText));

        if (matched.length === 0) return new vscode.CompletionList([], false);

        const items = matched.map((key) => {
          const entry = registry[key];

          const item = new vscode.CompletionItem(
            { label: "📊 " + key, description: "Ambastha Diagrams" },
            vscode.CompletionItemKind.Keyword,
          );

          item.filterText = key;

          item.insertText = new vscode.SnippetString(entry.template);
          item.range = new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(0, document.lineAt(0).text.length),
          );

          item.detail = "Ambastha Diagrams · " + (entry.category ?? "");
          item.sortText = "0_" + key;
          item.preselect = matched.length === 1;
          item.documentation = buildDoc(key, entry);
          item.commitCharacters = [];

          return item;
        });

        return new vscode.CompletionList(items, false);
      },
    },
    "f",
    "s",
    "c",
    "g",
    "k",
    "u",
    "p",
  );
}

function buildDoc(key, entry) {
  const md = new vscode.MarkdownString("", true);
  md.isTrusted = true;
  md.supportThemeIcons = true;
  if (entry.description) {
    md.appendMarkdown(
      "**" + key.toUpperCase() + "** — " + entry.description + "\n\n",
    );
  }
  if (entry.template) {
    md.appendCodeblock(entry.template, "abd");
  }
  return md;
}

function isAbdDoc(document) {
  return (
    document &&
    (document.languageId === "abd" || document.fileName.endsWith(".abd"))
  );
}

let _debounce = null;

function triggerInlineIfBlank(document) {
  if (!isAbdDoc(document)) return;
  if (document.getText().trim() !== "") return;
  clearTimeout(_debounce);
  _debounce = setTimeout(() => {
    if (document.getText().trim() !== "") return;
    vscode.commands.executeCommand("editor.action.triggerSuggest");
  }, 400);
}

export function registerBlankFileWatcher(context) {
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(triggerInlineIfBlank),
  );
  if (vscode.window.activeTextEditor) {
    triggerInlineIfBlank(vscode.window.activeTextEditor.document);
  }
}

export function registerClearWatcher(context) {
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (isAbdDoc(e.document)) triggerInlineIfBlank(e.document);
    }),
  );
}
