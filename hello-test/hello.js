// hello.js
// 待测试的js

// nodejs语法
module.exports = function (...rest) {
    var sum = 0;
    for (let n of rest) {
        sum += n;
    }
    return sum;
};
