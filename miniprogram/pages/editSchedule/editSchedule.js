// pages/editSchedule/editSchedule.js
import {dateToYYMMDD} from '../../util/util'
const app = getApp()

//引入插件：微信同声传译
const plugin = requirePlugin('WechatSI')
//获取全局唯一的语音识别管理器recordRecoManager
const manager = plugin.getRecordRecognitionManager()

var dateJson;
var  daySchedule_tomorrow = []
var  customers_tomorrow = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
     daySchedule:[],
     customers:[],
     copystr:'',
     isShowCopy:false,
     recordState: false, //录音状态
     content:'',//内容
     showModal: false,
     showModal2: false,
     pinyin_customer:'',
     orcs:[],
     orc_customers:[]


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    dateJson = JSON.parse(options.dateJson)
    this.getCurrentSchedule()
    this.getTomorrowSchedule()


    const{ year,month,date } = dateJson
    var workdate = new Date(year + '-' + month + '-' + date)
    var currentDate = new Date()
    if(workdate.getTime() > currentDate.getTime()){
      this.setData({
        isShowCopy:true
      })
    }else
    {
      this.setData({
        isShowCopy:false
      })

    }

     //识别语音
     this.initRecord()

    //  var a = '防御奎，下午八点半到10点半。'
     

    //  this.setData({
    //   content:a
    // })
    // this.showDialogBtn()
  





    

  },
  onShow: function () {
    
  },
  //识别语音 -- 初始化
  initRecord: function () {
    const that = this;
    // 有新的识别内容返回，则会调用此事件
    manager.onRecognize = function (res) {
      console.log(res)
    }
    // 正常开始录音识别时会调用此事件
    manager.onStart = function (res) {
      console.log("成功开始录音识别", res)
    }
    // 识别错误事件
    manager.onError = function (res) {
      console.error("error msg", res)
    }
    //识别结束事件
    manager.onStop = function (res) {
      console.log('..............结束录音')
      console.log('录音临时文件地址 -->' + res.tempFilePath); 
      console.log('录音总时长 -->' + res.duration + 'ms'); 
      console.log('文件大小 --> ' + res.fileSize + 'B');
      console.log('语音内容 --> ' + res.result);
      if (res.result == '') {
        wx.showModal({
          title: '提示',
          content: '听不清楚，请重新说一遍！',
          showCancel: false,
          success: function (res) {}
        })
        return;
      }
      var text = res.result;
     
      that.setData({
        content:text
      })
      that.showDialogBtn()
    }
  },
  //语音  --按住说话
  touchStart: function (e) {
  
    this.setData({
      recordState: true  //录音状态
    })
    // 语音开始识别
    manager.start({
      lang: 'zh_CN',// 识别的语言，目前支持zh_CN en_US zh_HK sichuanhua
    })
  },
  //语音  --松开结束
  touchEnd: function (e) {
    this.setData({
      recordState: false
    })
    // 语音结束识别
    manager.stop();
  },

  dealRecodeText(tmp){
    var that = this
    var hans = ['一','二','三','四','五','六','七','八','九','十','十一','十二']
    var hans2 = ['1','2','3','4','5','6','7','8','9','10','11','12']
    var nums = ['01','02','03','04','05','06','07','08','09','10','11','12']
    var nums2 =['13','14','15','16','17','18','19','20','21','22','23','24']
    var  text = tmp.replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\，|\<|\。|\>|\/|\?]/g,"") 
     var d = ''
     if(text.indexOf("上午") != -1){
        d = '上午';
     }else if(text.indexOf("下午") != -1){
        d = '下午';
     }
     
     if(d.length == 0){
      wx.showToast({
        title: '语音格式不对',
        icon:'none'
      })
       return;
     }
     if(text.indexOf("到") == -1){
      wx.showToast({
        title: '语音格式不对',
        icon:'none'
      })
        return;
     }

     var [name,text1]  =   [...text.split(d)]

     name = name.split(',')[0]

     var [begin,end] = [...text1.split('到')]

     console.log(begin,end)

     var [b1,b2] =  [...begin.split('点')]
     var idx1 = hans.indexOf(b1)
     if(idx1 == -1){
       idx1 = hans2.indexOf(b1)
     }
     if(idx1 == -1){
      wx.showToast({
        title: '语音格式不对',
        icon:'none'
      })
      return
     }
     
     var b3 = (d == '下午' ? nums2[idx1] : nums[idx1])
     if(b2 == ''){
       b3 += ':00'
     }else if(b2 == '半'){
       b3 += ':30'
     }else{
      wx.showToast({
        title: '语音格式不对',
        icon:'none'
      })
      return
     }


     var [e1,e2] =  [...end.split('点')]
     var idx2 = hans.indexOf(e1)
     if(idx2 == -1){
      idx2 = hans2.indexOf(e1)
    }
     if(idx2 == -1){
      wx.showToast({
        title: '语音格式不对',
        icon:'none'
      })
        return
     }
     var e3 = (d == '下午' ? nums2[idx2] : nums[idx2])
     if(e2 == ''){
       e3  += ':00'
     }else if(e2 == '半'){
       e3  += ':30'
     }else{
      wx.showToast({
        title: '语音格式不对',
        icon:'none'
      })
       return
     }
    console.log(name,b3,e3)

    wx.showLoading({
      title: '加载中..',
    })
     wx.cloud.callFunction({
      name:'customer',
      data:{
        name,
        $url:'getMyCustomerByName'
      },
    }).then(res=>{
       console.log(res)
       if(res.result!= undefined){
         that.data.pinyin_customer= res.result
         that.postaddSchedule(b3,e3)
        
       }else{
         wx.showToast({
           title: '您没有该会员,去创建吧',
           icon:'none'
         })
       }
       wx.hideLoading()
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })

     







     

     






     



























  },


  getTomorrowSchedule(){
    const{ year,month,date } = dateJson
    var workdate = year + '-' + month + '-' + date
    var day = new Date(workdate)
    day.setTime(day.getTime()+24*60*60*1000)
    workdate = dateToYYMMDD(day)
    wx.showLoading({
      title: '加载中..',
    })
    wx.cloud.callFunction({
      name:'schedule',
      data:{
        workdate,
        $url:'getScheduleAndCustomerByDate'
      },
    }).then(res=>{
       daySchedule_tomorrow = res.result[0]
       customers_tomorrow = res.result[1]
       console.log(res)
       wx.hideLoading()
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })
    
  },
  getCurrentSchedule(){
    const{ year,month,date } = dateJson
    var workdate = year + '-' + month + '-' + date
    wx.showLoading({
      title: '加载中..',
    })
    wx.cloud.callFunction({
      name:'schedule',
      data:{
        workdate,
        $url:'getScheduleAndCustomerByDate'
      },
    }).then(res=>{
      console.log(res)
       this.setData({
        daySchedule:res.result[0],
        customers:res.result[1]
       })
       wx.hideLoading()
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })
    
  },
  addSchedule(){
  //  wx.navigateTo({
  //     url: '../addSchedule/addSchedule?dateJson=' + JSON.stringify(dateJson),
  //   })
  wx.navigateTo({
    url: '../customers/customers?dateJson=' + JSON.stringify(dateJson),
  })
  
  },
  itemClick(e){
    const idx = e.currentTarget.dataset.idx
    const customer =  this.data.customers[idx]
    const {show_worktime_begin,show_worktime_end,is_sigin_in} = this.data.daySchedule[idx]
    if(is_sigin_in!=undefined && is_sigin_in == true){
       return;
    }
    console.log(customer._id)
    let item = JSON.stringify(customer)
    wx.navigateTo({
      url: '../addSchedule/addSchedule?dateJson=' + JSON.stringify(dateJson) + '&customer=' + encodeURIComponent(item) + '&show_worktime_begin=' + show_worktime_begin + '&show_worktime_end=' + show_worktime_end,
    })
  },
  delecteClick(e){
    const idx = e.currentTarget.dataset.idx
    const {customer_id} = this.data.daySchedule[idx]
    const{ year,month,date } = dateJson
    const workdate = year + '-' + month + '-' + date

    console.log(customer_id)
    console.log(workdate)
    wx.cloud.callFunction({
      name:'schedule',
      data:{
        workdate,
        customer_id,
        $url:'deleteCurrentSchedule'
      },
      
    }).then(res=>{
       console.log(res)
       wx.hideLoading()
       this.getCurrentSchedule()
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })

  },
  dayPlanClick(e){
     this.data.copystr = '今日课程:\n明日课程:\n'
     for (let index = 0; index < customers_tomorrow.length; index++) {
       const element = customers_tomorrow[index]
       this.data.copystr +=( daySchedule_tomorrow[index].show_worktime_begin + '.' + element.name  + '\n')
     }
     this.data.copystr += ('本月目标:\n今日完成:\n累计完成:\n')

     console.log(this.data.copystr)
     this.copyFileUrl(this.data.copystr)
     
  },
  copyFileUrl(copyStr) {
    wx.setClipboardData({
      data: copyStr,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log("复制成功",res.data) // data
            wx.showToast({
              title: '复制成功',
            })
          }
        })
      }
    })
  },
  yinyongClick(){
    const{ year,month,date,week } = dateJson
    var w = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
    var that = this
    wx.showModal({
      title:'复制模版',
      content:'复制上周' + w[week] + '的模版',
      success:function(res){
         if(res.confirm){
           console.log('点击了确认')
           that.toYinyong()
         }

      }
    })
  },
  toYinyong(){
    const{ year,month,date,week} = dateJson
    const workdate = year + '-' + month + '-' + date

    var copyDate = new Date(workdate)
    var dlt = 7 
     copyDate.setTime(copyDate.getTime() - dlt * 24*60*60*1000)
     copyDate  =  dateToYYMMDD(copyDate)
     console.log(copyDate)

     wx.showLoading({
       title: '加载中',
     })
     wx.cloud.callFunction({
      name:'schedule',
      data:{
        workdate,
        copyWorkdate:copyDate,
        $url:'copyScheduleByDate'
      },
      
    }).then(res=>{
       console.log(res)
       this.getCurrentSchedule()
       wx.hideLoading()
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })
    
  },
   /**
   * 弹窗
   */
  showDialogBtn: function () {
    this.setData({
      showModal: true
    })
  },
  showDialogBtn2: function () {
    this.setData({
      showModal2: true
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false,
      showModal2: false,
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    this.hideModal();
    this.dealRecodeText(this.data.content)
  },
  onConfirm2: function () {
    this.hideModal();
    this.getCustomersByNames()
    
    
  },
  getCustomersByNames(){

    var orcs = []
    var names = []
    var contents = this.data.content.split('\n')


    for(var i = 0 ;i < contents.length;i++){
      var c = contents[i]
      var a = c.split('-')
      orcs.push({
        name:a[0],
        beginDate:a[1],
        endDate:a[2]
      })
      names.push(a[0])
    }

    this.data.orcs = orcs

   

    // var names = []
    // for(var i = 0 ;i < this.data.orcs.length;i++){
    //     names.push(this.data.orcs[i].name)
    // }
    wx.showLoading({
      title: '加载中..',
    })
     wx.cloud.callFunction({
      name:'customer',
      data:{
        names,
        $url:'getMyCustomersByNames'
      },
    }).then(res=>{
      wx.hideLoading()
      if(res.result.code == 1){
        
        wx.showToast({
          title: res.result.message,
          duration:4000,
          icon:'none'
        })
        
      }else{
        this.data.orc_customers = res.result.result
        this.postAddSchedules()
      }
      console.log(res.result)
      
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })

  },

  postAddSchedules(){
    var that  = this
    wx.showLoading({
      title: '预约中..',
      mask:true
    })
    const {year,month,date}= dateJson
    const workdate = year + '-' + month + '-' + date
    var schedules = []
    for(var i = 0 ;i < this.data.orc_customers.length;i++){
      var c = this.data.orc_customers[i]
      var o = this.data.orcs[i]
      var s = {
        workdate,
        teacher_name:app.globalData.userInfo.nickName,
        worktime_begin:(workdate + ' ' +  o.beginDate) ,
        worktime_end:(workdate + ' ' +  o.endDate) ,
        name:c.name,
        customer_id:c._id,
        customer_openid : (c.is_from_wx ? c._openid:''),
      }
      schedules.push(s)
    }

  

    wx.cloud.callFunction({
      name: 'schedule',// 云函数的名称
      data: {
        workdate,
        teacher_name:app.globalData.userInfo.nickName,
        schedules,
        $url: 'orcToSchedule'
      }//参数
    }).then(res=>{
       console.log(res)
       that.getCurrentSchedule()
       wx.hideLoading()
       wx.showToast({
       title: '提交成功',
       icon:'none'
      }).catch(err=>{
        console.log(err)
      })
    })







  },



  postaddSchedule(beginDate,endDate){
    var that  = this
    wx.showLoading({
      title: '预约中..',
      mask:true
    })
    const {year,month,date}= dateJson
    const workdate = year + '-' + month + '-' + date
    const worktime_begin = workdate + ' ' +  beginDate 
    const worktime_end =  workdate + ' ' +  endDate
    console.log(workdate)
    wx.cloud.callFunction({
      name: 'schedule',// 云函数的名称
      data: {
        workdate,
        teacher_name:app.globalData.userInfo.nickName,
        worktime_begin,
        worktime_end,
        name:this.data.pinyin_customer.name,
        customer_id:this.data.pinyin_customer._id,
        customer_openid : (this.data.pinyin_customer.is_from_wx ? this.data.pinyin_customer._openid:''),
        $url: 'updateSchedule'
      }//参数
    }).then(res=>{
       console.log(res)
       that.getCurrentSchedule()
       wx.hideLoading()
       wx.showToast({
       title: '提交成功',
       icon:'none'
      }).catch(err=>{
        console.log(err)
      })
    })


  },
  inputChange(e){
    this.data.content = e.detail.value
  },
  inputChange2(e){
    this.data.content = e.detail.value
    
  },

  siginClick(){
    var that = this
    wx.showModal({
      title:'当日签到',
      content:'确定签到今日所有安排',
      success:function(res){
         if(res.confirm){
           console.log('点击了确认')
           that.toSigin()
         }

      }
    })

  },
  toSigin(){
    var that  = this
    wx.showLoading({
      title: '签到中..',
      mask:true
    })
    const {year,month,date}= dateJson
    const workdate = year + '-' + month + '-' + date
    wx.cloud.callFunction({
      name: 'schedule',// 云函数的名称
      data: {
        workdate,
        $url: 'siginInByDate'
      }//参数
    }).then(res=>{
       console.log(res)
       that.getCurrentSchedule()
       wx.hideLoading()
       wx.showToast({
       title: '签到成功',
       icon:'none'
      }).catch(err=>{
        console.log(err)
      })
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
       
      }
    })
  },
  uploadPicture(avatarUrl){
    var that = this
    wx.showLoading({
      title: '识别中..',
      mask:true
    })
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
    wx.showLoading({
      title: '识别中..',
      mask:true
    })
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
       console.log(res.fileList[0].tempFileURL)
       that.printedText(res.fileList[0].tempFileURL)
       wx.hideLoading()
      },
      fail: err =>{
        wx.hideLoading()
        wx.showToast({
          title: err,
          duration:3000,
          icon:'none'

        })
      }
    })

  },
  printedText(tempFileURL){
    var that = this
    wx.showLoading({
      title: '识别中..',
      mask:true
    })
    wx.cloud.callFunction({
      name:"pictureocr",
      data:{
        type:"photo",
        imgUrl: encodeURI(tempFileURL)
      },
      success:function(res){
        console.log(res)
        wx.hideLoading()
        that.getSchedule(res.result.items)
      },
      fail:function(e){
        console.log(e)
        wx.hideLoading()
        wx.showToast({
          title: e,
          duration:3000,
          icon:'none'

        })
      }
    })
  },
  getSchedule(items){
    wx.showLoading({
      title: '识别中..',
      mask:true
    })
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

        
        newItems.push(name +"-" + time1 + "-" + time2)
       }
     }

     


     
     
     var str = ''
     for(var j = 0;j< newItems.length;j++){
        var item  = newItems[j]
        str += (item + '\n')
     }

    

    this.setData({
      content:str
    })
    this.showDialogBtn2()
     
     console.log(newItems)
     wx.hideLoading()





  },


 
})