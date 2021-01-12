const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractLoader = require('mini-css-extract-plugin');
const {
    __DEV__,
    SRC_DIR,
    PROJECT_ROOT,
    ENABLE_VERBOSE,
    HMR_PATH,
    resolvePath,
} = require('../untils/constants');

const baseConfig = {
    target: 'web',
    context: PROJECT_ROOT,
    entry: {
        app: ['react-hot-loader/patch', './src/index.tsx'],
        shared: ['react', 'react-dom'],
    },
    output: {
        publicPath: '/',
        pathinfo: ENABLE_VERBOSE,
        filename: `js/${__DEV__ ? '[name].js?[chunkhash:8]' : '[name].[chunkhash:8].js'}`,
        chunkFilename: __DEV__ ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
        path: resolvePath('dist'),
    },
    resolve: {
        modules: ['node_modules', SRC_DIR],
        extensions: ['.js', '.tsx', '.scss', '.json'],
        alias: {
            '@': SRC_DIR,
            'react-dom': '@hot-loader/react-dom',
        },
    },
    module: {
        rules: [
            // Rules for js / ts /tsx
            {
                test: /\.(js|tsx)$/,
                use: 'babel-loader',
                // options: { cacheDirectory: true },
                include: SRC_DIR,
                exclude: /node_modules/,
            },
            // Rules for Style Sheets
            {
                test: /\.css$/,
                use: getCssLoaders(0),
                exclude: /node_modules/,
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                use: [
                    ...getCssLoaders(2),
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: __DEV__,
                        },
                    },
                ],
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    ...getCssLoaders(2),
                    {
                        loader: 'sass-loader',
                        options: { sourceMap: __DEV__ },
                    },
                ],
            },
            // Rules for Image
            {
                test: /\.(bmp|gif|jpg|jpeg|png|svg)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        // 低于 10 k 转换成 base64
                        limit: 10 * 1024,
                        // 在文件名中插入文件内容 hash，解决强缓存立即更新的问题
                        name: '[name].[contenthash].[ext]',
                        outputPath: 'images',
                    },
                },
            },
            // Rules for font
            {
                test: /\.(ttf|woff|woff2|eot|otf)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name]-[contenthash].[ext]',
                            outputPath: 'fonts',
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new WebpackBar({
            name: 'webpack-react',
            // react 蓝
            color: '#61dafb',
        }),
        new webpack.DefinePlugin({
            // 'process.env.NODE_ENV': NODE_ENV,
            __DEV__,
        }),
        new HtmlWebpackPlugin({
            minify: !__DEV__,
            title: 'React',
            template: './public/index.html',
            name: 'index.html',
        }),
    ],
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                default: false,
                framework: {
                    test: 'framework',
                    name: 'framework',
                    enforce: true,
                },
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    reuseExistingChunk: true,
                    chunks: 'all',
                    name: 'vendor',
                    priority: 1,
                    minChunks: 1, // 至少被引用多少次后进入 group
                    minSize: 0,
                },
            },
        },
    },
    stats: {
        cached: ENABLE_VERBOSE,
        cachedAssets: ENABLE_VERBOSE,
        chunks: ENABLE_VERBOSE,
        chunkModules: ENABLE_VERBOSE,
        colors: true,
        hash: ENABLE_VERBOSE,
        modules: ENABLE_VERBOSE,
        reasons: __DEV__,
        timings: true,
        version: ENABLE_VERBOSE,
        builtAt: true,
    },
};

if (__DEV__) {
    // 开发环境下注入热更新补丁
    // reload=true 设置 webpack 无法热更新时刷新整个页面，overlay=true 设置编译出错时在网页中显示出错信息遮罩
    baseConfig.entry.app.unshift(
        `webpack-hot-middleware/client?path=${HMR_PATH}&reload=true&overlay=true`,
    );
}

module.exports = baseConfig;

function getCssLoaders(importLoaders) {
    return [
        __DEV__ ? 'style-loader' : MiniCssExtractLoader.loader,
        {
            loader: 'css-loader',
            options: {
                // modules: false,
                modules: {
                    localIdentName: __DEV__ ? '[name]-[local]-[hash:base64:5]' : '[hash:base64:5]',
                },
                // 前面使用的每一个 loader 都需要指定 sourceMap 选项
                sourceMap: __DEV__,
                // 指定在 css-loader 前应用的 loader 的数量
                importLoaders,
            },
        },
        {
            loader: 'postcss-loader',
            options: { sourceMap: __DEV__ },
        },
    ];
}
