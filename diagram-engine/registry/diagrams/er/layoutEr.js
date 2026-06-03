/**
 * layoutEr.js
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

const ENTITY_W = 160;
const ENTITY_PAD = 18;
const ATTR_H = 22;
const HEADER_H = 32;
const COL_GAP = 140;
const ROW_GAP = 120;
const PADDING = 80;

function entityHeight(entity) {
  const attrRows = entity.attrs.length;
  return HEADER_H + attrRows * ATTR_H + (attrRows > 0 ? ENTITY_PAD : 0);
}

export function layoutERD(db) {
  const positions = {};
  const names = db.entityOrder;

  if (names.length === 0) {
    return { positions, width: 600, height: 300 };
  }

  const adj = {};
  names.forEach((n) => {
    adj[n] = [];
  });
  db.relations.forEach((r) => {
    if (adj[r.from]) adj[r.from].push(r.to);
    if (adj[r.to]) adj[r.to].push(r.from);
  });

  const layer = {};
  const queue = [names[0]];
  layer[names[0]] = 0;
  while (queue.length) {
    const cur = queue.shift();
    (adj[cur] || []).forEach((nb) => {
      if (layer[nb] === undefined) {
        layer[nb] = layer[cur] + 1;
        queue.push(nb);
      }
    });
  }
  names.forEach((n) => {
    if (layer[n] === undefined) layer[n] = 0;
  });

  const byLayer = {};
  names.forEach((n) => {
    const l = layer[n];
    (byLayer[l] = byLayer[l] || []).push(n);
  });
  const layerNums = Object.keys(byLayer)
    .map(Number)
    .sort((a, b) => a - b);

  let rawY = 0;

  for (const l of layerNums) {
    const group = byLayer[l];
    const n = group.length;
    const maxH = Math.max(
      ...group.map((name) => entityHeight(db.entities[name])),
    );

    const rowCY = rawY + maxH / 2;
    const rowW = n * ENTITY_W + (n - 1) * COL_GAP;
    const rowStartX = -rowW / 2;

    group.forEach((name, i) => {
      const h = entityHeight(db.entities[name]);
      const cx = rowStartX + i * (ENTITY_W + COL_GAP) + ENTITY_W / 2;
      positions[name] = {
        x: cx,
        y: rowCY,
        w: ENTITY_W,
        h,
      };
    });

    rawY += maxH + ROW_GAP;
  }

  const allPos = Object.values(positions);
  const rawMinX = Math.min(...allPos.map((p) => p.x - p.w / 2));
  const rawMaxX = Math.max(...allPos.map((p) => p.x + p.w / 2));
  const rawMinY = Math.min(...allPos.map((p) => p.y - p.h / 2));
  const rawMaxY = Math.max(...allPos.map((p) => p.y + p.h / 2));
  const diagramW = rawMaxX - rawMinX;
  const diagramH = rawMaxY - rawMinY;
  const shiftX = PADDING - rawMinX;
  const shiftY = PADDING - rawMinY;

  Object.values(positions).forEach((p) => {
    p.x += shiftX;
    p.y += shiftY;
  });

  const canvasW = Math.max(diagramW + PADDING * 2, 600);
  const canvasH = Math.max(diagramH + PADDING * 2, 400);

  return { positions, width: canvasW, height: canvasH };
}
