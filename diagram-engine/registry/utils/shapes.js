/**
 * shapes.js
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

import { templates as usecaseTemplates } from "../diagrams/usecase/templates/usecaseTemplates.js";
import { sequenceTemplates } from "../diagrams/sequence/templates/sequenceTemplates.js";
import { pertTemplates } from "../diagrams/pert/templates/pertTemplates.js";
import { cpmTemplates } from "../diagrams/cpm/templates/cpmTemplates.js";
import { ganttTemplates } from "../diagrams/gantt/templates/ganttTemplates.js";
import { T as kanbanTemplates } from "../diagrams/kanban/templates/kanbanTemplates.js";
import { classTemplates } from "../diagrams/class/templates/classTemplates.js";
import { flowchartTemplates } from "../diagrams/flowchart/templates/flowchartTemplates.js";

export const AbdShapes = {
  actor: (x, y, label, theme, styles) =>
    usecaseTemplates.actor(x, y, label, styles),
  note: (x, y, text, theme, styles) =>
    usecaseTemplates.note(x, y, text, styles),

  boundary: (x, y, w, h, label, theme, styles) =>
    usecaseTemplates.systemBoundary(x, y, w, h, label, styles),
  useCase: (x, y, label, theme, styles) =>
    usecaseTemplates.useCase(x, y, label, styles),
  external: (x, y, label, theme, styles) =>
    usecaseTemplates.externalSystem(x, y, label, styles),

  seqParticipant: (x, y, label, type, theme, styles) => {
    const actorSVG =
      type === "actor" ? usecaseTemplates.actor(0, 20, label, styles) : null;
    return sequenceTemplates.participant(x, y, label, type, actorSVG, styles);
  },

  seqNote: (x, y, w, text, theme, styles) => {
    return sequenceTemplates.note(x, y, w, text, (tx, ty, content) =>
      usecaseTemplates.note(tx, ty, content, styles),
    );
  },

  lifeline: (x, topY, bottomY, styles) =>
    sequenceTemplates.lifeline(x, topY, bottomY, styles),
  activationBar: (x, y, height, styles) =>
    sequenceTemplates.activation(x, y, height, styles),
  seqMessage: (fromX, toX, y, text, type, styles) =>
    sequenceTemplates.message(fromX, toX, y, text, type, styles),
  interactionFrame: (x, y, w, h, type, label, sections, styles) =>
    sequenceTemplates.frame(x, y, w, h, type, label, sections, styles),
  dashedDivider: (x1, x2, y, text, styles) =>
    sequenceTemplates.divider(x1, x2, y, text, styles),

  pertNode: (event, pos, radius, theme) => {
    if (event && event.duration !== undefined) {
      const nodeW = 120;
      const nodeH = 100;
      return cpmTemplates.node(
        pos.x - nodeW / 2,
        pos.y - nodeH / 2,
        {
          id: event.id,
          duration: event.duration,
          es: event.es,
          ef: event.ef,
          ls: event.ls,
          lf: event.lf,
          slack: event.slack,
          isCritical: event.isCritical,
        },
        theme,
      );
    }
    return pertTemplates.eventNode(event, pos, radius, theme);
  },
  pertActivity: (x1, y1, x2, y2, te, isCrit, midX, midY, theme) =>
    pertTemplates.activity(x1, y1, x2, y2, te, isCrit, midX, midY, theme),
  cpmNode: (x, y, data, theme) => cpmTemplates.node(x, y, data, theme),

  ganttBar: (x, y, w, id, crit, color, prog, start, end, rowH) =>
    ganttTemplates.bar(x, y, w, id, crit, color, prog, start, end, rowH),

  kanbanTicket: (x, y, w, h, data) => kanbanTemplates.ticket(x, y, w, h, data),
  kanbanColumn: (x, y, w, h, title, color, limit) =>
    kanbanTemplates.column(x, y, w, h, title, color, limit),

  flowStartStop: (x, y, label, theme) =>
    flowchartTemplates.startstop(x, y, label),

  flowProcess: (x, y, label, theme) => flowchartTemplates.process(x, y, label),

  flowDecision: (x, y, label, theme) =>
    flowchartTemplates.decision(x, y, label),

  flowIO: (x, y, label, theme) => flowchartTemplates.io(x, y, label),

  flowLink: (x1, y1, x2, y2, label) =>
    flowchartTemplates.connector(x1, y1, x2, y2, label),

  classBox: (x, y, width, struct, theme) =>
    classTemplates.struct(x, y, width, struct, theme),

  classConnector: (marker, fromId, toId, positions) =>
    classTemplates.connector(marker, fromId, toId, positions),
};
