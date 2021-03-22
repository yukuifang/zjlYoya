// pages/addCustomer/addCustomer.js
const db = wx.cloud.database()
var customer = {};
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
     birdthDate:'',
     avatarUrl:'',
     
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
  submit(e) {
    var that = this;
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    customer = e.detail.value
    if(customer.name.length == 0){
      wx.showToast({
        title: '请输入姓名',
        icon:'none'
      })
      return;
    }
    console.log(this.data.avatarUrl)
    if(this.data.avatarUrl.length > 0)
    {
      wx.showLoading({
        title: '提交中',
        mask:true
      })
      let suffix = /\.\w+$/.exec(this.data.avatarUrl)[0]
      wx.cloud.uploadFile({
        cloudPath: 'avatar/' + customer.name + suffix,
        filePath:that.data.avatarUrl,
        success:(res)=>{
           console.log(res)
           customer["avatar"] =  res.fileID
           that.uploadUser()
           wx.hideLoading()
        },
        fail: (err) => {
          console.log(err)
          wx.showToast({
            title: err,
            icon:'none'
          })
          wx.hideLoading()
        }
      })
    }else{
       that.uploadUser()
    }
    

  },

  uploadUser(){
    console.log(customer)
    customer.is_teacher = 0
    customer.is_from_wx = false
     wx.showLoading({
       title: '提交中',
       mask:true
     })
    //  db.collection('customer').add({
    //    data:customer
    //  }).then(res=>{
    //    wx.hideLoading()
    //    wx.showToast({
    //     title: '提交成功',
    //     icon:'none'
    //   })

    wx.cloud.callFunction({
      name: 'customer',// 云函数的名称
      data: {
        customer,
        $url: 'addCustomerByMySelf'
      }//参数
    }).then(res=>{
       console.log(res)
       wx.hideLoading()
       wx.showToast({
       title: res.result,
       icon:'none'
      }).catch(err=>{
        console.log(err)
      })
      if(res.result == '手动新增用户成功'){
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面
        prevPage.onPullDownRefresh()
        wx.navigateBack({
           delta: 0,
        })
      }

      app.globalData.customerlist = undefined
    

     

     }).catch(err=>{
      wx.hideLoading()
      wx.showToast({
        title: err,
        icon:'none'
      })
     })
  },

  bindDateChange(e){
    this.setData({
      birdthDate:e.detail.value
    })
  },
  chooseImage(e){
    let that = this;
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#CED63A",
      success: function(res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            that.chooseWxImage('album');
          } else if (res.tapIndex == 1) {
            that.chooseWxImage('camera');
          }
        }
      }
    })
  },
  /*打开相册、相机 */
  chooseWxImage(type) {
    let that = this;
    wx.chooseImage({
      count: that.data.countIndex,
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: function(res) {
        // 选择图片后的完成确认操作
        that.setData({
          avatarUrl: res.tempFilePaths[0]
        });
        console.log(that.data.avatarUrl);
      }
    })
  }
})