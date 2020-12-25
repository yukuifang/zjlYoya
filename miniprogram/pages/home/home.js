// pages/home/home.js
const app = getApp()

const MAX_LIMIT = 15
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customerlist:[],
    isTeacher:'',
    config:''
    
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
    this.getConfig()
    this.getlogin()
     wx.getStorage({
       key: 'is_teacher',
       success:res=>{
         this.setData({
          isTeacher:res.data
         })
       }
     })
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
    // this.askCutomerToOpenMessagePush()
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
  s_bookClick(){
    if(!this.toMine())return;
    this.askCutomerToOpenMessagePush()
    wx.navigateTo({
      url: '../../pages/todayClassPlan/todayClassPlan',
    })

  },
  getConfig(){
    wx.cloud.callFunction({
      name: 'config',// 云函数的名称
      data: {
        $url:'config_one'
      }//参数
    }).then((res) => {
      console.log(res)
      this.setData({
        config:res.result
      })
      wx.hideLoading()

    }).catch(err=>{
      wx.hideLoading()
      console.log(err)
    })
  },
  getlogin(){
    wx.cloud.callFunction({
      name: 'login',// 云函数的名称
      
    }).then((res) => {
      console.log(res)
    }).catch(err=>{
       console.log(err)
    })
  },
  sendCustomerMessage(){
    wx.cloud.callFunction({
      name: 'autosendmessage',// 云函数的名称
      
    }).then((res) => {
      console.log(res)
    }).catch(err=>{
      console.log(err)
     
    })
   },
   askCutomerToOpenMessagePush(){
    var tmpl_id = "UgxSFEgfxASQgj6E1IW_vLyQu07aasNidkbeQqHq-Ig"
    wx.getSetting({
      withSubscriptions: true,
      success:res => {
        var itemSettings = res.subscriptionsSetting.itemSettings
        if (itemSettings) {
          console.log(itemSettings)
          if (itemSettings[tmpl_id] === 'accept') {
             console.log('is accredit：ok')
          }else{
             this.requestSubscribeMessage()
          }
        }else{
          this.requestSubscribeMessage()
        }
      },fail:res=>{
        console.log(res)
        this.requestSubscribeMessage()
      }
    })
   

   },
  requestSubscribeMessage(){
    var tmpl_id = "UgxSFEgfxASQgj6E1IW_vLyQu07aasNidkbeQqHq-Ig"
    wx.requestSubscribeMessage({
      tmplIds: [tmpl_id],
      success:res=> { 
        console.log('授权成功', res)
      },fail:res=>{
        console.log('授权失败', res)
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