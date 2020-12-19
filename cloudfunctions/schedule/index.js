// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.router('getCurrentSchedule', async (ctx, next) => {
    const workdate = event.workdate
    ctx.body = await cloud.database().collection('schedule')
    .where({
      workdate
    })
    .get()
    .then(res => {
      return res.data
    })
  })

  app.router('updateSchedule', async (ctx, next) => {
    const workdate = event.workdate
    const worktime_begin = event.worktime_begin
    const worktime_end = event.worktime_end
    const customer_id = event.customer_id
    var json =  await cloud.database().collection('schedule')
    .where({
      workdate
    })
    .get()
    .then(res=>{
       return res.data
     })


    var schedule ; 
    if(json.length == 0){
      schedule = {
        workdate,
        lessions:[
          {
            worktime_begin,
            worktime_end,
            customer_id
          }
        ]

      }
      await cloud.database().collection('schedule')
      .add({
        data:schedule
      })
      .then(res=>{
         return res.data
       })
       ctx.body = "创建当天安排"
    }else{
      var oldSchedule = json[0]
      var lessions  =  oldSchedule.lessions 
      lessions[lessions.length]  = {
        worktime_begin,
        worktime_end,
        customer_id
      }
      await cloud.database().collection('schedule')
      .doc(oldSchedule._id)
      .update({
        data:{
          lessions
        }
      })
      .then(res=>{
         return res.data
       })
       ctx.body = "更新"
    }
  })
  return app.serve()
}