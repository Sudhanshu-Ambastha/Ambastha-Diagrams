/**
 * classTemplates.js
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

import { getRectEdgePoint } from "../../../utils/math.js";
export const classTemplates = {
  struct: (x, y, width, struct, theme = {}) => {
    const primary = theme?.primary || "#333";
    const titleH = 30;
    const itemH = 20;
    const attrH = struct.attributes.length * itemH;
    const methH = struct.methods.length * itemH;
    const totalH = titleH + attrH + methH + 10;

    const header = `
      <rect x="${x}" y="${y}" width="${width}" height="${totalH}"
            fill="white" stroke="${primary}" stroke-width="2" rx="3"/>
      <rect x="${x}" y="${y}" width="${width}" height="${titleH}"
            fill="#e8f0fe" stroke="${primary}" stroke-width="2" rx="3"/>
      <line x1="${x}" y1="${y + titleH}" x2="${x + width}" y2="${y + titleH}"
            stroke="${primary}" stroke-width="1"/>
      <text x="${x + width / 2}" y="${y + 20}" text-anchor="middle"
            font-weight="bold" font-family="monospace" font-size="13" fill="#111">${struct.name}</text>
    `;

    const attributes = struct.attributes
      .map(
        (attr, i) => `
      <text x="${x + 8}" y="${y + titleH + 15 + i * itemH}"
            font-family="monospace" font-size="12" fill="#222">${attr}</text>
    `,
      )
      .join("");

    const separator =
      attrH > 0
        ? `
      <line x1="${x}" y1="${y + titleH + attrH + 5}" x2="${x + width}" y2="${y + titleH + attrH + 5}"
            stroke="${primary}" stroke-width="1" stroke-dasharray="4,3"/>
    `
        : "";

    const methods = struct.methods
      .map(
        (meth, i) => `
      <text x="${x + 8}" y="${y + titleH + attrH + 18 + i * itemH}"
            font-family="monospace" font-size="12" font-style="italic" fill="#444">${meth}</text>
    `,
      )
      .join("");

    return `<g class="class-box">${header}${attributes}${separator}${methods}</g>`;
  },
  connector: (marker, fromId, toId, positions) => {
    const startPos = positions[fromId];
    const endPos = positions[toId];
    if (!startPos || !endPos) return "";

    const p1 = getRectEdgePoint(startPos, endPos);
    const p2 = getRectEdgePoint(endPos, startPos);

    const markerMap = {
      generalization: "url(#arrow-hollow)",
      containment: "url(#arrow-diamond)",
      dependency: "url(#arrow-open)",
      include: "url(#arrowhead)",
    };

    const isDashed = marker === "dependency" || marker === "include";
    const strokeDash = isDashed ? 'stroke-dasharray="5,5"' : "";
    const markerEnd = markerMap[marker] || "url(#arrowhead)";

    return `
      <g class="class-connector">
        <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" 
              stroke="black" stroke-width="1.2" fill="none" 
              ${strokeDash} marker-end="${markerEnd}"/>
      </g>
    `;
  },
};
