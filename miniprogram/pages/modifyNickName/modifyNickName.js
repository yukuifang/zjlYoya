// pages/modifyNickName/modifyNickName.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
     nickName:'',
     customer:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const undecode_customer = options.customer
    if(undecode_customer!=undefined ){
      this.data.customer =  JSON.parse(decodeURIComponent(undecode_customer))
    }


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

  },
  inputClick(e){
    this.data.nickName = e.detail.value
     console.log(e.detail.value)
  },
  submitClick(){
    if(this.data.nickName.length ==0){
      wx.showToast({
        title: '请输入姓名',
        icon:'none'
      })
      return
    }
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
     name:'customer',
     data:{
       customer:this.data.customer,
       nickName:this.data.nickName,
       $url:'modifyNickName'
     },
     
   }).then(res=>{
      console.log(res)
      wx.hideLoading()
      wx.showToast({
        title: '修改成功',
      })
      wx.navigateBack({
        delta: 0,
      })

   }).catch(err=>{
     console.log(err)
     wx.hideLoading()
   })
   
    
  }
})