// 创建app实例
// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');
const bodyParser = require('koa-bodyparser'); // 解析原始request请求

const controller = require('./controller'); // 自动导入controller:
const templating = require('./middleware/templating'); // ctx添加render方法，绑定Nunjucks模板
const rest = require('./middleware/rest');

// ================websocket=========================
const ws = require('ws');
const url = require('url');
const Cookies = require('cookies');

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

const WebSocketServer = ws.Server;

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
    let staticFiles = require('./middleware/static-files');
    app.use(staticFiles('/static/', __dirname + '/static'));
    app.use(staticFiles('/dist/', __dirname + '/dist'));
}

// parse user from cookie:
app.use(async (ctx, next) => {
    console.log('parse user from cookie')
    ctx.state.user = parseUser(ctx.cookies.get('name') || '');
    await next();
});

// parse request body:
app.use(bodyParser());

// add nunjucks as view:
templating('views', {
    noCache: !isProduction,
    watch: !isProduction
}, app);

// bind .rest() for ctx:
app.use(rest.restify());

// add controller middleware:
app.use(controller());

// ================websocket=========================
let server = app.listen(3000);

// 识别用户
function parseUser(obj) {
    // console.log('识别用户')
    if (!obj) {
        return;
    }
    console.log('try parse: ' + obj);
    let s = '';
    if (typeof obj === 'string') {
        s = obj;
    } else if (obj.headers) {
        let cookies = new Cookies(obj, null);
        s = cookies.get('name');
    }
    if (s) {
        try {
            let user = JSON.parse(Buffer.from(s, 'base64').toString());
            console.log(`User: ${user.name}, ID: ${user.id}`);
            return user;
        } catch (e) {
            // ignore
        }
    }
}

/**
 * 
 * @param {*} server http.Server
 * @param {*} onConnection 
 * @param {*} onMessage 
 * @param {*} onClose 
 * @param {*} onError 
 */
function createWebSocketServer(server, onConnection, onMessage, onClose, onError) {
    // 
    let wss = new WebSocketServer({
        server: server
    });
    // 
    wss.broadcast = function broadcast(data) {
        wss.clients.forEach(function each(client) {
            client.send(data);
        });
    };
    onConnection = onConnection || function () {
        console.log('[WebSocket] connected.');
    };
    onMessage = onMessage || function (msg) {
        console.log('[WebSocket] message received: ' + msg);
    };
    onClose = onClose || function (code, message) {
        console.log(`[WebSocket] closed: ${code} - ${message}`);
    };
    onError = onError || function (err) {
        console.log('[WebSocket] error: ' + err);
    };
    // wss.on('connection', function (ws) {
    wss.on('connection', function (ws, req) {
        ws.upgradeReq = req;
        let location = url.parse(ws.upgradeReq.url, true);
        console.log('[WebSocketServer] connection: ' + location.href);

        ws.on('message', onMessage);
        ws.on('close', onClose);
        ws.on('error', onError);
        // 如果请求的路径不对，关闭ws
        if (location.pathname !== '/ws/chat') {
            // close ws:
            ws.close(4000, 'Invalid URL');
        }
        // 如果没有user,关闭ws
        let user = parseUser(ws.upgradeReq);
        if (!user) {
            ws.close(4001, 'Invalid user');
        }
        ws.user = user;
        ws.wss = wss;
        onConnection.apply(ws);
    });
    console.log('WebSocketServer was attached.');
    return wss;
}

// 消息id
var messageIndex = 0;
function createMessage(type, user, data) {
    messageIndex++;
    return JSON.stringify({
        id: messageIndex,
        type: type,
        user: user,
        data: data
    });
}

function onConnect() {
    let user = this.user;
    let msg = createMessage('join', user, `${user.name} joined.`);
    this.wss.broadcast(msg);
    // build user list:
    // let users = this.wss.clients.map(function (client) {
    //     return client.user;
    // });
    let users = Array.from(this.wss.clients).map((client) => { return client.user });
    this.send(createMessage('list', user, users));
}

function onMessage(message) {
    console.log(message);
    if (message && message.trim()) {
        let msg = createMessage('chat', this.user, message.trim());
        this.wss.broadcast(msg);
    }
}

function onClose() {
    let user = this.user;
    let msg = createMessage('left', user, `${user.name} is left.`);
    this.wss.broadcast(msg);
}

app.wss = createWebSocketServer(server, onConnect, onMessage, onClose);

// module.exports = app;
console.log('app started at port 3000...');

