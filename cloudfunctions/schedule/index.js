// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()

const db = cloud.database()
const scheduleCollection =  db.collection('schedule')
const cm = db.command



// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  const wxContext = cloud.getWXContext()
  var _openid = wxContext.OPENID


  

  app.router('siginIn', async (ctx, next) => {
    const customer_id = event.customer_id
    var d =  new Date()
    const workdate = getYYMMDD(d)
    var json =  await cloud.database().collection('schedule')
    .where({
      _openid,
      workdate
    })
    .get()
    .then(res=>{
       return res.data
     })


     var oldSchedule = json[0]
      var lessions  =  oldSchedule.lessions 
      var findId = -1;
      for(var i= 0 ; i < lessions.length; i++){
         var tmp = lessions[i]
         console.log(tmp.customer_id)
         if(tmp.customer_id == customer_id){
           findId = i
           console.log('找到了')
           break
         }
      }
      if(findId >=0){
        lessions[findId].is_sigin_in = true
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
       ctx.body = "签到好了"

  })

  app.router('deleteCurrentSchedule', async (ctx, next) => {
    const workdate = event.workdate
    const customer_id = event.customer_id
    var json =  await cloud.database().collection('schedule')
    .where({
      _openid,
      workdate
    })
    .get()
    .then(res=>{
       return res.data
     })


     var oldSchedule = json[0]
      var lessions  =  oldSchedule.lessions 
      var findId = -1;
      for(var i= 0 ; i < lessions.length; i++){
         var tmp = lessions[i]
         console.log(tmp.customer_id)
         if(tmp.customer_id == customer_id){
           findId = i
           console.log('找到了')
           break
         }
      }
      if(findId >=0){
        lessions.splice(findId,1)
        console.log(lessions)
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
       ctx.body = "更新好了"

  })

  app.router('getCurrentSchedule', async (ctx, next) => {
    var workdate = event.workdate
    if(workdate== undefined || workdate.length == 0){
       var d =  new Date()
       workdate = getYYMMDD(d)
    }
    ctx.body = await cloud.database().collection('schedule')
    .where({
      _openid,
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
    const customer_openid = event.customer_openid
    const name = event.name
    var json =  await cloud.database().collection('schedule')
    .where({
      _openid,
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
        _openid,
        lessions:[
          {
            worktime_begin,
            worktime_end,
            customer_id,
            customer_openid,
            name
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
        customer_id,
        customer_openid,
        name
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


  app.router('editCurrentSchedule', async (ctx, next) => {
    const workdate = event.workdate
    const worktime_begin = event.worktime_begin
    const worktime_end = event.worktime_end
    const customer_id = event.customer_id
    const customer_openid = event.customer_openid
    const name = event.name
    const edit_customer_id =  event.edit_customer_id
    var json =  await cloud.database().collection('schedule')
    .where({
      _openid,
      workdate
    })
    .get()
    .then(res=>{
       return res.data
     })

    if(json.length > 0 ){
      var oldSchedule = json[0]
      var lessions  =  oldSchedule.lessions 
      var findId = -1
      for(var i = 0;i< lessions.length;i++){
         var tmp = lessions[i]
         if(tmp.customer_id == edit_customer_id){
           findId = i
           break;
         }
      }

      if(findId >= 0){
        lessions[findId] =  {
          worktime_begin,
          worktime_end,
          customer_id,
          customer_openid,
          name
        }
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
       ctx.body = findId
       
    }else{
       ctx.body = "数据库没找到"
    }
  })
  return app.serve()
}

function getYYMMDD(d){
    function change(t){
      if(t<10){
       return "0"+t;
      }else{
       return t;
      }
    }
    var year=d.getFullYear();
    var month=change(d.getMonth()+1);
    var day=change(d.getDate());
    var hour=change(d.getHours());
    var minute=change(d.getMinutes());
    var second=change(d.getSeconds());
    return year+'-'+month+'-'+day
}
