const webpack = require('webpack');
const path = require('path');
const src = './client';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const outputPath = path.resolve(__dirname, './public');

const webpackConfig = {
  entry: {
    app: [
      'react-hot-loader/patch',
      path.resolve(__dirname, src + '/index.js')
    ]
  },
  output: {
    path: path.resolve(__dirname, './public '),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(gif|png|jpg|jpeg|svg)$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, src + '/assets/'),
        use: 'url-loader?limit=10000&name=assets/[name]-[hash].[ext]'
      }
    ]
  },
  resolve: {
    alias: {
      'components': path.resolve(__dirname, src + '/components'),
      'constants': path.resolve(__dirname, src + '/constants'),
      'containers': path.resolve(__dirname, src + '/containers'),
      'actions': path.resolve(__dirname, src + '/actions'),
      'reducers': path.resolve(__dirname, src + '/reducers'),
      'routes': path.resolve(__dirname, src + '/routes'),
      'store': path.resolve(__dirname, src + '/store'),
      'utils': path.resolve(__dirname, src + '/utils'),
      'assets': path.resolve(__dirname, src + '/assets'),
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, src + '/assets/index.html'),
      filename: 'index.html',
      path: outputPath
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    contentBase: path.resolve(__dirname, './public'),
    port: 4200,
    historyApiFallback: true,
    inline: true,
    hot: true,
    host: '0.0.0.0'
  }
};

module.exports = webpackConfig;
