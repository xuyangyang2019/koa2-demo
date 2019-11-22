// 操作mysql 数据库用
// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');
// 解析原始request请求
const bodyParser = require('koa-bodyparser');

// 导入controller middleware:
const controller = require('./controller');
const templating = require('./templating');

// mysql

const model = require('./model');

let Pets = model.Pets;
let User = model.User;
(async () => {
    var user = await User.create({
        name: 'John',
        gender: false,
        email: 'john-' + Date.now() + '@garfield.pet',
        passwd: 'hahaha'
    });
    console.log('created: ' + JSON.stringify(user));

    var cat = await Pets.create({
        ownerId: user.id,
        name: 'Garfield',
        gender: false,
        birth: '2007-07-07',
    });
    console.log('created: ' + JSON.stringify(cat));

    var dog = await Pets.create({
        ownerId: user.id,
        name: 'Odie',
        gender: false,
        birth: '2008-08-08',
    });
    console.log('created: ' + JSON.stringify(dog));
})();

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

if (!isProduction) {
    let staticFiles = require('./static-files');
    app.use(staticFiles('/static/', __dirname + '/static'));
}

app.use(bodyParser());

templating('views', {
    noCache: !isProduction,
    watch: !isProduction
}, app);

app.use(controller());

// 在端口3000监听:
app.listen(3000);
console.log('app started at port 3000...');