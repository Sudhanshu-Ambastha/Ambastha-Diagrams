/**
 * parseFlowchart.js
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

export function parseFlowchart(script) {
  const model = {
    nodes: {},
    connections: [],
    ss: false,
    ssLabels: { start: "Start", end: "End" },
    theme: "StandardBlue",
    fontTheme: "modern",
  };

  if (typeof script !== "string") {
    if (script?.script) script = script.script;
    else return model;
  }

  const SHAPE = {
    d: "decision",
    decision: "decision",
    t: "startstop",
    terminal: "startstop",
    io: "io",
    p: "process",
    process: "process",
  };

  const bodyOrder = [];
  function touchOrder(id) {
    if (id && !bodyOrder.includes(id)) bodyOrder.push(id);
  }

  function ensureNode(id, type = "process", label = null) {
    if (!id || /^[{}?]$/.test(id.trim())) return;
    if (!model.nodes[id]) model.nodes[id] = { type, label: label ?? id };
    if (type !== "process") model.nodes[id].type = type;
    if (label !== null) model.nodes[id].label = label;
  }

  function addConn(from, to, label = "", dashed = false) {
    if (!from || !to || /^[{}?]$/.test(from) || /^[{}?]$/.test(to)) return;

    const isDuplicate = model.connections.some(
      (c) =>
        c.from === from &&
        c.to === to &&
        c.label === label &&
        c.dashed === dashed,
    );
    if (!isDuplicate) {
      model.connections.push({ from, to, label, dashed });
    }

    ensureNode(from);
    ensureNode(to);
    touchOrder(from);
    touchOrder(to);
  }

  function parseArrow(s) {
    s = s.trim();
    const dl = s.match(/^--([^->]+)-*->$/);
    if (dl) return { label: dl[1].trim(), dashed: true };
    if (s.startsWith("--")) return { label: "", dashed: true };
    const sl = s.match(/^-([^->]+)->$/);
    if (sl) return { label: sl[1].trim(), dashed: false };
    return { label: "", dashed: false };
  }

  function tokenizeChain(str) {
    const re = /(--[^->]+-+>|--+>|-[^->]+-+>|->)/g;
    const tokens = [];
    let last = 0,
      m;
    while ((m = re.exec(str)) !== null) {
      const node = str.slice(last, m.index).trim();
      if (node) tokens.push({ kind: "node", val: node });
      tokens.push({ kind: "arrow", val: m[0] });
      last = m.index + m[0].length;
    }
    const tail = str.slice(last).trim();
    if (tail) tokens.push({ kind: "node", val: tail });
    return tokens;
  }

  function parseChain(str) {
    const tokens = tokenizeChain(str);
    const conns = [];

    for (let i = 0; i + 2 < tokens.length; i += 2) {
      if (
        tokens[i].kind === "node" &&
        tokens[i + 1].kind === "arrow" &&
        tokens[i + 2].kind === "node"
      ) {
        const { label, dashed } = parseArrow(tokens[i + 1].val);

        const sources = tokens[i].val
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean);
        const destinations = tokens[i + 2].val
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean);

        for (const src of sources) {
          for (const dest of destinations) {
            conns.push({
              from: src,
              to: dest,
              label,
              dashed,
            });
          }
        }
      }
    }
    const trailingArrow =
      tokens.length > 0 && tokens[tokens.length - 1].kind === "arrow";
    return { conns, trailingArrow, tokens };
  }

  function chainNodes(str) {
    return tokenizeChain(str)
      .filter((t) => t.kind === "node")
      .flatMap((t) =>
        t.val
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean),
      );
  }

  function resolveJoinStr(joinStr) {
    if (!joinStr) return { joinEntry: null, joinTail: null };
    const { conns: jc, tokens } = parseChain(joinStr);
    jc.forEach((c) => addConn(c.from, c.to, c.label, c.dashed));

    const firstNodeToken = tokens.find((t) => t.kind === "node")?.val ?? null;
    const joinEntries = firstNodeToken
      ? firstNodeToken
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean)
      : [];
    const joinEntry = joinEntries[0] || null;
    const joinTail = jc[jc.length - 1]?.to ?? joinEntry;

    joinEntries.forEach((entry) => ensureNode(entry));
    if (joinTail && joinTail !== joinEntry) ensureNode(joinTail);

    return { joinEntry, joinTail };
  }

  function parseInlineStyles(id, extraStr) {
    if (!extraStr) return;

    const fillMatch = extraStr.match(/fill\s*:\s*["']?([^"'\s,]+)["']?/);
    const strokeMatch = extraStr.match(/stroke\s*:\s*["']?([^"'\s,]+)["']?/);
    const textMatch = extraStr.match(/textColor\s*:\s*["']?([^"'\s,]+)["']?/);
    const sizeMatch = extraStr.match(/fontSize\s*:\s*["']?([^"'\s,]+)["']?/);
    const weightMatch = extraStr.match(
      /fontWeight\s*:\s*["']?([^"'\s,]+)["']?/,
    );

    if (fillMatch) model.nodes[id].customFill = fillMatch[1].trim();
    if (strokeMatch) model.nodes[id].customStroke = strokeMatch[1].trim();
    if (textMatch) model.nodes[id].customTextColor = textMatch[1].trim();
    if (sizeMatch) model.nodes[id].customFontSize = sizeMatch[1].trim();
    if (weightMatch) model.nodes[id].customFontWeight = weightMatch[1].trim();
  }

  function parseDef(block) {
    block.split(/\n/).forEach((rawLine) => {
      const line = rawLine.trim().replace(/,\s*$/, "");
      if (!line || line === "{" || line === "}") return;

      const full = line.match(
        /^(\w+)\s*:\s*"([^"]+)"\s*,\s*shape\s*:\s*(\w+)(.*)$/i,
      );
      if (full) {
        const id = full[1];
        const type = SHAPE[full[3].toLowerCase()] || "process";
        const label = full[2];
        const extraStr = full[4] || "";

        ensureNode(id, type, label);
        parseInlineStyles(id, extraStr);
        return;
      }

      const lbl = line.match(/^(\w+)\s*:\s*"([^"]+)"(.*)$/);
      if (lbl) {
        const id = lbl[1];
        ensureNode(id, "process", lbl[2]);
        parseInlineStyles(id, lbl[3] || "");
        return;
      }

      const alias = line.match(/^(\w+)$/);
      if (alias) ensureNode(alias[1], "process", alias[1]);
    });
  }

  function parseBranchBlock(lines, decId) {
    const branches = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) {
        i++;
        continue;
      }
      const bm = line.match(/^(\w+)\s*:\s*(.*)$/);
      if (!bm) {
        i++;
        continue;
      }
      const branchLabel = bm[1];
      const rest = bm[2].trim();

      const nested = rest.match(/^(.*?)\s*(\w+)\s*\?\s*\{(.*)$/);
      if (nested) {
        const beforeStr = nested[1].trim();
        const nestedDec = nested[2];
        ensureNode(nestedDec, "decision");
        touchOrder(nestedDec);

        let entry = nestedDec;
        if (beforeStr) {
          const chainStr = beforeStr.trimEnd() + " -> " + nestedDec;
          const { conns } = parseChain(chainStr);
          conns.forEach((c) => {
            addConn(c.from, c.to, c.label, c.dashed);
          });
          if (conns.length) entry = conns[0].from;
        }

        addConn(decId, entry, branchLabel, false);

        const nestedLines = [];
        let depth = 1;
        i++;
        while (i < lines.length && depth > 0) {
          const bl = lines[i].trim();
          if (bl.includes("{")) depth++;
          if (bl.startsWith("}")) {
            depth--;
            if (depth === 0) break;
          }
          nestedLines.push(lines[i]);
          i++;
        }

        const closingLine = lines[i]?.trim() || "}";
        const jm = closingLine.match(/^\}\s*(->.*)?$/);
        const rawJoin = jm?.[1]?.replace(/^->/, "").trim() || "";

        const nestedBranches = parseBranchBlock(nestedLines, nestedDec);

        let tail = null;
        if (rawJoin) {
          const { joinEntry, joinTail } = resolveJoinStr(rawJoin);
          if (joinEntry) {
            nestedBranches.forEach((nb) => {
              if (nb.tail && nb.tail !== joinEntry)
                addConn(nb.tail, joinEntry, "", false);
            });
          }
          tail = joinTail;
        } else {
          const realTails = nestedBranches.filter((nb) => nb.tail !== null);
          tail = realTails[realTails.length - 1]?.tail || null;
        }

        branches.push({ label: branchLabel, entry, tail });
        i++;
        continue;
      }

      const { conns, trailingArrow } = parseChain(rest);
      const nodes = chainNodes(rest);
      let entry = nodes[0] || null;

      if (entry) {
        const immediateEntries = rest
          .split("->")[0]
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean);
        immediateEntries.forEach((ent) => {
          addConn(decId, ent, branchLabel, false);
          ensureNode(ent);
          touchOrder(ent);
        });
      }

      if (conns.length > 0) {
        conns.forEach((c) => addConn(c.from, c.to, c.label, c.dashed));
      }

      const tail = trailingArrow ? null : nodes[nodes.length - 1] || entry;
      if (tail) touchOrder(tail);

      branches.push({ label: branchLabel, entry, tail });
      i++;
    }
    return branches;
  }

  const rawLines = script.split(/\r?\n/);
  let bodyLines = rawLines.slice(1);

  const full = bodyLines.join("\n");
  const defMatch = full.match(/def\s*\{([^}]+)\}/s);
  if (defMatch) parseDef(defMatch[1]);

  let inDef = false;
  bodyLines = bodyLines.filter((line) => {
    const t = line.trim();
    if (t.match(/^def\s*\{/)) {
      inDef = true;
      return false;
    }
    if (inDef) {
      if (t === "}") inDef = false;
      return false;
    }
    return true;
  });

  let i = 0;
  while (i < bodyLines.length) {
    const line = bodyLines[i].trim();
    if (!line || line.startsWith("//")) {
      i++;
      continue;
    }

    const ssm = line.match(/^ss\s*:\s*(.+)$/i);
    if (ssm) {
      const val = ssm[1].trim();
      if (val === "true") model.ss = true;
      else if (val === "false") model.ss = false;
      else {
        const lbls = [...val.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
        if (lbls[0]) model.ssLabels.start = lbls[0];
        if (lbls[1]) model.ssLabels.end = lbls[1];
        model.ss = true;
      }
      i++;
      continue;
    }

    const themeMatch = line.match(/^theme\s*:\s*(\w+)/i);
    if (themeMatch) {
      model.theme = themeMatch[1];
      i++;
      continue;
    }

    const fontThemeMatch = line.match(/^fontTheme\s*:\s*(\w+)/i);
    if (fontThemeMatch) {
      model.fontTheme = fontThemeMatch[1];
      i++;
      continue;
    }

    const blockStart = line.match(/^(.*?)\s*(\w+)\s*\?\s*\{(.*)$/);
    if (blockStart) {
      const beforeChain = blockStart[1].trim();
      const decId = blockStart[2];

      ensureNode(decId, "decision");
      touchOrder(decId);

      if (beforeChain) {
        const structuralStr = beforeChain + " -> " + decId;
        const { conns } = parseChain(structuralStr);
        conns.forEach((c) => addConn(c.from, c.to, c.label, c.dashed));
      }

      const sameClose = line.match(
        /^(.*?)\s*(\w+)\s*\?\s*\{([^}]*)\}\s*(->.*)?$/,
      );
      if (sameClose) {
        const content = sameClose[3].trim();
        const rawJoin = sameClose[4]?.replace(/^->/, "").trim() || "";
        const tails2 = [];
        content.split(",").forEach((pair) => {
          const pm = pair.trim().match(/^(\w+)\s*:\s*(\w+)$/);
          if (pm) {
            addConn(decId, pm[2], pm[1], false);
            tails2.push(pm[2]);
          }
        });
        if (rawJoin) {
          const { joinEntry } = resolveJoinStr(rawJoin);
          if (joinEntry)
            tails2.forEach((t) => {
              if (t !== joinEntry) addConn(t, joinEntry, "", false);
            });
        }
        i++;
        continue;
      }

      const blockLines = [];
      let depth = 1;
      i++;
      while (i < bodyLines.length && depth > 0) {
        const bl = bodyLines[i].trim();
        if (bl.match(/\{/)) depth++;
        if (bl.startsWith("}")) {
          depth--;
          if (depth === 0) break;
        }
        blockLines.push(bodyLines[i]);
        i++;
      }

      const activeBranches = parseBranchBlock(blockLines, decId);

      const closingLine = bodyLines[i]?.trim() || "}";
      const jm = closingLine.match(/^\}\s*(->.*)?$/);
      const rawJoin = jm?.[1]?.replace(/^->/, "").trim() || "";
      if (rawJoin) {
        const { joinEntry } = resolveJoinStr(rawJoin);
        if (joinEntry) {
          activeBranches.forEach((b) => {
            if (b.tail !== null && b.tail !== joinEntry)
              addConn(b.tail, joinEntry, "", false);
          });
        }
      }
      i++;
      continue;
    }

    if (line.match(/(->|--+>)/)) {
      const { conns } = parseChain(line);
      conns.forEach((c) => {
        addConn(c.from, c.to, c.label, c.dashed);
      });
      i++;
      continue;
    }

    i++;
  }

  if (model.ss) {
    const allIds = Object.keys(model.nodes);
    const orderedIds = [
      ...bodyOrder.filter((id) => allIds.includes(id)),
      ...allIds.filter((id) => !bodyOrder.includes(id)),
    ];

    const beSet = new Set();
    {
      const color = {};
      orderedIds.forEach((id) => {
        color[id] = 0;
      });
      function dfs(u) {
        color[u] = 1;
        model.connections.forEach(({ from, to }) => {
          if (from !== u) return;
          if (color[to] === 1) beSet.add(u + "§" + to);
          else if (color[to] === 0) dfs(to);
        });
        color[u] = 2;
      }
      orderedIds.forEach((id) => {
        if (color[id] === 0) dfs(id);
      });
    }

    const fwdFroms = new Set();
    const fwdTos = new Set();
    model.connections.forEach(({ from, to }) => {
      if (beSet.has(from + "§" + to)) return;
      fwdFroms.add(from);
      fwdTos.add(to);
    });

    const roots = [...fwdFroms].filter((id) => !fwdTos.has(id));
    const leafs = [...fwdTos].filter((id) => !fwdFroms.has(id));

    const sid = "__ss_start__";
    const eid = "__ss_end__";
    model.nodes[sid] = { type: "startstop", label: model.ssLabels.start };
    model.nodes[eid] = { type: "startstop", label: model.ssLabels.end };
    roots.forEach((id) =>
      model.connections.unshift({
        from: sid,
        to: id,
        label: "",
        dashed: false,
      }),
    );
    leafs.forEach((id) =>
      model.connections.push({ from: id, to: eid, label: "", dashed: false }),
    );
  }

  return model;
}
