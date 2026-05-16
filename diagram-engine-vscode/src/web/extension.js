import * as vscode from "vscode";

export function activate(context) {
  const openPreview = vscode.commands.registerCommand(
    "diagramEngine.openPreview",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage(
          "Open an .abd file first to preview it.",
        );
        return;
      }
      PreviewPanel.createOrShow(context, editor.document);
    },
  );

  const onTextChange = vscode.workspace.onDidChangeTextDocument((e) => {
    if (isAbdFile(e.document)) PreviewPanel.update(e.document);
  });

  const onActiveEditorChange = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor && isAbdFile(editor.document)) {
        PreviewPanel.createOrShow(context, editor.document);
      }
    },
  );

  // Auto-open if .abd is already active on load
  const current = vscode.window.activeTextEditor;
  if (current && isAbdFile(current.document)) {
    PreviewPanel.createOrShow(context, current.document);
  }

  context.subscriptions.push(openPreview, onTextChange, onActiveEditorChange);
}

function isAbdFile(doc) {
  return doc.languageId === "abd" || doc.fileName.endsWith(".abd");
}

class PreviewPanel {
  static currentPanel = undefined;
  static currentDocument = undefined;

  static createOrShow(context, document) {
    const column = vscode.ViewColumn.Beside;

    if (PreviewPanel.currentPanel) {
      PreviewPanel.currentPanel.reveal(column);
      PreviewPanel.currentDocument = document;
      PreviewPanel._sendUpdate(document);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "diagramPreview",
      "ABD Preview",
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, "dist", "web"),
        ],
      },
    );

    PreviewPanel.currentPanel = panel;
    PreviewPanel.currentDocument = document;
    panel.webview.html = getWebviewContent(panel.webview, context);

    setTimeout(() => PreviewPanel._sendUpdate(document), 200);

    panel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type !== "download") return;

      const uri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file("diagram." + msg.format),
        filters: { Images: [msg.format] },
      });
      if (!uri) return;

      let buf;
      if (msg.format === "svg") {
        // SVG sent as raw UTF-8 string via msg.text
        buf = Buffer.from(msg.text, "utf8");
      } else {
        // PNG sent as data: URI via msg.data — strip header then decode
        const b64 = msg.data.replace(/^data:image\/\w+;base64,/, "");
        buf = Buffer.from(b64, "base64");
      }

      await vscode.workspace.fs.writeFile(uri, buf);
      vscode.window.showInformationMessage(
        "Saved diagram as " + msg.format.toUpperCase() + " ✓",
      );
    });

    panel.onDidDispose(() => {
      PreviewPanel.currentPanel = undefined;
      PreviewPanel.currentDocument = undefined;
    });
  }

  static update(document) {
    if (
      PreviewPanel.currentPanel &&
      PreviewPanel.currentDocument?.uri.toString() === document.uri.toString()
    ) {
      PreviewPanel._sendUpdate(document);
    }
  }

  static _sendUpdate(document) {
    PreviewPanel.currentPanel?.webview.postMessage({
      type: "update",
      text: document.getText(),
    });
  }
}

// ─────────────────────────────────────────────────────────────
//  HTML — everything inlined, no external CSS, no external fonts
//  Uses a <meta> nonce-free CSP compatible with vscode web
// ─────────────────────────────────────────────────────────────
function getWebviewContent(webview, context) {
  const engineUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "dist", "web", "engine.js"),
  );

  // NOTE: We intentionally keep ALL styles inside <style> tags (not attribute
  // style="") so they are covered by `style-src 'unsafe-inline'`.
  // The toolbar uses position:fixed so VS Code's body margin/padding can't push
  // it off-screen.

  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none';
               script-src 'unsafe-inline' ${webview.cspSource};
               style-src  'unsafe-inline';
               img-src    data: blob:;
               worker-src blob:;">
<style>
/* ── hard reset — fight VS Code's injected body styles ── */
html { height: 100%; }
body {
  margin: 0 !important;
  padding: 0 !important;
  background: #0f1117 !important;
  color: #e2e8f0;
  font-family: 'Segoe UI', system-ui, sans-serif;
  height: 100%;
  overflow: hidden;
}

/* ── tokens ── */
:root {
  --bg:      #0f1117;
  --surf:    #181b27;
  --bord:    #2a2d3e;
  --acc:     #6c8cff;
  --text:    #e2e8f0;
  --muted:   #64748b;
  --danger:  #f87171;
  --tbh:     44px;
  --r:       6px;
}

/* ── TOOLBAR — fixed to top, always visible ── */
#toolbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--tbh);
  background: var(--surf);
  border-bottom: 1px solid var(--bord);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 10px;
  z-index: 9999;
  user-select: none;
  /* make absolutely sure it's not hidden */
  visibility: visible !important;
  opacity: 1 !important;
}

.brand {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--muted);
  margin-right: 4px;
}
.sep {
  width: 1px; height: 20px;
  background: var(--bord);
  margin: 0 5px;
  flex-shrink: 0;
}

/* ── Generic toolbar button ── */
.tb {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border: 1px solid var(--bord);
  border-radius: var(--r);
  background: transparent;
  color: var(--text);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
  transition: background 120ms, border-color 120ms, color 120ms;
}
.tb:hover {
  background: rgba(108,140,255,.14);
  border-color: var(--acc);
  color: var(--acc);
}
.tb svg { width: 13px; height: 13px; flex-shrink: 0; fill: none; stroke: currentColor; stroke-width: 1.6; }

/* zoom readout */
#zpct {
  font-size: 12px;
  color: var(--muted);
  min-width: 38px;
  text-align: center;
}

/* ── Download dropdown ── */
.dl-wrap { position: relative; }
#dl-drop {
  display: none;
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--surf);
  border: 1px solid var(--bord);
  border-radius: var(--r);
  min-width: 150px;
  z-index: 10000;
  box-shadow: 0 8px 24px rgba(0,0,0,.55);
}
#dl-drop.open { display: block; }
.dli {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  font-size: 12px;
  cursor: pointer;
  color: var(--text);
  transition: background 100ms;
}
.dli:hover { background: var(--bord); color: var(--acc); }
.dli svg { width: 13px; height: 13px; flex-shrink: 0; fill: none; stroke: currentColor; stroke-width: 1.5; }

/* ── Viewport (below toolbar) ── */
#vp {
  position: fixed;
  top: var(--tbh);
  left: 0; right: 0; bottom: 0;
  overflow: hidden;
  cursor: grab;
  background: var(--bg);
}
#vp.drag { cursor: grabbing; }

/* ── Stage (the transformed layer) ── */
#stage {
  position: absolute;
  top: 0; left: 0;
  transform-origin: 0 0;
  will-change: transform;
}

/* ── Content states ── */
#canvas svg { display: block; }
.empty, .err {
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  padding: 28px 32px;
}
.empty { color: var(--muted); }
.err {
  color: var(--danger);
  border-left: 3px solid var(--danger);
  background: rgba(248,113,113,.06);
  border-radius: 0 4px 4px 0;
}
.err b { display: block; margin-bottom: 4px; font-size: 14px; }
</style>
</head>
<body>

<!-- ═══════════════════ TOOLBAR ═══════════════════ -->
<div id="toolbar">
  <span class="brand">ABD Preview</span>
  <div class="sep"></div>

  <!-- Zoom in -->
  <button class="tb" id="btn-zi" title="Zoom in">
    <svg viewBox="0 0 16 16">
      <circle cx="6.5" cy="6.5" r="4.5"/>
      <line x1="10.2" y1="10.2" x2="14" y2="14"/>
      <line x1="6.5" y1="4.5" x2="6.5" y2="8.5"/>
      <line x1="4.5" y1="6.5" x2="8.5" y2="6.5"/>
    </svg>
  </button>

  <span id="zpct">100%</span>

  <!-- Zoom out -->
  <button class="tb" id="btn-zo" title="Zoom out">
    <svg viewBox="0 0 16 16">
      <circle cx="6.5" cy="6.5" r="4.5"/>
      <line x1="10.2" y1="10.2" x2="14" y2="14"/>
      <line x1="4.5" y1="6.5" x2="8.5" y2="6.5"/>
    </svg>
  </button>

  <!-- Fit -->
  <button class="tb" id="btn-fit" title="Fit diagram to view">
    <svg viewBox="0 0 16 16">
      <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/>
    </svg>
    Fit
  </button>

  <div class="sep"></div>

  <!-- Download dropdown -->
  <div class="dl-wrap">
    <button class="tb" id="btn-dl" title="Download diagram">
      <svg viewBox="0 0 16 16">
        <path d="M8 2v8M5 7l3 3 3-3"/>
        <path d="M2 11v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1"/>
      </svg>
      Download ▾
    </button>
    <div id="dl-drop">
      <div class="dli" id="dl-svg">
        <svg viewBox="0 0 16 16">
          <rect x="2" y="2" width="12" height="12" rx="2"/>
          <path d="M5 10.5c0 .8.7 1.5 1.5 1.5h3a1.5 1.5 0 0 0 0-3h-2a1.5 1.5 0 0 1 0-3h3A1.5 1.5 0 0 1 12 7"/>
        </svg>
        Save as SVG
      </div>
      <div class="dli" id="dl-png">
        <svg viewBox="0 0 16 16">
          <rect x="2" y="2" width="12" height="12" rx="2"/>
          <circle cx="5.5" cy="6" r="1.2"/>
          <path d="M2 13l3.5-4 2.5 2.5 2-2.5 3.5 4"/>
        </svg>
        Save as PNG (2×)
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════ CANVAS VIEWPORT ═══════════════════ -->
<div id="vp">
  <div id="stage">
    <div id="canvas">
      <p class="empty">Open an .abd file to see the preview.</p>
    </div>
  </div>
</div>

<!-- ═══════════════════ SCRIPT ═══════════════════ -->
<script type="module">
import { renderDiagram } from '${engineUri}';

/* ── vscode bridge (singleton) ── */
const vscode = acquireVsCodeApi();

/* ── DOM ── */
const vp      = document.getElementById('vp');
const stage   = document.getElementById('stage');
const canvas  = document.getElementById('canvas');
const zpct    = document.getElementById('zpct');
const dlDrop  = document.getElementById('dl-drop');

/* ── Transform state ── */
let sc = 1, tx = 0, ty = 0;
const STEP = 0.12, MIN = 0.05, MAX = 10;

function applyT() {
  stage.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + sc + ')';
  zpct.textContent = Math.round(sc * 100) + '%';
}

function fit() {
  requestAnimationFrame(() => {
    const vw = vp.clientWidth,  vh = vp.clientHeight;
    const cw = canvas.scrollWidth || 400, ch = canvas.scrollHeight || 300;
    const pad = 40;
    sc = Math.min((vw - pad * 2) / cw, (vh - pad * 2) / ch, 1);
    tx = (vw - cw * sc) / 2;
    ty = (vh - ch * sc) / 2;
    applyT();
  });
}

function zoomAt(delta, cx, cy) {
  const prev = sc;
  sc = Math.min(MAX, Math.max(MIN, sc * (1 + delta)));
  const r = sc / prev;
  tx = cx - r * (cx - tx);
  ty = cy - r * (cy - ty);
  applyT();
}

/* buttons */
document.getElementById('btn-zi').addEventListener('click',  () => zoomAt(+0.2, vp.clientWidth/2, vp.clientHeight/2));
document.getElementById('btn-zo').addEventListener('click',  () => zoomAt(-0.2, vp.clientWidth/2, vp.clientHeight/2));
document.getElementById('btn-fit').addEventListener('click', fit);

/* wheel */
vp.addEventListener('wheel', e => {
  e.preventDefault();
  const r = vp.getBoundingClientRect();
  zoomAt(e.deltaY < 0 ? 0.15 : -0.15, e.clientX - r.left, e.clientY - r.top);
}, { passive: false });

/* drag / pan */
let drag = false, px = 0, py = 0, ox = 0, oy = 0;
vp.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  drag = true; vp.classList.add('drag');
  vp.setPointerCapture(e.pointerId);
  px = e.clientX; py = e.clientY; ox = tx; oy = ty;
});
vp.addEventListener('pointermove', e => {
  if (!drag) return;
  tx = ox + (e.clientX - px);
  ty = oy + (e.clientY - py);
  applyT();
});
const endDrag = () => { drag = false; vp.classList.remove('drag'); };
vp.addEventListener('pointerup',     endDrag);
vp.addEventListener('pointercancel', endDrag);

/* ── Download ── */
function getSVG() { return canvas.querySelector('svg'); }
function flashErr() {
  canvas.style.outline = '2px solid var(--danger)';
  setTimeout(() => canvas.style.outline = '', 500);
}

function getSVGString() {
  const svg = getSVG();
  if (!svg) return null;

  // Clone so we can safely add xmlns without mutating the live DOM
  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // Inline all computed styles so the export looks identical to the preview
  // (SVG elements lose their CSS class styles when opened standalone)
  clone.querySelectorAll('*').forEach(el => {
    try {
      const live = svg.ownerDocument.defaultView
        .getComputedStyle(svg.querySelector('[data-id="' + el.getAttribute('data-id') + '"]') || el);
      // Only copy paint / font properties that matter for SVG rendering
      const keep = ['fill','stroke','stroke-width','font-size','font-family','font-weight',
                    'opacity','rx','ry','text-anchor','dominant-baseline'];
      keep.forEach(p => {
        const v = live.getPropertyValue(p);
        if (v && v !== '') el.style[p] = v;
      });
    } catch(_) {}
  });

  return new XMLSerializer().serializeToString(clone);
}

function doSVG() {
  const xml = getSVGString();
  if (!xml) return flashErr();
  // Send as raw UTF-8 text — extension host writes it directly as bytes
  vscode.postMessage({ type: 'download', format: 'svg', text: xml });
}

function doPNG() {
  const svg = getSVG(); if (!svg) return flashErr();

  // Get explicit or viewBox dimensions; fall back to bounding rect
  const vb = svg.viewBox && svg.viewBox.baseVal;
  const W  = parseFloat(svg.getAttribute('width'))  || (vb && vb.width)  || svg.getBoundingClientRect().width  || 800;
  const H  = parseFloat(svg.getAttribute('height')) || (vb && vb.height) || svg.getBoundingClientRect().height || 600;
  const S  = 2; // 2× retina quality

  const xml = getSVGString();
  if (!xml) return flashErr();

  // Use data: URI — works in all VS Code webview sandboxes (no blob: needed)
  // encodeURIComponent handles full Unicode; no btoa needed for img.src
  const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);

  const img = new Image();
  img.onload = () => {
    const c   = document.createElement('canvas');
    c.width   = Math.ceil(W * S);
    c.height  = Math.ceil(H * S);
    const ctx = c.getContext('2d');
    // White background so transparent SVG areas become white in PNG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.scale(S, S);
    ctx.drawImage(img, 0, 0, W, H);

    // toDataURL is synchronous and always works inside a webview canvas
    const pngDataUrl = c.toDataURL('image/png');
    if (!pngDataUrl || pngDataUrl === 'data:,') return flashErr();
    vscode.postMessage({ type: 'download', format: 'png', data: pngDataUrl });
  };
  img.onerror = (e) => {
    console.error('PNG render failed:', e);
    flashErr();
  };
  img.src = dataUri;
}

/* dropdown toggle */
document.getElementById('btn-dl').addEventListener('click', e => {
  e.stopPropagation();
  dlDrop.classList.toggle('open');
});
document.addEventListener('click', () => dlDrop.classList.remove('open'));
document.getElementById('dl-svg').addEventListener('click', () => { dlDrop.classList.remove('open'); doSVG(); });
document.getElementById('dl-png').addEventListener('click', () => { dlDrop.classList.remove('open'); doPNG(); });

/* ── Receive diagram text from extension host ── */
window.addEventListener('message', ({ data }) => {
  if (data.type !== 'update') return;
  const text = data.text;
  if (!text || !text.trim()) {
    canvas.innerHTML = '<p class="empty">Empty diagram — start typing.</p>';
    return;
  }
  try {
    canvas.innerHTML = renderDiagram(text);
    fit();
  } catch (err) {
    canvas.innerHTML = '<div class="err"><b>❌ Render Error</b>' + err.message + '</div>';
  }
});
</script>
</body>
</html>`;
}

export function deactivate() {}
