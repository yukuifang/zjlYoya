// pages/home/home.js

const MAX_LIMIT = 15
var dateJson
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    message:'',
    selected_customer:undefined,
    selected_time1:'',
    selected_time2:'',
    customerlist:[],
    times:["07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00","22:30"]
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
    dateJson = JSON.parse(options.dateJson)
    console.log(options)
     this.getCustomerlist()
  },
  getCustomerlist(){
    
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'customer',// 云函数的名称
      data: {
        $url:'getAllCustomer'
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
  if(this.data.selected_customer!=undefined){
    this.data.selected_customer.isSeleted= false
  }  
  
  var customer = this.data.customerlist[e.currentTarget.dataset.idx]
  customer.isSeleted = true
  this.data.selected_customer = customer
  this.setData({
    customerlist:this.data.customerlist
  })
  this.write()
  
  },
  timeClick(e){
   
    var time = this.data.times[e.currentTarget.dataset.idx]
    if(this.data.selected_time1!=''){
      if(time == this.data.selected_time1){
        this.data.selected_time1 = ''
        this.setData({
          times:this.data.times,
          selected_time1:this.data.selected_time1,
          selected_time2:this.data.selected_time2,
        })
        console.log(time,this.data.selected_time1,this.data.selected_time2)
        this.write()
        return;
      }
    }  
    if(this.data.selected_time2!=''){
      if(time == this.data.selected_time2){
        this.data.selected_time2 = ''
        this.setData({
          times:this.data.times,
          selected_time1:this.data.selected_time1,
          selected_time2:this.data.selected_time2,
        })
        console.log(time,this.data.selected_time1,this.data.selected_time2)
        this.write()
        return;
      }
    } 
    if(this.data.selected_time1==''){
        this.data.selected_time1 = time
    }else if(this.data.selected_time2==''){
      this.data.selected_time2 = time
    }else{
      return;
    }
    this.setData({
      times:this.data.times,
      selected_time1:this.data.selected_time1,
      selected_time2:this.data.selected_time2,
    })
    this.write()
    console.log(time,this.data.selected_time1,this.data.selected_time2)
    
    },
    write(){
      this.data.message = ''
      if(this.data.selected_customer!=undefined){
         this.data.message += this.data.selected_customer.name + '-'
      }

      if(this.data.selected_time1.length>0){
        this.data.message +=  this.data.selected_time1 + '-'
      }
      if(this.data.selected_time2.length>0){
        this.data.message +=  this.data.selected_time2 
      }

      this.setData({
        message:this.data.message
      })

    },
    inputClick(e){
      this.data.message = e.detail.value 
    },
    reverseClick(){
      var messages =this.data.message.split('-')
      if(messages.length == 3 && messages[2].length>0){
          this.postReserve(messages[1],messages[2])
      }else{
        wx.showToast({
          title: '请选择姓名和时间',
          icon:'none'
        })
        return;
      }

    },
    postReserve(beginDate,endDate){
      if(this.data.selected_customer == undefined){
        wx.showToast({
          title: '请选择姓名',
          icon:'none'
        })
        return;
      } 
    const {year,month,date}= dateJson
    const workdate = year + '-' + month + '-' + date
    const worktime_begin = workdate + ' ' +  beginDate 
    const worktime_end =  workdate + ' ' +  endDate
    wx.showLoading({
      title: '预约中..',
      mask:true
    })
    console.log(workdate)
    wx.cloud.callFunction({
      name: 'schedule',// 云函数的名称
      data: {
        workdate,
        teacher_name:app.globalData.userInfo.nickName,
        worktime_begin,
        worktime_end,
        name:this.data.selected_customer.name,
        customer_id:this.data.selected_customer._id,
        customer_openid : (this.data.selected_customer.is_from_wx ? this.data.selected_customer._openid:''),
        $url: 'updateSchedule'
      }//参数
    }).then(res=>{
       console.log(res)
       wx.hideLoading()
       wx.showToast({
       title: '提交成功',
       icon:'none'
       })
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面
        prevPage.getCurrentSchedule()
        wx.navigateBack({
          delta: 0,
        })
        
    }).catch(err=>{
      console.log(err)
    })
    

    }
})