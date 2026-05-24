/**
 * renderCpmSvg.js
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

import { cpmTemplates, aoaTemplates } from "./templates/cpmTemplates.js";

function renderAoA(model, positions, width, height) {
  const mapping = model.getAoAMapping();
  let connectors = "";
  let nodeGroup = "";

  mapping.arrows.forEach((arrow) => {
    const start = positions[arrow.from];
    const end = positions[arrow.to];
    if (!start || !end) return;
    connectors += aoaTemplates.activityArrow(
      start,
      end,
      arrow.id,
      arrow.duration,
      arrow.isCritical,
    );
  });

  const dummies = mapping.dummies || [];
  dummies.forEach((dummy) => {
    const start = positions[dummy.from];
    const end = positions[dummy.to];
    if (!start || !end) return;
    connectors += aoaTemplates.dummyArrow(start, end);
  });

  Object.entries(mapping.milestones).forEach(([key, data]) => {
    const pos = positions[key];
    if (!pos) return;
    nodeGroup += aoaTemplates.milestone(pos.x, pos.y, data);
  });

  return cpmTemplates.assembleSVG(width, height, connectors, nodeGroup);
}

function renderAoN(model, positions, width, height) {
  const nodes = Object.values(model.activities);
  let connectors = "";
  let nodeGroup = "";

  nodes.forEach((node) => {
    node.successors.forEach((succId) => {
      const start = positions[node.id];
      const end = positions[succId];
      if (!start || !end) return;

      const isCrit = node.isCritical && model.activities[succId]?.isCritical;

      connectors += cpmTemplates.connector(
        start.x + 120,
        start.y + 50,
        end.x,
        end.y + 50,
        isCrit,
      );
    });
  });

  nodes.forEach((node) => {
    const pos = positions[node.id];
    if (!pos) return;
    nodeGroup += cpmTemplates.node(pos.x, pos.y, node);
  });

  return cpmTemplates.assembleSVG(width, height, connectors, nodeGroup);
}

export function renderCPM(model, layoutData) {
  const { positions, width, height } = layoutData;
  return model.type === "aoa"
    ? renderAoA(model, positions, width, height)
    : renderAoN(model, positions, width, height);
}
