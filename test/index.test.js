const app = require('./app.js')

// 测试结果断言库，比如一个判断 1 + 1 是否等于 2
const chai = require('chai')
// http请求测试库，用来请求API接口
const supertest = require('supertest')

// 判断测试结果是否与预期一样
const expect = chai.expect
// supertest封装服务request，是用来请求接口
const request = supertest(app.listen())

// 测试套件/组
describe('开始测试demo的GET请求', () => {
    // 测试用例
    it('测试/getString.json请求', (done) => {
        request
            .get('/getString.json')
            .expect(200)
            .end((err, res) => {
                // 断言判断结果是否为object类型
                expect(res.body).to.be.an('object')
                expect(res.body.success).to.be.an('boolean')
                expect(res.body.data).to.be.an('string')
                done()
            })
    })
})