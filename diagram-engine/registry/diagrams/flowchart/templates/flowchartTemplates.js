/**
 * flowchartTemplates.js
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

import { wrapText } from "../../../utils/textWrap.js";

export const flowchartTemplates = {
  startstop(x, y, label, style = {}) {
    const fill = style.fill || "#61c1ed";
    const stroke = style.stroke || "black";
    const color = style.color || "black";
    const sw = style.width || 1.5;
    return `
    <g class="flow-startstop">
      <ellipse cx="${x}" cy="${y}" rx="70" ry="22"
               fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
      <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11"
            font-family="Helvetica" font-weight="bold" fill="${color}">${label}</text>
    </g>`;
  },

  io(x, y, label, style = {}) {
    const fill = style.fill || "#61c1ed";
    const stroke = style.stroke || "black";
    const color = style.color || "black";
    const sw = style.width || 1.5;
    const lines = wrapText(label, 90);
    const h = 40,
      w = 120,
      skew = 20;
    const pts = `${x - w / 2 + skew},${y - h / 2} ${x + w / 2 + skew},${y - h / 2} ${x + w / 2 - skew},${y + h / 2} ${x - w / 2 - skew},${y + h / 2}`;
    return `
    <g class="flow-io">
      <polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
      ${lines
        .map(
          (line, i) => `
        <text x="${x}" y="${y - (lines.length - 1) * 7 + 4 + i * 14}"
              text-anchor="middle" font-size="11" font-family="Helvetica"
              font-weight="bold" fill="${color}">${line}</text>`,
        )
        .join("")}
    </g>`;
  },

  process(x, y, label, style = {}) {
    const fill = style.fill || "#61c1ed";
    const stroke = style.stroke || "black";
    const color = style.color || "black";
    const sw = style.width || 1.5;
    const lines = wrapText(label, 120);
    const boxW = 140;
    const boxH = Math.max(40, lines.length * 14 + 16);
    return `
    <g class="flow-process">
      <rect x="${x - boxW / 2}" y="${y - boxH / 2}" width="${boxW}" height="${boxH}"
            fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="4"/>
      ${lines
        .map(
          (line, i) => `
        <text x="${x}" y="${y - (lines.length - 1) * 7 + 4 + i * 14}"
              text-anchor="middle" font-size="11" font-family="Helvetica"
              font-weight="bold" fill="${color}">${line}</text>`,
        )
        .join("")}
    </g>`;
  },

  decision(x, y, label, style = {}) {
    const fill = style.fill || "#61c1ed";
    const stroke = style.stroke || "black";
    const color = style.color || "black";
    const sw = style.width || 1.5;
    const lines = wrapText(label, 80);
    const hw = 80,
      hh = 50;
    return `
    <g class="flow-decision">
      <path d="M ${x} ${y - hh} L ${x + hw} ${y} L ${x} ${y + hh} L ${x - hw} ${y} Z"
            fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
      ${lines
        .map(
          (line, i) => `
        <text x="${x}" y="${y - (lines.length - 1) * 7 + 4 + i * 14}"
              text-anchor="middle" font-size="11" font-family="Helvetica"
              font-weight="bold" fill="${color}">${line}</text>`,
        )
        .join("")}
    </g>`;
  },

  connector(x1, y1, x2, y2, label, dashed = false) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dashAttr = dashed ? 'stroke-dasharray="6,3"' : "";
    return `
    <g class="flow-connector">
      <path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="black" stroke-width="1.5"
            fill="none" marker-end="url(#arrow-open)" ${dashAttr}/>
      ${
        label
          ? `
        <rect x="${midX - 15}" y="${midY - 9}" width="30" height="16"
              fill="white" rx="3" opacity="0.9"/>
        <text x="${midX}" y="${midY + 3}" text-anchor="middle" font-size="10"
              font-family="Helvetica" font-weight="bold" fill="#333">${label}</text>`
          : ""
      }
    </g>`;
  },

  elbowConnector(x1, y1, x2, y2, label, dashed = false) {
    const midY = (y1 + y2) / 2;
    const d = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
    const dashAttr = dashed ? 'stroke-dasharray="6,3"' : "";
    return `
    <g class="flow-connector">
      <path d="${d}" stroke="black" stroke-width="1.5" fill="none"
            marker-end="url(#arrow-open)" ${dashAttr}/>
      ${
        label
          ? `
        <text x="${(x1 + x2) / 2}" y="${midY - 4}" text-anchor="middle" font-size="10"
              font-family="Helvetica" font-weight="bold" fill="#333">${label}</text>`
          : ""
      }
    </g>`;
  },
};
