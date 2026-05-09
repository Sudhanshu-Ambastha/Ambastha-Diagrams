/**
 * sequenceTemplates.js
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

export const sequenceTemplates = {
  participant(x, y, label, type, actorSVG) {
    if (type === "actor" && actorSVG) {
      return `<g class="seq-participant" transform="translate(${x},${y})">${actorSVG}</g>`;
    }
    return `
  <g class="seq-participant">
    <rect x="${x - 50}" y="${y - 20}" width="100" height="34" rx="4"
          fill="#dbeafe" stroke="#1e40af" stroke-width="1.5"/>
    <text x="${x}" y="${y + 3}" text-anchor="middle" font-family="sans-serif"
          font-size="12" font-weight="bold" fill="#1e293b">${label}</text>
  </g>`;
  },

  lifeline(x, topY, bottomY) {
    return `<line x1="${x}" y1="${topY}" x2="${x}" y2="${bottomY}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="5,4"/>`;
  },

  activation(x, y, height) {
    return `<rect x="${x - 5}" y="${y}" width="10" height="${Math.max(height, 8)}" fill="#bfdbfe" stroke="#1e40af" stroke-width="1" rx="1"/>`;
  },

  message(fromX, toX, y, text, type) {
    const isSelf = fromX === toX;
    const color =
      type === "reply" || type === "asyncReply" ? "#64748b" : "#1e293b";
    const dash =
      type === "reply" || type === "asyncReply" ? 'stroke-dasharray="6,3"' : "";
    const openHead = type === "async" || type === "asyncReply";
    let arrowHead, path;

    if (isSelf) {
      const rx = fromX + 50;
      path = `M ${fromX} ${y} L ${rx} ${y} L ${rx} ${y + 30} L ${toX} ${y + 30}`;
      arrowHead = `<polygon points="${toX},${y + 27} ${toX + 8},${y + 30} ${toX},${y + 33}" fill="${color}"/>`;
    } else {
      const dir = toX > fromX ? 1 : -1;
      path = `M ${fromX} ${y} L ${toX} ${y}`;
      arrowHead = openHead
        ? `<path d="M ${toX - dir * 10} ${y - 5} L ${toX} ${y} L ${toX - dir * 10} ${y + 5}" stroke="${color}" stroke-width="1.5" fill="none"/>`
        : `<polygon points="${toX},${y} ${toX - dir * 10},${y - 5} ${toX - dir * 10},${y + 5}" fill="${color}"/>`;
    }

    return `
  <g class="seq-message">
    <path d="${path}" stroke="${color}" stroke-width="1.5" fill="none" ${dash}/>
    ${arrowHead}
    <text x="${isSelf ? fromX + 58 : (fromX + toX) / 2}" y="${isSelf ? y + 18 : y - 6}" 
          text-anchor="middle" font-family="sans-serif" font-size="11" fill="${color}">${text}</text>
  </g>`;
  },

  frame(x, y, width, height, type, label, sections) {
    const isStandardFrame = ["alt", "loop", "opt", "ref", "sd"].includes(type);
    let out = `
  <g class="seq-frame">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="#94a3b8" stroke-width="1.5" rx="2"/>
    <path d="M ${x} ${y} L ${x + 65} ${y} L ${x + 75} ${y + 18} L ${x} ${y + 18} Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
    <text x="${x + 6}" y="${y + 13}" font-family="sans-serif" font-size="11" fill="#1e293b">
      <tspan font-weight="bold">${type}</tspan>${isStandardFrame ? " frame" : ""}
    </text>
    ${label ? `<text x="${x + 80}" y="${y + 13}" font-family="sans-serif" font-size="11" font-style="italic" fill="#475569">[${label}]</text>` : ""}`;

    (sections || []).slice(1).forEach((s) => {
      out += `<line x1="${x}" y1="${s.y}" x2="${x + width}" y2="${s.y}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,3"/>
              ${s.label ? `<text x="${x + 4}" y="${s.y + 12}" font-family="sans-serif" font-size="10" font-style="italic" fill="#64748b">[${s.label}]</text>` : ""}`;
    });
    return out + `</g>`;
  },

  note(x, y, w, text, noteRenderer) {
    return noteRenderer(x, y, text);
  },

  divider(x1, x2, y, text) {
    return `
  <g class="seq-divider">
    <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="8,4"/>
    ${
      text
        ? `<rect x="${(x1 + x2) / 2 - text.length * 4}" y="${y - 9}" width="${text.length * 8}" height="16" rx="3" fill="white" stroke="#94a3b8" stroke-width="1"/>
              <text x="${(x1 + x2) / 2}" y="${y + 4}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">${text}</text>`
        : ""
    }
  </g>`;
  },
};
