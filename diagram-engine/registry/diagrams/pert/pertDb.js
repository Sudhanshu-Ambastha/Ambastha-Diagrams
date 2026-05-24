/**
 * pertDb.js
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

export class PERTDb {
  constructor() {
    this.type = "aoa";
    this.events = {};
    this.activities = [];
    this.tasks = {};
    this.projectTime = 0;
  }

  addActivityAOA(from, to, topt, tml, tpess) {
    const te = (topt + 4 * tml + tpess) / 6;
    const variance = Math.pow((tpess - topt) / 6, 2);

    this.activities.push({ from, to, te, variance });

    [from, to].forEach((id) => {
      if (!this.events[id]) {
        this.events[id] = {
          id,
          e: 0,
          l: Infinity,
          successors: [],
          predecessors: [],
        };
      }
    });

    this.events[from].successors.push({ to, te });
    this.events[to].predecessors.push({ from, te });
  }

  addTaskAON(id, duration, predecessors) {
    this.tasks[id] = {
      id,
      duration,
      predecessors: predecessors || [],
      successors: [],
      es: 0,
      ef: 0,
      ls: 0,
      lf: Infinity,
      slack: 0,
      isCritical: false,
    };
  }

  topologicalSort() {
    const isAON = this.type === "aon";
    const nodes = isAON ? this.tasks : this.events;
    const indegree = {};
    const queue = [];
    const result = [];

    Object.keys(nodes).forEach((id) => {
      indegree[id] = isAON
        ? nodes[id].predecessors.length
        : nodes[id].predecessors.length;
      if (indegree[id] === 0) queue.push(id);
    });

    while (queue.length > 0) {
      const current = queue.shift();
      result.push(current);

      const targetSuccessors = isAON
        ? nodes[current].successors
        : nodes[current].successors.map((s) => s.to);
      targetSuccessors.forEach((succId) => {
        indegree[succId]--;
        if (indegree[succId] === 0) queue.push(succId);
      });
    }

    if (result.length !== Object.keys(nodes).length) {
      throw new Error(
        "PERT graph contains a cycle or disconnected dependency issue.",
      );
    }

    return result;
  }

  calculate() {
    if (this.type === "aoa") {
      this.calculateAOA();
    } else {
      this.calculateAON();
    }
  }

  calculateAOA() {
    const orderedIds = this.topologicalSort();
    orderedIds.forEach((id) => {
      const node = this.events[id];
      if (node.predecessors.length === 0) {
        node.e = 0;
      } else {
        node.e = Math.max(
          ...node.predecessors.map((p) => this.events[p.from].e + p.te),
        );
      }
    });

    const endNodes = orderedIds.filter(
      (id) => this.events[id].successors.length === 0,
    );
    this.projectTime = Math.max(...endNodes.map((id) => this.events[id].e), 0);

    [...orderedIds].reverse().forEach((id) => {
      const node = this.events[id];
      if (node.successors.length === 0) {
        node.l = this.projectTime;
      } else {
        node.l = Math.min(
          ...node.successors.map((s) => this.events[s.to].l - s.te),
        );
      }
    });
  }

  calculateAON() {
    Object.keys(this.tasks).forEach((id) => {
      this.tasks[id].predecessors.forEach((predId) => {
        if (this.tasks[predId]) {
          this.tasks[predId].successors.push(id);
        }
      });
    });

    const orderedIds = this.topologicalSort();

    orderedIds.forEach((id) => {
      const task = this.tasks[id];
      if (task.predecessors.length === 0) {
        task.es = 0;
      } else {
        task.es = Math.max(
          ...task.predecessors.map((predId) => this.tasks[predId]?.ef || 0),
        );
      }
      task.ef = task.es + task.duration;
    });

    this.projectTime = Math.max(
      ...Object.values(this.tasks).map((t) => t.ef),
      0,
    );

    [...orderedIds].reverse().forEach((id) => {
      const task = this.tasks[id];
      if (task.successors.length === 0) {
        task.lf = this.projectTime;
      } else {
        task.lf = Math.min(
          ...task.successors.map((succId) => this.tasks[succId]?.ls || 0),
        );
      }
      task.ls = task.lf - task.duration;
      task.slack = task.ls - task.es;
      task.isCritical = task.slack <= 0.01;
    });
  }
}
