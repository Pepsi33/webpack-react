const { merge } = require('webpack-merge');
const { BannerPlugin } = require('webpack');
const SizePlugin = require('size-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const baseConfig = require('./webpack.base.config');
const { ENABLE_ANALYZE, COPYRIGHT, resolvePath } = require('../utils/constants');

let prodConfig = merge(baseConfig, {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
        new BannerPlugin({
            raw: true,
            banner: COPYRIGHT,
        }),
        // new ForkTsCheckerWebpackPlugin({
        //   typescript: {
        //       // 生产环境打包并不频繁，可以适当调高允许使用的内存，加快类型检查速度
        //       memoryLimit: 1024 * 2,
        //       configFile: resolvePath('./tsconfig.json')
        //   },
        // }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash].css',
            chunkFilename: 'css/[id].[contenthash].css',
        }),
        new CompressionPlugin(),
        ...(ENABLE_ANALYZE
            ? [new SizePlugin({ writeFile: false }), new BundleAnalyzerPlugin()]
            : []),
    ],
    optimization: {
        minimizer: [new TerserPlugin({ extractComments: false }), new OptimizeCSSAssetsPlugin()],
    },
});

// 使用 --analyze 参数构建时，会输出各个阶段的耗时和自动打开浏览器访问 bundle 分析页面
if (ENABLE_ANALYZE) {
    const smp = new SpeedMeasurePlugin();
    // prodConfig = smp.wrap(prodConfig);
}

module.exports = prodConfig;
