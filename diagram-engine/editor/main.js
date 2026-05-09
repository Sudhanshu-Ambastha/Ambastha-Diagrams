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

import { renderDiagram } from "../core/index.js";

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const selector = document.getElementById("exampleSelector");
const colorPicker = document.getElementById("colorPicker");

editor.addEventListener("dblclick", (e) => {
  const text = editor.value;
  const pos = editor.selectionStart;
  const hexMatch = text.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g);
  if (!hexMatch) return;

  let start = pos;
  while (start > 0 && text[start] !== "#" && !/\s/.test(text[start])) start--;

  let end = pos;
  while (end < text.length && /[A-Fa-f0-9#]/.test(text[end])) end++;

  const word = text.substring(start, end).trim();
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  if (hexRegex.test(word)) {
    colorPicker.value =
      word.length === 4
        ? `#${word[1]}${word[1]}${word[2]}${word[2]}${word[3]}${word[3]}`
        : word;

    colorPicker.click();

    colorPicker.oninput = () => {
      const newColor = colorPicker.value;
      const editorText = editor.value;
      editor.value =
        editorText.substring(0, start) + newColor + editorText.substring(end);
      update();
    };
  }
});

async function init() {
  try {
    const response = await fetch("../registry/examples.json");
    if (!response.ok) throw new Error("Could not find examples.json");

    const examples = await response.json();

    Object.entries(examples).forEach(([name, syntax]) => {
      const option = document.createElement("option");
      option.value = syntax;
      option.textContent = name.replace(/_/g, " ").toUpperCase();
      selector.appendChild(option);
    });
  } catch (err) {
    console.warn("Using local defaults. Ensure registry/examples.json exists.");
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
