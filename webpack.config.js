const webpack = require('webpack');

module.exports = {
    devtool: 'inline-source-map',
    entry: './src/index.ts',
    output: {
      filename: 'dist/index.js'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },
    module: {
      rules: [
        { test: /\.tsx?$/, loader: 'ts-loader' }
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ]
  }
