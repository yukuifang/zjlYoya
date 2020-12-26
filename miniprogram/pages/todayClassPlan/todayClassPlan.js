

// pages/todayClassPlan/todayClassPlan.js
const app  = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customer:null,
    lessions:[]
     
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      wx.getStorage({
        key: 'userInfo',
        success:res=>{
          console.log(res)
        }
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
     if(this.data.customer!=undefined){
      this.getJMClassPlan()
     }
     

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
  selectTeacher(){
     wx.navigateTo({
       url: '../../pages/teacherList/teacherList',
     })
  },
  getJMClassPlan(){
    console.log('getJMClassPlan')
    console.log(this.data.customer)
    const teacher_openid = this.data.customer._openid
    wx.cloud.callFunction({
      name: 'schedule',// 云函数的名称
      data: {
        teacher_openid,
        $url: 'getJMClassPlan'
      }//参数
    }).then(res=>{
       console.log(res)
       this.setData({
         lessions:res.result
       })
       console.log(res)
    }).catch(err=>{
      console.log(err)
    })
    
  }
})