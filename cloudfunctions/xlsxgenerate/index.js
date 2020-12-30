// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
const nodeExcel = require('excel-export')
const path = require('path')

cloud.init({
  // env: "product-env-4gxq75gu2a5a651d"
  // env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
  const wxContext = cloud.getWXContext()
  var _openid = wxContext.OPENID
  
  app.router('signXlsx', async (ctx, next) => {
    var  workdate = event.workdate
    var d =  new Date(workdate)
    workdate = getYYMM(d)
    var json =  await db.collection('schedule')
    .where({
      _openid,
      workdate:new db.RegExp({
        regexp:'^' + workdate + '.*$', 
        options:'i'                
      })
    })
    .orderBy('workdate', 'asc')
    .get()
    .then(res=>{
       return res.data
     })
     



     var tableMap = {
      styleXmlFile:path.join(__dirname,"styles.xml"),
      name: Date.now()+"-export",
      cols: [],
      rows: [],
    }
    var tableHead = ["会员信息","本月节数"];
    //添加表头
    for(var i=0;i<tableHead.length;i++){
      tableMap.cols[tableMap.cols.length]={
       caption:tableHead[i],
       type:'string'
     }
    }

     //添加每一行数据
    // for(var i=0;i<tableList.length;i++){
    //    tableMap.rows[tableMap.rows.length]=[
    //       tableList[i].编号,
    //       tableList[i].名称,
    //       tableList[i].生日,
    //       tableList[i].年龄
    //    ]
    // }


    var id_signsJson =  {}
    for(var i =0 ;i < json.length;i++){
       var lessions = json[i].lessions
       for(var j = 0; j < lessions.length ; j++){
          var sigin = lessions[j]
          if(sigin.is_sigin_in){
             if(id_signsJson[sigin.customer_id] == undefined){
               id_signsJson[sigin.customer_id] = [sigin]
             }else{
               id_signsJson[sigin.customer_id].push(sigin)
             }
          }
       }
    }
    
    var k = 0
    for (let key of Object.keys(id_signsJson)) {
      var contents = []
      let sigin = id_signsJson[key];
      contents.push(sigin[0].name)
      contents.push(sigin.length + '')
      tableMap.rows[k] = contents
      k++
    }
    

    
   //保存excelResult到相应位置
    var excelResult = nodeExcel.execute(tableMap);
    var filePath = "outputExcels";
    var fileName = cloud.getWXContext().OPENID + "-" + Date.now()/1000 + '.xlsx';
    //图片上传到云存储
    var result = await cloud.uploadFile({
      cloudPath: path.join(filePath, fileName),
      fileContent: new Buffer(excelResult,'binary')
    }).then(res=>{
      console.log(res.fileID)
      return res
    }).catch(err=>{

    });

    ctx.body =  result

  })
  

  app.router('signXlsx2', async (ctx, next) => {
    var  workdate = event.workdate
    var d =  new Date(workdate)
    workdate = getYYMM(d)
    var schedules =  await db.collection('schedule')
    .where({
      _openid,
      workdate:new db.RegExp({
        regexp:'^' + workdate + '.*$', 
        options:'i'                
      })
    })
    .orderBy('workdate', 'asc')
    .get()
    .then(res=>{
       return res.data
     })
     



     var tableMap = {
      styleXmlFile:path.join(__dirname,"styles.xml"),
      name: Date.now()+"-export",
      cols: [],
      rows: [],
    }
    var tableHead = ["日期","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15"];
    //添加表头
    for(var i=0;i<tableHead.length;i++){
      tableMap.cols[tableMap.cols.length]={
       caption:tableHead[i],
       type:'string'
     }
    }

    var date = ''
    var contents = []
    var c = []
    for(var i =0 ;i < schedules.length;i++){
       var schedule = schedules[i]
       var lessions = schedule.lessions
       if(date.length > 0 &&  date!=schedule.workdate){
          for (let i = c.length-1; i < 15; i++) {
             c.push('')
          }
          contents.push(c)
          c = []
          date = schedule.workdate
       }else{
          date = schedule.workdate
       }
       c.push(schedule.workdate)
       for(var j = 0; j < lessions.length ; j++){
          var lession = lessions[j]
          var b = lession.worktime_begin.split(" ")[1]
          var e = lession.worktime_end.split(" ")[1]
          var n = lession.name
          c.push(b + '-' + e + '\n' + n)
       }
    }
    for (let i = c.length-1; i < 15; i++) {
      c.push('')
    }
    contents.push(c)
    tableMap.rows = contents
    
    
    

    
   //保存excelResult到相应位置
    var excelResult = nodeExcel.execute(tableMap);
    var filePath = "outputExcels";
    var fileName = cloud.getWXContext().OPENID + "-" + Date.now()/1000 + '.xlsx';
    //图片上传到云存储
    var result = await cloud.uploadFile({
      cloudPath: path.join(filePath, fileName),
      fileContent: new Buffer(excelResult,'binary')
    }).then(res=>{
      console.log(res.fileID)
      return res
    }).catch(err=>{

    });

    ctx.body =  result

  })
  

  
  return app.serve()
}
function getYYMM(d){
  function change(t){
    if(t<10){
     return "0"+t;
    }else{
     return t;
    }
  }
  var year=d.getFullYear();
  var month=change(d.getMonth()+1);
  return year+'-'+month
}