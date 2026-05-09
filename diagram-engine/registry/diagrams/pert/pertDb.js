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
    this.events = {};
    this.activities = [];
  }

  addActivity(from, to, topt, tml, tpess) {
    if (!from || !to) {
      console.warn("Invalid activity:", { from, to });
      return;
    }

    const te = (topt + 4 * tml + tpess) / 6;
    const variance = Math.pow((tpess - topt) / 6, 2);

    this.activities.push({
      from,
      to,
      te,
      variance,
    });

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

    this.events[from].successors.push({
      to,
      te,
    });

    this.events[to].predecessors.push({
      from,
      te,
    });
  }

  topologicalSort() {
    const indegree = {};
    const queue = [];
    const result = [];

    Object.keys(this.events).forEach((id) => {
      indegree[id] = this.events[id].predecessors.length;

      if (indegree[id] === 0) {
        queue.push(id);
      }
    });

    while (queue.length > 0) {
      const current = queue.shift();
      result.push(current);

      this.events[current].successors.forEach((succ) => {
        indegree[succ.to]--;

        if (indegree[succ.to] === 0) {
          queue.push(succ.to);
        }
      });
    }

    if (result.length !== Object.keys(this.events).length) {
      throw new Error(
        "PERT graph contains a cycle or disconnected dependency issue.",
      );
    }

    return result;
  }

  calculate() {
    const orderedIds = this.topologicalSort();

    orderedIds.forEach((id) => {
      const node = this.events[id];

      if (node.predecessors.length === 0) {
        node.e = 0;
      } else {
        node.e = Math.max(
          ...node.predecessors.map(
            (pred) => this.events[pred.from].e + pred.te,
          ),
        );
      }
    });

    const endNodes = orderedIds.filter(
      (id) => this.events[id].successors.length === 0,
    );

    const projectTime = Math.max(...endNodes.map((id) => this.events[id].e));

    [...orderedIds].reverse().forEach((id) => {
      const node = this.events[id];

      if (node.successors.length === 0) {
        node.l = projectTime;
      } else {
        node.l = Math.min(
          ...node.successors.map((succ) => this.events[succ.to].l - succ.te),
        );
      }
    });

    this.projectTime = projectTime;
  }
}
