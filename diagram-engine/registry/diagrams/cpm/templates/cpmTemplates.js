/**
 * cpmTemplates.js
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

export const cpmTemplates = {
  node(x, y, data) {
    const isCrit = data.isCritical;
    const borderColor = isCrit ? "#ff4d4d" : "#000";
    const borderWidth = isCrit ? "2.5" : "1";
    return `
    <g class="cpm-node" transform="translate(${x}, ${y})">
      <rect x="0"   y="0"  width="40"  height="30" fill="#f1f5f9" stroke="black" stroke-width="1"/>
      <rect x="40"  y="0"  width="40"  height="30" fill="#e2e8f0" stroke="black" stroke-width="1"/>
      <rect x="80"  y="0"  width="40"  height="30" fill="#f1f5f9" stroke="black" stroke-width="1"/>
      <text x="20"  y="20" text-anchor="middle" font-size="11" font-family="monospace">${data.es}</text>
      <text x="60"  y="20" text-anchor="middle" font-size="11" font-family="monospace" font-weight="bold">${data.duration}</text>
      <text x="100" y="20" text-anchor="middle" font-size="11" font-family="monospace">${data.ef}</text>
      <rect x="0" y="30" width="120" height="40" fill="white"
            stroke="${borderColor}" stroke-width="${borderWidth}"/>
      <text x="60" y="55" text-anchor="middle" font-size="13" font-family="sans-serif" font-weight="800">${data.id}</text>
      <rect x="0"  y="70" width="40"  height="30" fill="#f1f5f9" stroke="black" stroke-width="1"/>
      <rect x="40" y="70" width="40"  height="30"
            fill="${isCrit ? "#fee2e2" : "#f1f5f9"}" stroke="black" stroke-width="1"/>
      <rect x="80" y="70" width="40"  height="30" fill="#f1f5f9" stroke="black" stroke-width="1"/>
      <text x="20"  y="90" text-anchor="middle" font-size="11" font-family="monospace">${data.ls}</text>
      <text x="60"  y="90" text-anchor="middle" font-size="11" font-family="monospace"
            fill="${isCrit ? "#ff4d4d" : "black"}">${data.slack}</text>
      <text x="100" y="90" text-anchor="middle" font-size="11" font-family="monospace">${data.lf}</text>
    </g>`;
  },
};

export const aoaTemplates = {
  milestone(x, y, data) {
    const r = 30;
    return `
    <g class="milestone" transform="translate(${x}, ${y})">
      <circle cx="0" cy="0" r="${r}" fill="white" stroke="black" stroke-width="2"/>
      <line x1="0" y1="${-r}" x2="0" y2="${r}" stroke="black" stroke-width="1.5"/>
      <line x1="0" y1="0" x2="${r}" y2="0" stroke="black" stroke-width="1"/>
      <text x="${-r / 2}" y="5" text-anchor="middle" font-size="14" font-weight="bold" font-family="sans-serif">${data.id}</text>
      <text x="${r / 2}" y="-6" text-anchor="middle" font-size="11" font-family="monospace">${data.es}</text>
      <text x="${r / 2}" y="16" text-anchor="middle" font-size="11" font-family="monospace">${data.ls}</text>
    </g>`;
  },

  activityArrow(start, end, label, duration, isCrit) {
    const r = 30;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const sx = start.x + ux * r;
    const sy = start.y + uy * r;
    const ex = end.x - ux * r;
    const ey = end.y - uy * r;

    const color = isCrit ? "#ff4d4d" : "#4b5563";
    const sw = isCrit ? "2.5" : "1.5";
    const markerId = `arrowhead-${isCrit ? "critical" : "normal"}`;
    const mx = (sx + ex) / 2;
    const my = (sy + ey) / 2;
    const perpX = -uy * 14;
    const perpY = ux * 14;

    return `
    <g class="activity-arrow">
      <path d="M ${sx} ${sy} L ${ex} ${ey}"
            stroke="${color}" stroke-width="${sw}" fill="none"
            marker-end="url(#${markerId})"/>
      <text x="${mx + perpX}" y="${my + perpY - 4}" text-anchor="middle"
            font-family="sans-serif" font-weight="bold" font-size="13" fill="black">${label}</text>
      <text x="${mx + perpX}" y="${my + perpY + 12}" text-anchor="middle"
            font-family="monospace" font-size="11" fill="#555">${duration}</text>
    </g>`;
  },

  dummyArrow(start, end) {
    const r = 30;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const sx = start.x + ux * r;
    const sy = start.y + uy * r;
    const ex = end.x - ux * r;
    const ey = end.y - uy * r;

    return `
    <g class="dummy-arrow">
      <path d="M ${sx} ${sy} L ${ex} ${ey}"
            stroke="#9ca3af" stroke-width="1.5" fill="none"
            stroke-dasharray="6,4"
            marker-end="url(#arrowhead-dummy)"/>
    </g>`;
  },
};
