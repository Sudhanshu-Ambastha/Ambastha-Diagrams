/**
 * erTemplates.js
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

export const erdTemplates = {
  defs() {
    return `<defs></defs>`;
  },

  entity(cx, cy, entity, styles = {}) {
    const fill = styles.fill || "#dbeafe",
      stroke = styles.stroke || "#1e40af",
      headerFill = styles.headerFill || "#1e40af",
      headerText = styles.headerText || "#ffffff",
      attrText = styles.attrText || "#1e293b",
      pkFill = styles.pkFill || "#fef9c3",
      ff = styles.fontFamily || "Helvetica, Arial, sans-serif";
    const W = 160,
      HEADER_H = 32,
      ATTR_H = 22;
    const H =
      HEADER_H +
      entity.attrs.length * ATTR_H +
      (entity.attrs.length > 0 ? 8 : 0);
    const x = cx - W / 2,
      y = cy - H / 2;

    let out = `<g class="erd-entity" data-entity="${entity.name}">`;
    out += `<rect x="${x}" y="${y}" width="${W}" height="${H}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" rx="3"/>`;
    out += `<rect x="${x}" y="${y}" width="${W}" height="${HEADER_H}" fill="${headerFill}" stroke="none" rx="3"/>`;
    out += `<rect x="${x}" y="${y + HEADER_H - 4}" width="${W}" height="4" fill="${headerFill}" stroke="none"/>`;
    out += `<text x="${cx}" y="${y + HEADER_H * 0.65}" text-anchor="middle" font-size="13" font-weight="bold" font-family="${ff}" fill="${headerText}">${entity.name}</text>`;

    if (entity.attrs.length > 0)
      out += `<line x1="${x}" y1="${y + HEADER_H}" x2="${x + W}" y2="${y + HEADER_H}" stroke="${stroke}" stroke-width="1"/>`;

    entity.attrs.forEach((attr, i) => {
      const ay = y + HEADER_H + i * ATTR_H;
      if (attr.pk)
        out += `<rect x="${x + 1}" y="${ay}" width="${W - 2}" height="${ATTR_H}" fill="${pkFill}" stroke="none"/>`;
      if (i > 0)
        out += `<line x1="${x + 1}" y1="${ay}" x2="${x + W - 1}" y2="${ay}" stroke="${stroke}" stroke-width="0.5" stroke-dasharray="3,2" opacity="0.4"/>`;

      out += `<text x="${x + 10}" y="${ay + ATTR_H * 0.68}" font-size="11" font-family="${ff}" fill="${attrText}" font-weight="${attr.pk ? "bold" : "normal"}">${attr.name}</text>`;
      if (attr.pk || attr.fk) {
        const label = attr.pk ? "PK" : "FK";
        out += `<text x="${x + W - 35}" y="${ay + ATTR_H * 0.68}" font-size="9" font-family="${ff}" fill="${attr.pk ? "#ca8a04" : "#2563eb"}" font-weight="bold">${label}</text>`;
      }
      if (attr.type)
        out += `<text x="${x + W - 8}" y="${ay + ATTR_H * 0.68}" text-anchor="end" font-size="10" font-family="${ff}" fill="#64748b" font-style="italic">${attr.type}</text>`;
    });
    return out + `</g>`;
  },

  relation(
    sx,
    sy,
    ex,
    ey,
    cardFrom,
    cardTo,
    label,
    dashed,
    connColor = "#334155",
  ) {
    const dashAttr = dashed ? 'stroke-dasharray="8,4"' : "";
    const dx = ex - sx,
      dy = ey - sy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len,
      uy = dy / len;
    const nx = -uy,
      ny = ux;

    const GAP = 4;
    const CROW_D = 13;
    const CROW_W = 10;
    const SPACING = 4;
    const BAR_GAP = 10;
    const TICK = 9;
    const CIRC_R = 6;

    function crowFoot(endX, endY, card, dirX, dirY) {
      const perX = -dirY,
        perY = dirX;
      let svg = "";

      const hasCrow = card.inner === "many" || card.inner === "many_bar";

      if (hasCrow) {
        const baseX = endX + dirX * GAP;
        const baseY = endY + dirY * GAP;
        const tipX = baseX + dirX * CROW_D;
        const tipY = baseY + dirY * CROW_D;

        svg += `<line x1="${tipX}" y1="${tipY}" x2="${baseX + perX * CROW_W}" y2="${baseY + perY * CROW_W}" stroke="${connColor}" stroke-width="1.5"/>`;
        svg += `<line x1="${tipX}" y1="${tipY}" x2="${baseX - perX * CROW_W}" y2="${baseY - perY * CROW_W}" stroke="${connColor}" stroke-width="1.5"/>`;
        svg += `<line x1="${tipX}" y1="${tipY}" x2="${baseX}" y2="${baseY}" stroke="${connColor}" stroke-width="1.5"/>`;

        const barDist = GAP + CROW_D + SPACING;

        if (card.inner === "many_bar") {
          const bx = endX + dirX * barDist;
          const by = endY + dirY * barDist;
          svg += `<line x1="${bx - perX * TICK}" y1="${by - perY * TICK}" x2="${bx + perX * TICK}" y2="${by + perY * TICK}" stroke="${connColor}" stroke-width="1.8"/>`;
        }

        if (card.outer === "zero") {
          const circDist =
            card.inner === "many_bar"
              ? barDist + BAR_GAP + CIRC_R
              : GAP + CROW_D + SPACING + CIRC_R;
          const cx2 = endX + dirX * circDist;
          const cy2 = endY + dirY * circDist;
          svg += `<circle cx="${cx2}" cy="${cy2}" r="${CIRC_R}" fill="white" stroke="${connColor}" stroke-width="1.8"/>`;
        }
      } else {
        const innerDist = GAP;
        const ix = endX + dirX * innerDist;
        const iy = endY + dirY * innerDist;

        if (card.inner === "one") {
          svg += `<line x1="${ix - perX * TICK}" y1="${iy - perY * TICK}" x2="${ix + perX * TICK}" y2="${iy + perY * TICK}" stroke="${connColor}" stroke-width="1.8"/>`;
        }

        const outerDist = GAP + BAR_GAP;
        const ox = endX + dirX * outerDist;
        const oy = endY + dirY * outerDist;

        if (card.outer === "one") {
          svg += `<line x1="${ox - perX * TICK}" y1="${oy - perY * TICK}" x2="${ox + perX * TICK}" y2="${oy + perY * TICK}" stroke="${connColor}" stroke-width="1.8"/>`;
        } else if (card.outer === "zero") {
          const circDist = outerDist + CIRC_R;
          const cx2 = endX + dirX * circDist;
          const cy2 = endY + dirY * circDist;
          svg += `<circle cx="${cx2}" cy="${cy2}" r="${CIRC_R}" fill="white" stroke="${connColor}" stroke-width="1.8"/>`;
        }
      }

      return svg;
    }

    const midX = (sx + ex) / 2;
    const midY = (sy + ey) / 2;

    let out = `<g class="erd-relation">`;
    out += `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${connColor}" stroke-width="1.5" ${dashAttr}/>`;
    out += crowFoot(sx, sy, cardFrom, ux, uy);
    out += crowFoot(ex, ey, cardTo, -ux, -uy);
    if (label) {
      const lx = midX + nx * 14;
      const ly = midY + ny * 14;
      out += `<rect x="${lx - label.length * 3.2 - 4}" y="${ly - 9}" width="${label.length * 6.4 + 8}" height="16" fill="white" rx="3" opacity="0.92"/>`;
      out += `<text x="${lx}" y="${ly + 3}" text-anchor="middle" font-size="10" font-style="italic" font-family="Helvetica, Arial, sans-serif" fill="${connColor}">${label}</text>`;
    }
    return out + `</g>`;
  },
};
