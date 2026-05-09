/**
 * defs.js
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

export const AbdDefs = {
  generate(theme = {}) {
    const { colors = {} } = theme;
    const stroke = colors.primaryStroke || "black";
    const connectorColor = colors.connector || "black";
    const critColor = colors.critical || "#ff4d4d";
    const bg = colors.background || "white";

    return `
    <defs>
      <!-- Open arrow (association, dependency, include, extend) -->
      <marker id="arrow-open" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="${connectorColor}" stroke-width="1.2"/>
      </marker>

      <!-- Hollow triangle (generalization, realization, inherits) -->
      <marker id="arrow-hollow" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto">
        <path d="M 1 1 L 11 6 L 1 11 Z" fill="${bg}" stroke="${connectorColor}" stroke-width="1.2"/>
      </marker>

      <!-- Filled diamond (composition) -->
      <marker id="arrow-diamond" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto">
        <path d="M 0 6 L 6 1 L 12 6 L 6 11 Z" fill="${connectorColor}" stroke="${connectorColor}" stroke-width="1"/>
      </marker>

      <!-- Empty diamond (aggregation) -->
      <marker id="arrow-diamond-empty" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto">
        <path d="M 0 6 L 6 1 L 12 6 L 6 11 Z" fill="${bg}" stroke="${connectorColor}" stroke-width="1"/>
      </marker>

      <!-- Filled arrowhead (solid directed) -->
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="${connectorColor}"/>
      </marker>

      <!-- PERT normal -->
      <marker id="arrow-pert-norm" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M 0 0 L 8 4 L 0 8 Z" fill="${connectorColor}"/>
      </marker>

      <!-- PERT critical -->
      <marker id="arrow-pert-crit" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M 0 0 L 8 4 L 0 8 Z" fill="${critColor}"/>
      </marker>

      <!-- Drop shadow -->
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
        <feOffset dx="2" dy="2" result="offsetblur"/>
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.3"/>
        </feComponentTransfer>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    `;
  },
};
