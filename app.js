// 创建app实例
// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');

const bodyParser = require('koa-bodyparser'); // 解析原始request请求
const controller = require('./controller'); // 自动导入controller:
const templating = require('./templating'); // ctx添加render方法，绑定Nunjucks模板

// // mysql
// const model = require('./model');
// let User = model.User;
// (async () => {
//     var user = await User.create({
//         name: 'Xuyy',
//         gender: false,
//         email: 'Xuyy@jubotech.com',
//         passwd: '123456'
//     });
//     console.log('created: ' + JSON.stringify(user));
// })();

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

// 测试环境下 解析静态文件；线上用ngix反向代理
if (!isProduction) {
    let staticFiles = require('./static-files');
    app.use(staticFiles('/static/', __dirname + '/static'));
}

// 处理请求体
app.use(bodyParser());

templating('views', {
    noCache: !isProduction,
    watch: !isProduction
}, app);

app.use(controller());

module.exports = app;