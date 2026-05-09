/**
 * parseClass.js
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

export function parseClass(input, db) {
  if (!db) {
    console.error("❌ Logic Error: ClassDb instance is undefined");
    return;
  }

  const lines = typeof input === "string" ? input.split("\n") : input;
  let currentStruct = null;

  lines.forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith("//") || line === "class") return;
    if (line.startsWith("class ")) return;

    if (line.startsWith("struct ")) {
      const name = line.replace("struct ", "").replace("{", "").trim();
      db.addStruct(name, [], []);
      currentStruct = db.structs[name];
    } else if (line === "}") {
      currentStruct = null;
    } else if (currentStruct) {
      if (line.includes("()")) {
        currentStruct.methods.push(line);
      } else {
        currentStruct.attributes.push(line);
      }
    } else if (line.includes(":")) {
      const colonIdx = line.indexOf(":");
      const type = line.slice(0, colonIdx).trim();
      const body = line.slice(colonIdx + 1).trim();
      body.split(";").forEach((rel) => {
        const parts = rel.split("-->").map((p) => p.trim());
        if (parts.length === 2 && parts[0] && parts[1]) {
          db.addRelationship(type, parts[0], parts[1]);
        }
      });
    }
  });
}
