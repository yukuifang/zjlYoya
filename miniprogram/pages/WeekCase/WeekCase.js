// pages/WeekCase/WeekCase.js
import {dateToYYMMDD} from '../../util/util'
var dateJson
Page({

  /**
   * 页面的初始数据
   */
  data: {
    schedules:[],
    id_signsJson:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    dateJson = JSON.parse(options.dateJson)
    const{ year,month,date,week } = dateJson
    console.log(year,month,date,week)


    // 获取两周的开始时间
    var week_first_day = new Date()
    var day =  week_first_day.getDay()
    if(day ==0 ) {
      day = 7
    }
    week_first_day.setTime(week_first_day.getTime()-(day - 1) * 24*60*60*1000)
    week_first_day = dateToYYMMDD(week_first_day)
    console.log(week_first_day)
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name:'xlsxgenerate',
      data:{
        workdate:week_first_day,
        $url:'signXlsx3'
      },
    }).then(res=>{
      this.data.schedules = res.result
      this.dealLogical()
      console.log(res)
      wx.hideLoading()
      
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })
  
    

  },
  dealLogical(){
     var json = this.data.schedules
     var id_signsJson =  {}
    for(var i =0 ;i < json.length;i++){
       var lessions = json[i].lessions
       for(var j = 0; j < lessions.length ; j++){
          var sigin = lessions[j]
          if(id_signsJson[sigin.customer_id] == undefined){
            id_signsJson[sigin.customer_id] = [sigin]
          }else{
            id_signsJson[sigin.customer_id].push(sigin)
          }
       }
    }

    console.log(id_signsJson)
    this.setData({
      id_signsJson
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})