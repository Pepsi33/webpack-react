const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const PROJECT_NAME = path.parse(PROJECT_ROOT).name;
const resolvePath = (...args) => path.resolve(PROJECT_ROOT, ...args);
const SRC_DIR = resolvePath('src');
const BUILD_DIR = resolvePath('dist');

const ENABLE_VERBOSE = process.argv.includes('--verbose');
const ENABLE_ANALYZE = process.argv.includes('--analyze') || process.argv.includes('--analyse');

const __DEV__ = !process.argv.includes('--release'); //|| process.env.NODE_ENV !== 'production';
const NODE_ENV = __DEV__ ? 'development' : 'production';
const ENABLE_OPEN = process.env.open || true;

const HOST = '127.0.0.1';
const DEFAULT_PORT = 3000;
const COPYRIGHT = `/** @preserve Powered by Pepsi33 */`;

const HMR_PATH = '/__webpack_hmr';

module.exports = {
    __DEV__,
    SRC_DIR,
    BUILD_DIR,
    ENABLE_VERBOSE,
    ENABLE_ANALYZE,
    ENABLE_OPEN,
    HOST,
    DEFAULT_PORT,
    COPYRIGHT,
    PROJECT_NAME,
    PROJECT_ROOT,
    HMR_PATH,
    NODE_ENV,
    resolvePath,
};
