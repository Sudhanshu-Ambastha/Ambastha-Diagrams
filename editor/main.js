/**
 * main.js
 * Description: Part of the Sovereign Diagram Engine core logic.
 *
 * Copyright 2026 Sudhanshu Ambastha
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { renderDiagram } from "../diagram-engine/core/index.js";

require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs",
  },
});

let monacoEditor;
const editorDiv = document.getElementById("editor");
const resizer = document.getElementById("resizer");
const sidebar = document.getElementById("sidebar");

require(["vs/editor/editor.main"], function () {
  monaco.languages.registerCompletionItemProvider("plaintext", {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: [
          {
            label: "flowchart",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "flowchart\ntheme: modernSaaS\n\ndef {\n\n}\n",
            range: range,
          },
          {
            label: "sequence",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "sequence\n  participant User as U\n",
            range: range,
          },
        ],
      };
    },
  });

  monacoEditor = monaco.editor.create(editorDiv, {
    value: "",
    language: "plaintext",
    theme: "vs-dark",
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 18,
    lineHeight: 30,
    fontFamily: "'Cascadia Code', 'Fira Code', monospace",
  });

  const resizeObserver = new ResizeObserver(() => {
    monacoEditor.layout();
  });
  resizeObserver.observe(editorDiv);

  monacoEditor.onDidChangeModelContent(update);
  initTemplates();
});

resizer.addEventListener("mousedown", (e) => {
  const startX = e.pageX;
  const startWidth = sidebar.offsetWidth;

  const onMouseMove = (ev) => {
    const newWidth = startWidth + (ev.pageX - startX);
    sidebar.style.width = `${Math.max(200, Math.min(600, newWidth))}px`;
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp, { once: true });
});

async function initTemplates() {
  const selector = document.getElementById("exampleSelector");
  try {
    const response = await fetch("../diagram-engine/registry/examples.json");
    const examples = await response.json();

    Object.entries(examples).forEach(([key, config]) => {
      const option = document.createElement("option");
      option.value = config.template;
      option.textContent = key.replace(/_/g, " ").toUpperCase();
      selector.appendChild(option);
    });

    selector.addEventListener("change", (e) => {
      if (e.target.value) monacoEditor.setValue(e.target.value);
    });
  } catch (err) {
    console.warn("Could not load templates", err);
  }
}

function update() {
  const input = monacoEditor.getValue().trim();
  const preview = document.getElementById("preview");
  try {
    preview.innerHTML = renderDiagram(input);
  } catch (err) {
    preview.innerHTML = `<div class="error" style="color: #f87171; padding: 20px;">Error: ${err.message}</div>`;
  }
}
