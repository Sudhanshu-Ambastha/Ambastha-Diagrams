/**
 * textWrap.js
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

export function wrapText(label, maxWidth = 140) {
  const words = label.split(" ");

  let line = "";
  const lines = [];

  words.forEach((word) => {
    const testLine = line + word + " ";

    const estimatedWidth = testLine.length * 7;

    if (estimatedWidth > maxWidth && line.length > 0) {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = testLine;
    }
  });

  if (line.trim().length > 0) {
    lines.push(line.trim());
  }

  return lines;
}
