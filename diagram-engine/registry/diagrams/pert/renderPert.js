/**
 * renderPertSvg.js
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

import { AbdShapes } from "../../utils/shapes.js";

export function renderPert(model, layoutData) {
  const { positions, width, height } = layoutData;
  const isAON = model.type === "aon";

  let connectors = "";
  let nodesGroup = "";

  if (isAON) {
    const nodeW = 120;

    Object.values(model.tasks).forEach((task) => {
      const pos = positions[task.id];
      if (!pos) return;

      nodesGroup += AbdShapes.pertNode(task, pos, 0);

      task.predecessors.forEach((predId) => {
        const startPos = positions[predId];
        if (!startPos) return;

        const parentTask = model.tasks[predId];
        const isLinkCritical = parentTask?.isCritical && task.isCritical;

        const sx = startPos.x + nodeW / 2;
        const sy = startPos.y;
        const ex = pos.x - nodeW / 2;
        const ey = pos.y;

        const color = isLinkCritical ? "#ff4d4d" : "#4b5563";
        const sw = isLinkCritical ? "2.5" : "1.5";
        const marker = `url(#arrow-pert-${isLinkCritical ? "crit" : "norm"})`;

        connectors += `<path d="M ${sx} ${sy} L ${ex} ${ey}" stroke="${color}" stroke-width="${sw}" fill="none" marker-end="${marker}"/>`;
      });
    });
  } else {
    const radius = 30;

    model.activities.forEach((act) => {
      const startNode = model.events?.[act.from];
      const endNode = model.events?.[act.to];
      const startPos = positions?.[act.from];
      const endPos = positions?.[act.to];

      if (!startNode || !endNode || !startPos || !endPos) return;

      const isCritical =
        Math.abs(startNode.e - startNode.l) < 0.1 &&
        Math.abs(endNode.e - endNode.l) < 0.1 &&
        Math.abs(startNode.e + act.te - endNode.e) < 0.1;

      const angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);
      const x1 = startPos.x + radius * Math.cos(angle);
      const y1 = startPos.y + radius * Math.sin(angle);
      const x2 = endPos.x - radius * Math.cos(angle);
      const y2 = endPos.y - radius * Math.sin(angle);

      connectors += AbdShapes.pertActivity(
        x1,
        y1,
        x2,
        y2,
        act.te,
        isCritical,
        (x1 + x2) / 2,
        (y1 + y2) / 2 - 12,
      );
    });

    Object.values(model.events).forEach((event) => {
      const pos = positions[event.id];
      if (!pos) return;
      nodesGroup += AbdShapes.pertNode(event, pos, radius);
    });
  }

  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arrow-pert-norm" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#4b5563" />
      </marker>
      <marker id="arrow-pert-crit" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#ff4d4d" />
      </marker>
    </defs>
    <rect width="100%" height="100%" fill="white" />
    ${connectors}
    ${nodesGroup}
  </svg>`;
}
