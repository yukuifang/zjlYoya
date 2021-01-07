// pages/start/start.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
     isLauchPage:true
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
    this.userAuthoried()
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
  toHome(){
    const url = '../../pages/home/home'
    wx.switchTab({
      url
    })
  },
  teacherClick(){
    wx.setStorage({
      data: 1,
      key: 'is_teacher',
    })
    app.globalData.is_teacher = 1
    this.toHome()

    
  },
  studentClick(){
    wx.setStorage({
      data: 0,
      key: 'is_teacher',
    })
    app.globalData.is_teacher = 0
    this.toHome()
  },
  userAuthoried(){
    var that = this
    var a = new Promise(function(resolve, reject){
      wx.getStorage({
        key: 'is_login',
        success:res=>{
           app.globalData.isLogin = (res.data == undefined?false:res.data)
           resolve()
        },
        fail:err=>{
          resolve()
        }
      })
    })
    var b = new Promise(function(resolve, reject){
      wx.getSetting({
        success:res=>{
          var isAuthoried = res.authSetting['scope.userInfo']
          app.globalData.isAuthoried = (isAuthoried == undefined ? false:isAuthoried)
          resolve()
        },
        fail:err=>{
          resolve()
        }
      })
    })
    var c = new Promise(function(resolve, reject){
      wx.getStorage({ //获取本地缓存
        key:"is_teacher",
        success:res =>{
          app.globalData.isTeacher = (res.data == undefined?false:res.data)
          resolve()
        },
        fail:err=>{
          resolve()

        }
      })
    })

    Promise.all([a, b,c]).then((result) => {
      console.log('123')
      console.log(app.globalData.isTeacher)
      if(app.globalData.isTeacher != undefined){
        that.toHome2()
      } else{
        that.toStart2()
      }           
    }).catch(err=>{
      if(app.globalData.isTeacher != undefined){
        that.toHome2()
      } else{
        that.toStart2()
      } 

    }).finally(()=>{
      // wx.showToast({
      //   title: 'finally',
      // })

      console.log('finally')
      console.log(app.globalData)
      if(app.globalData.isTeacher != undefined){
        that.toHome2()
      } else{
        that.toStart2()
      }
    })

    



  
},
toHome2(){
  console.log('home')
  setTimeout(function(){
     const url = '../../pages/home/home'
      wx.switchTab({
        url
      })
  },1000)
 
},
toStart2(){
 console.log("tostart")
 setTimeout(()=>{
  this.setData({
    isLauchPage:(app.globalData.isTeacher == undefined ? false:true)
  })
 },1000)
  
},
})