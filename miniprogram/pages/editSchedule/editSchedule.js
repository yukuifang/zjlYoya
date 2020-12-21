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
       this.dealPaixu(res).then((c)=>{
        this.setData({
          customers:c,
          daySchedule:this.data.daySchedule
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
            return Date.parse(a.worktime_begin)-Date.parse(b.worktime_begin)
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
    const {show_worktime_begin,show_worktime_end} = this.data.daySchedule[idx]
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

  }

 
})