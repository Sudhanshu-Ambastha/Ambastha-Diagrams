/**
 * math.js
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
