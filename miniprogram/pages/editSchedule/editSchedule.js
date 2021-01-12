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
     pinyin_customer:''


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

    //  var a = '防御奎，下午六点到七点。'
     

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
   wx.navigateTo({
      url: '../addSchedule/addSchedule?dateJson=' + JSON.stringify(dateJson),
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
      showModal: false
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
  }

 
})