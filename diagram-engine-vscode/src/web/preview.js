import * as vscode from "vscode";

function encodeUtf8(str) {
  return new TextEncoder().encode(str);
}

function decodeBase64(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export class PreviewPanel {
  static currentPanel = undefined;
  static currentDocument = undefined;

  static createOrShow(context, document, column) {
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
      }
    );

    PreviewPanel.currentPanel = panel;
    PreviewPanel.currentDocument = document;

    panel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === "ready") {
        PreviewPanel._sendUpdate(PreviewPanel.currentDocument);
        return;
      }
      if (msg.type === "download") {
        const ext = msg.format;
        const uri = await vscode.window.showSaveDialog({
          defaultUri: vscode.Uri.file("diagram." + ext),
          filters: ext === "svg" ? { "SVG Image": ["svg"] } : { "PNG Image": ["png"] },
        });
        if (!uri) return;
        try {
          const bytes = ext === "svg"
            ? encodeUtf8(msg.text)
            : decodeBase64(msg.data.replace(/^data:image\/\w+;base64,/, ""));
          await vscode.workspace.fs.writeFile(uri, bytes);
          vscode.window.showInformationMessage("Saved as " + ext.toUpperCase() + " \u2713");
        } catch (error) {
          vscode.window.showErrorMessage("Failed to save: " + (error.message || "Unknown error"));
        }
      }
    });

    panel.webview.html = getWebviewContent(panel.webview, context);

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
    if (!document || !PreviewPanel.currentPanel) return;
    PreviewPanel.currentPanel.webview.postMessage({
      type: "update",
      text: document.getText(),
    });
  }
}

function getWebviewContent(webview, context) {
  const engineSrc = webview
    .asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "dist", "web", "engine.js"))
    .toString();

  const cspSource = webview.cspSource;

  const parts = [];
  parts.push('<!DOCTYPE html>');
  parts.push('<html lang="en">');
  parts.push('<head>');
  parts.push('<meta charset="UTF-8">');
  parts.push('<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\' ' + cspSource + '; style-src \'unsafe-inline\'; img-src data: blob:;">');
  parts.push('<style>');
  parts.push('html,body{height:100%;margin:0;padding:0;overflow:hidden;background:#0f1117;color:#e2e8f0;font-family:"Segoe UI",system-ui,sans-serif}');
  parts.push(':root{--surf:#181b27;--bord:#2a2d3e;--acc:#6c8cff;--text:#e2e8f0;--muted:#64748b;--danger:#f87171;--tbh:44px;--r:6px}');
  parts.push('#toolbar{position:fixed;top:0;left:0;right:0;height:var(--tbh);background:var(--surf);border-bottom:1px solid var(--bord);display:flex;align-items:center;gap:4px;padding:0 10px;z-index:9999;user-select:none}');
  parts.push('.brand{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-right:4px}');
  parts.push('.sep{width:1px;height:20px;background:var(--bord);margin:0 5px;flex-shrink:0}');
  parts.push('.tb{display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border:1px solid var(--bord);border-radius:var(--r);background:transparent;color:var(--text);font-size:12px;cursor:pointer;white-space:nowrap;transition:background 120ms,border-color 120ms,color 120ms}');
  parts.push('.tb:hover{background:rgba(108,140,255,.14);border-color:var(--acc);color:var(--acc)}');
  parts.push('.tb svg{width:13px;height:13px;flex-shrink:0;fill:none;stroke:currentColor;stroke-width:1.6}');
  parts.push('#zpct{font-size:12px;color:var(--muted);min-width:38px;text-align:center}');
  parts.push('.dl-wrap{position:relative}');
  parts.push('#dl-drop{display:none;position:absolute;top:calc(100% + 6px);right:0;background:var(--surf);border:1px solid var(--bord);border-radius:var(--r);min-width:160px;z-index:10000;box-shadow:0 8px 24px rgba(0,0,0,.55)}');
  parts.push('#dl-drop.open{display:block}');
  parts.push('.dli{display:flex;align-items:center;gap:8px;padding:9px 13px;font-size:12px;cursor:pointer;color:var(--text);transition:background 100ms}');
  parts.push('.dli:hover{background:var(--bord);color:var(--acc)}');
  parts.push('.dli svg{width:13px;height:13px;flex-shrink:0;fill:none;stroke:currentColor;stroke-width:1.5}');
  parts.push('#vp{position:fixed;top:var(--tbh);left:0;right:0;bottom:22px;overflow:hidden;cursor:grab;background:#0f1117}');
  parts.push('#vp.drag{cursor:grabbing}');
  parts.push('#stage{position:absolute;top:0;left:0;transform-origin:0 0;will-change:transform}');
  parts.push('#canvas svg{display:block}');
  parts.push('.empty,.err{font-family:monospace;font-size:12px;padding:24px 28px}');
  parts.push('.empty{color:var(--muted)}');
  parts.push('.err{color:var(--danger);border-left:3px solid var(--danger);background:rgba(248,113,113,.06);border-radius:0 4px 4px 0}');
  parts.push('.err b{display:block;margin-bottom:6px;font-size:13px}');
  parts.push('#sbar{position:fixed;bottom:0;left:0;right:0;height:22px;background:var(--surf);border-top:1px solid var(--bord);display:flex;align-items:center;padding:0 10px;font-size:11px;color:var(--muted);font-family:monospace;gap:16px}');
  parts.push('#sb-r{margin-left:auto}');
  parts.push('</style>');
  parts.push('</head>');
  parts.push('<body>');
  parts.push('<div id="toolbar">');
  parts.push('  <span class="brand">ABD Preview</span>');
  parts.push('  <div class="sep"></div>');
  parts.push('  <button class="tb" id="btn-zi" title="Zoom in"><svg viewBox="0 0 16 16"><circle cx="6.5" cy="6.5" r="4.5"/><line x1="10.2" y1="10.2" x2="14" y2="14"/><line x1="6.5" y1="4.5" x2="6.5" y2="8.5"/><line x1="4.5" y1="6.5" x2="8.5" y2="6.5"/></svg></button>');
  parts.push('  <span id="zpct">100%</span>');
  parts.push('  <button class="tb" id="btn-zo" title="Zoom out"><svg viewBox="0 0 16 16"><circle cx="6.5" cy="6.5" r="4.5"/><line x1="10.2" y1="10.2" x2="14" y2="14"/><line x1="4.5" y1="6.5" x2="8.5" y2="6.5"/></svg></button>');
  parts.push('  <button class="tb" id="btn-fit" title="Fit"><svg viewBox="0 0 16 16"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/></svg>Fit</button>');
  parts.push('  <div class="sep"></div>');
  parts.push('  <div class="dl-wrap">');
  parts.push('    <button class="tb" id="btn-dl"><svg viewBox="0 0 16 16"><path d="M8 2v8M5 7l3 3 3-3"/><path d="M2 11v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1"/></svg>Export &#9660;</button>');
  parts.push('    <div id="dl-drop">');
  parts.push('      <div class="dli" id="dl-svg"><svg viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 10.5c0 .8.7 1.5 1.5 1.5h3a1.5 1.5 0 0 0 0-3h-2a1.5 1.5 0 0 1 0-3h3"/></svg>Save as SVG</div>');
  parts.push('      <div class="dli" id="dl-png"><svg viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="2"/><circle cx="5.5" cy="6" r="1.2"/><path d="M2 13l3.5-4 2.5 2.5 2-2.5 3.5 4"/></svg>Save as PNG (2x)</div>');
  parts.push('    </div>');
  parts.push('  </div>');
  parts.push('</div>');
  parts.push('<div id="vp"><div id="stage"><div id="canvas"><p class="empty">Loading\u2026</p></div></div></div>');
  parts.push('<div id="sbar"><span id="sb-z">100%</span><span id="sb-r">engine loading\u2026</span></div>');
  parts.push('<script src="' + engineSrc + '"><\/script>');
  parts.push('<script>');
  parts.push('(function(){');
  parts.push('"use strict";');
  parts.push('var vscode=acquireVsCodeApi();');
  parts.push('var vp=document.getElementById("vp");');
  parts.push('var stage=document.getElementById("stage");');
  parts.push('var canvas=document.getElementById("canvas");');
  parts.push('var zpct=document.getElementById("zpct");');
  parts.push('var drop=document.getElementById("dl-drop");');
  parts.push('var sbZ=document.getElementById("sb-z");');
  parts.push('var sbR=document.getElementById("sb-r");');
  parts.push('var renderDiagram=null;');
  parts.push('var pendingText=null;');
  parts.push('function tryResolve(){');
  parts.push('  try{');
  parts.push('    var e=typeof DiagramEngine!=="undefined"?DiagramEngine:undefined;');
  parts.push('    console.log("[ABD] DiagramEngine=",typeof e,e);');
  parts.push('    if(!e)return false;');
  parts.push('    if(typeof e.renderDiagram==="function"){renderDiagram=e.renderDiagram;return true;}');
  parts.push('    if(typeof e.default==="function"){renderDiagram=e.default;return true;}');
  parts.push('    if(e.default&&typeof e.default.renderDiagram==="function"){renderDiagram=e.default.renderDiagram;return true;}');
  parts.push('    if(typeof e==="function"){renderDiagram=e;return true;}');
  parts.push('    return false;');
  parts.push('  }catch(ex){console.error("[ABD] tryResolve error",ex);return false;}');
  parts.push('}');
  parts.push('function engineReady(){sbR.textContent="engine ready";sbR.style.color="#4ade80";vscode.postMessage({type:"ready"});if(pendingText!==null){doRender(pendingText);pendingText=null;}}');
  parts.push('function engineFailed(){sbR.textContent="engine FAILED \u2014 F12 for details";sbR.style.color="#f87171";canvas.innerHTML="<div class=\'err\'><b>Engine failed to load</b><br>Open DevTools (F12) Console for the error. Check that dist/web/engine.js was built correctly.</div>";}');
  parts.push('if(tryResolve()){engineReady();}else{var _n=0,_t=setInterval(function(){_n++;if(tryResolve()){clearInterval(_t);engineReady();}else if(_n>=80){clearInterval(_t);engineFailed();}},100);}');
  parts.push('var sc=1,tx=0,ty=0;');
  parts.push('function applyT(){stage.style.transform="translate("+tx+"px,"+ty+"px) scale("+sc+")";var p=Math.round(sc*100)+"%";zpct.textContent=p;sbZ.textContent=p;}');
  parts.push('function fit(){requestAnimationFrame(function(){var vw=vp.clientWidth,vh=vp.clientHeight,cw=canvas.scrollWidth||400,ch=canvas.scrollHeight||300;sc=Math.min((vw-80)/cw,(vh-80)/ch,1);tx=(vw-cw*sc)/2;ty=(vh-ch*sc)/2;applyT();});}');
  parts.push('function zoomAt(d,cx,cy){var p=sc;sc=Math.min(10,Math.max(0.05,sc*(1+d)));var r=sc/p;tx=cx-r*(cx-tx);ty=cy-r*(cy-ty);applyT();}');
  parts.push('document.getElementById("btn-zi").onclick=function(){zoomAt(.2,vp.clientWidth/2,vp.clientHeight/2);};');
  parts.push('document.getElementById("btn-zo").onclick=function(){zoomAt(-.2,vp.clientWidth/2,vp.clientHeight/2);};');
  parts.push('document.getElementById("btn-fit").onclick=fit;');
  parts.push('vp.addEventListener("wheel",function(e){e.preventDefault();var r=vp.getBoundingClientRect();zoomAt(e.deltaY<0?.15:-.15,e.clientX-r.left,e.clientY-r.top);},{passive:false});');
  parts.push('var _drag=false,_px=0,_py=0,_ox=0,_oy=0;');
  parts.push('vp.addEventListener("pointerdown",function(e){if(e.button)return;_drag=true;vp.classList.add("drag");vp.setPointerCapture(e.pointerId);_px=e.clientX;_py=e.clientY;_ox=tx;_oy=ty;});');
  parts.push('vp.addEventListener("pointermove",function(e){if(!_drag)return;tx=_ox+(e.clientX-_px);ty=_oy+(e.clientY-_py);applyT();});');
  parts.push('function _ed(){_drag=false;vp.classList.remove("drag");}');
  parts.push('vp.addEventListener("pointerup",_ed);vp.addEventListener("pointercancel",_ed);');
  parts.push('function doRender(text){if(!renderDiagram){pendingText=text;return;}if(!text||!text.trim()){canvas.innerHTML="<p class=\'empty\'>Empty \u2014 start typing.</p>";return;}try{canvas.innerHTML=renderDiagram(text);fit();sbR.textContent="rendered OK";sbR.style.color="#4ade80";}catch(err){canvas.innerHTML="<div class=\'err\'><b>Render Error</b><br>"+(err.message||String(err))+"</div>";sbR.textContent="render error";sbR.style.color="#f87171";}}');
  parts.push('function getSVGEl(){return canvas.querySelector("svg");}');
  parts.push('function buildSVGString(){var svg=getSVGEl();if(!svg)return null;var clone=svg.cloneNode(true);clone.setAttribute("xmlns","http://www.w3.org/2000/svg");clone.setAttribute("xmlns:xlink","http://www.w3.org/1999/xlink");var live=svg.querySelectorAll("*");var cloned=clone.querySelectorAll("*");["fill","stroke","stroke-width","font-size","font-family","font-weight","opacity","text-anchor","dominant-baseline"].forEach(function(p){live.forEach(function(el,i){try{var v=window.getComputedStyle(el).getPropertyValue(p);if(v)cloned[i].style[p]=v;}catch(_){}});});return\'<?xml version="1.0" encoding="UTF-8"?>\\n\'+new XMLSerializer().serializeToString(clone);}');
  parts.push('function doExportSVG(){try{var xml=buildSVGString();if(!xml){sbR.textContent="nothing to export";return;}vscode.postMessage({type:"download",format:"svg",text:xml});}catch(e){sbR.textContent="SVG error: "+(e.message||e);}}');
  parts.push('function doExportPNG(){var svg=getSVGEl();if(!svg){sbR.textContent="nothing to export";return;}var vb=svg.viewBox&&svg.viewBox.baseVal;var W=parseFloat(svg.getAttribute("width"))||(vb&&vb.width)||svg.getBoundingClientRect().width||800;var H=parseFloat(svg.getAttribute("height"))||(vb&&vb.height)||svg.getBoundingClientRect().height||600;var S=2;var xml=buildSVGString();if(!xml)return;var uri="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(xml);var img=new Image();img.onload=function(){try{var c=document.createElement("canvas");c.width=Math.ceil(W*S);c.height=Math.ceil(H*S);var ctx=c.getContext("2d");ctx.fillStyle="#ffffff";ctx.fillRect(0,0,c.width,c.height);ctx.scale(S,S);ctx.drawImage(img,0,0,W,H);var url=c.toDataURL("image/png");if(!url||url==="data:,"){sbR.textContent="PNG failed";return;}vscode.postMessage({type:"download",format:"png",data:url});}catch(e){sbR.textContent="PNG error: "+(e.message||e);}};img.onerror=function(){sbR.textContent="PNG: image load failed";};img.src=uri;}');
  parts.push('document.getElementById("btn-dl").addEventListener("click",function(e){e.stopPropagation();drop.classList.toggle("open");});');
  parts.push('document.addEventListener("click",function(){drop.classList.remove("open");});');
  parts.push('document.getElementById("dl-svg").addEventListener("click",function(){drop.classList.remove("open");doExportSVG();});');
  parts.push('document.getElementById("dl-png").addEventListener("click",function(){drop.classList.remove("open");doExportPNG();});');
  parts.push('window.addEventListener("message",function(ev){var m=ev.data;if(!m)return;if(m.type==="update")doRender(m.text);});');
  parts.push('})();');
  parts.push('<\/script>');
  parts.push('</body>');
  parts.push('</html>');
  return parts.join('\n');
}