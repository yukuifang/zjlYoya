// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()

const db = cloud.database()
const repeatCollection =  db.collection('weekrepeat')
const cm = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var _openid = wxContext.OPENID
  const app = new TcbRouter({
    event
  })
  app.router('recordRepeat', async (ctx, next) => {
    const week = event.week
    const record_date = getYYMMDD(new Date)
    const worktime_begin = event.worktime_begin
    const worktime_end = event.worktime_end
    const customer_id = event.customer_id
    const customer_openid = event.customer_openid
    const name = event.name
    var json =  await repeatCollection
    .where({
      _openid,
      week
    })
    .get()
    .then(res=>{
       return res.data
     })


    var schedule ; 
    if(json.length == 0){
      schedule = {
        week,
        _openid,
        lessions:[
          {
            worktime_begin,
            worktime_end,
            customer_id,
            customer_openid,
            name,
            record_date
          }
        ]

      }
      await repeatCollection
      .add({
        data:schedule
      })
      .then(res=>{
         return res.data
       })
       ctx.body = "添加第一条重复记录"
    }else{
      var oldSchedule = json[0]
      var lessions  =  oldSchedule.lessions 

      const item = {
        worktime_begin,
        worktime_end,
        customer_id,
        customer_openid,
        name,
        record_date
      }

      var findIdx = -1
      for(var i = 0;i< lessions.length;i++){
        var tmp = lessions[i]
        if((worktime_begin.split(" ")[1] == tmp.worktime_begin.split(" ")[1])&&(worktime_end.split(" ")[1] == tmp.worktime_end.split(" ")[1])){
           findIdx = i
           break;
        }
      }
      if(findIdx>=0){
         lessions[findIdx] =  item
      }else{
         lessions[lessions.length]  = item
      }
      await repeatCollection
      .doc(oldSchedule._id)
      .update({
        data:{
          lessions
        }
      })
      .then(res=>{
         return res.data
       })
       ctx.body = "新增重复记录或者更新重复记录"
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