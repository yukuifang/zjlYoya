// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()

const db = cloud.database()
const scheduleCollection =  db.collection('schedule')
const customerCollection =  db.collection('customer')
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
      var new_customers = []
        // 时间排序
        lessions.sort(function(a,b) {
          return Date.parse(a.worktime_begin.replace(/-/g,"/"))-Date.parse(b.worktime_begin.replace(/-/g,"/"))
        })
        // 客户对应排序
        for(var i = 0;i < lessions.length;i++){
           var d =  lessions[i]
           d.show_worktime_begin = d.worktime_begin.split(" ")[1]
           d.show_worktime_end =  d.worktime_end.split(" ")[1]
           for(var j= 0;j < customers.length;j++){
             var c = customers[j]
             if(d.customer_id == c._id){
               new_customers.push(c)
               break
             }
           }
        }
        ctx.body = [lessions,new_customers]
    }else{
      ctx.body = [[],[]]
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
