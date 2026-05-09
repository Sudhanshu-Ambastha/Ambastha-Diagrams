/**
 * parseGantt.js
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
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function formatDate(d) {
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function stripComment(str) {
  return str.replace(/\s+#(?![0-9a-fA-F]{6}(\b|,|\s|$)).*$/, "").trim();
}
function splitCSV(str) {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");
}

export function parseGantt(source) {
  const lines = source
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  const meta = {
    title: "",
    dateFormat: "YYYY-MM-DD",
    view: "days",
    startDate: null,
    firstDayOfWeek: "monday",
    holidays: [],
  };

  const groups = [];
  const allActs = {};
  const milestones = [];
  let currentGroup = null;
  let currentProps = {};
  let msCounter = 0;

  function toArr(v) {
    return !v ? [] : Array.isArray(v) ? v : [v];
  }

  function flushGroup() {
    if (!currentGroup || !currentProps.activity) return;
    const acts = toArr(currentProps.activity);
    const durs = toArr(currentProps.duration);
    const preds = toArr(currentProps.predecessor);
    const progs = toArr(currentProps.progress);
    const colors = toArr(currentProps.color);
    const starts = toArr(currentProps.customstart);

    const groupActs = [];
    acts.forEach((id, i) => {
      const dur = parseFloat(durs[i]);
      if (isNaN(dur) || dur <= 0) {
        console.warn(
          `Activity "${id}" has invalid duration "${durs[i]}" — skipping. Use milestone: keyword for checkpoints.`,
        );
        return;
      }
      const rawPred = preds[i];
      const predList =
        typeof rawPred === "string" && rawPred !== "" && rawPred !== "_"
          ? rawPred
              .split(";")
              .map((p) => p.trim())
              .filter(Boolean)
          : [];
      const customStart =
        starts[i] && starts[i] !== "_" ? starts[i].trim() : null;
      const rawColor = colors[i];
      const color = rawColor && rawColor !== "_" ? rawColor.trim() : null;

      const act = {
        id,
        name: id,
        duration: dur,
        predecessors: predList,
        successors: [],
        progress: Math.min(100, Math.max(0, parseFloat(progs[i]) || 0)),
        color,
        customStart,
        isMilestone: false,
        group: currentGroup.name === "__default__" ? null : currentGroup.name,
        es: 0,
        ef: 0,
        ls: 0,
        lf: 0,
        slack: 0,
        isCritical: false,
        startDate: null,
        endDate: null,
      };
      allActs[id] = act;
      groupActs.push(act);
    });
    currentGroup.activities = groupActs;
    groups.push(currentGroup);
    currentGroup = null;
    currentProps = {};
  }

  lines.forEach((line) => {
    if (line.toLowerCase() === "gantt") return;

    if (/^group\s+/i.test(line)) {
      flushGroup();
      currentGroup = {
        name: line.replace(/^group\s+/i, "").trim(),
        activities: [],
      };
      currentProps = {};
      return;
    }

    if (/^milestone:/i.test(line)) {
      msCounter++;
      milestones.push({
        id: `__ms_${msCounter}`,
        name: line.slice(10).trim(),
        date: null,
        deps: [],
        color: null,
      });
      return;
    }
    if (/^milestonedate:/i.test(line)) {
      if (milestones.length)
        milestones[milestones.length - 1].date = stripComment(line.slice(14));
      return;
    }
    if (/^milestonedeps:/i.test(line)) {
      if (milestones.length) {
        milestones[milestones.length - 1].deps = splitCSV(
          stripComment(line.slice(14)),
        );
      }
      return;
    }
    if (/^milestonecolor:/i.test(line)) {
      if (milestones.length) {
        const c = stripComment(line.slice(15)).trim();
        milestones[milestones.length - 1].color = c && c !== "_" ? c : null;
      }
      return;
    }

    if (!line.includes(":")) return;
    const colonIdx = line.indexOf(":");
    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const rawValue = stripComment(line.slice(colonIdx + 1));
    if (!rawValue) return;
    const value = rawValue.includes(",") ? splitCSV(rawValue) : rawValue;

    if (key === "title") meta.title = value;
    else if (key === "dateformat") meta.dateFormat = value;
    else if (key === "view") meta.view = String(value).toLowerCase();
    else if (key === "startdate") meta.startDate = value;
    else if (key === "firstdayofweek")
      meta.firstDayOfWeek = String(value).toLowerCase();
    else if (key === "holidays") meta.holidays = toArr(value);
    else {
      if (!currentGroup) {
        currentGroup = { name: "__default__", activities: [] };
        currentProps = {};
      }
      currentProps[key] = value;
    }
  });

  flushGroup();

  if (Object.keys(allActs).length === 0)
    throw new Error("Gantt requires at least one activity.");

  Object.values(allActs).forEach((act) => {
    act.predecessors.forEach((predId) => {
      if (allActs[predId]) allActs[predId].successors.push(act.id);
    });
  });

  scheduleGantt(allActs, meta);

  const baseDate = new Date(meta.startDate || new Date());
  milestones.forEach((ms) => {
    const depEF = ms.date
      ? daysBetween(baseDate, new Date(ms.date))
      : Math.max(0, ...ms.deps.map((d) => allActs[d]?.ef || 0));
    allActs[ms.id] = {
      id: ms.id,
      name: ms.name,
      duration: 0,
      predecessors: ms.deps,
      successors: [],
      progress: 0,
      color: ms.color,
      customStart: null,
      isMilestone: true,
      group: null,
      es: depEF,
      ef: depEF,
      ls: depEF,
      lf: depEF,
      slack: 0,
      isCritical: false,
      startDate: formatDate(addDays(baseDate, depEF)),
      endDate: formatDate(addDays(baseDate, depEF)),
    };
  });

  return { meta, groups, allActs, milestones };
}

function scheduleGantt(allActs, meta) {
  const baseDate = meta.startDate ? new Date(meta.startDate) : new Date();
  const ids = Object.keys(allActs);
  const inDegree = {};
  ids.forEach((id) => {
    inDegree[id] = 0;
  });
  ids.forEach((id) => {
    if (allActs[id].customStart) return;
    allActs[id].predecessors.forEach((predId) => {
      if (allActs[predId]) inDegree[id]++;
    });
  });

  const visited = new Set();
  const sorted = [];
  const queue = ids.filter(
    (id) => inDegree[id] === 0 && !allActs[id].customStart,
  );
  ids
    .filter((id) => allActs[id].customStart)
    .forEach((id) => {
      visited.add(id);
      sorted.push(allActs[id]);
    });

  while (queue.length > 0) {
    const id = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    sorted.push(allActs[id]);
    ids.forEach((other) => {
      if (allActs[other].customStart || visited.has(other)) return;
      if (allActs[other].predecessors.includes(id)) {
        inDegree[other]--;
        if (inDegree[other] === 0) queue.push(other);
      }
    });
  }

  const unvisited = ids.filter((id) => !visited.has(id));
  if (unvisited.length > 0)
    throw new Error(`Circular dependency: ${unvisited.join(", ")}`);

  sorted.forEach((act) => {
    act.es = act.customStart
      ? daysBetween(baseDate, new Date(act.customStart))
      : act.predecessors.length === 0
        ? 0
        : Math.max(...act.predecessors.map((p) => allActs[p]?.ef || 0));
    act.ef = act.es + act.duration;
    act.startDate = formatDate(addDays(baseDate, act.es));
    act.endDate = formatDate(addDays(baseDate, act.ef));
  });

  const pft = Math.max(...ids.map((id) => allActs[id].ef), 0);
  [...sorted].reverse().forEach((act) => {
    act.lf =
      act.successors.length === 0
        ? pft
        : Math.min(...act.successors.map((s) => allActs[s]?.ls ?? pft));
    act.ls = act.lf - act.duration;
    act.slack = act.lf - act.ef;
    act.isCritical = !act.customStart && Math.abs(act.slack) < 0.001;
  });
}
