/**
 * svg.js
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

import { defaultTheme } from "../theme/default.js";

export function renderSVG(graph) {
  const palette = defaultTheme.colors.visualParadigm;

  let body = "";

  graph.nodes.forEach((node) => {
    body += `
      <rect
        x="${node.x}"
        y="${node.y}"
        width="140"
        height="60"
        rx="10"
        fill="${palette.primaryFill}"
        stroke="${palette.primaryStroke}"
      />
      <text
        x="${node.x + 70}"
        y="${node.y + 35}"
        text-anchor="middle"
        fill="${palette.text}"
        font-family="${defaultTheme.typography.enterprise.fontFamily}"
      >
        ${node.label}
      </text>
    `;
  });

  return `
    <svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
      ${body}
    </svg>
  `;
}
