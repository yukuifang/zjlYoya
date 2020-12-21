let formatString = function (str){
  if (typeof(str) != "string"){
    console.log('去除回车换行空格失败！参数不是字符串类型')
    return;
  }
  str = str.replace(/\ +/g, "");//去掉空格
  str = str.replace(/[\r\n]/g, "");//去掉回车换行
  return str;
}

let dateToYYMMDD = function(d){
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
module.exports = {
  formatString: formatString,
  dateToYYMMDD:dateToYYMMDD
}