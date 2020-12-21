// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()

var customerCollection =  cloud.database().collection('customer')

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
  app.router('customerlist', async (ctx, next) => {
    ctx.body = await customerCollection
    .skip(event.start)
    .limit(event.count)
    .orderBy('createTime', 'desc')
    .get()
    .then(res => {
      return res
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
        
        if (index==1 && acc.data.length > 0){
          var customer =  acc.data[0]
          customer.worktime_begin = daySchedule[0].worktime_begin
          customer.worktime_end = daySchedule[0].worktime_end
          acc.data = [customer]
        }

        if(cur.data.constructor.toString().indexOf("Array")>-1 && cur.data.length > 0){
          var customer =  cur.data[0]
          customer.worktime_begin = daySchedule[index-1].worktime_begin
          customer.worktime_end = daySchedule[index-1].worktime_end
          return {
            data:acc.data.concat([customer])
          }
        }
        // var customer =  cur.data
        // customer.worktime_begin = daySchedule[index].worktime_begin
        // customer.worktime_end = daySchedule[index].worktime_end
        // return {
        //   data:acc.data.concat([customer])
        // }
        
        return {
          data:acc.data.concat(cur.data)
        }
      })
    }
    ctx.body = list
  })
  return app.serve()
}