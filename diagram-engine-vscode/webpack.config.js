const path = require("path");

module.exports = [
  {
    name: "extension-web",
    entry: "./src/web/extension.js",
    output: {
      filename: "extension.js",
      path: path.resolve(__dirname, "dist", "web"),
      libraryTarget: "commonjs",
    },
    target: "webworker",
    externals: { vscode: "commonjs vscode" },
    resolve: {
      mainFields: ["browser", "module", "main"],
      extensions: [".js", ".json"],
      fallback: { fs: false, path: false },
    },
    performance: { hints: false },
    devtool: false,
    mode: "production",
  },

  {
    name: "extension-desktop",
    entry: "./src/web/extension.js",
    output: {
      filename: "extension.js",
      path: path.resolve(__dirname, "dist", "desktop"),
      libraryTarget: "commonjs2",
    },
    target: "node",
    externals: { vscode: "commonjs vscode" },
    resolve: {
      mainFields: ["module", "main"],
      extensions: [".js", ".json"],
    },
    performance: { hints: false },
    devtool: false,
    mode: "production",
  },

  {
    name: "engine",
    entry: "../diagram-engine/core/index.js",
    output: {
      filename: "engine.js",
      path: path.resolve(__dirname, "dist", "web"),
      library: {
        name: "DiagramEngine",
        type: "var",
      },
    },
    target: "web",
    resolve: {
      mainFields: ["browser", "module", "main"],
      extensions: [".js", ".json"],
      fallback: { fs: false, path: false },
    },
    performance: { hints: false },
    devtool: false,
    mode: "production",
  },
];
