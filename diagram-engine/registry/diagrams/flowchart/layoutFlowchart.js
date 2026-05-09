/**
 * layoutFlowchart.js
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

export function layoutFlowchart(model) {
  const positions = {};
  const ids = Object.keys(model.nodes);
  if (ids.length === 0) return { positions, width: 800, height: 200 };

  const backEdgeSet = new Set();
  {
    const color = {};
    ids.forEach((id) => {
      color[id] = 0;
    });
    function dfs(u) {
      color[u] = 1;
      model.connections.forEach(({ from, to }) => {
        if (from !== u) return;
        if (color[to] === 1) backEdgeSet.add(u + "§" + to);
        else if (color[to] === 0) dfs(to);
      });
      color[u] = 2;
    }
    ids.forEach((id) => {
      if (color[id] === 0) dfs(id);
    });
  }

  const forwardChildren = {};
  const forwardParents = {};
  ids.forEach((id) => {
    forwardChildren[id] = [];
    forwardParents[id] = [];
  });
  model.connections.forEach(({ from, to }) => {
    if (backEdgeSet.has(from + "§" + to)) return;
    forwardChildren[from].push(to);
    forwardParents[to].push(from);
  });

  const layer = {};
  ids.forEach((id) => {
    if (layer[id] !== undefined) return;
    const visited = new Set();
    function _lay(n) {
      if (layer[n] !== undefined) return layer[n];
      if (visited.has(n)) return 0;
      visited.add(n);
      if (forwardParents[n].length === 0) {
        layer[n] = 0;
        return 0;
      }
      layer[n] = Math.max(...forwardParents[n].map(_lay)) + 1;
      return layer[n];
    }
    _lay(id);
  });

  if (model.nodes["__ss_start__"] !== undefined) {
    const layer0 = ids.filter((id) => (layer[id] ?? 0) === 0);
    const nonStart = layer0.filter((id) => id !== "__ss_start__");
    if (nonStart.length > 0) {
      ids.forEach((id) => {
        if (id !== "__ss_start__") layer[id] = (layer[id] ?? 0) + 1;
      });
    }
  }

  const byLayer = {};
  ids.forEach((id) => {
    const l = layer[id] ?? 0;
    if (!byLayer[l]) byLayer[l] = [];
    byLayer[l].push(id);
  });
  const layerNums = Object.keys(byLayer)
    .map(Number)
    .sort((a, b) => a - b);

  for (let iter = 0; iter < 2; iter++) {
    for (const l of layerNums) {
      if (l === 0) continue;
      const nodesInRow = byLayer[l] || [];

      const getBarycenter = (id) => {
        const parents = forwardParents[id] || [];
        if (parents.length === 0) return 0;
        const parentPositions = parents.map((pId) => {
          const prevRow = byLayer[layer[pId]] || [];
          const idx = prevRow.indexOf(pId);
          return idx === -1 ? 0 : idx;
        });
        return parentPositions.reduce((a, b) => a + b, 0) / parents.length;
      };

      nodesInRow.sort((a, b) => getBarycenter(a) - getBarycenter(b));
    }
  }

  const NODE_H = { startstop: 44, decision: 80, io: 44, process: 40 };
  const nodeH = (id) => NODE_H[model.nodes[id]?.type] ?? 40;

  const HORIZONTAL_GAP = 260;
  const VERTICAL_GAP = 70;

  const centerX = 1000;
  let currentY = 10;

  for (let idx = 0; idx < layerNums.length; idx++) {
    const l = layerNums[idx];
    const group = byLayer[l] || [];
    const n = group.length;

    const maxRowH = Math.max(...group.map(nodeH));

    group.forEach((id, i) => {
      if (n === 1) {
        positions[id] = { x: centerX, y: currentY + maxRowH / 2 };
      } else {
        const offset = (i - (n - 1) / 2) * HORIZONTAL_GAP;
        positions[id] = { x: centerX + offset, y: currentY + maxRowH / 2 };
      }
    });

    currentY += maxRowH + VERTICAL_GAP;
  }

  const allX = Object.values(positions).map((p) => p.x);
  const allY = Object.values(positions).map((p) => p.y);

  const minX = Math.min(...allX) - 200;
  const maxX = Math.max(...allX) + 200;
  const minY = Math.min(...allY) - 100;
  const maxY = Math.max(...allY) + 150;

  const calculatedWidth = maxX - minX;
  const calculatedHeight = maxY - minY;

  ids.forEach((id) => {
    positions[id].x = positions[id].x - minX;
    positions[id].y = positions[id].y - minY;
  });

  return {
    positions,
    width: Math.max(calculatedWidth, 800),
    height: Math.max(calculatedHeight, 400),
    backEdgeSet,
  };
}
