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
  const padding = 50;
  const boxWidth = 200;
  let currentX = padding;
  let currentY = padding;

  const structNames = Object.keys(db.structs);

  structNames.forEach((name) => {
    const struct = db.structs[name];
    const attrCount = Array.isArray(struct.attributes)
      ? struct.attributes.length
      : 0;
    const methCount = Array.isArray(struct.methods) ? struct.methods.length : 0;
    const totalItems = attrCount + methCount;
    const boxHeight = 50 + totalItems * 20;

    positions[name] = {
      x: currentX,
      y: currentY,
      w: boxWidth,
      h: boxHeight,
    };

    currentX += boxWidth + padding;

    if (currentX > 800) {
      currentX = padding;
      currentY += 250;
    }
  });

  const finalWidth = Math.max(currentX + padding, 1000);
  const finalHeight = currentY + 400;

  return { positions, width: finalWidth, height: finalHeight };
}
