/**
 * renderGantt.js
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

import { ganttTemplates as T } from "./templates/ganttTemplates.js";

export function renderGantt(model, layoutData) {
  const { positions, totalWidth, totalHeight, maxUnits, cfg, view } =
    layoutData;
  const { scale, rowHeight } = cfg;

  const allActs = model.allActs || {};
  const meta = model.meta || {};
  const milestones = model.milestones || [];

  let content = T.defs();

  content += T.grid(
    totalWidth,
    totalHeight,
    maxUnits,
    scale,
    meta.startDate,
    view,
  );

  milestones.forEach((ms) => {
    const msPos = positions[ms.id];
    const msAct = allActs[ms.id];
    if (!msPos || !msAct) return;

    const depIds = ms.deps || [];
    depIds.forEach((depId) => {
      const depPos = positions[depId];
      if (!depPos) return;

      content += T.milestoneLink(
        depPos.x + (depPos.width || 0),
        depPos.y + rowHeight / 2 + 5,
        msPos.x,
        msPos.y + rowHeight / 2 + 5,
        msAct.color,
      );
    });
  });

  Object.values(allActs).forEach((act) => {
    const pos = positions[act.id];
    if (!pos || act.isMilestone) return;

    act.successors.forEach((succId) => {
      const succPos = positions[succId];
      if (succPos) {
        content += T.link(
          pos.x + pos.width,
          pos.y + rowHeight / 2 + 5,
          succPos.x,
          succPos.y + rowHeight / 2 + 5,
          act.isCritical && allActs[succId]?.isCritical,
        );
      }
    });
  });

  model.groups?.forEach((group) => {
    const gPos = positions[`__group_${group.name}`];
    if (!gPos || group.name === "__default__") return;

    const acts = group.activities.map((a) => positions[a.id]).filter(Boolean);
    if (acts.length === 0) return;

    const xStart = Math.min(...acts.map((p) => p.x));
    const xEnd = Math.max(...acts.map((p) => p.x + p.width));

    content += T.groupOverlay(gPos.yFirst, xStart, xEnd, group.name, rowHeight);
  });

  Object.values(allActs).forEach((act) => {
    const pos = positions[act.id];
    if (!pos) return;

    if (act.isMilestone) {
      content += T.milestone(pos.x, pos.y, act.name, act.color, rowHeight);
    } else {
      content += T.bar(
        pos.x,
        pos.y,
        pos.width,
        act.id,
        act.isCritical,
        act.color,
        act.progress,
        act.startDate,
        act.endDate,
        rowHeight,
      );
    }
  });

  return T.wrapper(totalWidth, totalHeight, meta.title, content);
}
