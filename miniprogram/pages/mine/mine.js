// pages/mine/mine.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAuthoried:false,
    isLogin:false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  

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
    this.setData({
      isAuthoried:app.globalData.isAuthoried,
      isLogin:app.globalData.isLogin
    })
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

  },
  onGotUserInfo: function(event){
    console.log(event);
    var userInfo =  event.detail.userInfo
    if(userInfo == undefined){
      app.globalData.isAuthoried = false
    }else{
      app.globalData.isAuthoried = true
      wx.setStorageSync('userInfo', userInfo)
      this.uploadUserMessage(userInfo)
    }
    this.setData({
      isAuthoried:app.globalData.isAuthoried
    })
  },
  uploadUserMessage(userInfo){
    wx.showLoading({
      title: '登陆中...',
    })
    var customer  = userInfo
    wx.cloud.callFunction({
      name:'wxcustomer',
      data:{
        customer,
        $url:'addWxCustomer'
      },
      
    }).then(res=>{
      console.log(res)
      wx.showToast({
        title: res.result,
        icon:'none'
      })
      wx.hideLoading()
      this.setData({
        isLogin:true
      })
      app.globalData.isLogin = true
      wx.setStorage({
        data: 1,
        key: 'is_login',
      })


    }).then(err=>{
      console.log(err)
      wx.hideLoading()
    })
   
    
  }

  
})