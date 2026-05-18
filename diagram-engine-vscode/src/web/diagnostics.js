import * as vscode from "vscode";

export function createDiagnosticEngine(context) {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("abdErrors");
  context.subscriptions.push(diagnosticCollection);

  return function updateDiagnostics(document, rawEngineResult) {
    if (!document || document.languageId !== "abd") return;

    diagnosticCollection.set(document.uri, []);

    if (rawEngineResult && rawEngineResult.error) {
      const errorMsg = rawEngineResult.error.message || "";
      let errorLine = 0;

      const lineMatch = errorMsg.match(/(?:line\s*|:\s*)(\d+)/i);
      if (lineMatch && lineMatch[1]) {
        errorLine = Math.max(0, parseInt(lineMatch[1], 10) - 1);
      }

      const textLine = document.lineAt(errorLine);
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(errorLine, 0, errorLine, textLine.text.length),
        `[Ambastha Diagram Syntax Error] -> ${errorMsg}`,
        vscode.DiagnosticSeverity.Error,
      );

      diagnostic.source = "ABD Compiler";
      diagnosticCollection.set(document.uri, [diagnostic]);
    }
  };
}
