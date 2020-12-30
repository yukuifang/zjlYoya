// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
cloud.init({
  // env: "product-env-4gxq75gu2a5a651d"
  env: cloud.DYNAMIC_CURRENT_ENV
})

var configCollection =  cloud.database().collection('config')

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
  app.router('config_one', async (ctx, next) => {
    var json = await configCollection
    .get()
    .then(res => {
      return res.data
    })

    if(json!=undefined && json.length > 0 ){
      var configJson=  json[0]
      configJson.serverDate = new Date()
      ctx.body = configJson
    }
  })
  return app.serve()
  
}