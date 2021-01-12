const chalk = require('chalk');
const { createProxyMiddleware } = require('http-proxy-middleware');
const proxyTable = require('../configs/proxy');

function link(str) {
    return chalk.magenta.underline(str);
}

module.exports = function proxyMiddleware(server) {
    Object.entries(proxyTable).forEach(([path, options]) => {
        const from = path;
        const to = options.target;
        console.log(`proxy ${link(from)} ${chalk.green('->')} ${link(to)}`);

        if (!options.logLevel) options.logLevel = 'warn';
        server.use(path, createProxyMiddleware(options));
    });
    process.stdout.write('\n');
};
