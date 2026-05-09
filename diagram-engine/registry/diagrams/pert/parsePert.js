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
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  let isAON = false;
  const dataMap = {};

  lines.forEach((line) => {
    if (line.toLowerCase().startsWith("type:")) {
      const typeVal = line.split(":")[1].trim().toLowerCase();
      if (typeVal === "aon") isAON = true;
    } else if (line.includes(":")) {
      const parts = line.split(":");
      const key = parts[0].trim().toLowerCase();
      const value = parts.slice(1).join(":").trim();
      dataMap[key] = value;
    }
  });

  db.type = isAON ? "aon" : "aoa";

  const cleanList = (rawStr) => {
    if (!rawStr) return [];
    return rawStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  if (isAON) {
    const activities = cleanList(dataMap["activity"] || dataMap["task"]);
    const durations = cleanList(dataMap["duration"] || dataMap["likely"]);

    let predecessorsRaw = [];
    if (dataMap["predecessor"] || dataMap["predecessors"]) {
      predecessorsRaw = (dataMap["predecessor"] || dataMap["predecessors"])
        .split(",")
        .map((s) => s.trim());
    }

    activities.forEach((activity, index) => {
      const durationVal = parseFloat(durations[index] || 0);

      let preds = [];
      const predString = predecessorsRaw[index];
      if (predString && predString !== "-" && predString !== "_") {
        preds = predString
          .split(";")
          .map((p) => p.trim())
          .filter(Boolean);
      }

      db.addTaskAON(activity, durationVal, preds);
    });
  } else {
    const activities = cleanList(dataMap["activity"]);
    const optimistic = cleanList(dataMap["optimistic"] || "");
    const likely = cleanList(dataMap["likely"] || "");
    const pessimistic = cleanList(dataMap["pessimistic"] || "");

    activities.forEach((activity, index) => {
      let from, to;
      if (activity.includes("->")) {
        [from, to] = activity.split("->").map((s) => s.trim());
      } else if (activity.includes("-")) {
        [from, to] = activity.split("-").map((s) => s.trim());
      }

      if (!from || !to) return;

      db.addActivityAOA(
        from,
        to,
        parseFloat(optimistic[index] || likely[index] || 0),
        parseFloat(likely[index] || 0),
        parseFloat(pessimistic[index] || likely[index] || 0),
      );
    });
  }

  db.calculate();
  return db;
}
