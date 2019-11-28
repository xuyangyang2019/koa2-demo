const model = require('../model');
let User = model.User;

let fn_signin = async (ctx, next) => {
    let
        email = ctx.request.body.email || '',
        password = ctx.request.body.password || '';

    var users = await User.findAll({
        where: {
            email: email,
            passwd: password
        }
    });
    // user应该保证唯一性
    // console.log(`find ${users.length} users:`);
    if (users.length > 0) {
        // console.log('signin ok!');
        let currentUser = users[0]
        ctx.render('signin-ok.html', {
            title: 'Sign In OK',
            name: currentUser.name
        });
    } else {
        // console.log('signin failed!');
        ctx.render('signin-failed.html', {
            title: 'Sign In Failed'
        });
    }
};

module.exports = {
    'POST /signin': fn_signin
};