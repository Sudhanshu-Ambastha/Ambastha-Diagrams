/**
 * apply-headers.js
 * Description: Automated license header management for the abd Engine.
 *
 * Copyright 2026 Sudhanshu Ambastha
 * Apache License 2.0
 */

import fs from "fs";
import path from "path";

const AUTHOR = "Sudhanshu Ambastha";
const YEAR = "2026";
const PROJECT_ROOT = "./diagram-engine";

const EXCLUDED_EXTENSIONS = [
  ".md",
  ".svg",
  ".json",
  ".png",
  ".jpg",
  ".txt",
  ".png",
  ".svg",
];
const EXCLUDED_FILES = [
  "LICENSE",
  "notice",
  "package.json",
  "package-lock.json",
  ".gitignore",
];

const getCommentedHeader = (fileName, description, ext) => {
  const licenseText = `
 * ${fileName}
 * Description: ${description}
 *
 * Copyright ${YEAR} ${AUTHOR}
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
`;

  switch (ext) {
    case ".html":
      return `<!--${licenseText}-->\n\n`;
    case ".css":
      return `/*${licenseText}*/\n\n`;
    case ".js":
    case ".ts":
    case ".java":
    case ".c":
    case ".cpp":
      return `/**${licenseText} */\n\n`;
    default:
      return null;
  }
};

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!["node_modules", ".git", "dist", "build"].includes(file)) {
        processDirectory(filePath);
      }
    } else {
      const ext = path.extname(file).toLowerCase();

      if (EXCLUDED_EXTENSIONS.includes(ext) || EXCLUDED_FILES.includes(file)) {
        return;
      }

      const header = getCommentedHeader(
        file,
        "Part of the Sovereign Diagram Engine core logic.",
        ext,
      );

      if (!header) return;

      const content = fs.readFileSync(filePath, "utf8");

      if (content.includes("Licensed under the Apache License")) {
        console.log(`Skipping: ${file} (Already licensed)`);
        return;
      }

      const newContent = header + content;
      fs.writeFileSync(filePath, newContent, "utf8");
      console.log(`✅ Applied ${ext} header to: ${filePath}`);
    }
  });
}

console.log("🚀 Starting License Header Injection...");
processDirectory(PROJECT_ROOT);
console.log("🎯 Finished! Your engine is now legally protected.");
