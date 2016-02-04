var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './index.js',
  output: {
    path: __dirname,
    filename: 'bezier.js',
    library: "Bezier",
    libraryTarget: "var"
  },
  module: {
    loaders: [
      {
        test: /lib\/.*\.js$/,
        loaders: [
          'babel-loader'
        ],
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
};
