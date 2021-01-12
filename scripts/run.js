// see  https://github.com/kriasoft/react-static-boilerplate/tree/2b73935e12a798367034bd4076e86e199d05a915

const fs = require('fs');
const del = require('del');
const webpack = require('webpack');
const { WebpackOpenBrowser } = require('webpack-open-browser');

const tasks = new Map(); // The collection of automation tasks ('clean', 'build', etc.)

function run(task, data) {
    const start = new Date();
    console.log(`Starting '${task}'...`);
    return Promise.resolve()
        .then(() => tasks.get(task)(data))
        .then(
            (data) => {
                console.log(`Finished '${task}' after ${Date.now() - start.getTime()}ms`);
                return data;
            },
            (error) => {
                console.error(`Error occurred '${task}': ${error.message}`);
                if (error.stack) {
                    console.error(error.stack);
                }
                process.exit(1); // 直接退出进程
                // throw err; // 异步任务抛出无意义
            },
        );
}

function logEnv(webpackConfig) {
    console.log(
        `[ENV] mode => ${webpackConfig.mode} process.env.NODE_ENV(ignored) => ${process.env.NODE_ENV}`,
    );
}

function format(time) {
    return time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
}

function createCompilationPromise(compiler) {
    const name = 'default';
    return new Promise((resolve, reject) => {
        let timeStart = new Date();
        compiler.hooks.compile.tap(name, () => {
            timeStart = new Date();
            console.info(`[${format(timeStart)}] Compiling '${name}'...`);
        });

        compiler.hooks.done.tap(name, (stats) => {
            const timeEnd = new Date();
            const time = timeEnd.getTime() - timeStart.getTime();
            if (stats.hasErrors()) {
                console.info(`[${format(timeEnd)}] Failed to compile '${name}' after ${time} ms`);
                reject(new Error('Compilation failed!'));
            } else {
                console.info(
                    `[${format(timeEnd)}] Finished '${name}' compilation after ${time} ms`,
                );
                resolve(stats);
            }
        });
    });
}

//
// Bundle JavaScript, CSS and image files with Webpack
// -----------------------------------------------------------------------------
tasks.set(
    '_bundleProd',
    (webpackConfig) =>
        new Promise((resolve, reject) => {
            webpack(webpackConfig).run(function (err, stats) {
                if (stats && stats.compilation.errors.length > 0) {
                    console.error(stats.compilation.errors);
                }
                if (err || (stats && stats.compilation.errors.length > 0)) {
                    reject(err || (stats && stats.compilation.errors));
                } else {
                    console.log(stats.toString(webpackConfig.stats));
                    resolve(stats);
                }
            });
        }),
);

//
// Clean up the output directory
// -----------------------------------------------------------------------------
tasks.set('clean', () => del(['dist/*', '!dist/.gitkeep'], { dot: true }));

//
// Build website into a distributable format
// -----------------------------------------------------------------------------
tasks.set('build', () => {
    const prodConfig = require('./configs/webpack.prod.config');
    logEnv(prodConfig);
    return Promise.resolve()
        .then(() => run('clean'))
        .then(() => run('_bundleProd', prodConfig))
        .then((stats) => {
            console.log('success');
        });
});

//
// Build website and launch it in a browser for testing (default)
// -----------------------------------------------------------------------------
tasks.set('start', () =>
    run('clean').then(
        () =>
            new Promise(async (resolve, reject) => {
                const express = require('express');
                const devConfig = require('./configs/webpack.dev.config');
                const setupMiddlewares = require('./middlewares/index');
                const getPort = require('./untils/getPort');
                const { HOST, DEFAULT_PORT, ENABLE_OPEN } = require('./untils/constants');
                const PORT = await getPort(HOST, DEFAULT_PORT);
                const address = `http://${HOST}:${PORT}`;

                // ENABLE_OPEN 参数值可能是 true 或者是一个指定的 URL
                if (ENABLE_OPEN) {
                    let openAddress = ENABLE_OPEN;
                    if (ENABLE_OPEN === true) {
                        openAddress = address;
                        let { publicPath } = devConfig.output;
                        // 未设置和空串都视为根路径
                        publicPath = publicPath == null || publicPath === '' ? '/' : publicPath;
                        if (publicPath !== '/') {
                            // 要注意处理没有带 '/' 前缀和后缀的情况
                            openAddress = `${address}${
                                publicPath.startsWith('/') ? '' : '/'
                            }${publicPath}${publicPath.endsWith('/') ? '' : '/'}index.html`;
                        }
                    }
                    devConfig.plugins.push(new WebpackOpenBrowser({ url: openAddress }));
                }
                // console.log(devConfig);

                const app = express();
                const compiler = webpack(devConfig);
                setupMiddlewares(app, compiler);

                createCompilationPromise(compiler)
                    .then((stats) => {
                        app.use(express.static('dist'));

                        app.listen(PORT, function () {
                            console.log(`
          ------------------------
          项目已启动               
                                
          端口号：${PORT}
          
          地址：${address}            
          ------------------------
        `);
                            resolve();
                        });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }),
    ),
);

// Execute the specified task or default one. E.g.: node run build
run(/^\w/.test(process.argv[2] || '') ? process.argv[2] : 'start' /* default */);
