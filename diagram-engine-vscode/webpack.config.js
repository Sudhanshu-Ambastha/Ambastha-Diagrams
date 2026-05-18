const path = require("path");

module.exports = [
  {
    name: "extension",
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
    name: "engine",
    entry: "./src/web/engine.js",
    output: {
      filename: "engine.js",
      path: path.resolve(__dirname, "dist", "web"),
      // Use 'var' type: assigns to a var named DiagramEngine in global scope
      // This avoids the TDZ issue with 'window' type when minified
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