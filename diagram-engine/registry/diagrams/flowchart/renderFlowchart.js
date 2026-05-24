/**
 * renderFlowchart.js
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

import { flowchartTemplates } from "./templates/flowchartTemplates.js";
import { AbdDefs } from "../../utils/defs.js";

const BOUNDS = {
  startstop: { hw: 70, hh: 22 },
  process: { hw: 70, hh: 20 },
  io: { hw: 80, hh: 20 },
  decision: { hw: 80, hh: 50 },
};

function getBorderPoint(type, center, toward) {
  const { hw, hh } = BOUNDS[type] || { hw: 70, hh: 20 };
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  if (!dx && !dy) return { x: center.x, y: center.y + hh };

  if (type === "decision") {
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const t = 1 / (absDx / hw + absDy / hh);
    return {
      x: center.x + Math.sign(dx) * absDx * t,
      y: center.y + Math.sign(dy) * absDy * t,
    };
  }
  const tH = hh / (Math.abs(dy) || 0.0001);
  const tW = hw / (Math.abs(dx) || 0.0001);
  if (tH <= tW) {
    return { x: center.x + dx * tH, y: center.y + (dy > 0 ? hh : -hh) };
  }
  return { x: center.x + (dx > 0 ? hw : -hw), y: center.y + dy * tW };
}

function buildParentCount(model) {
  const count = {};
  model.connections.forEach(({ to }) => {
    count[to] = (count[to] || 0) + 1;
  });
  return count;
}

export function renderFlowchart(model, layout, theme) {
  const parentCount = buildParentCount(model);
  const backEdgeSet = layout.backEdgeSet || new Set();
  let shapes = "",
    connectors = "";

  Object.keys(model.nodes).forEach((id) => {
    const { type, label, style } = model.nodes[id];
    const pos = layout.positions[id];
    if (!pos) return;
    switch (type) {
      case "startstop":
        shapes += flowchartTemplates.startstop(pos.x, pos.y, label, style);
        break;
      case "process":
        shapes += flowchartTemplates.process(pos.x, pos.y, label, style);
        break;
      case "decision":
        shapes += flowchartTemplates.decision(pos.x, pos.y, label, style);
        break;
      case "io":
        shapes += flowchartTemplates.io(pos.x, pos.y, label, style);
        break;
    }
  });

  model.connections.forEach((conn) => {
    const fromPos = layout.positions[conn.from];
    const toPos = layout.positions[conn.to];
    if (!fromPos || !toPos) return;

    const fromType = model.nodes[conn.from]?.type || "process";
    const toType = model.nodes[conn.to]?.type || "process";
    const dashed = conn.dashed || false;
    const isBack = backEdgeSet.has(conn.from + "§" + conn.to);
    const isMerge = (parentCount[conn.to] || 0) > 1;
    const dx = toPos.x - fromPos.x;

    if (isBack) {
      const sx = fromPos.x - (BOUNDS[fromType]?.hw || 70);
      const sy = fromPos.y;
      const ex = toPos.x - (BOUNDS[toType]?.hw || 70);
      const ey = toPos.y;
      const cx = Math.min(sx, ex) - 50;
      connectors += `
      <g class="flow-connector">
        <path d="M ${sx} ${sy} C ${cx} ${sy}, ${cx} ${ey}, ${ex} ${ey}"
              stroke="#999" stroke-width="1.5" fill="none" stroke-dasharray="5,3"
              marker-end="url(#arrow-open)"/>
        ${
          conn.label
            ? `<text x="${cx - 6}" y="${(sy + ey) / 2 + 4}"
              text-anchor="end" font-size="10" font-family="Helvetica" fill="#666">${conn.label}</text>`
            : ""
        }
      </g>`;
      return;
    }

    if (Math.abs(dx) < 10) {
      const s = { x: fromPos.x, y: fromPos.y + (BOUNDS[fromType]?.hh || 20) };
      const e = { x: toPos.x, y: toPos.y - (BOUNDS[toType]?.hh || 20) };
      connectors += flowchartTemplates.connector(
        s.x,
        s.y,
        e.x,
        e.y,
        conn.label,
        dashed,
      );
    } else if (isMerge || conn.label) {
      const sx = fromPos.x;
      const sy = fromPos.y + (BOUNDS[fromType]?.hh || 20);
      const ex = toPos.x;
      const ey = toPos.y - (BOUNDS[toType]?.hh || 20);
      connectors += flowchartTemplates.elbowConnector(
        sx,
        sy,
        ex,
        ey,
        conn.label,
        dashed,
      );
    } else {
      const s = getBorderPoint(fromType, fromPos, toPos);
      const e = getBorderPoint(toType, toPos, fromPos);
      connectors += flowchartTemplates.connector(
        s.x,
        s.y,
        e.x,
        e.y,
        conn.label,
        dashed,
      );
    }
  });

  return `
    <svg width="${layout.width}" height="${layout.height}"
         xmlns="http://www.w3.org/2000/svg" style="background:#fff;">
      ${AbdDefs.generate(theme)}
      ${connectors}
      ${shapes}
    </svg>`;
}
