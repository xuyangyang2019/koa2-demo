// index:

module.exports = {
    'GET /': async (ctx, next) => {
        let user = ctx.state.user;
        if (user) {
            ctx.render('roomVue.html', {
                user: user
            });
        } else {
            ctx.response.redirect('/signin');
        }
    }
};
