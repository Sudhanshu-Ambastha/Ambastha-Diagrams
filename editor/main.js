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

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const selector = document.getElementById("exampleSelector");
const colorPicker = document.getElementById("colorPicker");

let activeCanvasNodeId = null;

editor.addEventListener("dblclick", () => {
  const text = editor.value;
  const selectionStart = editor.selectionStart;

  const leftMatch = text.substring(0, selectionStart).match(/[#A-Fa-f0-9]+$/);
  const rightMatch = text.substring(selectionStart).match(/^[#A-Fa-f0-9]+/);

  const leftToken = leftMatch ? leftMatch[0] : "";
  const rightToken = rightMatch ? rightMatch[0] : "";
  const completeWord = leftToken + rightToken;

  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  if (hexRegex.test(completeWord)) {
    activeCanvasNodeId = null;
    const startIdx = selectionStart - leftToken.length;
    const endIdx = selectionStart + rightToken.length;

    colorPicker.value =
      completeWord.length === 4
        ? `#${completeWord[1]}${completeWord[1]}${completeWord[2]}${completeWord[2]}${completeWord[3]}${completeWord[3]}`
        : completeWord;

    colorPicker.oninput = (e) => {
      const updatedColor = e.target.value;
      const currentText = editor.value;

      editor.value =
        currentText.substring(0, startIdx) +
        updatedColor +
        currentText.substring(endIdx);
      update();

      editor.setSelectionRange(startIdx, startIdx + updatedColor.length);
    };

    colorPicker.click();
  }
});

function bindCanvasInteraction() {
  const nodes = preview.querySelectorAll("[data-node-id]");
  nodes.forEach((node) => {
    node.addEventListener("click", (e) => {
      activeCanvasNodeId = e.target.getAttribute("data-node-id");

      colorPicker.oninput = (ev) => {
        if (!activeCanvasNodeId) return;
        const pickedColor = ev.target.value;
        let scriptText = editor.value;

        const nodeLineRegex = new RegExp(
          `(${activeCanvasNodeId}\\s*:\\s*"[^"]*"[^\\n]*)`,
        );

        if (nodeLineRegex.test(scriptText)) {
          const fillPropRegex = new RegExp(
            `(${activeCanvasNodeId}\\s*:\\s*"[^"]*"[^\\n]*fill:\\s*)([^,\\n\\}]+)`,
          );
          if (fillPropRegex.test(scriptText)) {
            scriptText = scriptText.replace(
              fillPropRegex,
              `$1"${pickedColor}"`,
            );
          } else {
            scriptText = scriptText.replace(
              nodeLineRegex,
              `$1, fill: "${pickedColor}"`,
            );
          }
        } else {
          scriptText = scriptText.replace(
            /(def\s*\{)/,
            `$1\n  ${activeCanvasNodeId}: "${activeCanvasNodeId}", fill: "${pickedColor}"`,
          );
        }

        editor.value = scriptText;
        update();
      };

      colorPicker.click();
    });
  });
}

async function init() {
  try {
    const response = await fetch("../diagram-engine/registry/examples.json");
    if (!response.ok) throw new Error("Could not find examples.json");

    const examples = await response.json();
    const groups = {};

    Object.entries(examples).forEach(([key, config]) => {
      const option = document.createElement("option");
      option.value = config.template;
      option.textContent = key.replace(/_/g, " ").toUpperCase();

      if (config.description) {
        option.title = config.description;
      }

      if (config.category) {
        const catName = config.category.toUpperCase();
        if (!groups[catName]) {
          groups[catName] = document.createElement("optgroup");
          groups[catName].label = `${catName} DIAGRAMS`;
          selector.appendChild(groups[catName]);
        }
        groups[catName].appendChild(option);
      } else {
        selector.appendChild(option);
      }
    });
  } catch (err) {
    console.warn(
      "Using local defaults. Ensure registry/examples.json exists.",
      err,
    );
  }
  update();
}

selector.addEventListener("change", () => {
  if (selector.value) {
    editor.value = selector.value;
    update();
  }
});

function update() {
  const input = editor.value.trim();
  if (!input) {
    preview.innerHTML = "";
    return;
  }

  try {
    const svg = renderDiagram(input);
    preview.innerHTML = svg;
    editor.style.borderColor = "#cbd5e1";

    bindCanvasInteraction();
  } catch (err) {
    editor.style.borderColor = "#ef4444";
    preview.innerHTML = `
      <div class="error-box">
        <h3>❌ Logic Error</h3>
        <p>${err.message}</p>
      </div>`;
  }
}

let timeout;
editor.addEventListener("input", () => {
  clearTimeout(timeout);
  timeout = setTimeout(update, 100);
});

init();
