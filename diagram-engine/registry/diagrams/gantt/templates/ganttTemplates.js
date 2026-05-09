/**
 * ganttTemplates.js
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

function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function darken(hex) {
  try {
    const h = hex.replace("#", "");

    const r = Math.max(0, parseInt(h.slice(0, 2), 16) - 50)
      .toString(16)
      .padStart(2, "0");

    const g = Math.max(0, parseInt(h.slice(2, 4), 16) - 50)
      .toString(16)
      .padStart(2, "0");

    const b = Math.max(0, parseInt(h.slice(4, 6), 16) - 50)
      .toString(16)
      .padStart(2, "0");

    return `#${r}${g}${b}`;
  } catch {
    return "#1e293b";
  }
}

export const ganttTemplates = {
  wrapper(width, height, title, content) {
    const titleH = title ? 40 : 10;
    return `<svg width="${width}" height="${height + titleH}" viewBox="0 0 ${width} ${height + titleH}" xmlns="http://www.w3.org/2000/svg" style="background:#fff; display:block;">
    ${title ? `<text x="${width / 2}" y="25" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1e293b">${title}</text>` : ""}
    <g transform="translate(0,${titleH})">${content}</g></svg>`;
  },

  grid(totalWidth, totalHeight, maxUnits, scale, startDate, view) {
    let out = `<rect x="0" y="0" width="${totalWidth}" height="25" fill="#f1f5f9"/>`;
    for (let u = 0; u <= maxUnits; u++) {
      const x = u * scale;
      out += `<line x1="${x}" y1="0" x2="${x}" y2="${totalHeight}" stroke="#e2e8f0" stroke-width="1"/>`;
      let label = view === "weeks" ? `Wk ${u + 1}` : `Day ${u}`;
      out += `<text x="${x + 5}" y="17" font-family="monospace" font-size="10" fill="#64748b">${label}</text>`;
    }
    return out;
  },

  groupOverlay(y, xStart, xEnd, label, rowHeight) {
    const barH = 10;
    const barY = y + (rowHeight - barH) / 2 + 5;
    const tipH = 12;
    const tipW = 15;
    const width = Math.max(xEnd - xStart, 50);

    return `
    <g class="gantt-group">
      <rect x="${xStart}" y="${barY}" width="${width}" height="${barH}" fill="#1e293b"/>
      <polygon points="${xStart},${barY + barH} ${xStart},${barY + barH + tipH} ${xStart + tipW},${barY + barH}" fill="#1e293b"/>
      <polygon points="${xStart + width},${barY + barH} ${xStart + width},${barY + barH + tipH} ${xStart + width - tipW},${barY + barH}" fill="#1e293b"/>
      <text x="${xStart + width / 2}" y="${barY + 8}" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="white">${label.toUpperCase()}</text>
    </g>`;
  },

  bar(
    x,
    y,
    width,
    id,
    isCritical,
    color,
    progress,
    startDate,
    endDate,
    rowHeight,
  ) {
    const barH = 24;
    const barY = y + (rowHeight - barH) / 2 + 5;
    const fill = color || (isCritical ? "#ef4444" : "#3b82f6");
    const progW = width * (progress / 100);

    return `
    <g class="gantt-bar">
      <rect x="${x}" y="${barY}" width="${width}" height="${barH}" rx="4" fill="${fill}" fill-opacity="0.9"/>
      ${progress > 0 ? `<rect x="${x}" y="${barY + barH - 6}" width="${progW}" height="3" fill="${darken(fill)}" rx="1.5"/>` : ""}
      <text x="${x + 8}" y="${barY + 16}" font-family="sans-serif" font-size="11" font-weight="bold" fill="white">${id}</text>
      <text x="${x + width + 8}" y="${barY + 16}" font-family="sans-serif" font-size="9" fill="#94a3b8">${startDate} → ${endDate}</text>
    </g>`;
  },

  milestone(x, y, label, color, rowHeight) {
    const cy = y + rowHeight / 2 + 5;
    return `
    <g class="gantt-milestone">
      <path d="M ${x} ${cy - 8} L ${x + 8} ${cy} L ${x} ${cy + 8} L ${x - 8} ${cy} Z" fill="${color || "#f59e0b"}"/>
      <text x="${x + 12}" y="${cy + 4}" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1e293b">${label}</text>
    </g>`;
  },

  milestoneLink(sx, sy, mx, my, color) {
    const lineWeight = 1.5;
    const strokeColor = color || "#f59e0b";
    return `
    <g class="milestone-link">
      <path d="M ${sx} ${sy} L ${mx} ${my}"
            stroke="${strokeColor}" 
            stroke-width="${lineWeight}" 
            fill="none" 
            stroke-dasharray="5,3" />
    </g>`;
  },

  link(sx, sy, ex, ey, isCritical) {
    const color = isCritical ? "#ef4444" : "#94a3b8";
    sy += 5;
    ey += 5;
    return `<path d="M ${sx} ${sy} L ${sx + 10} ${sy} L ${sx + 10} ${ey} L ${ex} ${ey}" stroke="${color}" stroke-width="1.5" fill="none" stroke-dasharray="3,2"/>`;
  },

  defs() {
    return `<defs><marker id="ms-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#f59e0b"/></marker></defs>`;
  },
};
