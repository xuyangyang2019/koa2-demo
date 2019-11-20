// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');
// 注意require('koa-router')返回的是函数:
const router = require('koa-router')();
// 解析原始request请求
const bodyParser = require('koa-bodyparser');

const fs = require('fs');

// 创建一个Koa对象表示web app本身:
const app = new Koa();

// // 先导入fs模块，然后用readdirSync列出文件
// // 这里可以用sync是因为启动时只运行一次，不存在性能问题:
// let files = fs.readdirSync(__dirname + '/controllers');
// // 过滤出.js文件:
// let js_files = files.filter((f) => {
//     return f.endsWith('.js');
// });
// // 处理每个js文件:
// for (const f of js_files) {
//     console.log(`js文件: ${f}...`);
//     // 导入js文件:
//     let mapping = require(__dirname + '/controllers/' + f);
//     for (const url in mapping) {
//         if (url.startsWith('GET ')) {
//             // 如果url类似"GET xxx":
//             let path = url.substring(4);
//             router.get(path, mapping[url]);
//         } else if (url.startsWith('POST ')) {
//             // 如果url类似"POST xxx":
//             let path = url.substring(5);
//             router.post(path, mapping[url]);
//         } else {
//             // 无效的URL:
//             console.log(`invalid URL: ${url}`);
//         }
//     }
// }

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
 */
function addControllers(router) {
    // 先导入fs模块，然后用readdirSync列出文件
    // 这里可以用sync是因为启动时只运行一次，不存在性能问题:
    var files = fs.readdirSync(__dirname + '/controllers');
    // 过滤出.js文件:
    var js_files = files.filter((f) => {
        return f.endsWith('.js');
    });

    // 处理每个js文件:
    for (var f of js_files) {
        console.log(`process controller: ${f}...`);
        // 导入js文件
        let mapping = require(__dirname + '/controllers/' + f);
        addMapping(router, mapping);
    }
}

addControllers(router);

// 对于任何请求，app将调用该异步函数处理请求：
app.use(async (ctx, next) => {
    console.log('打印URL')
    console.log(`${ctx.request.method} ${ctx.request.url}`); // 打印URL
    await next(); // 调用下一个middleware
    // 用户鉴权
    // if (await checkUserPermission(ctx)) {
    //     await next(); // 调用下一个middleware
    // } else {
    //     ctx.response.status = 403;
    // }
});
// 由于middleware的顺序很重要，这个koa-bodyparser必须在router之前被注册到app对象上。
app.use(bodyParser());
// add router middleware:
app.use(router.routes());

// 在端口3000监听:
app.listen(3000);
console.log('app started at port 3000...');