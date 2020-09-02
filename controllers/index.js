
module.exports = {
    'GET /': async (ctx, next) => {
        ctx.render('index.html', {
            title: 'koa2-unjucks-demo'
        })
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
        // ctx.render('indexVue.html');
    }
};
