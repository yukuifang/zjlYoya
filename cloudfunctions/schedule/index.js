// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  // env: "product-env-4gxq75gu2a5a651d"

  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const scheduleCollection =  db.collection('schedule')
const customerCollection =  db.collection('customer')
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
                ele.teacher_name = schedule.name
                result.push(ele)
            }
          }

        }

    }
    ctx.body = result
  })


  

  app.router('siginIn', async (ctx, next) => {
    const customer_id = event.customer_id
    const worktime_begin = event.worktime_begin
    const worktime_end = event.worktime_end
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

     var wholeDate = '' 
     var oldSchedule = json[0]
      var lessions  =  oldSchedule.lessions 
      var findId = -1;
      for(var i= 0 ; i < lessions.length; i++){
         var tmp = lessions[i]
         console.log(tmp.customer_id)
         if(tmp.customer_id == customer_id && tmp.worktime_begin == worktime_begin && tmp.worktime_end == worktime_end){
           findId = i
           console.log('找到了')
           wholeDate = tmp.worktime_begin + ' ' + tmp.worktime_end
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

       // 签到记录到客户数据里面
      var customers =  await customerCollection
      .where({
        _id:customer_id
      })
      .get()
      .then(res=>{
        return res.data
      })
      var sigins = []
      if(customers!= undefined && customers.length > 0){
        var customer = customers[0]
        sigins = customer.sigins
        if(sigins!=undefined && sigins.length > 0){
           sigins.push(wholeDate)
        }else{
           sigins = [wholeDate]
        }
      }
      await customerCollection
      .doc(customer_id)
      .update({
        data:{
          sigins
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

  })

  app.router('updateSchedule', async (ctx, next) => {
    const workdate = event.workdate
    const worktime_begin = event.worktime_begin
    const worktime_end = event.worktime_end
    const customer_id = event.customer_id
    const customer_openid = event.customer_openid
    const name = event.name // 会员名字
    const teacher_name = event.teacher_name
    var json =  await scheduleCollection
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
        name:teacher_name,
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
      await scheduleCollection
      .add({
        data:schedule
      })
      .then(res=>{
         return res.data
       })
       ctx.body = "创建第一条安排"
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
      // 时间排序
      lessions.sort(function(a,b) {
        return Date.parse(a.worktime_begin.replace(/-/g,"/"))-Date.parse(b.worktime_begin.replace(/-/g,"/"))
      })
      await scheduleCollection
      .doc(oldSchedule._id)
      .update({
        data:{
          lessions
        }
      })
      .then(res=>{
         return res.data
       })
       ctx.body = "新增一条安排"
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
    var json =  await scheduleCollection
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


  app.router('getScheduleAndCustomerByDate', async (ctx, next) => {
    var workdate = event.workdate
    if(workdate== undefined || workdate.length == 0){ //如果workdate是空值 ，获取当天签到
      var d =  new Date()
      workdate = getYYMMDD(d)
   }
    var schedules = await scheduleCollection
    .where({
      _openid,
      workdate
    })
    .get()
    .then(res => {
      return res.data
    })

    if(schedules!=undefined && schedules.length>0){
      var schedule = schedules[0]
      var lessions = schedule.lessions
      const tasks = []
      for(var i = 0;i < lessions.length;i++){
        let promise = customerCollection.where({
          _id:lessions[i].customer_id
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
      var customers = list.data.length>0?list.data:[]
      for(var i = 0;i < lessions.length;i++){
           var d =  lessions[i]
           d.show_worktime_begin = d.worktime_begin.split(" ")[1]
           d.show_worktime_end =  d.worktime_end.split(" ")[1]
           
      }
      ctx.body = [lessions,customers]
    }else{
      ctx.body = [[],[]]
    }

    

  })


  app.router('getScheduleAndCustomerByDate2', async (ctx, next) => {
    var workdate = event.workdate
    if(workdate== undefined || workdate.length == 0){ //如果workdate是空值 ，获取当天签到
      var d =  new Date()
      workdate = getYYMMDD(d)
   }
   var week = new Date(workdate).getDay()
    var schedules = await scheduleCollection
    .where({
      _openid,
      workdate
    })
    .get()
    .then(res => {
      return res.data
    })

    var repeatSchedules =  await repeatCollection
    .where({
      _openid,
      week
    })
    .get()
    .then(res=>{
       return res.data
     })



    var api_lession = []
    if(schedules!=undefined && schedules.length>0){
      var schedule = schedules[0]
      api_lession = schedule.lessions
    } 



     

     //  插入周重复计划
    if(repeatSchedules!=undefined && repeatSchedules.length > 0){
       var  repeatSchedule = repeatSchedules[0]
       if(repeatSchedule.lessions != undefined && repeatSchedule.lessions.length > 0){
             var  repeatLessions = repeatSchedule.lessions
             for(var k = 0; k < repeatLessions.length; k++){
                var repeatLession = repeatLessions [k]
                var a  = new Date(repeatLession.record_date).getTime()
                var b =  new Date(workdate).getTime()
                if(b <a){
                  repeatLessions.splice(k,1)
                  k--
                }
              }
             var new_schedule
             if(schedules.length == 0){
              repeatLessions.sort(function(a,b) {
                return Date.parse(a.worktime_begin.replace(/-/g,"/"))-Date.parse(b.worktime_begin.replace(/-/g,"/"))
              })
              api_lession = repeatLessions
              new_schedule = {
                 workdate,
                 _openid,
                 name:repeatSchedule.name,
                 lessions:repeatLessions
              }
              await scheduleCollection
              .add({
                data:new_schedule
              })
              .then(res=>{
                 return res.data
              })
            }else{
              
              var newLessions =[]
              var oldSchedule = schedules[0]
              var oldLessions  =  oldSchedule.lessions 
              newLessions = oldLessions
              for(var i = 0;i<newLessions.length;i++){
                 var findIdx = -1
                 var newLession = newLessions[i]
                 for(var j = 0 ; j < repeatLessions.length ; j++){
                     var repeatLession = repeatLessions[j]
                     if(newLession.worktime_begin == repeatLession.worktime_begin &&  newLession.worktime_end == repeatLession.worktime_end){
                        findIdx = i
                        break
                     }
                 }
                 if(findIdx >= 0){
                    newLessions.splice(findIdx,1)
                    i--
                 }
              }
             newLessions =  newLessions.concat(repeatLessions)
              // 时间排序
             newLessions.sort(function(a,b) {
                return Date.parse(a.worktime_begin.replace(/-/g,"/"))-Date.parse(b.worktime_begin.replace(/-/g,"/"))
             })
             api_lession = newLessions
             await scheduleCollection
            .doc(oldSchedule._id)
            .update({
            data:{
              newLessions
            }
            })
            .then(res=>{
               return res.data
            })


              
            }
          
       }
    }
    //  插入周重复计划


    if(api_lession!=undefined && api_lession.length>0){
      const tasks = []
      for(var i = 0;i < api_lession.length;i++){
        let promise = customerCollection.where({
          _id:api_lession[i].customer_id
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
      var customers = list.data.length>0?list.data:[]
      for(var i = 0;i < api_lession.length;i++){
           var d =  api_lession[i]
           d.show_worktime_begin = d.worktime_begin.split(" ")[1]
           d.show_worktime_end =  d.worktime_end.split(" ")[1]
      }
      ctx.body = [api_lession,customers]
    }else{
      ctx.body = [[],[]]
    }

    

  })
 

  app.router('copyScheduleByDate', async (ctx, next) => {
    const workdate = event.workdate
    const copyWorkdate = event.copyWorkdate
    var json =  await scheduleCollection
    .where({
      _openid,
      workdate
    })
    .get()
    .then(res=>{
       return res.data
     })

     var copyJson =  await scheduleCollection
    .where({
      _openid,
      workdate:copyWorkdate
    })
    .get()
    .then(res=>{
       return res.data
    })


    if(copyJson!= undefined && copyJson.length >0){
      var copySchedule =  copyJson[0]
      if(copySchedule.lessions!=undefined && copySchedule.lessions.length>0){
       for(var i = 0; i< copySchedule.lessions.length ; i++ ){
           var copyLession = copySchedule.lessions[i]
           copyLession.is_sigin_in = false
           copyLession.worktime_begin = workdate + ' ' + copyLession.worktime_begin.split(' ')[1]
           copyLession.worktime_end = workdate + ' ' + copyLession.worktime_end.split(' ')[1]
        }
        var schedule 
        if(json.length == 0){
          schedule = {
            workdate,
            _openid,
            name:copySchedule.name,
            lessions:copySchedule.lessions
          }
          await scheduleCollection
          .add({
            data:schedule
          })
          .then(res=>{
             return res.data
           })
           ctx.body = "ok"
        }else{
          var oldSchedule = json[0]
          await scheduleCollection
          .doc(oldSchedule._id)
          .update({
            data:{
              lessions:copySchedule.lessions
            }
          })
          .then(res=>{
             return res.data
           })
           ctx.body = "ok"
        }
         
      }else{
        ctx.body = "no"
      }
    }else{
      ctx.body = "no"
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
