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
    this.getCurrentSchedule2()
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
  getCurrentSchedule2(){
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



  getCurrentSchedule(){
    const{ year,month,date } = dateJson
    const workdate = year + '-' + month + '-' + date
    wx.showLoading({
      title: '加载中..',
    })
    wx.cloud.callFunction({
      name:'schedule',
      data:{
        workdate,
        $url:'getCurrentSchedule'
      },
      
    }).then(res=>{
       console.log(res)
       if(res.result.length>0){
        this.data.daySchedule = res.result[0].lessions
        this.getCustomerById()
       }
       
       wx.hideLoading()
      
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })
  },

  getCustomerById(){
    var that = this
    // var ids = []
    for (let index = 0; index < this.data.daySchedule.length; index++) {
       var customerJson = this.data.daySchedule[index]
       customerJson.show_worktime_begin =customerJson.worktime_begin.split(" ")[1]
       customerJson.show_worktime_end =customerJson.worktime_end.split(" ")[1]
      //  ids.push(customerJson.customer_id)
    }
    wx.showLoading({
      title: '加载中..',
    })
    wx.cloud.callFunction({
      name:'customer',
      data:{
        daySchedule:this.data.daySchedule,
        $url:'getCustomersWithIds'
      },
      
    }).then(res=>{
        that.dealPaixu(res).then((c)=>{
           that.setData({
              customers:c,
              daySchedule:that.data.daySchedule
           })
           wx.hideLoading()
        })
        
       
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })
  },
  dealPaixu(res){
    var that = this
    return new Promise(function(resolve, reject){
       var  customers =  res.result.data
       var  daySchedule = that.data.daySchedule
       var new_customers = []
        // 时间排序
        daySchedule.sort(function(a,b) {
          return Date.parse(a.worktime_begin.replace(/-/g,"/"))-Date.parse(b.worktime_begin.replace(/-/g,"/"))
        })
        // 客户对应排序
        for(var i = 0;i < daySchedule.length;i++){
           var d =  daySchedule[i]
           for(var j= 0;j < customers.length;j++){
             var c = customers[j]
             if(d.customer_id == c._id){
               new_customers.push(c)
               break
             }
           }
        }
        resolve(new_customers)
      });
       
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

 
})