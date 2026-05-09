/**
 * ganttLayout.js
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

export function layoutGantt(model, config = {}) {
  const view = model.meta?.view || "days";
  const scale = config.scale || (view === "weeks" ? 100 : 50);
  const rowHeight = config.rowHeight || 45;
  const cfg = { scale, rowHeight };

  const allActs = model.allActs || {};
  const groups = model.groups || [];
  const milestones = model.milestones || [];

  const positions = {};
  let rowIndex = 0;

  const xOf = (es) => (view === "weeks" ? (es / 7) * scale : es * scale);
  const wOf = (dur) => (view === "weeks" ? (dur / 7) * scale : dur * scale);

  const groupedIds = new Set();

  groups.forEach((group) => {
    if (group.name !== "__default__" && group.activities?.length > 0) {
      // Group header row
      positions[`__group_${group.name}`] = {
        type: "group",
        label: group.name,
        yFirst: rowIndex * rowHeight,
        rowIndex,
      };
      rowIndex++;

      group.activities.forEach((act) => {
        groupedIds.add(act.id);
        positions[act.id] = {
          type: "bar",
          x: xOf(act.es),
          y: rowIndex * rowHeight,
          width: Math.max(wOf(act.duration), 40),
          rowIndex,
        };
        rowIndex++;
      });
    } else {
      group.activities?.forEach((act) => {
        groupedIds.add(act.id);
        positions[act.id] = {
          type: "bar",
          x: xOf(act.es),
          y: rowIndex * rowHeight,
          width: Math.max(wOf(act.duration), 40),
          rowIndex,
        };
        rowIndex++;
      });
    }
  });

  Object.values(allActs).forEach((act) => {
    if (groupedIds.has(act.id) || act.id.startsWith("__ms_")) return;
    positions[act.id] = {
      type: "bar",
      x: xOf(act.es),
      y: rowIndex * rowHeight,
      width: Math.max(wOf(act.duration), 40),
      rowIndex,
    };
    rowIndex++;
  });

  milestones.forEach((ms) => {
    const act = allActs[ms.id];
    if (!act) return;
    positions[ms.id] = {
      type: "milestone",
      x: xOf(act.es),
      y: rowIndex * rowHeight,
      width: 0,
      rowIndex,
    };
    rowIndex++;
  });

  const maxEF = Math.max(...Object.values(allActs).map((a) => a.ef), 1);
  const maxUnits = view === "weeks" ? Math.ceil(maxEF / 7) + 1 : maxEF + 1;

  return {
    positions,
    totalWidth: maxUnits * scale + 150,
    totalHeight: rowIndex * rowHeight + 50,
    maxUnits,
    cfg,
    view,
  };
}
