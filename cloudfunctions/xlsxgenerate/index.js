// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
const nodeExcel = require('excel-export')
const path = require('path')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
  
  app.router('signXlsx', async (ctx, next) => {
    
    var d =  new Date()
    const workdate = getYYMM(d)
    var json =  await db.collection('schedule')
    .where({
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