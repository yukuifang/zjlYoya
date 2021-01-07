// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  // env: "product-env-4gxq75gu2a5a651d"
  // env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const scheduleCollection =  db.collection('schedule')
const customerCollection =  db.collection('customer')
const cm = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  
  //获取明天的时间
 var day = new Date();
 day.setTime(day.getTime()+24*60*60*1000)
 var workdate = getYYMMDD(day)

 // 获取所有老师的明天计划推送给其他用户
 var schedules = await scheduleCollection
    .where({
      workdate
    })
    .get()
    .then(res => {
      return res.data
    })
  
  if(schedules!=undefined && schedules.length >0){
    for(var i = 0; i< schedules.length;i++){
        var schedule = schedules[i]
        if(schedule.lessions!=undefined && schedule.lessions.length>0){
            for(var j = 0;j< schedule.lessions.length;j++){
              var tmp =  schedule.lessions[j]
              if(tmp.customer_openid!=undefined && tmp.customer_openid.length > 0){
                  await cloud.openapi.subscribeMessage.send({
                      touser: tmp.customer_openid, //要推送给那个用户
                      page: 'pages/mine/mine', //要跳转到那个小程序页面
                      lang: 'zh_CN',
                      data: { //推送的内容
                        name1: {
                          value: tmp.name
                        },
                        name10: {
                          value: '金玲'
                        },
                        thing2: {
                          value: "亚玛瑜伽"
                        },
                        date3: {
                          value: workdate
                        },
                        thing8: {
                          value: "亲爱的会员，请明天准时参加上课"
                        },
                  
                  
                      },
                      templateId: 'UgxSFEgfxASQgj6E1IW_vLyQu07aasNidkbeQqHq-Ig', //模板id
                      // miniprogramState: 'developer'
                  })
              }
            }

        }
    } 

  }
  
  
  // 获取今天的时间
  var day = new Date();
  var today_workdate = getYYMMDD(day)

  // 获取所有老师的今天的计划
 var today_schedules = await scheduleCollection
 .where({
   workdate:today_workdate
 })
 .get()
 .then(res => {
   return res.data
 })


 if(today_schedules!=undefined && today_schedules.length >0){
  for(var i = 0; i< today_schedules.length;i++){
      var schedule = today_schedules[i]
      if(schedule.lessions!=undefined && schedule.lessions.length>0){
          for(var j = 0;j< schedule.lessions.length;j++){
            var tmp =  schedule.lessions[j]
            if(tmp.is_sigin_in!=undefined && tmp.is_sigin_in == true){
              continue
            }
            tmp.is_sigin_in = true
            await scheduleCollection
            .doc(schedule._id)
            .update({
              data:{
                lessions:schedule.lessions
              }
            })
            .then(res=>{
              return res.data
            })


            
            // 签到记录到客户数据里面
            wholeDate = tmp.worktime_begin + ' ' + tmp.worktime_end
            var customers =  await customerCollection
            .where({
              _id:tmp.customer_id
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
            .doc(tmp.customer_id)
            .update({
              data:{
                sigins
              }
            })
            .then(res=>{
              return res.data
            })
            // 签到记录到客户数据里面
          }

      }
  } 
 }
  return '推送成功和自动签到'
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