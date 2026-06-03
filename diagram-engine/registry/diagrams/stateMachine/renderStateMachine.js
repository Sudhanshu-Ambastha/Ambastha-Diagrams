import { stateMachineTemplates } from "./templates/stateMachineTemplates.js";

export function renderStateMachine(db, layout, theme) {
  const palette = (theme &&
    theme.colors &&
    (theme.colors[theme.activeThemeName] || theme.colors.StandardBlue)) || {
    background: "#ffffff",
    primaryFill: "#bfdbfe",
    primaryStroke: "#1e40af",
    text: "#1e293b",
    connector: "#334155",
    critical: "#ef4444",
    dashedConnector: "#94a3b8",
  };

  let nodesSVG = "";
  let edgesSVG = "";

  Object.values(db.nodes).forEach((node) => {
    const pos = layout.positions[node.id];
    const size = layout.sizes[node.id] || { w: 140, h: 44 };
    if (!pos) return;

    if (node.type === "note") {
      nodesSVG += stateMachineTemplates.note(
        pos.x,
        pos.y,
        size.w,
        size.h,
        node.label,
        palette,
      );
    } else if (node.children && node.children.length > 0) {
      nodesSVG += stateMachineTemplates.state(
        pos.x,
        pos.y,
        size.w,
        size.h,
        node.label,
        true,
        palette,
      );
    } else if (
      [
        "initial",
        "final",
        "choice",
        "junction",
        "fork",
        "join",
        "entryPoint",
        "exitPoint",
        "terminate",
        "shallowHistory",
        "deepHistory",
      ].includes(node.type)
    ) {
      nodesSVG += stateMachineTemplates.pseudoState(
        pos.x,
        pos.y,
        14,
        node.type,
        palette,
      );
    } else {
      nodesSVG += stateMachineTemplates.state(
        pos.x,
        pos.y,
        size.w,
        size.h,
        node.label,
        false,
        palette,
      );
    }
  });

  db.transitions.forEach((t) => {
    const fpos = layout.positions[t.from];
    const tpos = layout.positions[t.to];
    if (!fpos || !tpos) return;
    const fromType = db.nodes[t.from]?.type || "state";
    const toType = db.nodes[t.to]?.type || "state";

    const s = stateMachineTemplates.getPoint(
      fromType,
      fpos.x,
      fpos.y,
      layout.sizes[t.from],
      tpos.x,
      tpos.y,
    );
    const e = stateMachineTemplates.getPoint(
      toType,
      tpos.x,
      tpos.y,
      layout.sizes[t.to],
      fpos.x,
      fpos.y,
    );

    edgesSVG += stateMachineTemplates.transition(
      [
        { x: s.x, y: s.y },
        { x: e.x, y: e.y },
      ],
      t.label,
      palette,
    );
  });

  return `<svg width="${layout.width}" height="${layout.height}"
               xmlns="http://www.w3.org/2000/svg"
               style="background:${palette.background || "#ffffff"}">
    ${stateMachineTemplates.defs(palette)}
    ${edgesSVG}
    ${nodesSVG}
  </svg>`;
}
