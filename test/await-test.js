const fs = require('fs');
const assert = require('assert');
const hello = require('../hello-test/await');

describe('#await.js', () => {
    describe('#sum()', () => {

        // 如果要测试同步函数，我们传入无参数函数即可：
        // it('test sync function', function () {
        // // TODO:
        //     assert(true);
        // });

        // 如果要测试异步函数，我们要传入的函数需要带一个参数，通常命名为done
        // it('#async with done', (done) => {
        //     (async function () {
        //         try {
        //             let r = await hello();
        //             assert.strictEqual(r, 15);
        //             done();
        //         } catch (err) {
        //             done(err);
        //         }
        //     })();
        // });

        // 但是用try...catch太麻烦。还有一种更简单的写法，就是直接把async函数当成同步函数来测试
        it('#async function', async () => {
            let r = await hello();
            assert.strictEqual(r, 15);
        });

    });
});