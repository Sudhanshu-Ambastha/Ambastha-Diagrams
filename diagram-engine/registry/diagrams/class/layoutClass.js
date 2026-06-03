/**
 * layoutClass.js
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

export function layoutClass(db) {
  if (!db || !db.structs) {
    console.warn("⚠️ Layout received an invalid or empty database instance.");
    return { positions: {}, width: 100, height: 100 };
  }

  const positions = {};
  const PADDING = 60;
  const BOX_W = 200;
  const COL_GAP = 50;
  const ROW_H = 250;
  const MAX_ROW_W = 800;
  let currentX = PADDING;
  let currentY = PADDING;
  let maxRightEdge = 0;
  let maxBottomEdge = 0;

  const structNames = Object.keys(db.structs);

  structNames.forEach((name) => {
    const struct = db.structs[name];
    const attrCount = Array.isArray(struct.attributes)
      ? struct.attributes.length
      : 0;
    const methCount = Array.isArray(struct.methods) ? struct.methods.length : 0;
    const totalItems = attrCount + methCount;
    const BOX_H = 50 + totalItems * 20;

    positions[name] = {
      x: currentX,
      y: currentY,
      w: BOX_W,
      h: BOX_H,
    };

    maxRightEdge = Math.max(maxRightEdge, currentX + BOX_W);
    maxBottomEdge = Math.max(maxBottomEdge, currentY + BOX_H);
    currentX += BOX_W + COL_GAP;

    if (currentX + BOX_W > PADDING + MAX_ROW_W) {
      currentX = PADDING;
      currentY += ROW_H;
    }
  });

  const finalWidth = maxRightEdge + PADDING;
  const finalHeight = maxBottomEdge + PADDING;

  return { positions, width: finalWidth, height: finalHeight };
}
