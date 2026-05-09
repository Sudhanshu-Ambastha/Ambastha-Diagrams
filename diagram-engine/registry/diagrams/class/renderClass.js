/**
 * renderClass.js
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
import { AbdDefs } from "../../utils/defs.js";
import { layoutClass } from "./layoutClass.js";

export function renderClass(db, layoutData, theme) {
  let needsRelayout = false;
  db.relationships.forEach((rel) => {
    ["from", "to"].forEach((side) => {
      if (!db.structs[rel[side]]) {
        db.addStruct(rel[side], [], []);
        needsRelayout = true;
      }
    });
  });

  const { positions, width, height } = needsRelayout
    ? layoutClass(db)
    : layoutData;

  let output = "";

  db.relationships.forEach((rel) => {
    output += AbdShapes.classConnector(rel.marker, rel.from, rel.to, positions);
  });

  Object.keys(db.structs).forEach((name) => {
    const pos = positions[name];
    const struct = db.structs[name];
    output += AbdShapes.classBox(pos.x, pos.y, pos.w, struct, theme);
  });

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
         xmlns="http://www.w3.org/2000/svg" style="background:${theme.background || "#fff"}">
      ${AbdDefs.generate(theme)}
      ${output}
    </svg>
  `;
}
