// MVC Controllers

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
