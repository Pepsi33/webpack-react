const { HotModuleReplacementPlugin } = require('webpack');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base.config');

const devConfig = merge(baseConfig, {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [new HotModuleReplacementPlugin()],
});

module.exports = devConfig;
