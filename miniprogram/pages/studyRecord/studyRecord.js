// pages/studyRecord/studyRecord.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      customer:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     this.getMyProfile()

  },

  getMyProfile(){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'customer',// 云函数的名称
      data: {
        $url:'getMyProfile'
      }//参数
    }).then((res) => {
      var a = res.result
      if(a != undefined && a.length > 0){
        var customer = a[0]
        var newSigins = []
        if(customer.sigins!= undefined && customer.sigins.length>0){
           for (let i = 0; i < customer.sigins.length; i++) {
             const ele = customer.sigins[i]
              var r  = ele.split(' ')
              var n = r[0] + ' ' + r[1] + '-' + r[3]
              newSigins.push(n)
           }
           customer.sigins = newSigins
        }
        console.log(customer.sigins)
        this.setData({
          customer
        })
      }
      console.log(res)
      wx.hideLoading()
    }).catch(err=>{
      wx.hideLoading()
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