// 文件系统模块
const fs = require('fs');


/**
 * 绑定路由
 * @param {*} router 要绑定的路由
 * @param {*} mapping 要绑定的方法{路由path:方法,...}
 */
function addMapping(router, mapping) {
    for (var url in mapping) {
        if (url.startsWith('GET ')) {
            var path = url.substring(4);
            router.get(path, mapping[url]);
            console.log(`register URL mapping: GET ${path}`);
        } else if (url.startsWith('POST ')) {
            var path = url.substring(5);
            router.post(path, mapping[url]);
            console.log(`register URL mapping: POST ${path}`);
        } else {
            console.log(`invalid URL: ${url}`);
        }
    }
}

/**
 * 过滤js文件、导入js文件
 * @param {*} router 路由的实列
 * @param {*} controllers_dir js文件夹
 */
function addControllers(router, controllers_dir) {
    // 先导入fs模块，然后用readdirSync列出文件
    // 这里可以用sync是因为启动时只运行一次，不存在性能问题:
    var files = fs.readdirSync(__dirname + `/${controllers_dir}`);
    // 过滤出.js文件:
    var js_files = files.filter((f) => {
        return f.endsWith('.js');
    });

    // 处理每个js文件:
    for (var f of js_files) {
        console.log(`process controller: ${f}...`);
        // 导入js文件
        let mapping = require(__dirname + `/${controllers_dir}/` + f);
        addMapping(router, mapping);
    }
}

module.exports = function (dir) {
    // 如果不传参数，扫描目录默认为'controllers'
    let controllers_dir = dir || 'controllers'; 
    const router = require('koa-router')();
    addControllers(router, controllers_dir);
    return router.routes();
};