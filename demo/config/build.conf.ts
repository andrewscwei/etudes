import HTMLPlugin from 'html-webpack-plugin'
import path from 'path'
import { Configuration, EnvironmentPlugin } from 'webpack'

const isDev: boolean = process.env.NODE_ENV === 'development'
const cwd: string = path.join(__dirname, '../')
const inputDir: string = path.join(cwd, 'src')
const outputDir: string = path.join(cwd, '../', '.gh-pages')

const config: Configuration = {
  devtool: isDev ? 'eval-source-map' : 'source-map',
  entry: {
    bundle: path.join(inputDir, 'index.tsx'),
  },
  infrastructureLogging: {
    level: 'error',
  },
  mode: isDev ? 'development' : 'production',
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.tsx?$/,
      use: [{
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
      }],
    }, {
      test: /\.(jpe?g|png|gif|svg)(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          esModule: false,
          limit: 8192,
          name: `assets/images/[name]${isDev ? '' : '.[hash:6]'}.[ext]`,
        },
      }],
    }, {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          esModule: false,
          limit: 8192,
          name: `assets/videos/[name]${isDev ? '' : '.[hash:6]'}.[ext]`,
        },
      }],
    }],
  },
  output: {
    filename: isDev ? '[name].js' : '[name].[chunkhash].js',
    path: outputDir,
    publicPath: process.env.NODE_ENV === 'development' ? '/' : './',
    sourceMapFilename: '[file].map',
    globalObject: 'this', // https://github.com/webpack/webpack/issues/6642#issuecomment-371087342
  },
  plugins: [
    new EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
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
  ...!isDev ? {} : {
    devServer: {
      historyApiFallback: true,
    },
  } as any,
  resolve: {
    alias: {
      ...!isDev ? {} : {
        'etudes': path.join(cwd, '../lib'),
      },
    },
    extensions: ['.js', '.ts', '.tsx'],
  },
  target: 'web',
}

export default config
