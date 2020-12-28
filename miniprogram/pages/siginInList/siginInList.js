

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

 
  
  itemClick(e){
    
  },
  signinClick(e){
    const idx = e.currentTarget.dataset.idx
    const {customer_id,is_sigin_in,worktime_begin,worktime_end} = this.data.daySchedule[idx]
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
           that.toSigin(customer_id,worktime_begin,worktime_end)
         }

      }
    })
  },
  toSigin(customer_id,worktime_begin,worktime_end){
    wx.cloud.callFunction({
      name:'schedule',
      data:{
        worktime_begin,
        worktime_end,
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