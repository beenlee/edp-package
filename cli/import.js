/**
 * @file 项目导入依赖包模块的命令行执行
 * @author errorrik[errorrik@gmail.com]
 */


/**
 * 命令行配置项
 *
 * @inner
 * @type {Object}
 */
var cli = {};

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '导入包';

/**
 * 命令选项信息
 *
 * @type {Array}
 */
cli.options = [ 'older', 'save-dev' ];

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function ( args, opts ) {
    if ( args.length === 0 ) {
        console.error( cli.usage );
        process.exit( 0 );
    }
    require('../lib/import-all')( args, opts );
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
