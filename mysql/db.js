// orm
const Sequelize = require('sequelize');
// 生成唯一标识符
const uuid = require('node-uuid');

// 配置文件
const config = require('../config');

/**
 * 生成唯一标识符
 */
function generateId() {
    return uuid.v1(); // 基于时间戳生成
    // return uuid.v4(); // 随机生成
}

// 创建一个sequelize对象实例
var sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASS, {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: config.DB_DIALECT,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

// 类型
const ID_TYPE = Sequelize.STRING(50);

/**
 * 定义模型，告诉Sequelize如何映射数据库表
 * 
 * 给所有model自动加上id、createdAt、updatedAt和version，所有字段默认为NOT NULL，除非显式指定
 * 
 * 统一主键，名称必须是id，类型必须是STRING(50)，可以自己指定，也可以由框架自动生成
 * 
 * 统一timestamp机制，每个Model必须有createdAt、updatedAt和version，分别记录创建时间、修改时间和版本号；
 * 
 * createdAt和updatedAt以BIGINT存储时间戳，最大的好处是无需处理时区，排序方便。version每次修改时自增。
 * 
 * @param {*} name 表名
 * 
 * @param {*} attributes 列名
 * 
 * @returns sequelize 返回orm
 */
function defineModel(name, attributes) {
    console.log(name)
    var attrs = {};
    for (let key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            };
        }
    }
    attrs.id = {
        type: ID_TYPE,
        primaryKey: true
    };
    attrs.createdAt = {
        type: Sequelize.BIGINT,
        allowNull: false
    };
    attrs.updatedAt = {
        type: Sequelize.BIGINT,
        allowNull: false
    };
    attrs.version = {
        type: Sequelize.BIGINT,
        allowNull: false
    };

    return sequelize.define(
        // 表名
        name,
        // 指定列名和数据类型
        attrs,
        // 额外的配置
        {
            tableName: name,
            // 关闭Sequelize的自动添加timestamp的功能
            timestamps: false,
            // Sequelize在创建、修改Entity时会调用我们指定的函数，这些函数通过hooks在定义Model时设定。
            // 我们在beforeValidate这个事件中根据是否是isNewRecord设置主键（如果主键为null或undefined）、设置时间戳和版本号。
            hooks: {
                beforeValidate: function (obj) {
                    let now = Date.now();
                    if (obj.isNewRecord) {
                        console.log('will create entity...' + obj);
                        if (!obj.id) {
                            obj.id = generateId();
                        }
                        obj.createdAt = now;
                        obj.updatedAt = now;
                        obj.version = 0;
                    } else {
                        console.log('will update entity...');
                        obj.updatedAt = now;
                        obj.version++;
                    }
                }
            }
        });
}

var exp = {
    defineModel: defineModel,
    // 自动创建表结构
    sync: () => {
        // DDL: 数据定义语言
        // only allow create ddl in non-production environment:
        // if (process.env.NODE_ENV !== 'production') {
        if (config.mode !== 'prod') {
            console.log(`自动创建表结构${config.mode}`)
            return sequelize.sync({ force: true })
        } else {
            throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
        }
    }
};

const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'BOOLEAN'];
for (let type of TYPES) {
    exp[type] = Sequelize[type];
}

exp.ID = ID_TYPE; // 主键的数据类型
exp.generateId = generateId; // 主键

module.exports = exp;
