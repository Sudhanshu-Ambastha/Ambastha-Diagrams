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

export const AbdShapes = {
  actor: (x, y, label, theme) => usecaseTemplates.actor(x, y, label, theme),
  note: (x, y, text, theme) => usecaseTemplates.note(x, y, text, theme),

  classBox: (x, y, w, struct, theme) =>
    classTemplates.struct(x, y, w, struct, theme),

  seqParticipant: (x, y, label, type, theme) => {
    const actorSVG =
      type === "actor" ? usecaseTemplates.actor(0, 0, label, theme) : null;
    return sequenceTemplates.participant(x, y, label, type, actorSVG);
  },

  seqNote: (x, y, w, text, theme) => {
    return sequenceTemplates.note(x, y, w, text, (tx, ty, content) =>
      usecaseTemplates.note(tx, ty, content, theme),
    );
  },

  classConnector: (marker, fromId, toId, positions) =>
    classTemplates.connector(marker, fromId, toId, positions),

  lifeline: (x, topY, bottomY) => sequenceTemplates.lifeline(x, topY, bottomY),
  activationBar: (x, y, height) => sequenceTemplates.activation(x, y, height),
  seqMessage: (fromX, toX, y, text, type) =>
    sequenceTemplates.message(fromX, toX, y, text, type),
  interactionFrame: (x, y, w, h, type, label, sections) =>
    sequenceTemplates.frame(x, y, w, h, type, label, sections),
  dashedDivider: (x1, x2, y, text) =>
    sequenceTemplates.divider(x1, x2, y, text),

  boundary: (x, y, w, h, label, theme) =>
    usecaseTemplates.systemBoundary(x, y, w, h, label, theme),
  useCase: (x, y, label, theme) => usecaseTemplates.useCase(x, y, label, theme),
  external: (x, y, label, theme) =>
    usecaseTemplates.externalSystem(x, y, label, theme),
  pertNode: (event, pos, radius, theme) =>
    pertTemplates.eventNode(event, pos, radius, theme),
  pertActivity: (x1, y1, x2, y2, te, isCrit, midX, midY, theme) =>
    pertTemplates.activity(x1, y1, x2, y2, te, isCrit, midX, midY, theme),
  cpmNode: (x, y, data, theme) => cpmTemplates.node(x, y, data, theme),

  ganttBar: (x, y, w, id, crit, color, prog, start, end, rowH) =>
    ganttTemplates.bar(x, y, w, id, crit, color, prog, start, end, rowH),

  kanbanTicket: (x, y, w, h, data) => kanbanTemplates.ticket(x, y, w, h, data),
  kanbanColumn: (x, y, w, h, title, color, limit) =>
    kanbanTemplates.column(x, y, w, h, title, color, limit),
};
