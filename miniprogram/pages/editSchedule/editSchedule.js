// pages/editSchedule/editSchedule.js
import {dateToYYMMDD} from '../../util/util'

var dateJson;
var  daySchedule_tomorrow = []
var  customers_tomorrow = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
     daySchedule:[],
     customers:[],
     copystr:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    dateJson = JSON.parse(options.dateJson)
    this.getCurrentSchedule()
    this.getTomorrowSchedule()
  },
  onShow: function () {
    
  },
  getTomorrowSchedule(){
    const{ year,month,date } = dateJson
    var workdate = year + '-' + month + '-' + date
    var day = new Date(workdate)
    day.setTime(day.getTime()+24*60*60*1000)
    workdate = dateToYYMMDD(day)
    wx.showLoading({
      title: '加载中..',
    })
    wx.cloud.callFunction({
      name:'schedule',
      data:{
        workdate,
        $url:'getScheduleAndCustomerByDate'
      },
    }).then(res=>{
       daySchedule_tomorrow = res.result[0]
       customers_tomorrow = res.result[1]
       console.log(res)
       wx.hideLoading()
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })
    
  },
  getCurrentSchedule(){
    const{ year,month,date } = dateJson
    var workdate = year + '-' + month + '-' + date
    wx.showLoading({
      title: '加载中..',
    })
    wx.cloud.callFunction({
      name:'schedule',
      data:{
        workdate,
        $url:'getScheduleAndCustomerByDate'
      },
    }).then(res=>{
      console.log(res)
       this.setData({
        daySchedule:res.result[0],
        customers:res.result[1]
       })
       wx.hideLoading()
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })
    
  },
  addSchedule(){
   wx.navigateTo({
      url: '../addSchedule/addSchedule?dateJson=' + JSON.stringify(dateJson),
    })
  
  },
  itemClick(e){
    const idx = e.currentTarget.dataset.idx
    const customer =  this.data.customers[idx]
    const {show_worktime_begin,show_worktime_end,is_sigin_in} = this.data.daySchedule[idx]
    if(is_sigin_in!=undefined && is_sigin_in == true){
       return;
    }
    console.log(customer._id)
    let item = JSON.stringify(customer)
    wx.navigateTo({
      url: '../addSchedule/addSchedule?dateJson=' + JSON.stringify(dateJson) + '&customer=' + encodeURIComponent(item) + '&show_worktime_begin=' + show_worktime_begin + '&show_worktime_end=' + show_worktime_end,
    })
  },
  delecteClick(e){
    const idx = e.currentTarget.dataset.idx
    const {customer_id} = this.data.daySchedule[idx]
    const{ year,month,date } = dateJson
    const workdate = year + '-' + month + '-' + date

    console.log(customer_id)
    console.log(workdate)
    wx.cloud.callFunction({
      name:'schedule',
      data:{
        workdate,
        customer_id,
        $url:'deleteCurrentSchedule'
      },
      
    }).then(res=>{
       console.log(res)
       wx.hideLoading()
       this.getCurrentSchedule()
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })

  },
  dayPlanClick(e){
     this.data.copystr = '今日课程:\n明日课程:\n'
     for (let index = 0; index < customers_tomorrow.length; index++) {
       const element = customers_tomorrow[index]
       this.data.copystr +=( daySchedule_tomorrow[index].show_worktime_begin + '.' + element.name  + '\n')
     }
     this.data.copystr += ('本月目标:\n今日完成:\n累计完成:\n')

     console.log(this.data.copystr)
     this.copyFileUrl(this.data.copystr)
     
  },
  copyFileUrl(copyStr) {
    wx.setClipboardData({
      data: copyStr,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log("复制成功",res.data) // data
            wx.showToast({
              title: '复制成功',
            })
          }
        })
      }
    })
  },
  yinyongClick(){
    const{ year,month,date,week } = dateJson
    var w = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
    var that = this
    wx.showModal({
      title:'复制模版',
      content:'复制上周' + w[week] + '的模版',
      success:function(res){
         if(res.confirm){
           console.log('点击了确认')
           that.toYinyong()
         }

      }
    })
  },
  toYinyong(){
    const{ year,month,date,week} = dateJson
    const workdate = year + '-' + month + '-' + date

    var copyDate = new Date(workdate)
    var dlt = 7 
     copyDate.setTime(copyDate.getTime() - dlt * 24*60*60*1000)
     copyDate  =  dateToYYMMDD(copyDate)
     console.log(copyDate)

     wx.showLoading({
       title: '加载中',
     })
     wx.cloud.callFunction({
      name:'schedule',
      data:{
        workdate,
        copyWorkdate:copyDate,
        $url:'copyScheduleByDate'
      },
      
    }).then(res=>{
       console.log(res)
       this.getCurrentSchedule()
       wx.hideLoading()
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })
    
  }

 
})