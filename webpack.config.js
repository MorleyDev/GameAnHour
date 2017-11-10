const webpack = require("webpack");
const ClosureCompilerPlugin = require("webpack-closure-compiler");
const PrepackWebpackPlugin = require("prepack-webpack-plugin")["default"];

const isProd = process.argv.indexOf("--env.prod") >= 0;
const { resolve } = require("path");

// Full optimisation is dangerous due to the loop optimiser
const fullOptimisation = {
  test: /\.(j|t)sx?$/,
  use: [{
    loader: "babel-loader",
    options: {
      presets: [["@babel/preset-env", { loose: true, useBuiltIns: "usage" }]],
      plugins: ["transform-typescript", "closure-elimination", "preval", "loop-optimizer", "tailcall-optimization", "module:fast-async"]
    }
  }]
};

// Standard will not remove .map and .forEach, so is safer, but less performant
const standardOptimisation = {
  test: /\.(j|t)sx?$/,
  use: [{
    loader: "babel-loader",
    options: {
      presets: [["@babel/preset-env", { loose: true, useBuiltIns: "usage" }]],
      plugins: ["transform-typescript", "closure-elimination", "preval", "tailcall-optimization", "module:fast-async"]
    }
  }]
};
const safeFullOptimisationDirectories = [
  resolve(__dirname, "src/engine"),
  resolve(__dirname, "src/main/components"),
  resolve(__dirname, "src/main/game-bootstrap.ts"),
  resolve(__dirname, "src/main/game-initial-state.ts"),
  resolve(__dirname, "src/main/game-reducer.ts"),
  resolve(__dirname, "src/main/game-render.ts"),
  resolve(__dirname, "src/main/game-models.ts"),
  resolve(__dirname, "src/pauper/assets"),
  resolve(__dirname, "src/pauper/audio"),
  resolve(__dirname, "src/pauper/maths"),
  resolve(__dirname, "src/pauper/models"),
  resolve(__dirname, "src/pauper/ecs"),
  resolve(__dirname, "src/pauper/redux"),
  resolve(__dirname, "src/pauper/render"),
  resolve(__dirname, "src/pauper/rx-operators"),
  resolve(__dirname, "src/pauper/utility")
];

module.exports = {
  devtool: "inline-source-map",
  entry: {
    "index": "./src/index.ts",
    "engine/golang/bootstrap": "./src/engine/golang/bootstrap.ts",
    "engine/golang/epic": "./src/engine/golang/epic.ts",
    "engine/golang/reducer": "./src/engine/golang/reducer.ts",
    "engine/golang/render": "./src/engine/golang/render.ts",
    "engine/sfml/index": "./src/engine/sfml/index.ts"
  },
  output: {
    filename: "dist/[name].js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        ...fullOptimisation,
        include: safeFullOptimisationDirectories
      },
      {
        ...standardOptimisation,
        exclude: [resolve(__dirname, "node_modules")].concat(safeFullOptimisationDirectories)
      }
    ]//.concat(isProd ? [{ ...standardOptimisation, include: [resolve(__dirname, "node_modules")] }] : [])
  },
  devServer: {
    hot: true,
    noInfo: true,
    host: "0.0.0.0",
    disableHostCheck: true,
    port: 8080,
    inline: true
  },
  plugins: (isProd
    ? [
      new PrepackWebpackPlugin({
        test: /\.ts$/,
        prepack: {
          mathRandomSeed: Math.random(),
          speculate: true
        }
      })//,
      //new ClosureCompilerPlugin({ jsCompiler: true, compiler: { warning_level: "QUIET" } })
    ]
    : [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin()
    ]
  )
}
