/**
 * usecaseTemplates.js
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

export const templates = {
  actor(x, y, label) {
    return `
    <g class="actor">
      <circle cx="${x}" cy="${y - 50}" r="6" fill="#61c1ed" stroke="black" stroke-width="1"/>
      <line x1="${x}" y1="${y - 44}" x2="${x}" y2="${y - 20}" stroke="black" stroke-width="1"/>
      <line x1="${x - 15}" y1="${y - 35}" x2="${x + 15}" y2="${y - 35}" stroke="black" stroke-width="1"/>
      <line x1="${x}" y1="${y - 20}" x2="${x - 15}" y2="${y - 5}" stroke="black" stroke-width="1"/>
      <line x1="${x}" y1="${y - 20}" x2="${x + 15}" y2="${y - 5}" stroke="black" stroke-width="1"/>
      <text x="${x}" y="${y + 15}" text-anchor="middle" font-size="12" font-family="Helvetica" font-weight="bold">${label}</text>
    </g>
    `;
  },

  useCase(x, y, label) {
    return `
    <g class="usecase">
      <ellipse cx="${x}" cy="${y}" rx="70" ry="25" fill="#61c1ed" stroke="black" stroke-width="1"/>
      <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="11" font-family="Helvetica" font-weight="bold" fill="black">
        ${label}
      </text>
    </g>
    `;
  },

  systemBoundary(x, y, width, height, label) {
    return `
    <g class="system-boundary">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#61c1ed" stroke="#000" stroke-width="2"/>
      <text x="${x + width / 2}" y="${y + 30}" text-anchor="middle" font-size="18" font-family="Helvetica" font-weight="bold">${label}</text>
    </g>
    `;
  },

  note(x, y, label) {
    return `
    <g class="note">
      <path d="M ${x} ${y} L ${x + 80} ${y} L ${x + 100} ${y + 20} L ${x + 100} ${y + 60} L ${x} ${y + 60} Z" fill="#61c1ed" stroke="black"/>
      <path d="M ${x + 80} ${y} L ${x + 80} ${y + 20} L ${x + 100} ${y + 20} Z" fill="#ffffff" stroke="black"/>
      <text x="${x + 50}" y="${y + 35}" text-anchor="middle" font-size="10" font-family="Helvetica" font-weight="bold">${label}</text>
    </g>
    `;
  },

  dashedOval(x, y, label) {
    return `
    <g class="dashed-oval">
      <ellipse cx="${x}" cy="${y}" rx="70" ry="30" fill="#61c1ed" stroke="black" stroke-width="1.5" stroke-dasharray="5,5"/>
      <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="12" font-family="Helvetica" font-weight="bold">${label}</text>
    </g>
    `;
  },

  externalSystem(x, y, label) {
    const lines = wrapText(label, 140);
    const boxHeight = 40 + (lines.length - 1) * 15;

    return `
  <g class="external-system">
    <rect x="${x}" y="${y}" width="160" height="${boxHeight}" fill="#61c1ed" stroke="black"/>
    ${lines.map((line, i) => `<text x="${x + 80}" y="${y + 20 + i * 15}" text-anchor="middle" font-size="12" font-family="Helvetica" font-weight="bold">${line}</text>`).join("")}
    </g>
    `;
  },

  connector(x1, y1, x2, y2, type, fromId, toId, model) {
    const isRel = type === "include" || type === "extend";
    const isDashed =
      isRel ||
      type === "dependency" ||
      type === "realization" ||
      type === "anchor";
    const isDotted = type === "constraint";

    if (type === "anchor") {
      const isFromValid =
        model.notes[fromId] || model.externalSystems?.[fromId];
      const isToValid = model.notes[toId] || model.externalSystems?.[toId];
      if (!isFromValid && !isToValid) {
        console.error(
          "Anchor connection only allowed between System/External System and Notes",
        );
        return "";
      }
    }

    if (type === "containment") {
      const isSystem = model.systemBoundary?.id === fromId;
      const isToOvalOrNote = model.usecases[toId] || model.notes[toId];
      if (!isSystem || !isToOvalOrNote) {
        console.error(
          "Containment only allowed from System Boundary to UseCase or Note",
        );
        return "";
      }
    }

    let markerId = "none";
    if (isRel || type === "dependency") markerId = "arrow-open";
    if (type === "generalization" || type === "realization")
      markerId = "arrow-hollow";
    if (type === "containment") markerId = "arrow-diamond";

    let d;
    let labelX, labelY;

    const needsCurve =
      isRel ||
      [
        "dependency",
        "realization",
        "generalization",
        "containment",
        "constraint",
      ].includes(type);

    if (needsCurve) {
      const startX = x1 + 70;
      const endX = x2 + 70;
      const ctrlX = Math.max(startX, endX) + 60;
      const ctrlY = (y1 + y2) / 2;
      d = `M ${startX} ${y1} Q ${ctrlX} ${ctrlY} ${endX} ${y2}`;
      labelX = Math.max(startX, endX) + 40;
      labelY = (y1 + y2) / 2;
    } else {
      let startX = x1;
      let endX = x2;
      if (x1 < x2) {
        startX = x1;
        endX = x2 - 70;
      } else {
        startX = x1;
        endX = x2 + 70;
      }
      d = `M ${startX} ${y1} L ${endX} ${y2}`;
    }

    let strokeDash = "";
    if (isDashed) strokeDash = 'stroke-dasharray="5,5"';
    if (isDotted) strokeDash = 'stroke-dasharray="2,2"';
    const showLabel = isRel;

    return `
      <g class="connector" data-type="${type}">
        <path d="${d}" stroke="black" stroke-width="1.2" fill="none" ${strokeDash} marker-end="url(#${markerId})"/>
        ${
          showLabel
            ? `
          <text x="${labelX}" y="${labelY}" text-anchor="start" font-size="10" font-family="Helvetica" font-style="italic" fill="#000" font-weight="bold">
            «${type}»
          </text>`
            : ""
        }
      </g>
    `;
  },
};
