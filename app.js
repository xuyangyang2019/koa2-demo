// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');
// 解析原始request请求
const bodyParser = require('koa-bodyparser');
// 导入controller middleware:
const controller = require('./controller');

// 模板引擎
const nunjucks = require('nunjucks');
function createEnv(path, opts) {
    var
        autoescape = opts.autoescape === undefined ? true : opts.autoescape,
        noCache = opts.noCache || false,
        watch = opts.watch || false,
        throwOnUndefined = opts.throwOnUndefined || false,
        env = new nunjucks.Environment(
            new nunjucks.FileSystemLoader('views', {
                noCache: noCache,
                watch: watch,
            }), {
            autoescape: autoescape,
            throwOnUndefined: throwOnUndefined
        });
    if (opts.filters) {
        for (var f in opts.filters) {
            env.addFilter(f, opts.filters[f]);
        }
    }
    return env;
}
var env = createEnv('views', {
    watch: true,
    filters: {
        hex: function (n) {
            return '0x' + n.toString(16);
        }
    }
});

var s = env.render('hello.html', { name: '小明' });
// 模板可以防止xss攻击
// var s = env.render('hello.html', { name: '<script>alert("小明")</script>' });
// http://mozilla.github.io/nunjucks/getting-started.html
// console.log(s);

// var s = env.render('hello.html', {
//     name: '<Nunjucks>',
//     fruits: ['Apple', 'Pear', 'Banana'],
//     count: 12000
// });
// console.log(s);

console.log(env.render('extend.html', {
    header: 'Hello',
    body: 'bla bla bla...'
}));

// 创建一个Koa对象表示web app本身:
const app = new Koa();

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

// 使用middleware:创建、绑定router
app.use(controller());
// // add router middleware:
// app.use(router.routes());

// 在端口3000监听:
app.listen(3000);
console.log('app started at port 3000...');