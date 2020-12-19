// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
  app.router('updateSchedule', async (ctx, next) => {
    const workdate = event.workdate
    const worktime = event.worktime
    const customer_id = event.customer_id
    var json =  await cloud.database().collection('schedule')
    .where({
      workdate
    })
    .get()
    .then(res=>{
       return res.data
     })

    if(json.length == 0){
      await cloud.database().collection('schedule')
      .add({
        data:{
          workdate,
          lessions:[
            {
              worktime,
              customer_id
            }
          ]

        }
      })
      .then(res=>{
         return res.data
       })
       ctx.body = "新增"
    }else{
       ctx.body = "更新"
    }

     




    // ctx.body = await cloud.database().collection('schedule')
    // .where(event.workDate)
    // .update({
       
    // })
    // .then(res => {
    //   return res
    // })
  })
  return app.serve()
}