export function layoutStateMachine(db) {
  const positions = {};
  const sizes = {};

  const TYPE_SIZE = {
    state: { w: 140, h: 44 },
    initial: { w: 24, h: 24 },
    final: { w: 28, h: 28 },
    choice: { w: 30, h: 30 },
    junction: { w: 18, h: 18 },
    fork: { w: 80, h: 10 },
    join: { w: 80, h: 10 },
    entryPoint: { w: 22, h: 22 },
    exitPoint: { w: 22, h: 22 },
    terminate: { w: 22, h: 22 },
    shallowHistory: { w: 26, h: 26 },
    deepHistory: { w: 26, h: 26 },
    note: { w: 110, h: 50 },
  };

  function sizeOf(id) {
    const node = db.nodes[id];
    if (!node) return TYPE_SIZE.state;
    if (node.children && node.children.length > 0) {
      const childW =
        node.children.reduce(
          (s, cid) => s + (TYPE_SIZE[db.nodes[cid]?.type]?.w || 140),
          0,
        ) +
        (node.children.length - 1) * 20 +
        60;
      const childH = 120;
      return { w: Math.max(childW, 200), h: childH + 60 };
    }
    return TYPE_SIZE[node.type] || TYPE_SIZE.state;
  }

  const allIds = Object.keys(db.nodes);
  const roots = allIds.filter((id) => {
    const node = db.nodes[id];
    if (node.parent) return false;
    if (node.type === "initial" || id === "__initial__") return true;
    return !db.transitions.some(
      (t) => t.to === id && !db.nodes[t.from]?.parent,
    );
  });

  const layer = {};
  const visited = new Set();

  function assignLayer(id, depth = 0) {
    if (visited.has(id)) return;
    visited.add(id);
    layer[id] = Math.max(layer[id] || 0, depth);
    db.transitions
      .filter((t) => t.from === id && !db.nodes[t.to]?.parent)
      .forEach((t) => assignLayer(t.to, depth + 1));
  }

  roots.forEach((id) => assignLayer(id, 0));
  allIds
    .filter((id) => !db.nodes[id]?.parent && layer[id] === undefined)
    .forEach((id) => {
      layer[id] = 0;
    });

  const byLayer = {};
  allIds
    .filter((id) => !db.nodes[id]?.parent)
    .forEach((id) => {
      const l = layer[id] || 0;
      if (!byLayer[l]) byLayer[l] = [];
      byLayer[l].push(id);
    });

  const layerNums = Object.keys(byLayer)
    .map(Number)
    .sort((a, b) => a - b);

  const ROW_GAP = 110;
  let y = 60;

  layerNums.forEach((l) => {
    const group = byLayer[l];
    const n = group.length;
    const maxH = Math.max(...group.map((id) => sizeOf(id).h));
    const totalW = group.reduce((s, id) => s + sizeOf(id).w, 0) + (n - 1) * 40;
    let x = 300 - totalW / 2;

    group.forEach((id) => {
      const s = sizeOf(id);
      sizes[id] = s;
      positions[id] = { x: x + s.w / 2, y: y + s.h / 2 };

      const node = db.nodes[id];
      if (node.children && node.children.length > 0) {
        const childrenTotalW =
          node.children.reduce((s, cid) => s + sizeOf(cid).w, 0) +
          (node.children.length - 1) * 20;
        let childX = x + s.w / 2 - childrenTotalW / 2;
        const childY = y + 50;

        node.children.forEach((cid) => {
          const cs = sizeOf(cid);
          sizes[cid] = cs;
          positions[cid] = { x: childX + cs.w / 2, y: childY + cs.h / 2 };
          childX += cs.w + 20;
        });
      }
      x += s.w + 40;
    });

    y += maxH + ROW_GAP;
  });

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  Object.keys(positions).forEach((id) => {
    const p = positions[id];
    const s = sizes[id] || { w: 140, h: 44 };
    minX = Math.min(minX, p.x - s.w / 2);
    maxX = Math.max(maxX, p.x + s.w / 2);
    minY = Math.min(minY, p.y - s.h / 2);
    maxY = Math.max(maxY, p.y + s.h / 2);
  });

  const padding = 50;
  const offsetX = padding - minX;
  const offsetY = padding - minY;

  Object.keys(positions).forEach((id) => {
    positions[id].x += offsetX;
    positions[id].y += offsetY;
  });

  return {
    positions,
    sizes,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}
