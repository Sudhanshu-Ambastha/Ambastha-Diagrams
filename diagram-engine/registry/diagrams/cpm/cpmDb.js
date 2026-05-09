/**
 * cpmDb.js
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

export class CPMDb {
  constructor() {
    this.activities = {};
    this.type = "aon";
  }

  addActivity(id, duration, predecessors = []) {
    this.activities[id] = {
      id,
      duration: parseFloat(duration) || 0,
      predecessors: predecessors.filter((p) => p && p !== "_" && p !== ""),
      successors: [],
      es: 0,
      ef: 0,
      ls: 0,
      lf: 0,
      slack: 0,
      isCritical: false,
    };
  }

  getSortedNodes() {
    const activities = this.activities;
    const ids = Object.keys(activities);

    const inDegree = {};
    ids.forEach((id) => {
      inDegree[id] = 0;
    });
    ids.forEach((id) => {
      activities[id].predecessors.forEach((predId) => {
        if (activities[predId]) inDegree[id]++;
      });
    });

    const queue = ids.filter((id) => inDegree[id] === 0);
    const sorted = [];

    while (queue.length > 0) {
      const id = queue.shift();
      const node = activities[id];
      sorted.push(node);

      ids.forEach((otherId) => {
        if (activities[otherId].predecessors.includes(id)) {
          inDegree[otherId]--;
          if (inDegree[otherId] === 0) queue.push(otherId);
        }
      });
    }

    if (sorted.length !== ids.length) {
      const inCycle = ids.filter((id) => !sorted.find((n) => n.id === id));
      throw new Error(`Circular dependency detected: ${inCycle.join(", ")}`);
    }

    return sorted;
  }

  calculate() {
    const nodes = this.getSortedNodes();

    nodes.forEach((node) => {
      node.successors = [];
      node.predecessors.forEach((predId) => {
        if (this.activities[predId]) {
          this.activities[predId].successors.push(node.id);
        }
      });
    });

    nodes.forEach((node) => {
      node.es =
        node.predecessors.length === 0
          ? 0
          : Math.max(
              ...node.predecessors.map((p) => this.activities[p]?.ef || 0),
            );
      node.ef = node.es + node.duration;
    });

    const pft = nodes.length > 0 ? Math.max(...nodes.map((n) => n.ef)) : 0;
    [...nodes].reverse().forEach((node) => {
      node.lf =
        node.successors.length === 0
          ? pft
          : Math.min(
              ...node.successors.map((s) => this.activities[s]?.ls ?? pft),
            );
      node.ls = node.lf - node.duration;
      node.slack = node.lf - node.ef;
      node.isCritical = Math.abs(node.slack) < 0.001;
    });
  }

  getAoAMapping() {
    const milestones = {};
    const arrows = [];
    const dummies = [];
    const nodes = this.getSortedNodes();
    let mCounter = 1;

    milestones["m_start"] = { id: mCounter++, es: 0, ls: 0 };
    nodes.forEach((n) => {
      milestones[`m_${n.id}`] = { id: mCounter++, es: n.ef, ls: n.lf };
    });

    nodes.forEach((n) => {
      let fromKey;

      if (n.predecessors.length === 0) {
        fromKey = "m_start";
      } else if (n.predecessors.length === 1) {
        fromKey = `m_${n.predecessors[0]}`;
      } else {
        const mergeKey = `m_merge_${n.predecessors.slice().sort().join("_")}`;
        if (!milestones[mergeKey]) {
          const es = Math.max(
            ...n.predecessors.map((p) => this.activities[p].ef),
          );
          const ls = Math.min(
            ...n.predecessors.map((p) => this.activities[p].lf),
          );
          milestones[mergeKey] = { id: mCounter++, es, ls };
          n.predecessors.forEach((predId) => {
            dummies.push({
              from: `m_${predId}`,
              to: mergeKey,
              isCritical: this.activities[predId].isCritical,
            });
          });
        }
        fromKey = mergeKey;
      }

      arrows.push({
        id: n.id,
        from: fromKey,
        to: `m_${n.id}`,
        duration: n.duration,
        isCritical: n.isCritical,
      });
    });

    return { milestones, arrows, dummies };
  }
}
