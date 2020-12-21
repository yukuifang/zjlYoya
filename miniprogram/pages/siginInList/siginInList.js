

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
    this.getCurrentSchedule()
  },
  onShow: function () {
    
  },
  getCurrentSchedule(){
    wx.showLoading({
      title: '加载中..',
    })
    wx.cloud.callFunction({
      name:'schedule',
      data:{
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
    for (let index = 0; index < this.data.daySchedule.length; index++) {
       var customerJson = this.data.daySchedule[index]
       customerJson.show_worktime_begin =customerJson.worktime_begin.split(" ")[1]
       customerJson.show_worktime_end =customerJson.worktime_end.split(" ")[1]
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
  signinClick(e){
    const idx = e.currentTarget.dataset.idx
    const {customer_id,is_sigin_in} = this.data.daySchedule[idx]
    const {name} = this.data.customers[idx]
    var that = this

    if(is_sigin_in){
      wx.showToast({
        title: '已经签到了哦😯',
        icon:'none'
      })
      return
    }
    wx.showModal({
      title:'今日签到',
      content:name+'签到',
      success:function(res){
         if(res.confirm){
           console.log('点击了确认')
           that.toSigin(customer_id)
         }

      }
    })
  },
  toSigin(customer_id){
    wx.cloud.callFunction({
      name:'schedule',
      data:{
        customer_id,
        $url:'siginIn'
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