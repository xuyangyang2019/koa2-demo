// REST API
// 存储Product列表，相当于模拟数据库:
var products = [{
    name: 'iPhone',
    price: 6999
}, {
    name: 'Kindle',
    price: 999
}];

module.exports = {
    'GET /api/products': async (ctx, next) => {
        // 设置Content-Type:
        // ctx.response.type = 'application/json';
        // 设置Response Body:
        ctx.response.body = {
            products: products
        };
    },
    'POST /api/addProducts': async (ctx, next) => {
        // console.log('post 请求')
        // console.log(ctx.body)
        var p = {
            name: ctx.request.body.name,
            price: ctx.request.body.price
        };
        // console.log(p)
        products.push(p);
        ctx.response.type = 'application/json';
        ctx.response.body = p;
    }
}