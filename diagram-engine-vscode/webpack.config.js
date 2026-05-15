const path = require("path");

module.exports = [
  {
    entry: "./src/web/extension.js",
    output: {
      filename: "extension.js",
      path: path.resolve(__dirname, "dist", "web"),
      libraryTarget: "commonjs",
    },
    target: "webworker",
    externals: { vscode: "commonjs vscode" },
    mode: "none",
    resolve: {
      extensions: [".js"],
      fallback: { path: false, fs: false },
    },
  },
  {
    entry: "../diagram-engine/core/index.js",
    output: {
      filename: "engine.js",
      path: path.resolve(__dirname, "dist", "web"),
      library: { type: "module" },
    },
    target: "web",
    experiments: { outputModule: true },
    mode: "none",
    resolve: {
      extensions: [".js"],
    },
  },
];
