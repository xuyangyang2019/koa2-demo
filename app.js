// 创建app实例
// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');

// 创建一个Koa对象表示web app本身:
const app = new Koa();

// generator中间件开发 
// generator中间件在koa v2中需要用koa-convert封装一下才能使用
// const convert = require('koa-convert')
// const loggerGenerator  = require('./middleware/logger-generator')
// app.use(convert(loggerGenerator()))

// async中间件开发
const loggerAsync = require('./middleware/logger-async')
app.use(loggerAsync())

// koa2 原生路由实现
// const fs = require('fs')
// /**
//  * 用Promise封装异步读取文件方法
//  * @param  {string} page html文件名称
//  * @return {promise}      
//  */
// function render(page) {
//     return new Promise((resolve, reject) => {
//         let viewUrl = `./views/${page}`
//         fs.readFile(viewUrl, "binary", (err, data) => {
//             if (err) {
//                 reject(err)
//             } else {
//                 resolve(data)
//             }
//         })
//     })
// }
// /**
// * 根据URL获取HTML内容
// * @param  {string} url koa2上下文的url，ctx.url
// * @return {string}     获取HTML文件内容
// */
// async function route(url) {
//     let view = '404.html'
//     switch (url) {
//         case '/':
//             view = 'index.html'
//             break
//         case '/index':
//             view = 'index.html'
//             break
//         case '/todo':
//             view = 'todo.html'
//             break
//         case '/404':
//             view = '404.html'
//             break
//         default:
//             break
//     }
//     let html = await render(view)
//     return html
// }
// app.use(async (ctx) => {
//     let url = ctx.request.url
//     let html = await route(url)
//     ctx.body = html
// })

// koa-router中间件
const Router = require('koa-router')
// 子路由1
let home = new Router()
home.get('/', async (ctx) => {
    let html = `
    <ul>
      <li><a href="/page/helloworld">/page/helloworld</a></li>
      <li><a href="/page/404">/page/404</a></li>
    </ul>
  `
    ctx.body = html
})
// 子路由2
let page = new Router()
page.get('/404', async (ctx) => {
    ctx.body = '404 page!'
}).get('/helloworld', async (ctx) => {
    ctx.body = 'helloworld page!'
})
// 装载所有子路由
let router = new Router()
router.use('/', home.routes(), home.allowedMethods())
router.use('/page', page.routes(), page.allowedMethods())
// 加载路由中间件
app.use(router.routes()).use(router.allowedMethods())

// GET请求数据获取
// app.use(async (ctx) => {
//     let url = ctx.url
//     // 从上下文的request对象中获取
//     let request = ctx.request
//     let req_query = request.query
//     let req_querystring = request.querystring

//     // 从上下文中直接获取
//     let ctx_query = ctx.query
//     let ctx_querystring = ctx.querystring

//     ctx.body = {
//         url,
//         req_query,
//         req_querystring,
//         ctx_query,
//         ctx_querystring
//     }
// })

// // 解析出POST请求上下文中的表单数据 
// app.use(async (ctx) => {
//     if (ctx.url === '/pd' && ctx.method === 'GET') {
//         // 当GET请求时候返回表单页面
//         let html = `
//     <h1>koa2 request post demo</h1>
//     <form method="POST" action="/pd">
//         <p>userName</p>
//         <input name="userName" /><br/>
//         <p>nickName</p>
//         <input name="nickName" /><br/>
//         <p>email</p>
//         <input name="email" /><br/>
//         <button type="submit">submit</button>
//     </form>
//     `
//         ctx.body = html
//     } else if (ctx.url === '/pd' && ctx.method === 'POST') {
//         // 当POST请求的时候，解析POST表单里的数据，并显示出来
//         let postData = await parsePostData(ctx)
//         ctx.body = postData
//     } else {
//         // 其他请求显示404
//         ctx.body = '<h1>404！！！ o(╯□╰)o</h1>'
//     }
// })
// // 解析上下文里node原生请求的POST参数
// function parsePostData(ctx) {
//     return new Promise((resolve, reject) => {
//         try {
//             let postdata = "";
//             ctx.req.addListener('data', (data) => {
//                 postdata += data
//             })
//             ctx.req.addListener("end", function () {
//                 let parseData = parseQueryStr(postdata)
//                 resolve(parseData)
//             })
//         } catch (err) {
//             reject(err)
//         }
//     })
// }
// // 将POST请求参数字符串解析成JSON
// function parseQueryStr(queryStr) {
//     let queryData = {}
//     let queryStrList = queryStr.split('&')
//     console.log(queryStrList)
//     for (let [index, queryStr] of queryStrList.entries()) {
//         let itemList = queryStr.split('=')
//         queryData[itemList[0]] = decodeURIComponent(itemList[1])
//     }
//     return queryData
// }

// koa-bodyparser中间件可以把koa2上下文的formData数据解析到ctx.request.body中
const bodyParser = require('koa-bodyparser');
// 使用ctx.body解析中间件
app.use(bodyParser())
app.use(async (ctx) => {
    if (ctx.url === '/pd' && ctx.method === 'GET') {
        // 当GET请求时候返回表单页面
        let html = `
    <h1>koa2 request post demo</h1>
    <form method="POST" action="/">
        <p>userName</p>
        <input name="userName" /><br/>
        <p>nickName</p>
        <input name="nickName" /><br/>
        <p>email</p>
        <input name="email" /><br/>
        <button type="submit">submit</button>
    </form>
    `
        ctx.body = html
    } else if (ctx.url === '/' && ctx.method === 'POST') {
        // 当POST请求的时候，解析POST表单里的数据，并显示出来
        let postData = ctx.request.body
        ctx.body = postData
    } else {
        // 其他请求显示404
        ctx.body = '<h1>404！！！ o(╯□╰)o</h1>'
    }
})


// 扫描注册Controller，并添加router:
// const controller = require('./middleware/controller');

// ctx添加render方法，绑定Nunjucks模板
// const templating = require('./middleware/templating');

// rest中间件
// const rest = require('./middleware/rest');

// const websocket = req
// const websocketServer = require('./websocket/websocketServer'); 
// let parseUser = websocketServer.parseUser
// let createWebSocketServer = websocketServer.createWebSocketServer

// 判断当前环境是否是production环境 production development
// const config = require('./config')
// const isProduction = config.mode === 'prod';

// 第一个middleware是记录URL以及页面执行时间：
// app.use(async (ctx, next) => {
//     console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
//     var
//         start = new Date().getTime(),
//         execTime;
//     await next();
//     execTime = new Date().getTime() - start;
//     ctx.response.set('X-Response-Time', `${execTime}ms`);
// });

// 测试环境下 解析静态文件；线上用ngix反向代理
// if (!isProduction) {
//     console.log('测试环境，使用static-files')
//     let staticFiles = require('./middleware/static-files');
//     app.use(staticFiles('/static/', __dirname + '/static'));
//     app.use(staticFiles('/dist/', __dirname + '/dist'));
// }

// parse user from cookie:
// app.use(async (ctx, next) => {
//     console.log('parse user from cookie')
//     ctx.state.user = parseUser(ctx.cookies.get('name') || '');
//     await next();
// });

// parse request body:
// app.use(bodyParser());

// add nunjucks as view:
// templating('views', {
//     noCache: !isProduction,
//     watch: !isProduction
// }, app);

// bind .rest() for ctx:
// app.use(rest.restify());

// controller中间件
// 自动扫描controllers文件夹中的js文件 
// controllers中的js文件 导出模块方法{'GET /login':async (ctx,next)=>{},...}
// 自动require js文件到 mapping = {'GET /login':async (ctx,next)=>{}}

// 遍历每个mapping 自动添加router router.get(path, mapping[url])
// app.use(controller(__dirname + '/controllers'));

// =========================================================
// const router = require('koa-router')();
// const fs = require('fs');

// 自己添加
// app.use(async (ctx, next) => {
//     if (ctx.request.path === '/') {
//         ctx.response.body = 'index page';
//     } else {
//         await next();
//     }
// });

// 通过koa-router中间件控制路由
// add url-route:
// router.get('/hello/:name', async (ctx, next) => {
//     var name = ctx.params.name;
//     ctx.response.body = `<h1>Hello, ${name}!</h1>`;
// });
// router.get('/', async (ctx, next) => {
//     ctx.response.body = '<h1>Index</h1>';
// });

// /**
//  * 异步读取文件
//  * @param {*} url 
//  */
// function read(url) {
//     return new Promise((resolve, reject) => {
//         fs.readFile(url, 'utf-8', function (err, data) {
//             if (err) return reject(err);
//         })
//     })
// }

// vue-cli用到 所有的请求都指向index.html
// router.get(/^\/[^\.]*$/, async (ctx, next) => {
//     let path = __dirname + '/static/index2.html'
//     // 构造解析 异步读取
//     const { status, body } = await read(path);
//     // 同步读取
//     // body = fs.readFileSync(path, 'utf-8');
//     ctx.state = status;
//     ctx.type = 'text/html';
//     ctx.body = body;
// });

// // add router middleware:
// app.use(router.routes());

// =========================================================


// ================websocket=========================

// let server = app.listen(3000);
// app.wss = createWebSocketServer(server);

// module.exports = app;
app.listen(3000)
console.log('app started at port 3000...');

