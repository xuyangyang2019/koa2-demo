
/**
 * restful api 子路由
 */

const router = require('koa-router')()
const apiController = require('../controllers/apiController')

const routers = router
  .get('/user/getLoginUserInfo', apiController.getLoginUserInfo)
  .get('/user/getAllUsers', apiController.getAllUsers)
  .post('/user/signIn', apiController.signIn)
  .post('/user/signUp', apiController.signUp)
 
  
module.exports = routers