export function getRectEdgePoint(from, to) {
  const cx = from.x + from.w / 2;
  const cy = from.y + from.h / 2;
  const targetX = to.x + to.w / 2;
  const targetY = to.y + to.h / 2;

  const dx = targetX - cx;
  const dy = targetY - cy;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (from.w * absDy > from.h * absDx) {
    return {
      x: cx + (from.h / 2) * (dx / absDy),
      y: cy + (dy > 0 ? from.h / 2 : -from.h / 2),
    };
  } else {
    return {
      x: cx + (dx > 0 ? from.w / 2 : -from.w / 2),
      y: cy + (from.w / 2) * (dy / absDx),
    };
  }
}
