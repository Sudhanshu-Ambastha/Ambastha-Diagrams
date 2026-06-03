/**
 * renderSequence.js
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

import { AbdShapes as S } from "../../utils/shapes.js";

export function renderSequence(model, layoutData, theme) {
  const { canvas = { width: 100, height: 100 }, lifelineBottom = 0 } =
    layoutData;

  let out = "";

  // 1. Render Lifelines and Participants
  if (layoutData.participants) {
    layoutData.participants.forEach((p) => {
      out += S.lifeline(p.x, p.y + 20, lifelineBottom);
    });

    layoutData.participants.forEach((p) => {
      out += S.seqParticipant(p.x, p.y, p.label, p.type, theme);
    });
  }

  function renderFlow(items) {
    if (!items) return;
    items.forEach((item) => {
      if (item.kind === "message") {
        out += S.seqMessage(item.fromX, item.toX, item.y, item.text, item.type);
        if (item.type === "sync" || item.type === "async") {
          out += S.activationBar(item.toX, item.y, 30);
        }
      } else if (item.kind === "note") {
        out += `<line x1="${item.anchorX}" y1="${item.y + 15}" x2="${item.x + item.w / 2}" y2="${item.y + 15}" 
                  stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,2" />`;
        out += S.seqNote(item.x, item.y, item.w, item.text, theme);
      } else if (item.kind === "frame") {
        out += S.interactionFrame(
          item.x,
          item.y,
          item.width,
          item.height,
          item.type,
          item.label,
          item.sections,
        );
        item.sections.forEach((section) => renderFlow(section.messages));
      }
    });
  }

  renderFlow(layoutData.messages || []);
  const bgColor = theme?.background || "#ffffff";

  return `<svg 
    viewBox="0 0 ${canvas.width} ${canvas.height}" 
    width="${canvas.width}" 
    height="${canvas.height}"
    xmlns="http://www.w3.org/2000/svg" 
    xmlns:xlink="http://www.w3.org/1999/xlink">
    <rect width="${canvas.width}" height="${canvas.height}" fill="${bgColor}"/>
    ${out}
  </svg>`;
}
