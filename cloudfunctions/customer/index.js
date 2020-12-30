// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  // env: "product-env-4gxq75gu2a5a651d"
  // env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const customerCollection =  db.collection('customer')
const cm = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var _openid = wxContext.OPENID
  const app = new TcbRouter({
    event
  })

  // 获取自己的信息
  app.router('getMyProfile', async (ctx, next) => {
    ctx.body = await customerCollection
    .where({
      _openid
    })
    .get()
    .then(res => {
      return res.data
    })
  })


  app.router('wxcustomerlist', async (ctx, next) => {
    ctx.body = await customerCollection
    .where({
       is_teacher:1
    })
    .skip(event.start)
    .limit(event.count)
    .orderBy('createTime', 'desc')
    .get()
    .then(res => {
      return res.data
    })
  })

  // 微信登陆，新增用户信息
  app.router('addWxCustomer', async (ctx, next) => {
    var customer = event.customer
    customer._openid = _openid
    var json  = await customerCollection.where({
      _openid
    })
    .get()
    .then(res=>{
      return res.data
    })
    if(json == undefined || json.length == 0){
      await customerCollection.add({
        data:customer
      }).then(res=>{
         return res.data
      })
      ctx.body = '首次登陆成功'
 
    }else{
      var oldCustomer = json[0]
      customer.nick_name = oldCustomer.nick_name
      await customerCollection.where({
        _openid,
        is_from_wx:true
      }).update({
        data:customer
      }).then(res=>{
        return res.data
      })
      ctx.body = '登陆成功,欢迎再次回来'

   }

  })


  // 获取会员列表，（来自微信和手动）
  app.router('customerlist', async (ctx, next) => {
    ctx.body = await customerCollection
    .where(cm.or([
      {
        _openid,
        is_from_wx:false,
        is_teacher:0
        

      },
      {
        _openid:cm.neq(_openid),
        is_from_wx:true,
        is_teacher:0
      }
      
    ]))
    .skip(event.start)
    .limit(event.count)
    .orderBy('createTime', 'desc')
    .get()
    .then(res => {
      return res.data
    })
  })

  app.router('getCustomersWithIds', async (ctx, next) => {
    var daySchedule = event.daySchedule
    const tasks = []
    for(var i = 0;i < daySchedule.length;i++){
      let promise = customerCollection.where({
         _id:daySchedule[i].customer_id
      }).get()
      tasks.push(promise)
    }
    let list={
      data:[]
    }
    if(tasks.length>0){
      list =(await Promise.all(tasks)).reduce((acc,cur,index)=>{
        return {
          data:acc.data.concat(cur.data)
        }
      })
    }
    ctx.body = list
  })



  app.router('modifyNickName', async (ctx, next) => {
    var customer = event.customer
    var nickName = event.nickName
    customer._openid = _openid
    var json  = await customerCollection.where({
      _id:customer._id
    })
    .get()
    .then(res=>{
      return res.data
    })

    if(json != undefined && json.length >0){
      await customerCollection
      .doc(customer._id)
      .update({
        data:{
          nick_name:nickName
        }
      }).then(res=>{
        return res.data
      })
      ctx.body = '修改成功'
      
     }else{
      ctx.body = '没找到，修改不成功'
     }
    

  })

  return app.serve()
}