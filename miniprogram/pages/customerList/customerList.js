// pages/home/home.js

const MAX_LIMIT = 15
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customerlist:[]
  },
  toAddUser(){
    wx.navigateTo({
      url: '../addCustomer/addCustomer',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
        customerlist:this.data.customerlist.concat(res.result)//在当前数据的基础上拼接
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()//停止当前页面下拉刷新
    }).catch(err=>{
      wx.hideLoading()
      wx.stopPullDownRefresh()//停止当前页面下拉刷新
      console.log(err)
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

  },
  itemClick(e){
  var customer = this.data.customerlist[e.currentTarget.dataset.idx]
  let item = JSON.stringify(customer)
  wx.navigateTo({
     url: '../../pages/modifyNickName/modifyNickName?customer=' + encodeURIComponent(item),
  })
   return

    console.log(e);
    var pages = getCurrentPages();var currPage = pages[pages.length - 1]; //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({ 
      customer: this.data.customerlist[e.currentTarget.dataset.idx]
    },()=>{
       wx.navigateBack({
         delta: 0,
       })
    })

  }
})