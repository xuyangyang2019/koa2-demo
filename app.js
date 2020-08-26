const fs = require('fs');
const path = require('path')

// 创建app实例
// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');

// 文件上传
const { uploadFile } = require('./util/upload')

// 创建一个Koa对象表示web app本身:
const app = new Koa();
// 判断当前环境是否是production环境 production development
const config = require('./config')
const isProduction = config.mode === 'prod';

// generator中间件开发 
// generator中间件在koa v2中需要用koa-convert封装一下才能使用
// const convert = require('koa-convert')
// const loggerGenerator  = require('./middleware/logger-generator')
// app.use(convert(loggerGenerator()))

// async中间件开发
const loggerAsync = require('./middleware/logger-async')
app.use(loggerAsync())

// rest中间件
// const rest = require('./middleware/rest');

// koa-static中间件使用
// const static = require('koa-static')
// // 静态资源目录对于相对入口文件index.js的路径
// const staticPath = './static'
// app.use(static(
//     path.join(__dirname, staticPath)
// ))

// 测试环境下 解析静态文件；线上用ngix反向代理
// if (!isProduction) {
//     console.log('测试环境，使用static-files')
let staticFiles = require('./middleware/static-files');
app.use(staticFiles('/static/', __dirname + '/static'));
//     app.use(staticFiles('/dist/', __dirname + '/dist'));
// }

// koa-bodyparser必须在router之前被注册到app对象上
// koa-bodyparser中间件可以把koa2上下文的formData数据解析到ctx.request.body中
const bodyParser = require('koa-bodyparser');
// 使用ctx.body解析中间件
app.use(bodyParser())

// bind .rest() for ctx:
// app.use(rest.restify());

/**
 * 用Promise封装异步读取文件方法
 * @param  {string} page html文件名称
 * @return {promise}      
 */
function render(page) {
    return new Promise((resolve, reject) => {
        let viewUrl = `./views/${page}`
        fs.readFile(viewUrl, "binary", (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

// // 加载ejs模板引擎
// const views = require('koa-views')
// app.use(views(path.join(__dirname, './views'), {
//     extension: 'ejs'
// }))
// app.use(async (ctx) => {
//     let title = 'hello koa2'
//     await ctx.render('index', {
//         title,
//     })
// })

// 加载Nunjucks模板引擎
// const templating = require('./middleware/templating');
// templating('views', {
//     noCache: !isProduction,
//     watch: !isProduction
// }, app);
const nunjucks = require('nunjucks');
function createEnv(path, opts) {
    let autoescape = opts.autoescape === undefined ? true : opts.autoescape
    let noCache = opts.noCache || false
    let watch = opts.watch || false
    let throwOnUndefined = opts.throwOnUndefined || false
    let env = new nunjucks.Environment(
        new nunjucks.FileSystemLoader(path || 'views', {
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
let env = createEnv('views', {
    watch: true,
    filters: {
        hex: function (n) {
            return '0x' + n.toString(16);
        }
    }
});


// koa-router中间件
const Router = require('koa-router')
// 子路由1
let home = new Router()
home.get('/', async (ctx) => {
    let html = await render('demo.html')
    ctx.body = html
}).get('rd', async (ctx) => {
    let url = ctx.url
    // 从上下文的request对象中获取
    let request = ctx.request
    let req_query = request.query
    let req_querystring = request.querystring

    // 从上下文中直接获取
    let ctx_query = ctx.query
    let ctx_querystring = ctx.querystring
    ctx.body = {
        url,
        req_query,
        req_querystring,
        ctx_query,
        ctx_querystring
    }
})
// 子路由2
let page = new Router()
page.get('/404', async (ctx) => {
    ctx.body = '404 page!'
}).get('/helloworld', async (ctx) => {
    ctx.body = 'helloworld page!'
}).get('/gd', async (ctx) => {
    ctx.body = 'gd!'
}).get('/nj', async (ctx) => {
    // Nunjucks默认就使用同步IO读取模板文件
    ctx.body = env.render('demo-unjucks.html', {
        header: 'Hello',
        body: 'bla bla bla...'
    })
}).get('/upload', async (ctx) => {
    let html = ` <h1>koa2 upload demo</h1>
    <form method="POST" action="/page/upload" enctype="multipart/form-data">
      <p>file upload</p>
      <span>picName:</span><input name="picName" type="text" /><br/>
      <input name="file" type="file" /><br/><br/>
      <button type="submit">submit</button>
    </form>`
    ctx.body = html
}).get('/ck', async (ctx) => {
    // ctx.cookies.set(name, value, [options])
    ctx.cookies.set(
        'cid',
        'hello world',
        {
            maxAge: 10 * 60 * 1000, // cookie有效时长
            expires: new Date('2020-09-15'),  // cookie失效时间
            path: '/index',       // 写cookie所在的路径,默认是'/'
            domain: 'localhost',  // 写cookie所在的域名
            httpOnly: false,  // 是否只是服务器可访问 cookie, 默认是 true
            overwrite: false,  // 是否允许重写
            // secure // 安全 cookie   默认false，设置成true表示只有 https可以访问
        }
    )
    ctx.body = 'cookie is ok'
}).get('/pd', async (ctx) => {
    let html = `
    <h1>koa2 request post demo</h1>
    <form method="POST" action="/page/pd">
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
}).post('/pd', async (ctx) => {
    // 当POST请求的时候，解析POST表单里的数据，并显示出来
    let postData = ctx.request.body
    ctx.body = postData
}).post('/upload', async (ctx) => {
    console.log('上传文件')
    console.log(ctx.url)
    // 上传文件请求处理
    let result = { success: false }
    let serverFilePath = path.join(__dirname, 'upload-files')
    // 上传文件事件
    result = await uploadFile(ctx, {
        fileType: 'album', // common or album
        path: serverFilePath
    })
    ctx.body = result
})

// 装载所有子路由
let router = new Router()
router.use('/', home.routes(), home.allowedMethods())
router.use('/page', page.routes(), page.allowedMethods())
// 加载路由中间件
app.use(router.routes()).use(router.allowedMethods())

/**
 * 自动扫描controllers文件夹中的js文件 
 * controllers中的js文件 导出模块方法{'GET /login':async (ctx,next)=>{},...}
 * 自动require js文件到 mapping = {'GET /login':async (ctx,next)=>{}}
 * 遍历每个mapping 自动添加router router.get(path, mapping[url])
 */
// 扫描注册Controller，并添加router:
// const controller = require('./middleware/controller');
// app.use(controller(__dirname + '/controllers'));

// =========================================================
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

// const websocket = req
// const websocketServer = require('./websocket/websocketServer'); 
// let parseUser = websocketServer.parseUser
// let createWebSocketServer = websocketServer.createWebSocketServer
// parse user from cookie:
// app.use(async (ctx, next) => {
//     console.log('parse user from cookie')
//     ctx.state.user = parseUser(ctx.cookies.get('name') || '');
//     await next();
// });

// ================websocket=========================

// let server = app.listen(3000);
// app.wss = createWebSocketServer(server);

// module.exports = app;
app.listen(3000)
console.log('app started at port 3000...');

