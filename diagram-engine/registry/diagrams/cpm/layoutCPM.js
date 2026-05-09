/**
 * layoutCPM.js
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

export function layoutCPM(model) {
  const positions = {};
  const levels = {};
  const nodeLevels = {};
  const isAoA = model.type === "aoa";
  const marginX = 100;
  const marginY = 100;

  if (isAoA) {
    const mapping = model.getAoAMapping();
    const allEdges = [
      ...mapping.arrows.map((a) => ({ from: a.from, to: a.to })),
      ...mapping.dummies.map((d) => ({ from: d.from, to: d.to })),
    ];

    nodeLevels["m_start"] = 0;
    let changed = true;
    while (changed) {
      changed = false;
      allEdges.forEach((e) => {
        const fromLvl = nodeLevels[e.from] ?? 0;
        const newLvl = fromLvl + 1;
        if ((nodeLevels[e.to] ?? -1) < newLvl) {
          nodeLevels[e.to] = newLvl;
          changed = true;
        }
      });
    }

    Object.entries(nodeLevels).forEach(([id, lvl]) => {
      if (!levels[lvl]) levels[lvl] = [];
      levels[lvl].push(id);
    });
  } else {
    model.getSortedNodes().forEach((n) => {
      const lvl =
        n.predecessors.length > 0
          ? Math.max(...n.predecessors.map((p) => (nodeLevels[p] ?? 0) + 1))
          : 0;
      nodeLevels[n.id] = lvl;
      if (!levels[lvl]) levels[lvl] = [];
      levels[lvl].push(n.id);
    });
  }

  const xSp = isAoA ? 220 : 220;
  const ySp = isAoA ? 130 : 160;

  let maxNodes = 0;
  const sortedLevels = Object.keys(levels).sort((a, b) => +a - +b);
  sortedLevels.forEach((lvl) => {
    const col = levels[lvl];
    maxNodes = Math.max(maxNodes, col.length);
    col.forEach((id, i) => {
      positions[id] = {
        x: marginX + +lvl * xSp,
        y: marginY + i * ySp,
      };
    });
  });

  return {
    positions,
    width: sortedLevels.length * xSp + marginX * 2,
    height: maxNodes * ySp + marginY * 2,
  };
}
