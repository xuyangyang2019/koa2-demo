// config files:
const defaultConfig = './config-default.js';
const overrideConfig = './config-override.js';
const testConfig = './config-test.js';

const fs = require('fs');

var config = null;
console.log(process.env.NODE_ENV)

// 如果是测试环境，就读取config-test.js
if (process.env.NODE_ENV === 'test') {
    console.log(`测试环境 Load ${testConfig}...`);
    config = require(testConfig);
} else {
    // 读取config-default.js
    console.log(`默认配置 Load ${defaultConfig}...`);
    config = require(defaultConfig);
    try {
        // 如果不是测试环境，就读取config-override.js，如果文件不存在，就忽略
        if (fs.statSync(overrideConfig).isFile()) {
            console.log(`重新配置数据库 Load ${overrideConfig}...`);
            config = Object.assign(config, require(overrideConfig));
        }
    } catch (err) {
        console.log(`没有override Cannot load ${overrideConfig}.`);
    }
}

module.exports = config;