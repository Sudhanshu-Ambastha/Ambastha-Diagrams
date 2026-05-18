const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url"); 

const ENGINE_PATH = path.join(
  __dirname,
  "diagram-engine-vscode",
  "dist",
  "web",
  "engine.js",
);

const diagramText = `
flowchart
  startstop "Start Process" as A; "Terminate Run" as G
  io "Read Configuration File" as B
  decision "Is Environment Valid?" as C
  process "Initialize Aero Engine" as D; "Log System Specs" as E; "Throw Crash Dump" as F

  A --> B
  B --> C
  C --> D "Yes"
  C --> F "No"
  D --> E
  E --> G
  F --> G
`.trim();

async function runTest() {
  try {
    console.log("--------------------------------------------------");
    console.log("🛠️  Loading Diagram Engine...");
    console.log("--------------------------------------------------");

    if (!fs.existsSync(ENGINE_PATH)) {
      throw new Error(
        `Engine file not found at: ${ENGINE_PATH}\nDid you forget to build/compile your project files first?`,
      );
    }

    // This will now resolve perfectly using the url module function
    const engineUrl = pathToFileURL(ENGINE_PATH).href;
    const engine = await import(engineUrl);

    const renderDiagram =
      engine.renderDiagram ||
      (engine.default && engine.default.renderDiagram) ||
      engine.default;

    if (typeof renderDiagram !== "function") {
      throw new Error(
        "Could not find a valid 'renderDiagram' export function inside engine.js.",
      );
    }

    console.log("🚀 Compiling Diagram to SVG String...");
    const svgOutput = renderDiagram(diagramText);

    console.log("\n--------------------------------------------------");
    console.log("📄 GENERATED RAW SVG XML CODE OUTPUT:");
    console.log("--------------------------------------------------\n");

    console.log(svgOutput);

    console.log("\n--------------------------------------------------");

    const outputPath = path.join(__dirname, "output-test.svg");
    fs.writeFileSync(outputPath, svgOutput, "utf8");
    console.log(`✅ Success! Raw output saved directly to: ./output-test.svg`);
  } catch (error) {
    console.error(`\n❌ Test Framework Execution Failure:\n${error.message}`);
  }
}

runTest();
