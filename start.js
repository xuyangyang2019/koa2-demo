// start.js
// 负责真正启动应用
const app = require('./app');
require('./websocket/websocketServer')
require('./websocket/websocketClient')

app.listen(3000);
console.log('app started at port 3000...');