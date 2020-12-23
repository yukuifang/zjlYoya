// pages/home/home.js
const app = getApp()

const MAX_LIMIT = 15
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customerlist:[]
  },
  toAddUser(){
    if(!this.toMine())return;
    wx.navigateTo({
      url: '../addCustomer/addCustomer',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    [5,8,0,1].reduce((acc,cur,index)=>{
       console.log(acc + ' ' + cur + ' '+ index)
    })
     this.getCustomerlist()
  },
  getCustomerlist(){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'customer',// 云函数的名称
      data: {
        start: this.data.customerlist.length,
        count: MAX_LIMIT,
        $url:'customerlist'
      }//参数
    }).then((res) => {
      console.log(res)
      this.setData({
        customerlist:this.data.customerlist.concat(res.result.data)//在当前数据的基础上拼接
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()//停止当前页面下拉刷新
    }).catch(err=>{
      wx.hideLoading()
      wx.stopPullDownRefresh()//停止当前页面下拉刷新
      wx.showToast({
        title: err,
        icon:'none'
      })
    })
  },
  showCustomes(e){
    if(!this.toMine())return;
     wx.navigateTo({
       url: '../customerList/customerList',
     })
  },
  schedulePlan(e){
    if(!this.toMine())return;
    wx.navigateTo({
      url: '../memberschedule/memberschedule',
    })
  },
  signIn(e){
    if(!this.toMine())return;
    wx.navigateTo({
      url: '../siginInList/siginInList',
    })
    
  },
  toMine(){
    if(!app.globalData.isAuthoried){
      wx.switchTab({
        url: '../mine/mine',
      })
      return false
    }
    return true
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
     this.data.customerlist = []
     this.getCustomerlist()
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