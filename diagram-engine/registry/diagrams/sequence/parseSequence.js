/**
 * parseSequence.js
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

export function parseSequence(source) {
  const lines = source
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  const model = { participants: [], messages: [], notes: [], dividers: [] };
  const pMap = new Map();
  const frameStack = [];

  function addParticipant(id, label, type) {
    if (pMap.has(id)) return;
    const p = { id, label: label || id, type: type || "object" };
    model.participants.push(p);
    pMap.set(id, p);
  }

  function currentMessages() {
    if (frameStack.length === 0) return model.messages;
    return frameStack[frameStack.length - 1].sections.at(-1).messages;
  }

  lines.forEach((line) => {
    if (/^sequence$/i.test(line)) return;

    const pMatch = line.match(/^participant\s+(actor\s+)?(.+?)\s+as\s+(\S+)$/i);
    if (pMatch) {
      addParticipant(
        pMatch[3],
        pMatch[2].trim(),
        pMatch[1] ? "actor" : "object",
      );
      return;
    }

    const noteMatch = line.match(
      /^note\s+(left of|right of|over)\s+([^:]+):\s*(.+)$/i,
    );
    if (noteMatch) {
      const [, position, target, text] = noteMatch;
      currentMessages().push({
        kind: "note",
        placement: position.toLowerCase(),
        targets: target.split(",").map((s) => s.trim()),
        text: text.trim(),
      });
      return;
    }

    const divMatch = line.match(/^==\s*(.+?)\s*==$/);
    if (divMatch) {
      model.dividers.push({
        text: divMatch[1],
        afterIndex: model.messages.length,
      });
      return;
    }

    const frameOpen = line.match(/^(loop|alt|opt|par|critical|break)\s*(.*)$/i);
    if (frameOpen) {
      frameStack.push({
        kind: "frame",
        type: frameOpen[1].toLowerCase(),
        label: frameOpen[2].trim(),
        sections: [{ label: "", messages: [] }],
      });
      return;
    }

    if (/^else(\s|$)/i.test(line)) {
      if (frameStack.length > 0) {
        frameStack[frameStack.length - 1].sections.push({
          label: line.replace(/^else\s*/i, "").trim(),
          messages: [],
        });
      }
      return;
    }

    if (/^end$/i.test(line)) {
      if (frameStack.length > 0) {
        const frame = frameStack.pop();
        currentMessages().push(frame);
      }
      return;
    }

    const msgMatch = line.match(/^(\S+)\s*(-{1,2}>?>?x?)\s*(\S+)\s*:\s*(.*)$/);
    if (msgMatch) {
      const [, fromId, arrow, toId, text] = msgMatch;
      addParticipant(fromId);
      addParticipant(toId);
      let type =
        arrow === "->x"
          ? "destroy"
          : arrow.startsWith("--") && arrow.includes(">>")
            ? "asyncReply"
            : arrow.includes(">>")
              ? "async"
              : arrow.startsWith("--")
                ? "reply"
                : "sync";

      currentMessages().push({
        kind: "message",
        fromId,
        toId,
        text: text.trim(),
        type,
      });
    }
  });

  return model;
}
