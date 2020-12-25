import util from '../../util/util'
const db = wx.cloud.database()
var dateJson;
var edit_customer_id = ''
Page({

  /**
   * 页面的初始数据
   */
 
  data: {
     beginDate:'',
     endDate:'',
     customer:'',
     isRepetition:false,
     isEdit:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    dateJson = JSON.parse(options.dateJson)
    const undecode_customer = options.customer
    const beginDate = options.show_worktime_begin
    const endDate = options.show_worktime_end
    this.setData({
      isEdit:false
    })
    if(undecode_customer!=undefined && beginDate.length >0 && endDate.length > 0){
      const customer =  JSON.parse(decodeURIComponent(undecode_customer))
      this.setData({
        isEdit:true
      })
      edit_customer_id = customer._id
       this.setData({
           customer,
           beginDate,
           endDate
      })
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
  selectCustomer(e){
      wx.navigateTo({
        url: '../customerList/customerList',
      })
  },
  changeBeginTime(e){
    //改变时间
    var time = e.detail.value;
    console.log("当前选择时间"+time);
    this.setData({
      beginDate:time
    })
  },
  changeEndTime(e){
    var time = e.detail.value;
    console.log("当前选择时间"+time);
    this.setData({
      endDate:time
    })
  },
  addSchedule(e){
    if(this.data.customer.name == undefined){
      wx.showToast({
        title: '请选择预约会员',
        icon:'none'
      })
      return;
    }
    console.log('hhhh')
    console.log(this.data.date)
    if(this.data.beginDate == undefined || this.data.beginDate.length == 0){
      wx.showToast({
        title: '请选择开始预约时间',
        icon:'none'
      })
      return;
    }
    if(this.data.endDate == undefined || this.data.endDate.length == 0){
      wx.showToast({
        title: '请选择结束预约时间',
        icon:'none'
      })
      return;
    }
    const {year,month,date}= dateJson
    const workdate = year + '-' + month + '-' + date
    const worktime_begin = workdate + ' ' +  this.data.beginDate 
    const worktime_end =  workdate + ' ' +  this.data.endDate
    wx.showLoading({
      title: '预约中..',
      mask:true
    })
    
    console.log(workdate)
    console.log(edit_customer_id)
    wx.cloud.callFunction({
      name: 'schedule',// 云函数的名称
      data: {
        workdate,
        worktime_begin,
        worktime_end,
        name:this.data.customer.name,
        customer_id:this.data.customer._id,
        customer_openid : (this.data.customer.is_from_wx ? this.data.customer._openid:''),
        edit_customer_id,
        $url: this.data.isEdit?'editCurrentSchedule':'updateSchedule'
      }//参数
    }).then(res=>{
       console.log(res)
       wx.hideLoading()
       wx.showToast({
       title: '提交成功',
       icon:'none'
      }).catch(err=>{
        console.log(err)
      })


      if(this.data.isRepetition){
        this.addRepeat()
      }

     var pages = getCurrentPages();
     var currPage = pages[pages.length - 1];   //当前页面
     var prevPage = pages[pages.length - 2];  //上一个页面
     prevPage.getCurrentSchedule()
      wx.navigateBack({
        delta: 0,
      })
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
      wx.showToast({
       title: err,
       icon:'none'
     })
    })

  
  },
  postAddSchedule(){
    wx.cloud.callFunction({
      name: 'schedule',// 云函数的名称
      data: {
        workdate,
        worktime_begin,
        worktime_end,
        name:this.data.customer.name,
        customer_id:this.data.customer._id,
        customer_openid : (this.data.customer.is_from_wx ? this.data.customer._openid:''),
        edit_customer_id,
        $url: this.data.isEdit?'editCurrentSchedule':'updateSchedule'
      }//参数
    }).then(res=>{
       console.log(res)
       wx.hideLoading()
       wx.showToast({
       title: '提交成功',
       icon:'none'
      }).catch(err=>{
        console.log(err)
      })


      if(this.data.isRepetition){
        this.addRepeat()
      }

     var pages = getCurrentPages();
     var currPage = pages[pages.length - 1];   //当前页面
     var prevPage = pages[pages.length - 2];  //上一个页面
     prevPage.getCurrentSchedule()
      wx.navigateBack({
        delta: 0,
      })
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
      wx.showToast({
       title: err,
       icon:'none'
     })
    })


  },
  changeSwitch(e){
    this.data.isRepetition =  !this.data.isRepetition 
  },
  addRepeat(){
    
    const {year,month,date,week}= dateJson
    console.log(week)
    const record_date = year + '-' + month + '-' + date
    const worktime_begin = record_date + ' ' +  this.data.beginDate 
    const worktime_end =  record_date + ' ' +  this.data.endDate
    wx.cloud.callFunction({
      name: 'weekrepeat',// 云函数的名称
      data: {
        worktime_begin,
        worktime_end,
        name:this.data.customer.name,
        customer_id:this.data.customer._id,
        customer_openid : (this.data.customer.is_from_wx ? this.data.customer._openid:''),
        week,
        $url: 'recordRepeat'
      }//参数
    }).then(res=>{
       console.log(res)
    }).catch(err=>{
      console.log(err)
    })
  }


})