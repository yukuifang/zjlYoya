// pages/editSchedule/editSchedule.js

var dateJson;
Page({

  /**
   * 页面的初始数据
   */
  data: {
     daySchedule:[],
     customers:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    dateJson = JSON.parse(options.dateJson)
    this.getCurrentSchedule()

  },
  onShow: function () {
    
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
    var ids = []
    for (let index = 0; index < this.data.daySchedule.length; index++) {
       var customerJson = this.data.daySchedule[index]
       customerJson.worktime_begin =customerJson.worktime_begin.split(" ")[1]
       customerJson.worktime_end =customerJson.worktime_end.split(" ")[1]
      //  console.log(customerJson.worktime.split(" ")[1])
       ids.push(customerJson.customer_id)
    }
    wx.showLoading({
      title: '加载中..',
    })
    wx.cloud.callFunction({
      name:'customer',
      data:{
        ids,
        $url:'getCustomersWithIds'
      },
      
    }).then(res=>{
       this.setData({
         customers:res.result.data,
         daySchedule:this.data.daySchedule
       })
       wx.hideLoading()
    }).catch(err=>{
      console(err)
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
    const {worktime_begin,worktime_end} = this.data.daySchedule[idx]
    let item = JSON.stringify(customer)
    wx.navigateTo({
      url: '../addSchedule/addSchedule?dateJson=' + JSON.stringify(dateJson) + '&customer=' + encodeURIComponent(item) + '&worktime_begin=' + worktime_begin + '&worktime_end=' + worktime_end,
    })
  },
  delecteClick(e){

    console.log('hhhhyyyyyyyy')
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
      console(err)
      wx.hideLoading()
    })

  }

 
})