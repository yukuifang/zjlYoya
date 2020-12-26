// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()

const db = cloud.database()
const scheduleCollection =  db.collection('schedule')
const repeatCollection =  db.collection('weekrepeat')
const cm = db.command



// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  const wxContext = cloud.getWXContext()
  var _openid = wxContext.OPENID

 
  // 学生获取今天和明天的上课
  app.router('getJMClassPlan', async (ctx, next) => {
    var d =  new Date()
    const workdate = getYYMMDD(d)
    var schedules =  await scheduleCollection
    .where({
      workdate
    })
    .get()
    .then(res=>{
       return res.data
     })

    var result = [] 
    if(schedules!=undefined && schedules.length>0){
        for(var i = 0;i < schedules.length;i++){
          var schedule = schedules[i]
          for (let j = 0; j < schedule.lessions.length; j++) {
            const ele  = schedule.lessions[j];
            if(ele.customer_openid == _openid){
                result.push(ele)
            }
          }

        }

    }
    ctx.body = result
  })


  

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
    console.log('hello nodeJs')
    var workdate = event.workdate
    if(workdate== undefined || workdate.length == 0){ //如果workdate是空值 ，获取当天签到
       var d =  new Date()
       workdate = getYYMMDD(d)
    }
    // const week  = new Date(workdate).getDay()

    // var repeats = await repeatCollection
    // .where({
    //   _openid,
    //   week
    // })
    // .get()
    // .then(res => {
    //   return res.data
    // })

    var schedules = await scheduleCollection
    .where({
      _openid,
      workdate
    })
    .get()
    .then(res => {
      return res.data
    })
    ctx.body = schedules


    
    
    // var arr = []
    // if(repeats != undefined && repeats.length >0){
    //   var repeatLessions  =   repeats[0].lessions
    //   var  schedule 
    //   if(schedules!=undefined && schedules.length>0){
    //     schedule = schedules[0]
    //   }
    //   for(var i = 0;i< repeatLessions.length;i++){
    //      var repeat  = repeatLessions[i]
    //      var time1 = new Date(repeat.record_date).getTime()
    //      var time2 = new Date(workdate).getTime()
    //      var findIdx = -1
    //      if(time2 > time1){
    //          if(schedule!=undefined && schedule.lessions!=undefined && schedule.lessions.length>0){
    //             for(var j = 0; j < schedule.lessions.length;j++){
    //                 var lession = schedule.lessions[j]
    //                 if((repeat.worktime_begin.split(" ")[1] == lession.worktime_begin.split(" ")[1])&&(repeat.worktime_end.split(" ")[1] == lession.worktime_end.split(" ")[1])){
    //                     findIdx = j 
    //                     break;
    //                 }
    //             }
    //             if(findIdx==-1){
    //                 arr.push(repeat)
    //             }
    //          }else{
    //             arr.push(repeat)
    //          }
    //      }
    //   }





    // }


    // if(arr.length > 0){
    //   var repeatLessions = []
    //   for(var i = 0 ; i < arr.length;i++){
    //      var temp = arr[i]
    //      var worktime_begin = workdate + " " +  temp.worktime_begin.split(" ")[1]
    //      var worktime_end = workdate + " " + temp.worktime_end.split(" ")[1]
    //      var customer_id = temp.customer_id
    //      var name = temp.name
    //      var customer_openid = customer_openid
    //      var repeatLession = {
    //       worktime_begin,
    //       worktime_end,
    //       customer_id,
    //       customer_openid,
    //       name
    //      }
    //      repeatLessions.push(repeatLession)
    //   }
    //   var schedule; 
    //   if(schedules==undefined ||  schedules.length == 0){
    //     schedule = {
    //       workdate,
    //       _openid,
    //       lessions:repeatLessions
    //     }
    //     await scheduleCollection
    //     .add({
    //       data:schedule
    //     })
    //     .then(res=>{
    //        return res.data
    //      })
    //      schedules = [schedule]
    //     //  "创建当天第一个lession"
    //   }else{
    //     var oldSchedule = schedules[0]
    //     var oldLessions  =  oldSchedule.lessions 
    //     var newLessions  = oldLessions.concat(repeatLessions)
    //     oldSchedule.lessions = newLessions
    //     await scheduleCollection
    //     .doc(oldSchedule._id)
    //     .update({
    //       data:{
    //         newLessions
    //       }
    //     })
    //     .then(res=>{
    //        return res.data
    //      })
    //     //  ctx.body = "更新"
    //   }
    //   ctx.body = schedules
    // }else{
    //   ctx.body = schedules
    // }
    


    






    // ctx.body = await cloud.database().collection('schedule')
    // .where({
    //   _openid,
    //   workdate
    // })
    // .get()
    // .then(res => {
    //   return res.data
    // })
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
