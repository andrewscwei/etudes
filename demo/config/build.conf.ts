import HTMLPlugin from 'html-webpack-plugin'
import path from 'path'
import { Configuration } from 'webpack'

const isDev = process.env.NODE_ENV === 'development'
const cwd = path.join(__dirname, '../')
const inputDir = path.join(cwd, 'src')
const outputDir = path.join(cwd, '../', '.gh-pages')

const config: Configuration = {
  devtool: isDev ? 'source-map' : false,
  entry: {
    main: path.join(inputDir, 'index.tsx'),
  },
  infrastructureLogging: {
    level: 'error',
  },
  mode: isDev ? 'development' : 'production',
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.[jt]sx?$/,
      use: [{
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
      }],
    }, {
      test: /\.svg$/,
      include: /assets\/svgs/,
      type: 'asset/source',
    }, {
      test: /\.(jpe?g|png|gif|svg)(\?.*)?$/,
      include: /assets\/images/,
      type: 'asset',
      generator: {
        filename: `assets/images/${isDev ? '[name]' : '[name].[hash:base64]'}[ext]`,
      },
    }, {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      include: /assets\/media/,
      type: 'asset',
      generator: {
        filename: `assets/media/${isDev ? '[name]' : '[name].[hash:base64]'}[ext]`,
      },
    }],
  },
  output: {
    filename: isDev ? '[name].js' : '[name].[chunkhash].js',
    path: outputDir,
    publicPath: process.env.NODE_ENV === 'development' ? '/' : './',
    sourceMapFilename: '[file].map',
  },
  plugins: [
    new HTMLPlugin({
      filename: 'index.html',
      inject: true,
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: false,
      },
      template: path.join(inputDir, 'templates', 'index.html'),
    }),
  ],
  resolve: {
    alias: {
      ...!isDev ? {} : {
        'etudes': path.join(cwd, '../lib'),
      },
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  target: 'web',
  ...isDev ? {
    devServer: {
      historyApiFallback: true,
    },
  } : {},
}

export default config
