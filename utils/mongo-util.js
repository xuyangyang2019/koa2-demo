//2. 加载模块
const mongoose = require("mongoose");

//3. 连接数据库 mongod 服务器端  mongo客户端
//数据库的名称可以是不存在 创建一个zf数据库
const DB_URL = 'mongodb://localhost:27017/test' /** * 连接 */
// var db = mongoose.connect('mongodb://user:pass@localhost:port/database')
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

/** * 连接成功 */
db.on('connected', function () {
    console.log('Mongoose connection open to ' + DB_URL)
})

/** * 连接异常 */
db.on('error', function (err) {
    console.log('Mongoose connection error: ' + err)
})

/** * 连接断开 */
db.on('disconnected', function () {
    console.log('Mongoose connection disconnected')
})

// db.once('open', function() {
//     // we're connected!
//     console.log('mongodb open')
//     var kittySchema = mongoose.Schema({
//         name: String
//     })
//     // 译者注：注意了， method 是给 document 用的
//     // NOTE: methods must be added to the schema before compiling it with mongoose.model()
//     kittySchema.methods.speak = function() {
//         var greeting = this.name ? 'Meow name is ' + this.name : "I don't have a name"
//         console.log(greeting)
//     }
//     var Kitten = mongoose.model('Kitten', kittySchema)

//     var fluffy = new Kitten({ name: 'fluffy' })
//     fluffy.save(function(err, fluffy) {
//         if (err) return console.error(err)
//         fluffy.speak()
//     })
//     Kitten.find(function(err, kittens) {
//         if (err) return console.error(err)
//         console.log(kittens)
//     })
// })


//定义一个 schema,描述此集合里有哪些字段，字段是什么类型
//只有schema中有的属性才能被保存到数据库中
// var PersonSchema = new mongoose.Schema({
//     name: { type: String },
//     home: { type: String },
//     age: { type: Number, default: 0 },
//     time: { type: Date, default: Date.now },
//     email: { type: String, default: '' }
// });
// //创建模型，可以用它来操作数据库中的person集合，指的是整体
// var PersonModel = db.model("person", PersonSchema);
// //根据模型创建实体，是指的个体对象
// var personEntity = new PersonModel({
//     name: "zf",
//     age: 6,
//     email: "zf@qq.com",
//     home: 'beijing'
// });
// //用save 方法把自己保存到数据库中
// personEntity.save(function (error, doc) {
//     if (error) {
//         console.log("error :" + error);
//     } else {
//         console.log(doc);
//     }
// });