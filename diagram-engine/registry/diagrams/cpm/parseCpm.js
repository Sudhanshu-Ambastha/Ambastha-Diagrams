/**
 * parseCpm.js
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

import { CPMDb } from "./cpmDb.js";

export function parseCPM(code) {
  const db = new CPMDb();

  const lines = code
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  let activities = [];
  let durations = [];
  let predecessors = [];

  lines.forEach((line) => {
    const clean = (prefix) =>
      line
        .replace(prefix, "")
        .split(",")
        .map((s) => s.trim());

    if (line.startsWith("type:")) {
      db.type = line.replace("type:", "").trim().toLowerCase();
    } else if (line.startsWith("activity:")) {
      activities = clean("activity:");
    } else if (line.startsWith("duration:")) {
      durations = clean("duration:");
    } else if (line.startsWith("predecessor:")) {
      predecessors = clean("predecessor:");
    }
  });

  if (activities.length === 0) {
    throw new Error(
      "No activities defined. Add a line like: activity: A, B, C",
    );
  }
  if (activities.length !== durations.length) {
    throw new Error(
      `Activity count (${activities.length}) doesn't match duration count (${durations.length})`,
    );
  }

  activities.forEach((id, i) => {
    const rawPred = predecessors[i];
    const preds =
      typeof rawPred === "string" &&
      rawPred.trim() !== "" &&
      rawPred.trim() !== "_"
        ? rawPred
            .split(";")
            .map((p) => p.trim())
            .filter((p) => p !== "")
        : [];

    db.addActivity(id, durations[i], preds);
  });

  db.calculate();
  return db;
}
