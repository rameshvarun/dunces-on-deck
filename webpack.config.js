const webpack = require('webpack');
const path = require("path");
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { execSync } = require('child_process');

const common = {
  entry: {
    host: "./src/host.tsx",
    remote: "./src/remote.tsx",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: { allowTsInNodeModules: true }
        }
      },
      {
        test: /\.(png|svg|jpg|gif|mp3)$/,
        use: ["file-loader"]
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      title: 'Dunces on Deck',
      filename: 'index.html',
      chunks: ['host']
    }),
    new HtmlWebpackPlugin({
      template: 'src/remote.html',
      title: 'Dunces on Deck Remote',
      filename: 'join/index.html',
      chunks: ['remote']
    }),
    new CopyPlugin([
      { from: 'src/manifest.json', to: '.' },
    ]),
    new webpack.DefinePlugin({
      'VERSION': JSON.stringify(execSync('git describe --always', {encoding: 'utf-8'}).trim()),
    })
  ]
};

const development = {
  mode: 'development',
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
    https: true,
    useLocalIp: true,
    host: "0.0.0.0"
  },
}

const production = {
  mode: 'production',
}

module.exports = (env) => {
  if (env === 'development') return merge(common, development);
  else if (env === 'production') return merge(common, production);
  else {
    throw new Error(`Unknown environment ${env}.`);
  }
}
