const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const devConfig = require('../configs/webpack.dev.config');
const { HMR_PATH } = require('../utils/constants');

module.exports = function webpackMiddleware(compiler) {
    const publicPath = devConfig.output.publicPath;

    const devMiddlewareOptions = {
        // 保持和 webpack 中配置一致
        publicPath,
        // 只在发生错误或有新的编译时输出
        stats: devConfig.stats || 'minimal',
        // 需要输出文件到磁盘可以开启
        // writeToDisk: true
    };

    const hotMiddlewareOptions = {
        // sse 路由
        path: HMR_PATH,
    };

    return [
        webpackDevMiddleware(compiler, devMiddlewareOptions),
        webpackHotMiddleware(compiler, hotMiddlewareOptions),
    ];
};
