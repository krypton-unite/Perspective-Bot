const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
pkg_name = require('./package.json').name

module.exports = {
  entry: {
    app: './src/index.js',
  },
  target: 'node', // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Production',
      favicon: "./assets/android-chrome-512x512.png"
    })
  ],
  output: {
    filename: pkg_name+'.js',
    path: path.resolve(__dirname, 'dist'),
  }
};