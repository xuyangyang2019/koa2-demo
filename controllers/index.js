// MVC Controllers

// let fn_hello = async (ctx, next) => {
//     ctx.response.type = 'text/html';
//     let name = ctx.request.query.name || 'world';
//     ctx.response.body = `<h1>Hello, ${name}!</h1>`;
// };

// module.exports = {
//     'GET /hello/:name': fn_hello
// };


// let fn_index = async (ctx, next) => {
//     ctx.render('index.html', {
//         title: 'Welcome'
//     });
// };

// module.exports = {
//     'GET /': fn_index
// };

module.exports = {
    'GET /': async (ctx, next) => {
        // websocket demo
        // let user = ctx.state.user;
        // if (user) {
        //     ctx.render('roomVue.html', {
        //         user: user
        //     });
        // } else {
        //     ctx.response.redirect('/signin');
        // }

        // rest demo
        ctx.render('index.html');
    }
};
