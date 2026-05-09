/**
 * layoutPert.js
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

export function layoutPert(model) {
  const positions = {};
  const levels = {};
  const eventLevels = {};

  const eventIds =
    typeof model.topologicalSort === "function"
      ? model.topologicalSort()
      : Object.keys(model.events);

  eventIds.forEach((id) => {
    const node = model.events[id];

    let level = 0;

    if (node.predecessors.length > 0) {
      level =
        Math.max(
          ...node.predecessors.map((pred) => (eventLevels[pred.from] ?? 0) + 1),
        ) || 0;
    }

    eventLevels[id] = level;

    if (!levels[level]) {
      levels[level] = [];
    }

    levels[level].push(id);
  });

  const xSpacing = 250;
  const ySpacing = 180;
  const marginX = 100;
  const marginY = 150;

  let maxEventsInLevel = 1;

  Object.values(levels).forEach((group) => {
    maxEventsInLevel = Math.max(maxEventsInLevel, group.length);
  });

  Object.keys(levels).forEach((levelKey) => {
    const ids = levels[levelKey];
    const level = Number(levelKey);

    const totalHeight = (ids.length - 1) * ySpacing;

    const startY =
      marginY + (maxEventsInLevel * ySpacing) / 2 - totalHeight / 2;

    ids.forEach((id, index) => {
      positions[id] = {
        x: marginX + level * xSpacing,
        y:
          ids.length > 1
            ? startY + index * ySpacing
            : marginY + (maxEventsInLevel * ySpacing) / 2,
      };
    });
  });

  return {
    positions,
    width: Object.keys(levels).length * xSpacing + marginX * 2,
    height: maxEventsInLevel * ySpacing + marginY * 2,
  };
}
