
// pages/home/home.js
import {dateToYYMMDD} from '../../util/util'
const app = getApp()

const MAX_LIMIT = 15
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customerlist:[],
    isTeacher:'',
    config:'',
    sendMessageSwitch:true
    
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
    // this.chooseImage()
    // this.sendCustomerMessage()
    this.getSendMessageDate()
    this.getConfig()
    // this.getlogin()
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
       url: '../customerList/customerList?isSelete=0',
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
  s_lookRecord(){
    if(!this.toMine())return;
    this.askCutomerToOpenMessagePush()
    wx.navigateTo({
      url: '../../pages/studyRecord/studyRecord',
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
      app.globalData.serverDate = res.result.serverDate
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
             console.log('订阅通知已经授权')
          }else{
             this.requestSubscribeMessage()
             console.log('订阅通知没有授权1')
          }
        }else{
          this.requestSubscribeMessage()
          console.log('订阅通知没有授权2')
        }
      },fail:res=>{
        console.log(res)
        this.requestSubscribeMessage()
        console.log('订阅通知没有授权3')
      }
    })
   

   },
  requestSubscribeMessage(){
    if(!this.data.sendMessageSwitch){
      return;
    }
    var tmpl_id = "UgxSFEgfxASQgj6E1IW_vLyQu07aasNidkbeQqHq-Ig"
    wx.requestSubscribeMessage({
      tmplIds: [tmpl_id],
      success:res=> { 
        console.log('授权成功', res)
        this.data.sendMessageSwitch = false
      },fail:res=>{
        console.log('授权失败', res)
        this.data.sendMessageSwitch = true
      }
    })
   },

   getSendMessageDate(){
    var currentDate =  dateToYYMMDD(new Date())
    wx.getStorage({
      key: 'sendMessageDate',
      success:res=>{
         var localDate = res.data
         if(currentDate!=localDate){
           this.data.sendMessageSwitch = true
           wx.setStorage({
            data: currentDate,
            key: 'key',
           })
         }else{
          this.data.sendMessageSwitch = false
         }
      },
      fail:err=>{
        this.data.sendMessageSwitch = true
        wx.setStorage({
           data: currentDate,
           key: 'key',
        })
      }
      
    })
   },
   chooseImage(){
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
        console.log('88666555')
        console.log(res.tempFilePaths[0])
        that.uploadPicture(res.tempFilePaths[0])
        // that.setData({
        //   avatarUrl: res.tempFilePaths[0]
        // });
        // console.log(that.data.avatarUrl);
      }
    })
  },
  uploadPicture(avatarUrl){
    var that = this
    let suffix = /\.\w+$/.exec(avatarUrl)[0]
    wx.cloud.uploadFile({
      cloudPath: 'pictureorc/' + 'pic' + suffix,
      filePath:avatarUrl,
      success:(res)=>{
         console.log(res.fileID)
         that.getTmpUrl(res.fileID)
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

  },
  getTmpUrl(fileID){
    var that = this
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
       console.log(res.fileList[0].tempFileURL)
       that.printedText(res.fileList[0].tempFileURL)

      },
      fail: console.error
    })

  },


   printedText(tempFileURL){
    var that = this
    wx.cloud.callFunction({
      name:"pictureocr",
      data:{
        type:"photo",
        imgUrl: encodeURI(tempFileURL)
      },
      success:function(res){
        console.log(res)
        that.getSchedule(res.result.items)
      },
      fail:function(e){
        console.log(e)
      }
    })
  },
  getSchedule(items){
    console.log(items)
    var hans = ['1','2','3','4','5','6','7','8','9','10','11','12']
    var nums1 = ['01','02','03','04','05','06','07','08','09','10','11','12']
    var nums2 =['13','14','15','16','17','18','19','20','21','22','23','24']
    var newItems = []
     for(var i = 0; i < items.length-2; i++){
       var time1 = items[i].text
       var name = items[i + 1].text
       var time2 = items[i + 2].text


       if((time1.indexOf('上午') != -1 || time1.indexOf('下午') != -1 || time1.indexOf('正午') != -1) && (time2.indexOf('上午') != -1 || time2.indexOf('下午') != -1 || time2.indexOf('正午') != -1) &&(name.indexOf('上午') == -1 && name.indexOf('下午') == -1 && name.indexOf('正午') == -1)){
        time1 = time1.replace(/\s*/g,"")
        time1 = time1.replace("-","")
        time1 = time1.replace("时","")

        time2 = time2.replace(/\s*/g,"")
        time2 = time2.replace("-","")
        time2 = time2.replace("时","")

        name = name.replace(/\s*/g,"")

        console.log(name + time1 + time2)

        if(time1.indexOf('上午') != -1){
          time1 = time1.replace("上午","")
          time1 =  time1.split(":")[0]
          time1 = nums1[hans.indexOf(time1)]
        }else if(time1.indexOf('下午') != -1){
          time1 = time1.replace("下午","")
          time1 =  time1.split(":")[0]
          time1 = nums2[hans.indexOf(time1)]
        }else if(time1.indexOf('正午') != -1){
          time1 = '12'
        }

        if(time2.indexOf('上午') != -1){
          time2 = time2.replace("上午","")
          time2 =  time2.split(":")[0]
          time2 = nums1[hans.indexOf(time2)]
        }else if(time2.indexOf('下午') != -1){
          time2 = time2.replace("下午","")
          time2 =  time2.split(":")[0]
          time2 = nums2[hans.indexOf(time2)]
        }else if(time2.indexOf('正午') != -1){
          time2 = '12'
        }

        time1 = time1 + ':00'
        time2 = time2 + ':00'

       
        


       
       



        



 
        newItems.push(name + time1 + time2)
       }
     }
     console.log(newItems)





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