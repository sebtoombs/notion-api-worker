const path = require('path')

const mode = process.env.NODE_ENV || 'production'

module.exports = {
  output: {
    filename: `worker.js`,
    path: path.join(__dirname, 'dist'),
  },
  target: 'webworker',
  devtool: 'source-map',
  mode,
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'esbuild-loader',
      },
    ],
  },
  optimization: {
    usedExports: true,
  },
}
