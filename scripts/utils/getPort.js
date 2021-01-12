const _getPort = require('get-port');

/**
 * 获取可用端口，被占用后加一
 */
module.exports = async function getPort(host, port) {
    const result = await _getPort({ port });

    // 没被占用就返回这个端口号
    if (result === port) {
        return result;
    }

    // 递归，端口号 +1
    return getPort(host, port + 1);
};
