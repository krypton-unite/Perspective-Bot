const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  // devtool: 'inline-source-map',
  devServer: {
    hot: true,
    inline: true,
    contentBase: './dist',
  },
  entry: {
    // client: 'webpack-hot-middleware/client',
    // dev_server: './src/dev_server.js'
    client: 'webpack-dev-server/client?http://localhost:8080',
    dev_server: 'webpack/hot/dev-server'
  },
  plugins: [
    // OccurrenceOrderPlugin is needed for webpack 1.x only
    // new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    // Use NoErrorsPlugin for webpack 1.x
    // new webpack.NoEmitOnErrorsPlugin()
  ]
});
