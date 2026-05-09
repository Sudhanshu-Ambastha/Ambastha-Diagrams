/**
 * layoutSequence.js
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

export function layoutSequence(model) {
  const P_GAP = 180,
    P_TOP = 65,
    M_GAP = 35;
  const NOTE_HGAP = 100,
    NOTE_VGAP = 50;
  const FRAME_PAD = 30,
    LEFT_PAD = 150;

  model.participants.forEach((p, i) => {
    p.x = LEFT_PAD + i * P_GAP;
    p.y = P_TOP;
  });

  const pMap = new Map(model.participants.map((p) => [p.id, p]));
  let maxRight = 0;

  function layoutFlow(items, startY, depth = 0) {
    let y = startY;

    items.forEach((item) => {
      if (item.kind === "message") {
        const from = pMap.get(item.fromId),
          to = pMap.get(item.toId);
        if (from && to) {
          item.fromX = from.x;
          item.toX = to.x;
          item.y = y;
          maxRight = Math.max(maxRight, from.x, to.x);
          y += M_GAP;
        }
      } else if (item.kind === "note") {
        const xs = item.targets.map((id) => pMap.get(id)?.x).filter(Boolean);
        if (xs.length > 0) {
          const isRight = item.placement === "right of";
          const targetX = isRight ? Math.max(...xs) : Math.min(...xs);

          item.x = isRight ? targetX + 60 : targetX - 140;
          item.anchorX = targetX;
          item.w = 120;
          item.y = y - 10;

          maxRight = Math.max(maxRight, item.x + item.w);
          y += NOTE_VGAP;
        }
      } else if (item.kind === "frame") {
        item.x = LEFT_PAD - FRAME_PAD + depth * 4;
        item.y = y;
        const bodyStart = y + 28;

        item.sections.forEach((section, si) => {
          section.y = si === 0 ? bodyStart : y;
          y = layoutFlow(section.messages, section.y, depth + 1);
          section.endY = y;
        });

        item.height = y - item.y + FRAME_PAD;
        item.width = (model.participants.length - 1) * P_GAP + FRAME_PAD * 2;
        maxRight = Math.max(maxRight, item.x + item.width);
        y += FRAME_PAD;
      }
    });
    return y;
  }

  const finalY = layoutFlow(model.messages, P_TOP + 80);

  return {
    ...model,
    canvas: {
      width: Math.max(maxRight + 50, model.participants.length * P_GAP),
      height: finalY + 60,
    },
    lifelineBottom: finalY + 20,
  };
}
