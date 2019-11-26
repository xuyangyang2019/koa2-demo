var fn_hello = async (ctx, next) => {
    var name = ctx.params.name;
    ctx.response.type = 'text/html';
    ctx.response.body = `<h1>Hello, ${name}!</h1>`;
    // var name = ctx.request.query.name || 'world';
    // ctx.response.body = `<h1>Hello, ${name}!</h1>`;

};

module.exports = {
    'GET /hello/:name': fn_hello
};