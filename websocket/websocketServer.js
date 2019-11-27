const ws = require('ws');
const url = require('url');
const Cookies = require('cookies');
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

const WebSocketServer = ws.Server;
// let server = app.listen(3000);

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
    console.log('onConnect')
    let user = this.user;
    let msg = createMessage('join', user, `${user.name} joined.`);
    this.wss.broadcast(msg);
    let users = Array.from(this.wss.clients).map((client) => { return client.user });
    this.send(createMessage('list', user, users));
}

function onMessage(message) {
    console.log('onMessage');
    if (message && message.trim()) {
        let msg = createMessage('chat', this.user, message.trim());
        this.wss.broadcast(msg);
    }
}

function onClose() {
    console.log('onClose')
    let user = this.user;
    let msg = createMessage('left', user, `${user.name} is left.`);
    this.wss.broadcast(msg);
}

function onError() {
    console.log('onError')
    // let user = this.user;
    // let msg = createMessage('left', user, `${user.name} is left.`);
    // this.wss.broadcast(msg);
}

// function createWebSocketServer(server, onConnection, onMessage, onClose, onError) {
function createWebSocketServer(server) {
    console.log('创建wss')
    // 创建实例
    let wss = new WebSocketServer({
        server: server
    });
    // 广播
    wss.broadcast = function broadcast(data) {
        wss.clients.forEach(function each(client) {
            client.send(data);
        });
    };

    let onConnection = onConnect || function () {
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

    wss.on('connection', function (ws, req) {
        ws.upgradeReq = req;
        let location = url.parse(ws.upgradeReq.url, true);
        console.log('有新的连接')
        // console.log(location)
        console.log('[WebSocketServer] connection: ' + location.href);

        // 监听连接
        ws.on('message', onMessage);
        ws.on('close', onClose);
        ws.on('error', onError);

        // 如果请求的路径不对，关闭ws
        if (location.pathname !== '/ws/chat') {
            ws.close(4000, 'Invalid URL');
        }
        // 如果没有user,关闭ws
        let user = parseUser(ws.upgradeReq);
        if (!user) {
            ws.close(4001, 'Invalid user');
        }
        ws.user = user;
        ws.wss = wss;
        // onConnetion劫持ws,this指向ws
        onConnection.apply(ws);
    });
    console.log('WebSocketServer was attached.');
    return wss;
}

module.exports = {
    parseUser,
    createWebSocketServer
}
