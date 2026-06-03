const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

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
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(
              __dirname,
              "node_modules/ambastha-engine/syntax/abd.tmLanguage.json",
            ),
            to: path.resolve(
              __dirname,
              "dist",
              "web",
              "syntax",
              "abd.tmLanguage.json",
            ),
          },
        ],
      }),
    ],
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
    entry: "./src/web/engine.js",
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
