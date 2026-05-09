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
  const taskLevels = {};

  const isAON = model.type === "aon";
  const nodeIds =
    typeof model.topologicalSort === "function"
      ? model.topologicalSort()
      : Object.keys(isAON ? model.tasks : model.events);

  nodeIds.forEach((id) => {
    let level = 0;
    const currentItem = isAON ? model.tasks[id] : model.events[id];

    if (
      currentItem &&
      currentItem.predecessors &&
      currentItem.predecessors.length > 0
    ) {
      const validLevels = currentItem.predecessors.map((p) => {
        const predId = isAON ? p : p.from;
        return taskLevels[predId] !== undefined ? taskLevels[predId] + 1 : 0;
      });
      level = Math.max(...validLevels, 0);
    }

    taskLevels[id] = level;
    if (!levels[level]) levels[level] = [];
    levels[level].push(id);
  });

  const xSpacing = isAON ? 320 : 250;
  const ySpacing = isAON ? 200 : 180;
  const marginX = 120;
  const marginY = 120;

  let maxElementsInLevel = 1;
  Object.values(levels).forEach((group) => {
    maxElementsInLevel = Math.max(maxElementsInLevel, group.length);
  });

  Object.keys(levels).forEach((levelKey) => {
    const ids = levels[levelKey];
    const level = Number(levelKey);
    const totalHeight = (ids.length - 1) * ySpacing;
    const startY =
      marginY + (maxElementsInLevel * ySpacing) / 2 - totalHeight / 2;

    ids.forEach((id, index) => {
      positions[id] = {
        x: marginX + level * xSpacing,
        y:
          ids.length > 1
            ? startY + index * ySpacing
            : marginY + (maxElementsInLevel * ySpacing) / 2,
      };
    });
  });

  return {
    positions,
    width: Object.keys(levels).length * xSpacing + marginX * 2,
    height: maxElementsInLevel * ySpacing + marginY * 2,
  };
}
