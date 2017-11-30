const path = require("path")

module.exports = {
  entry: "./src/script.js",
  output: {
      path: path.join(__dirname, "dist", "js"),
      filename: "bundle.js"
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
}