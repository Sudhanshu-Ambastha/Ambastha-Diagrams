/**
 * layoutKanban.js
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

export function layoutKanban(
  model,
  config = { colWidth: 280, ticketHeight: 90 },
) {
  const positions = { swimlanes: [], columns: [], tickets: {} };
  const colGap = 25;
  const laneGap = 60;
  let currentY = 20;

  model.columns.forEach((col, idx) => {
    positions.columns.push({
      x: idx * (config.colWidth + colGap) + 20,
      y: 0,
      width: config.colWidth,
      title: col.title,
      color: col.color,
    });
  });

  model.swimlanes.forEach((lane) => {
    const laneStartY = currentY;
    let maxTicketsInLane = 0;

    model.columns.forEach((col, colIdx) => {
      const tickets = lane.rows[col.title] || [];
      maxTicketsInLane = Math.max(maxTicketsInLane, tickets.length);
      const x = colIdx * (config.colWidth + colGap) + 20;

      tickets.forEach((ticket, tIdx) => {
        positions.tickets[ticket.id] = {
          x: x + 10,
          y: laneStartY + 60 + tIdx * (config.ticketHeight + 15),
          width: config.colWidth - 20,
          height: config.ticketHeight,
        };
      });
    });

    positions.swimlanes.push({
      title: lane.title,
      y: laneStartY,
      height: Math.max(120, maxTicketsInLane * 110 + 80),
    });
    currentY += Math.max(120, maxTicketsInLane * 110 + 80) + laneGap;
  });

  return {
    positions,
    totalWidth: model.columns.length * (config.colWidth + colGap) + 40,
    totalHeight: currentY,
  };
}
