function wrap(text, maxW, fontSize) {
  const charW = fontSize * 0.6;
  const maxCh = Math.floor(maxW / charW);
  if (!text || text.length <= maxCh) return [text || ""];
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  words.forEach((w) => {
    const cand = cur ? cur + " " + w : w;
    if (cand.length > maxCh && cur) {
      lines.push(cur);
      cur = w;
    } else cur = cand;
  });
  if (cur) lines.push(cur);
  return lines;
}

function textBlock(lines, cx, cy, palette, fontSize, fontWeight) {
  const lineH = fontSize * 1.3;
  const startY = cy - ((lines.length - 1) * lineH) / 2;
  return lines
    .map(
      (ln, i) =>
        `<text x="${cx}" y="${startY + i * lineH + fontSize * 0.35}"
           text-anchor="middle" font-size="${fontSize}" font-weight="${fontWeight || "normal"}"
           font-family="Helvetica, Arial, sans-serif"
           fill="${palette.text || "#1e293b"}">${ln}</text>`,
    )
    .join("");
}

export const stateMachineTemplates = {
  state(x, y, w, h, label, isCompositeOrPalette, maybePalette) {
    let isComposite = false;
    let palette;
    if (typeof isCompositeOrPalette === "boolean") {
      isComposite = isCompositeOrPalette;
      palette = maybePalette || {};
    } else {
      palette = isCompositeOrPalette || {};
    }

    const fill = palette.primaryFill || "#bfdbfe";
    const stroke = palette.primaryStroke || "#1e40af";
    const rx = 14;

    if (isComposite) {
      const titleH = 28;
      return `<g class="sm-state sm-composite">
        <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}"
              fill="${palette.background || "#ffffff"}" stroke="${stroke}" stroke-width="1.5" rx="${rx}"/>
        <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${titleH}" rx="${rx}" fill="${fill}" stroke="none"/>
        <rect x="${x - w / 2}" y="${y - h / 2 + rx}" width="${w}" height="${titleH - rx}" fill="${fill}" stroke="none"/>
        <text x="${x}" y="${y - h / 2 + 19}" text-anchor="middle" font-size="12" font-weight="bold"
              font-family="Helvetica, Arial, sans-serif" fill="${palette.text || "#1e293b"}">${label}</text>
      </g>`;
    }

    const lines = wrap(label, w - 16, 12);
    return `<g class="sm-state">
      <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}"
            fill="${fill}" stroke="${stroke}" stroke-width="1.5" rx="${rx}"/>
      ${textBlock(lines, x, y, palette, 12)}
    </g>`;
  },

  submachine(x, y, w, h, label, palette) {
    palette = palette || {};
    const fill = palette.primaryFill || "#bfdbfe";
    const stroke = palette.primaryStroke || "#1e40af";
    const inset = 4;
    const rx = 14;
    const lines = wrap(label, w - 24, 12);
    const iconY = y + h / 2 - 12;
    const icon1X = x + w / 2 - 34;
    const icon2X = x + w / 2 - 14;

    return `<g class="sm-submachine">
      <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}"
            fill="${fill}" stroke="${stroke}" stroke-width="1.5" rx="${rx}"/>
      <rect x="${x - w / 2 + inset}" y="${y - h / 2 + inset}" width="${w - inset * 2}" height="${h - inset * 2}"
            fill="none" stroke="${stroke}" stroke-width="1" rx="${rx - inset}"/>
      ${textBlock(lines, x, y - 6, palette, 12)}
      <circle cx="${icon1X}" cy="${iconY}" r="7" fill="none" stroke="${stroke}" stroke-width="1.2"/>
      <circle cx="${icon1X}" cy="${iconY}" r="2.5" fill="${stroke}"/>
      <circle cx="${icon2X}" cy="${iconY}" r="7" fill="none" stroke="${stroke}" stroke-width="1.2"/>
      <circle cx="${icon2X}" cy="${iconY}" r="2.5" fill="${stroke}"/>
    </g>`;
  },

  pseudo(x, y, type, palette) {
    return stateMachineTemplates._pseudoImpl(x, y, 14, type, palette || {});
  },

  pseudoState(x, y, radius, type, palette) {
    return stateMachineTemplates._pseudoImpl(x, y, radius, type, palette || {});
  },

  _pseudoImpl(x, y, r, type, palette) {
    const fill = palette.primaryFill || "#bfdbfe";
    const stroke = palette.primaryStroke || "#1e40af";
    const conn = palette.connector || "#334155";
    const text = palette.text || "#1e293b";

    switch (type) {
      case "initial":
        return `<g class="sm-initial"><circle cx="${x}" cy="${y}" r="${r}" fill="${conn}"/></g>`;
      case "final":
        return `<g class="sm-final">
          <circle cx="${x}" cy="${y}" r="${r + 2}" fill="none" stroke="${conn}" stroke-width="2"/>
          <circle cx="${x}" cy="${y}" r="${r - 2}" fill="${conn}"/>
        </g>`;
      case "shallowHistory":
        return `<g class="sm-shallow-history">
          <circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
          <text x="${x}" y="${y + r * 0.35}" text-anchor="middle"
                font-size="${r}" font-weight="bold" font-family="Helvetica" fill="${text}">H</text>
        </g>`;
      case "deepHistory":
        return `<g class="sm-deep-history">
          <circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
          <text x="${x}" y="${y + r * 0.35}" text-anchor="middle"
                font-size="${r * 0.85}" font-weight="bold" font-family="Helvetica" fill="${text}">H*</text>
        </g>`;
      case "choice":
        return `<g class="sm-choice">
          <polygon points="${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}"
                   fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
        </g>`;
      case "junction":
        return `<g class="sm-junction"><circle cx="${x}" cy="${y}" r="${r * 0.65}" fill="${conn}"/></g>`;
      case "fork":
      case "join":
        return `<g class="sm-${type}">
          <rect x="${x - r * 3.5}" y="${y - 4}" width="${r * 7}" height="8" rx="2" fill="${conn}"/>
        </g>`;
      case "entryPoint":
        return `<g class="sm-entry-point">
          <circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
          <circle cx="${x}" cy="${y}" r="${r * 0.3}" fill="${stroke}"/>
        </g>`;
      case "exitPoint":
        return `<g class="sm-exit-point">
          <circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
          <line x1="${x - r * 0.55}" y1="${y - r * 0.55}" x2="${x + r * 0.55}" y2="${y + r * 0.55}"
                stroke="${stroke}" stroke-width="1.8"/>
          <line x1="${x + r * 0.55}" y1="${y - r * 0.55}" x2="${x - r * 0.55}" y2="${y + r * 0.55}"
                stroke="${stroke}" stroke-width="1.8"/>
        </g>`;
      case "terminate":
        return `<g class="sm-terminate">
          <line x1="${x - r}" y1="${y - r}" x2="${x + r}" y2="${y + r}" stroke="${conn}" stroke-width="3"/>
          <line x1="${x + r}" y1="${y - r}" x2="${x - r}" y2="${y + r}" stroke="${conn}" stroke-width="3"/>
        </g>`;
      default:
        return `<g class="sm-pseudo"><circle cx="${x}" cy="${y}" r="${r}"
                  fill="${fill}" stroke="${stroke}" stroke-width="1.5"/></g>`;
    }
  },

  transition(points, label, palette) {
    palette = palette || {};
    const isDash = points.dashed || false;
    const ttype = points.type || "normal";
    const guard = points.guard || "";
    const connColor =
      ttype === "constraint" || ttype === "anchor" || ttype === "dependency"
        ? palette.dashedConnector || "#94a3b8"
        : palette.connector || "#334155";
    const dashAttr =
      isDash ||
      ttype === "constraint" ||
      ttype === "anchor" ||
      ttype === "dependency"
        ? 'stroke-dasharray="6,3"'
        : "";

    const pts = Array.isArray(points) ? points : [];
    let pathD;
    if (pts.length === 1 && pts[0].cx1 !== undefined) {
      const p = pts[0];
      pathD = `M ${p.x} ${p.y} C ${p.cx1} ${p.cy1}, ${p.cx2} ${p.cy2}, ${p.ex} ${p.ey}`;
    } else if (pts.length >= 2) {
      pathD = `M ${pts[0].x} ${pts[0].y} L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
    } else {
      return "";
    }

    let prefix = "";
    if (ttype === "include") prefix = "«include» ";
    if (ttype === "dependency") prefix = "«use» ";
    if (ttype === "anchor") prefix = "«anchor» ";
    const fullLabel = [prefix + (label || ""), guard ? "[" + guard + "]" : ""]
      .filter(Boolean)
      .join(" ")
      .trim();

    const midX =
      pts.length >= 2 ? (pts[0].x + pts[pts.length - 1].x) / 2 : pts[0].x;
    const midY =
      pts.length >= 2 ? (pts[0].y + pts[pts.length - 1].y) / 2 : pts[0].y;
    const labelW = fullLabel ? fullLabel.length * 6 + 10 : 0;

    return `<g class="sm-transition">
      <path d="${pathD}" stroke="${connColor}" stroke-width="1.5" fill="none"
            ${dashAttr} marker-end="url(#sm-arrow)"/>
      ${
        fullLabel
          ? `
        <rect x="${midX - labelW / 2}" y="${midY - 10}" width="${labelW}" height="16"
              fill="white" rx="3" opacity="0.92"/>
        <text x="${midX}" y="${midY + 2}" text-anchor="middle" font-size="10"
              font-family="Helvetica" fill="${connColor}">${fullLabel}</text>`
          : ""
      }
    </g>`;
  },

  note(x, y, w, h, text, palette) {
    palette = palette || {};
    const fold = 13;
    const lines = wrap(text || "", w - 16, 10);
    const lineH = 13;
    const startY = y - h / 2 + 18;
    const stroke = palette.connector || "#ca8a04";

    return `<g class="sm-note">
      <path d="M ${x - w / 2} ${y - h / 2}
               L ${x + w / 2 - fold} ${y - h / 2}
               L ${x + w / 2} ${y - h / 2 + fold}
               L ${x + w / 2} ${y + h / 2}
               L ${x - w / 2} ${y + h / 2} Z"
            fill="#fef9c3" stroke="${stroke}" stroke-width="1"/>
      <line x1="${x + w / 2 - fold}" y1="${y - h / 2}" x2="${x + w / 2 - fold}" y2="${y - h / 2 + fold}"
            stroke="${stroke}" stroke-width="1"/>
      <line x1="${x + w / 2 - fold}" y1="${y - h / 2 + fold}" x2="${x + w / 2}" y2="${y - h / 2 + fold}"
            stroke="${stroke}" stroke-width="1"/>
      ${lines
        .map(
          (ln, i) =>
            `<text x="${x}" y="${startY + i * lineH}" text-anchor="middle"
               font-size="10" font-family="Helvetica" fill="#713f12">${ln}</text>`,
        )
        .join("")}
    </g>`;
  },

  defs(palette) {
    palette = palette || {};
    const conn = palette.connector || "#334155";
    const dash = palette.dashedConnector || "#94a3b8";
    return `<defs>
      <marker id="sm-arrow" markerWidth="10" markerHeight="7"
              refX="9" refY="3.5" orient="auto">
        <polygon points="0 0,10 3.5,0 7" fill="${conn}"/>
      </marker>
      <marker id="sm-arrow-dash" markerWidth="10" markerHeight="7"
              refX="9" refY="3.5" orient="auto">
        <polygon points="0 0,10 3.5,0 7" fill="${dash}"/>
      </marker>
    </defs>`;
  },

  getPoint(type, cx, cy, size, toX, toY, index = 0, total = 1) {
    const { w, h } = size;
    const hw = w / 2,
      hh = h / 2;
    if (total > 1) {
      const offset = (index - (total - 1) / 2) * (Math.min(w, h) / total);
      if (Math.abs(toY - cy) > Math.abs(toX - cx)) {
        return { x: cx + offset, y: cy + (toY > cy ? hh : -hh) };
      } else {
        return { x: cx + (toX > cx ? hw : -hw), y: cy + offset };
      }
    }
    const dx = toX - cx,
      dy = toY - cy;
    if (!dx && !dy) return { x: cx, y: cy + hh };
    if (
      [
        "initial",
        "final",
        "junction",
        "choice",
        "shallowHistory",
        "deepHistory",
        "entryPoint",
        "exitPoint",
        "terminate",
      ].includes(type)
    ) {
      const len = Math.sqrt(dx * dx + dy * dy);
      return { x: cx + (dx / len) * hw, y: cy + (dy / len) * hh };
    }
    if (type === "fork" || type === "join") {
      if (Math.abs(dy) >= Math.abs(dx)) {
        return { x: cx, y: cy + (dy > 0 ? hh : -hh) };
      }
      return { x: cx + (dx > 0 ? hw : -hw), y: cy };
    }
    const tH = hh / (Math.abs(dy) || 0.0001);
    const tW = hw / (Math.abs(dx) || 0.0001);
    if (tH <= tW) return { x: cx + dx * tH, y: cy + (dy > 0 ? hh : -hh) };
    return { x: cx + (dx > 0 ? hw : -hw), y: cy + dy * tW };
  },
};
