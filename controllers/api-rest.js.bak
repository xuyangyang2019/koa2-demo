// REST API
const APIError = require('../rest').APIError;

// 存储Product列表，相当于模拟数据库:
const products = require('../products');
// var products = [{
//     name: 'iPhone',
//     price: 6999
// }, {
//     name: 'Kindle',
//     price: 999
// }];

module.exports = {  
    'GET /api/products': async (ctx, next) => {
        // 设置Content-Type:
        // ctx.response.type = 'application/json';
        // 设置Response Body:
        // ctx.response.body = {
        //     products: products
        // };
        ctx.rest({
            // products: products
            products: products.getProducts()
        });
    },
    
    'POST /api/addProducts': async (ctx, next) => {
        console.log('添加产品')
        // var p = {
        //     name: ctx.request.body.name,
        //     price: ctx.request.body.price
        // };
        // products.push(p);
        // ctx.response.type = 'application/json';
        // ctx.response.body = p;

        var p = products.createProduct(ctx.request.body.name, ctx.request.body.manufacturer, parseFloat(ctx.request.body.price));
        ctx.rest(p);
    },

    'DELETE /api/products/:id': async (ctx, next) => {
        console.log(`delete product ${ctx.params.id}...`);
        var p = products.deleteProduct(ctx.params.id);
        if (p) {
            ctx.rest(p);
        } else {
            throw new APIError('product:not_found', 'product not found by id.');
        }
    }
}