import * as vscode from "vscode";

export function activate(context) {
  const openPreview = vscode.commands.registerCommand(
    "diagramEngine.openPreview",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      PreviewPanel.createOrShow(context, editor.document);
    },
  );

  const onTextChange = vscode.workspace.onDidChangeTextDocument((e) => {
    if (
      e.document.languageId === "abd" ||
      e.document.fileName.endsWith(".abd")
    ) {
      PreviewPanel.update(e.document);
    }
  });

  const onActiveEditorChange = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (
        editor &&
        (editor.document.languageId === "abd" ||
          editor.document.fileName.endsWith(".abd"))
      ) {
        PreviewPanel.createOrShow(context, editor.document);
      }
    },
  );

  context.subscriptions.push(openPreview, onTextChange, onActiveEditorChange);
}

class PreviewPanel {
  static currentPanel = undefined;
  static currentDocument = undefined;

  static createOrShow(context, document) {
    const column = vscode.ViewColumn.Beside;

    if (PreviewPanel.currentPanel) {
      PreviewPanel.currentPanel.reveal(column);
      PreviewPanel.currentDocument = document;
      PreviewPanel._doUpdate(context, document);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "diagramPreview",
      "Diagram Preview",
      column,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, "dist", "web"),
        ],
      },
    );

    PreviewPanel.currentPanel = panel;
    PreviewPanel.currentDocument = document;
    PreviewPanel._doUpdate(context, document);

    panel.onDidDispose(() => {
      PreviewPanel.currentPanel = undefined;
      PreviewPanel.currentDocument = undefined;
    });
  }

  static update(document) {
    if (
      PreviewPanel.currentPanel &&
      PreviewPanel.currentDocument?.uri.toString() === document.uri.toString()
    ) {
      PreviewPanel.currentPanel.webview.postMessage({
        type: "update",
        text: document.getText(),
      });
    }
  }

  static _doUpdate(context, document) {
    if (!PreviewPanel.currentPanel) return;
    const webview = PreviewPanel.currentPanel.webview;
    webview.html = getWebviewContent(webview, context);
    setTimeout(() => {
      webview.postMessage({ type: "update", text: document.getText() });
    }, 100);
  }
}

function getWebviewContent(webview, context) {
  const engineUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "dist", "web", "engine.js"),
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; script-src 'unsafe-inline' ${webview.cspSource}; style-src 'unsafe-inline';">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #ffffff;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 24px;
      min-height: 100vh;
      overflow: auto;
    }
    #canvas { width: 100%; }
    #canvas svg { max-width: 100%; height: auto; }
    .error-box {
      border: 2px solid #ef4444;
      padding: 15px;
      background: #fef2f2;
      border-radius: 6px;
      font-family: monospace;
    }
    .error-box h3 { color: #ef4444; margin-bottom: 8px; }
    .empty { color: #9ca3af; font-family: sans-serif; text-align: center; margin-top: 40px; }
  </style>
</head>
<body>
  <div id="canvas"><p class="empty">Open an .abd file to see the preview.</p></div>

  <script type="module">
    import { renderDiagram } from '${engineUri}';

    window.addEventListener('message', (event) => {
      const { type, text } = event.data;
      if (type !== 'update') return;

      const canvas = document.getElementById('canvas');
      if (!text?.trim()) {
        canvas.innerHTML = '<p class="empty">Empty diagram — start typing.</p>';
        return;
      }

      try {
        canvas.innerHTML = renderDiagram(text);
      } catch (err) {
        canvas.innerHTML = \`
          <div class="error-box">
            <h3>❌ Render Error</h3>
            <p>\${err.message}</p>
          </div>\`;
      }
    });
  </script>
</body>
</html>`;
}

export function deactivate() {}
