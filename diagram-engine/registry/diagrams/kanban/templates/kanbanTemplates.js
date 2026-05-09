/**
 * kanbanTemplates.js
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

function getPriorityColor(priority) {
  const map = {
    "Very High": "#ef4444",
    High: "#f97316",
    Medium: "#eab308",
    Low: "#22c55e",
  };
  return map[priority] || null;
}

export const T = {
  swimlaneHeader: (title, y, width) => `
    <g transform="translate(25, ${y})">
      <rect width="${width - 50}" height="40" rx="4" fill="#f1f5f9" />
      <text x="15" y="25" font-family="sans-serif" font-weight="bold" fill="#475569" font-size="16">== ${title} ==</text>
    </g>`,

  column: (x, y, width, height, title, color, isOverLimit) => {
    const bgColor = color || "#f8fafc";
    const borderColor = isOverLimit
      ? "#ef4444"
      : color
        ? "rgba(0,0,0,0.1)"
        : "#e2e8f0";

    return `
    <g class="kanban-column" transform="translate(${x}, ${y})">
      <rect width="${width}" height="${height}" rx="8" fill="${bgColor}" stroke="${borderColor}" stroke-width="${isOverLimit ? 3 : 1.5}" />
      <text x="15" y="30" font-family="sans-serif" font-weight="bold" fill="#1e293b">${title} ${isOverLimit ? "⚠️" : ""}</text>
    </g>`;
  },

  ticket: (x, y, width, height, data) => {
    const priorityColor = getPriorityColor(data.priority);
    return `
    <g class="kanban-ticket" transform="translate(${x}, ${y})">
      <rect width="${width}" height="${height}" rx="6" fill="#ffffff" stroke="#e2e8f0" filter="url(#shadow)" />
      ${priorityColor ? `<rect width="4" height="${height}" rx="2" fill="${priorityColor}" />` : ""}
      <text x="15" y="25" font-family="sans-serif" font-size="13" font-weight="600" fill="#334155">${data.title}</text>
      <text x="15" y="42" font-family="monospace" font-size="9" fill="#94a3b8">${data.id}</text>
      <text x="15" y="60" font-family="sans-serif" font-size="11" fill="#64748b">👤 ${data.owner || "unassigned"}</text>
      ${data.targetDate ? `<text x="15" y="78" font-family="sans-serif" font-size="10" font-weight="bold" fill="#6366f1">📅 ${data.targetDate}</text>` : ""}
    </g>`;
  },
};
