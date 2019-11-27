// 我们其实不需要创建表的SQL，因为Sequelize提供了一个sync()方法，可以自动创建数据库。
// 这个功能在开发和生产环境中没有什么用，但是在测试环境中非常有用。
// 测试时，我们可以用sync()方法自动创建出表结构，而不是自己维护SQL脚本。
const model = require('./model.js');
// const db = require('./mysql/db');

model.sync().then(async () => {
    console.log('init db ok.');
    // 插入数据
    let User = model.User;
    let user = await User.create({
        name: 'Xuyy',
        gender: false,
        email: 'Xuyy@jubotech.com',
        passwd: '123456'
    });
    console.log('created: ' + JSON.stringify(user));

    let user2 = await User.create({
        name: 'Xuyy2',
        gender: false,
        email: 'Xuyy2@jubotech.com',
        passwd: '123456'
    });

    console.log('created: ' + JSON.stringify(user2));
    let user3 = await User.create({
        name: 'Xuyy3',
        gender: false,
        email: 'Xuyy3@jubotech.com',
        passwd: '123456'
    });
    console.log('created: ' + JSON.stringify(user3));

    process.exit(0);

}).catch((err) => {
    console.log(err)
    process.exit(0);
})