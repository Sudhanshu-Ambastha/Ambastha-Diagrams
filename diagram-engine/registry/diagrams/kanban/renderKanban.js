/**
 * renderKanban.js
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

import { T } from "./templates/kanbanTemplates.js";

const PALETTE = [
  "#ffe0b2",
  "#e1bee7",
  "#c8e6c9",
  "#d1c4e9",
  "#ffcdd2",
  "#fff9c4",
];

export function renderKanban(model, layout) {
  let svgContent = "";

  model.columns.forEach((columnSchema, colIdx) => {
    const colPos = layout.positions.columns[colIdx];
    svgContent += `
      <text x="${colPos.x + colPos.width / 2}" y="20" 
            font-family="sans-serif" font-weight="bold" font-size="14" 
            fill="#64748b" text-anchor="middle">
        ${columnSchema.title.toUpperCase()}
      </text>`;
  });

  layout.positions.swimlanes.forEach((lanePos, sIdx) => {
    const verticalOffset = lanePos.y + 15;
    svgContent += T.swimlaneHeader(
      lanePos.title,
      verticalOffset,
      layout.totalWidth,
    );

    const laneData = model.swimlanes[sIdx];

    model.columns.forEach((columnSchema, colIdx) => {
      const colPos = layout.positions.columns[colIdx];
      const colColor = columnSchema.color || PALETTE[colIdx % PALETTE.length];
      const tickets = laneData.rows[columnSchema.title] || [];
      const isOverLimit =
        columnSchema.limit && tickets.length > columnSchema.limit;
      const colHeight = lanePos.height - 40;

      svgContent += T.column(
        colPos.x,
        verticalOffset + 45,
        colPos.width,
        colHeight,
        "",
        colColor,
        isOverLimit,
      );

      tickets.forEach((ticket) => {
        const pos = layout.positions.tickets[ticket.id];
        if (pos) {
          svgContent += T.ticket(
            pos.x,
            pos.y + 15,
            pos.width,
            pos.height,
            ticket,
          );
        }
      });
    });
  });

  const finalHeight = layout.totalHeight + 40;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${layout.totalWidth}" height="${finalHeight}" viewBox="0 0 ${layout.totalWidth} ${finalHeight}">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#ffffff" />
      ${svgContent}
    </svg>
  `;
}
