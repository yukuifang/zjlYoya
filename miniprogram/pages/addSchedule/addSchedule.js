const db = wx.cloud.database()
var dateJson;
Page({

  /**
   * 页面的初始数据
   */
 
  data: {
     date:'',
     customer:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    dateJson = JSON.parse(options.dateJson)
    
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
  selectCustomer(e){
      wx.navigateTo({
        url: '../customerList/customerList',
      })
  },
  changeTime(e){
    //改变时间
    var time = e.detail.value;
    console.log("当前选择时间"+time);
    this.setData({
      date:time
    })
  },
  addSchedule(e){
    // console.log(this.data.customer == undefined)
    if(this.data.customer.name == undefined){
      wx.showToast({
        title: '请选择预约会员',
        icon:'none'
      })
      return;
    }
    
    if(this.data.date == undefined){
      wx.showToast({
        title: '请选择预约时间',
        icon:'none'
      })
      return;
    }
    const {year,month,date}= dateJson
    const workdate = year + '-' + month + '-' + date
    const worktime = this.data.date 
    wx.showLoading({
      title: '预约中..',
      mask:true
    })
    
    console.log(workdate)
    wx.cloud.callFunction({
      name: 'schedule',// 云函数的名称
      data: {
        workdate,
        worktime,
        customer_id:this.data.customer._id,
        $url:'updateSchedule'
      }//参数
    }).then(res=>{
       console.log(res)
    }).catch(err=>{
      console.log('err')
      console.log(err)
    })

    return;


    db.collection('schedule').add({
      data:{
        workdate,
        lessions:[
          
        ]
      }
    }).then(res=>{
      wx.hideLoading()
      wx.showToast({
       title: '提交成功',
      })

      wx.navigateBack({
        delta: 0,
      })
    }).catch(err=>{
     wx.hideLoading()
     wx.showToast({
       title: err,
     })
    })

  }
})