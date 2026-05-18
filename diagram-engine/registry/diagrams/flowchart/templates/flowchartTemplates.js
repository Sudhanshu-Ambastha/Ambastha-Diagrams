import { wrapText } from "../../../utils/textWrap.js";

export const flowchartTemplates = {
  startstop(x, y, label) {
    return `
    <g class="flow-startstop">
      <ellipse cx="${x}" cy="${y}" rx="70" ry="22" fill="#61c1ed" stroke="black" stroke-width="1.5"/>
      <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11"
            font-family="Helvetica" font-weight="bold" fill="black">${label}</text>
    </g>`;
  },

  io(x, y, label) {
    const lines = wrapText(label, 90);
    const h = 40;
    const w = 120;
    const skew = 20;
    const pts = `${x - w / 2 + skew},${y - h / 2} ${x + w / 2 + skew},${y - h / 2} ${x + w / 2 - skew},${y + h / 2} ${x - w / 2 - skew},${y + h / 2}`;
    return `
    <g class="flow-io">
      <polygon points="${pts}" fill="#61c1ed" stroke="black" stroke-width="1.5"/>
      ${lines
        .map(
          (line, i) => `
        <text x="${x}" y="${y - (lines.length - 1) * 7 + 4 + i * 14}"
              text-anchor="middle" font-size="11" font-family="Helvetica"
              font-weight="bold" fill="black">${line}</text>`,
        )
        .join("")}
    </g>`;
  },

  process(x, y, label) {
    const lines = wrapText(label, 120);
    const boxW = 140;
    const boxH = Math.max(40, lines.length * 14 + 16);
    return `
    <g class="flow-process">
      <rect x="${x - boxW / 2}" y="${y - boxH / 2}" width="${boxW}" height="${boxH}"
            fill="#61c1ed" stroke="black" stroke-width="1.5" rx="4"/>
      ${lines
        .map(
          (line, i) => `
        <text x="${x}" y="${y - (lines.length - 1) * 7 + 4 + i * 14}"
              text-anchor="middle" font-size="11" font-family="Helvetica"
              font-weight="bold" fill="black">${line}</text>`,
        )
        .join("")}
    </g>`;
  },

  decision(x, y, label) {
    const lines = wrapText(label, 80);
    const hw = 80;
    const hh = 50;
    return `
    <g class="flow-decision">
      <path d="M ${x} ${y - hh} L ${x + hw} ${y} L ${x} ${y + hh} L ${x - hw} ${y} Z"
            fill="#61c1ed" stroke="black" stroke-width="1.5"/>
      ${lines
        .map(
          (line, i) => `
        <text x="${x}" y="${y - (lines.length - 1) * 7 + 4 + i * 14}"
              text-anchor="middle" font-size="11" font-family="Helvetica"
              font-weight="bold" fill="black">${line}</text>`,
        )
        .join("")}
    </g>`;
  },

  connector(x1, y1, x2, y2, label) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    return `
    <g class="flow-connector">
      <path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="black" stroke-width="1.5"
            fill="none" marker-end="url(#arrow-open)"/>
      ${
        label
          ? `
        <rect x="${midX - 15}" y="${midY - 9}" width="30" height="16"
              fill="white" rx="3" opacity="0.9"/>
        <text x="${midX}" y="${midY + 3}" text-anchor="middle" font-size="10"
              font-family="Helvetica" font-weight="bold" fill="#333">${label}</text>`
          : ""
      }
    </g>`;
  },

  elbowConnector(x1, y1, x2, y2, label) {
    const midY = (y1 + y2) / 2;
    const d = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
    return `
    <g class="flow-connector">
      <path d="${d}" stroke="black" stroke-width="1.5" fill="none"
            marker-end="url(#arrow-open)"/>
      ${
        label
          ? `
        <text x="${(x1 + x2) / 2}" y="${midY - 4}" text-anchor="middle" font-size="10"
              font-family="Helvetica" font-weight="bold" fill="#333">${label}</text>`
          : ""
      }
    </g>`;
  },
};
