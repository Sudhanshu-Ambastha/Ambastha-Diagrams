/**
 * parseKanban.js
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

export function parseKanban(source) {
  const lines = source.split("\n");
  const board = {
    columns: [],
    swimlanes: [],
  };

  let currentSwimlane = null;
  let currentColumnName = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    if (trimmed.startsWith("==") && trimmed.endsWith("==")) {
      currentSwimlane = {
        title: trimmed.replace(/==/g, "").trim(),
        rows: {},
      };
      board.swimlanes.push(currentSwimlane);
    } else if (trimmed.endsWith(":")) {
      const headerRaw = trimmed.slice(0, -1);
      const colorMatch = headerRaw.match(/\((#[a-fA-F0-9]{3,6})\)/);
      const limitMatch = headerRaw.match(/\(limit:(\d+)\)/);

      const colName = headerRaw
        .replace(colorMatch ? colorMatch[0] : "", "")
        .replace(limitMatch ? limitMatch[0] : "", "")
        .trim();

      currentColumnName = colName;

      if (!board.columns.find((c) => c.title === colName)) {
        board.columns.push({
          title: colName,
          color: colorMatch ? colorMatch[1] : null,
          limit: limitMatch ? parseInt(limitMatch[1]) : null,
        });
      }

      if (!currentSwimlane) {
        currentSwimlane = { title: "General", rows: {} };
        board.swimlanes.push(currentSwimlane);
      }
      if (!currentSwimlane.rows[colName]) currentSwimlane.rows[colName] = [];
    } else if (trimmed.startsWith("|") && currentColumnName) {
      const parts = trimmed
        .split("|")
        .map((p) => p.trim())
        .filter((p, i, arr) => i !== 0 && i !== arr.length - 1);
      if (parts.length > 0) {
        currentSwimlane.rows[currentColumnName].push({
          title: parts[0],
          id: parts[1],
          priority: parts[2],
          owner: parts[3],
          targetDate: parts[4] || null,
        });
      }
    }
  });

  return board;
}
