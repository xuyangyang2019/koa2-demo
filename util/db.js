const mysql = require('mysql')
const connection = mysql.createConnection({
    host: '127.0.0.1',   // 数据库地址
    user: 'root',    // 数据库用户
    password: '123456',   // 数据库密码
    database: 'test'  // 选中数据库
})

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});

// 执行sql脚本对数据库进行读写 
connection.query('SELECT * FROM user', (error, results, fields) => {
    if (error) throw error
    // connected! 
    console.log(results)
})

// 结束会话
connection.end();