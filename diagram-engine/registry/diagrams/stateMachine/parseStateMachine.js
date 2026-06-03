/**
 * parseStateMachine.js
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

export function parseStateMachine(source) {
  const db = {
    nodes: {},
    transitions: [],
    notes: [],
    rootOrder: [],
  };

  const lines = source.split(/\r?\n/).slice(1);

  function resolveDot(db, id) {
    if (!id || !id.includes(".")) return id;
    const [parentId, childAlias] = id.split(".");
    const parent = db.nodes[parentId];
    if (!parent) return id;

    const match = parent.children.find(
      (cid) => cid === childAlias || db.nodes[cid]?.label === childAlias,
    );
    return match || id;
  }

  function ensureNode(id, type = "state", label = null, parent = null) {
    if (!id) return null;
    if (!db.nodes[id]) {
      db.nodes[id] = {
        id,
        label: label || id,
        type,
        children: [],
        notes: [],
        parent,
      };
    } else {
      if (type !== "state") db.nodes[id].type = type;
      if (label) db.nodes[id].label = label;
      if (parent) db.nodes[id].parent = parent;
    }
    return db.nodes[id];
  }

  function addTransition(from, to, label = "", guard = "", ttype = "normal") {
    const f = resolveDot(db, from === "[*]" ? "__initial__" : from);
    const t = resolveDot(db, to === "[*]" ? "__final__" : to);

    ensureNode(f, from === "[*]" ? "initial" : "state");
    ensureNode(t, to === "[*]" ? "final" : "state");
    db.transitions.push({ from: f, to: t, label, guard, type: ttype });
  }

  function parseTransitionLine(line, ttype = "normal") {
    const m = line.match(/^(.+?)\s*-->\s*(.+?)(?::\s*(.+))?$/);
    if (!m) return false;

    const froms = m[1]
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    const toRaw = m[2].trim();

    let label = "",
      guard = "";
    if (m[3]) {
      const gm = m[3].match(/^(.*?)\s*\[([^\]]+)\]\s*$/);
      if (gm) {
        label = gm[1].trim();
        guard = gm[2].trim();
      } else label = m[3].trim();
    }

    const tos = toRaw
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    froms.forEach((f) =>
      tos.forEach((t) => addTransition(f, t, label, guard, ttype)),
    );
    return true;
  }

  function parseBlock(blockLines, parentId) {
    let i = 0;
    while (i < blockLines.length) {
      const raw = blockLines[i].trim();
      i++;
      if (!raw || raw.startsWith("//")) continue;
      parseLine(raw, parentId);
    }
  }

  function parseLine(line, parentId = null) {
    const stateDecl = line.match(/^state\s+"([^"]+)"\s+as\s+(\w+)\s*(\{.*)?$/);
    if (stateDecl) {
      const [, label, id] = stateDecl;
      ensureNode(id, "state", label, parentId);
      if (parentId) db.nodes[parentId].children.push(id);
      else db.rootOrder.push(id);
      return;
    }

    const bareSt = line.match(/^state\s+(\w+)\s*$/);
    if (bareSt) {
      ensureNode(bareSt[1], "state", bareSt[1], parentId);
      if (!parentId) db.rootOrder.push(bareSt[1]);
      return;
    }

    const pseudoTypes = [
      "initial",
      "final",
      "choice",
      "junction",
      "fork",
      "join",
      "entryPoint",
      "exitPoint",
      "terminate",
      "shallowHistory",
      "deepHistory",
    ];
    for (const pt of pseudoTypes) {
      const re = new RegExp("^" + pt + "\\s*:\\s*(\\w+)\\s*$", "i");
      const pm = line.match(re);
      if (pm) {
        const id = pm[1];
        ensureNode(id, pt, id, parentId);
        if (parentId) db.nodes[parentId].children.push(id);
        else db.rootOrder.push(id);
        return;
      }
    }

    const noteLine = line.match(/^note(?:\s+on\s+(\w+))?\s*:\s*"([^"]+)"$/);
    if (noteLine) {
      const attachedTo = noteLine[1] || null;
      const text = noteLine[2];
      db.notes.push({ text, attachedTo });
      if (attachedTo && db.nodes[attachedTo]) {
        db.nodes[attachedTo].notes.push(text);
      }
      return;
    }

    const keywords = ["include", "dependency", "anchor", "constraint"];
    for (const kw of keywords) {
      const re = new RegExp("^" + kw + "\\s*:\\s*(.+)$", "i");
      const m = line.match(re);
      if (m) {
        parseTransitionLine(m[1], kw);
        return;
      }
    }

    parseTransitionLine(line, "normal");
  }

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i].trim();
    i++;
    if (!raw || raw.startsWith("//")) continue;

    const blockOpen = raw.match(/^state\s+"([^"]+)"\s+as\s+(\w+)\s*\{/);
    if (blockOpen) {
      const [, label, id] = blockOpen;
      ensureNode(id, "state", label, null);
      db.rootOrder.push(id);

      const blockLines = [];
      let depth = 1;
      while (i < lines.length && depth > 0) {
        const bl = lines[i].trim();
        if (bl.includes("{")) depth++;
        if (bl.startsWith("}")) {
          depth--;
          if (depth === 0) {
            i++;
            break;
          }
        }
        blockLines.push(lines[i]);
        i++;
      }
      parseBlock(blockLines, id);
      continue;
    }
    parseLine(raw, null);
  }

  if (db.transitions.some((t) => t.from === "__initial__")) {
    if (!db.nodes["__initial__"]) ensureNode("__initial__", "initial", "");
  }
  if (db.transitions.some((t) => t.to === "__final__")) {
    if (!db.nodes["__final__"]) ensureNode("__final__", "final", "");
  }

  return db;
}
