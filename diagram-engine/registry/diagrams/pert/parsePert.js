/**
 * parsePert.js
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

import { PERTDb } from "./pertDb.js";

export function parsePert(code) {
  const db = new PERTDb();

  const lines = code
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  let activities = [];
  let optimistic = [];
  let likely = [];
  let pessimistic = [];

  const cleanList = (line, prefix) => {
    return line
      .replace(prefix, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  lines.forEach((line) => {
    if (line.startsWith("activity:")) {
      activities = cleanList(line, "activity:");
    } else if (line.startsWith("optimistic:")) {
      optimistic = cleanList(line, "optimistic:");
    } else if (line.startsWith("likely:")) {
      likely = cleanList(line, "likely:");
    } else if (line.startsWith("pessimistic:")) {
      pessimistic = cleanList(line, "pessimistic:");
    }
  });

  activities.forEach((activity, index) => {
    let from;
    let to;

    if (activity.includes("->")) {
      [from, to] = activity.split("->").map((s) => s.trim());
    } else if (activity.includes("-")) {
      [from, to] = activity.split("-").map((s) => s.trim());
    }

    if (!from || !to) {
      console.warn("Invalid activity definition:", activity);
      return;
    }

    db.addActivity(
      from,
      to,
      parseFloat(optimistic[index] || 0),
      parseFloat(likely[index] || 0),
      parseFloat(pessimistic[index] || 0),
    );
  });

  db.calculate();

  return db;
}
