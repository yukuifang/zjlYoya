// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
cloud.init()
var wx_customer_db =  cloud.database().collection('wxcustomer')


 // 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
  const wxContext = cloud.getWXContext()
  const open_id = wxContext.OPENID
  app.router('addWxCustomer', async (ctx, next) => {
    var customer = event.customer
    customer._openid = open_id
    var json  = await wx_customer_db.where({
      _openid:open_id
    })
    .get()
    .then(res=>{
      return res.data
    })
    if(json == undefined || json.length == 0){
      await wx_customer_db.add({
        data:customer
      }).then(res=>{
         return res.data
      })
      ctx.body = '首次登陆成功'
 
    }else{
      await wx_customer_db.where({
        _openid:open_id
      }).update({
        data:customer
      }).then(res=>{
        return res.data
      })
      ctx.body = '登陆成功,欢迎再次回来'



    }

  })
  return app.serve()
}