/**
 * layout.js
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

export function layoutDiagram(model) {
  const ucIds = Object.keys(model.usecases);
  const actors = Object.keys(model.actors);
  const exts = Object.keys(model.externalSystems);

  const width = 800;
  const centerX = width / 2;
  const sideOffset = 220;
  const actorX = centerX - sideOffset;
  const extX = centerX + sideOffset;

  const systemTop = 80;
  const headerHeight = 70;
  const spacing = 70;
  const startY = systemTop + headerHeight;

  const positions = {};

  ucIds.forEach((id, i) => {
    positions[id] = { x: centerX, y: startY + i * spacing };
  });

  const placeEntities = (entities, xPos) => {
    entities.forEach((id, index) => {
      const connections = model.connections.filter(
        (c) => c.from === id || c.to === id,
      );
      const connectedY = connections
        .map((c) => positions[c.from === id ? c.to : c.from]?.y)
        .filter((y) => y !== undefined);

      let y =
        connectedY.length > 0
          ? connectedY.reduce((a, b) => a + b, 0) / connectedY.length
          : startY + index * spacing;

      positions[id] = { x: xPos, y };
    });
  };

  placeEntities(actors, actorX);
  placeEntities(exts, extX);

  const systemHeight = ucIds.length * spacing + headerHeight;
  const height = Math.max(systemTop + systemHeight + 60, 600);

  return {
    positions,
    width,
    height,
    systemHeight,
    systemTop,
    boundaryWidth: 280,
  };
}
