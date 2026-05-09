/**
 * renderSVG.js
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

import { templates } from "./templates/usecaseTemplates.js";
import { AbdDefs } from "../../utils/defs.js";

export function renderUseCase(model, layoutData, theme = {}) {
  const { positions, width, height, systemHeight, systemTop, boundaryWidth } =
    layoutData;
  const centerX = width / 2;
  const boundaryX = centerX - boundaryWidth / 2;
  const boundaryY = systemTop;

  let boundary = "";
  let connectors = "";
  let nodes = "";

  if (model.system) {
    boundary += templates.systemBoundary(
      boundaryX,
      boundaryY,
      boundaryWidth,
      systemHeight,
      model.system,
    );
  }

  model.connections.forEach((conn) => {
    const p1 = positions[conn.from];
    const p2 = positions[conn.to];
    if (!p1 || !p2) return;
    connectors += templates.connector(
      p1.x,
      p1.y,
      p2.x,
      p2.y,
      conn.type,
      conn.from,
      conn.to,
      model,
    );
  });

  const renderCollection = (collection, type) => {
    Object.keys(collection).forEach((id) => {
      const p = positions[id];
      if (!p) return;
      if (type === "usecase")
        nodes += templates.useCase(p.x, p.y, collection[id]);
      else if (type === "external")
        nodes += templates.externalSystem(p.x, p.y, collection[id]);
      else if (type === "actor")
        nodes += templates.actor(p.x, p.y, collection[id]);
    });
  };

  renderCollection(model.usecases, "usecase");
  renderCollection(model.externalSystems, "external");
  renderCollection(model.actors, "actor");

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" 
         xmlns="http://www.w3.org/2000/svg" style="background:${theme.background || "#fff"}">
      ${AbdDefs.generate(theme)}
      ${boundary}${connectors}${nodes}
    </svg>
  `;
}
