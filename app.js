// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');
// 解析原始request请求
const bodyParser = require('koa-bodyparser');

// 导入controller middleware:
const controller = require('./controller');
const templating = require('./templating');

// 判断当前环境是否是production环境 production development
const isProduction = process.env.NODE_ENV === 'production';
// 创建一个Koa对象表示web app本身:
const app = new Koa();

// 第一个middleware是记录URL以及页面执行时间：
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    var
        start = new Date().getTime(),
        execTime;
    await next();
    execTime = new Date().getTime() - start;
    ctx.response.set('X-Response-Time', `${execTime}ms`);
});
// 对于任何请求，app将调用该异步函数处理请求：
// app.use(async (ctx, next) => {
//     console.log('打印URL')
//     console.log(`${ctx.request.method} ${ctx.request.url}`); // 打印URL
//     await next(); // 调用下一个middleware
//     // 用户鉴权
//     // if (await checkUserPermission(ctx)) {
//     //     await next(); // 调用下一个middleware
//     // } else {
//     //     ctx.response.status = 403;
//     // }
// });

// 第二个middleware处理静态文件：
// 生产环境下，静态文件是由部署在最前面的反向代理服务器（如Nginx）处理的，Node程序不需要处理静态文件。
// 而在开发环境下，我们希望koa能顺带处理静态文件，
if (!isProduction) {
    let staticFiles = require('./static-files');
    app.use(staticFiles('/static/', __dirname + '/static'));
}

// 第三个middleware解析POST请求：
// 由于middleware的顺序很重要，这个koa-bodyparser必须在router之前被注册到app对象上。
app.use(bodyParser());

// 第四个middleware负责给ctx加上render()来使用Nunjucks：
// 如果是开发环境，就使用缓存，如果不是，就关闭缓存
// 在开发环境下，关闭缓存后，我们修改View，可以直接刷新浏览器看到效果，
// 否则，每次修改都必须重启Node程序，会极大地降低开发效率。
// app.use(templating('views', {
//     noCache: !isProduction,
//     watch: !isProduction
// }));
templating('views', {
    noCache: !isProduction,
    watch: !isProduction
}, app);

// 最后一个middleware处理URL路由：
// 使用middleware:创建、绑定router
app.use(controller());

// 在端口3000监听:
app.listen(3000);
console.log('app started at port 3000...');
console.log(process.env.NODE_ENV);