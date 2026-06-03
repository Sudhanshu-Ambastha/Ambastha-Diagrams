import { AbdShapes as S } from "../../utils/shapes.js";

function borderPoint(cx, cy, w, h, toX, toY) {
  const dx = toX - cx,
    dy = toY - cy;
  if (!dx && !dy) return { x: cx, y: cy + h / 2 };
  const hw = w / 2,
    hh = h / 2;
  const tH = hh / (Math.abs(dy) || 0.0001);
  const tW = hw / (Math.abs(dx) || 0.0001);
  if (tH <= tW) return { x: cx + dx * tH, y: cy + (dy > 0 ? hh : -hh) };
  return { x: cx + (dx > 0 ? hw : -hw), y: cy + dy * tW };
}

export function renderERD(db, layout, theme) {
  const themeName =
    db.theme || (theme && theme.activeThemeName) || "StandardBlue";
  const palette = (theme &&
    theme.colors &&
    (theme.colors[themeName] || theme.colors.StandardBlue)) || {
    background: "#ffffff",
    primaryFill: "#dbeafe",
    primaryStroke: "#1e40af",
    text: "#1e293b",
    connector: "#334155",
  };

  const bg = palette.background || "#ffffff";
  const connColor = palette.connector || "#334155";

  const entityStyles = {
    fill: palette.primaryFill || "#dbeafe",
    stroke: palette.primaryStroke || "#1e40af",
    headerFill: palette.primaryStroke || "#1e40af",
    headerText: palette.background || "#ffffff",
    attrText: palette.text || "#1e293b",
    pkFill: palette.warning ? palette.warning + "33" : "#fef9c3",
  };

  let edgesSVG = "";
  let nodesSVG = "";

  db.relations.forEach((rel) => {
    const fromPos = layout.positions[rel.from];
    const toPos = layout.positions[rel.to];
    if (!fromPos || !toPos) return;

    const s = borderPoint(
      fromPos.x,
      fromPos.y,
      fromPos.w,
      fromPos.h,
      toPos.x,
      toPos.y,
    );
    const e = borderPoint(
      toPos.x,
      toPos.y,
      toPos.w,
      toPos.h,
      fromPos.x,
      fromPos.y,
    );

    edgesSVG += S.erdRelation(
      s.x,
      s.y,
      e.x,
      e.y,
      rel.cardFrom,
      rel.cardTo,
      rel.label,
      rel.dashed,
      rel.isDiamond,
      connColor,
    );
  });

  db.entityOrder.forEach((name) => {
    const entity = db.entities[name];
    const pos = layout.positions[name];
    if (!pos || !entity) return;
    nodesSVG += S.erdEntity(pos.x, pos.y, entity, entityStyles);
  });

  return `<svg
    width="${layout.width}"
    height="${layout.height}"
    viewBox="0 0 ${layout.width} ${layout.height}"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
    style="background:${bg}; display:block;">
  ${S.erdDefs()}
  ${edgesSVG}
  ${nodesSVG}
</svg>`;
}
