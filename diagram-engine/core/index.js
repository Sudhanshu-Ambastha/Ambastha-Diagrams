/**
 * index.js
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

import { diagrams } from "../registry/register.js";

export function renderDiagram(source) {
  const lines = source.trim().split("\n");
  const type = lines[0].trim();
  const diagram = diagrams[type];

  if (!diagram) {
    throw new Error("Unknown diagram type: " + type);
  }

  const db =
    typeof diagram.db === "function" ? diagram.db() : (diagram.db ?? null);

  if (db !== null) {
    diagram.parse(source, db);
    const layoutData = diagram.layout(db);
    return diagram.render(db, layoutData, diagram.theme ?? {});
  } else {
    const model = diagram.parse(source);
    const layoutData = diagram.layout(model);
    return diagram.render(model, layoutData, diagram.theme ?? {});
  }
}
