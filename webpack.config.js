const webpack = require('webpack');
const ClosureCompilerPlugin = require('webpack-closure-compiler');
const isProd = process.argv.indexOf("--env.prod") >= 0;

module.exports = {
  devtool: 'inline-source-map',
  entry: {
    index: './src/index.ts',
    "engine/golang/render": './src/engine/golang/render.ts',
    "engine/golang/reducer": './src/engine/golang/reducer.ts',
    "engine/golang/bootstrap": './src/engine/golang/bootstrap.ts',
    "engine/golang/epic": './src/engine/golang/epic.ts'
  },
  output: {
    filename: 'dist/[name].js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
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
    ? [new ClosureCompilerPlugin({ jsCompiler: true, compiler: { warning_level: "QUIET" } })]
    : [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin()
    ]
  )
}
