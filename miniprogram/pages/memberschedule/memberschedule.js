import todo from '../../components/calendar/plugins/todo'
import selectable from '../../components/calendar/plugins/selectable'
import solarLunar from '../../components/calendar/plugins/solarLunar/index'
import timeRange from '../../components/calendar/plugins/time-range'
import week from '../../components/calendar/plugins/week'
import holidays from '../../components/calendar/plugins/holidays/index'
import plugin from '../../components/calendar/plugins/index'


plugin
  .use(todo)
  .use(solarLunar)
  .use(selectable)
  .use(week)
  .use(timeRange)
  .use(holidays)


var currentMonth = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectDateJson:'',
     // 此处为日历自定义配置字段
    calendarConfig: {

      markToday: '今', // 当天日期展示不使用默认数字，用特殊文字标记
      // multi: true, // 是否开启多选,
      // weekMode: false, // 周视图模式

      // theme: 'default', // 日历主题，目前共两款可选择，默认 default 及 elegant，自定义主题色在参考 /theme 文件夹
      // showLunar: true, // 是否显示农历，此配置会导致 setTodoLabels 中 showLabelAlways 配置失效
      // inverse: true, // 单选模式下是否支持取消选中,
      
      // takeoverTap: false, // 是否完全接管日期点击事件（日期不会选中)
      // emphasisWeek: true, // 是否高亮显示周末日期
      
      // showHolidays: true, // 显示法定节假日班/休情况，需引入holidays插件
      // showFestival: true, // 显示节日信息（如教师节等），需引入holidays插件
      // highlightToday: true, // 是否高亮显示当天，区别于选中样式（初始化时当天高亮并不代表已选中当天）
      
      // preventSwipe: true, // 是否禁用日历滑动切换月份
      // firstDayOfWeek: 'Mon', // 每周第一天为周一还是周日，默认按周日开始
      // onlyShowCurrentMonth: false, // 日历面板是否只显示本月日期
      // autoChoosedWhenJump: true, // 设置默认日期及跳转到指定日期后是否需要自动选中
      
    }
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
  /**
   * 日历初次渲染完成后触发事件，如设置事件标记
   */
  afterCalendarRender(e) {
    console.log('afterCalendarRender', e)
    const calendar = this.selectComponent('#calendar').calendar
    const selected = calendar.getSelectedDates()
    console.log(selected)

    var {curYear,curMonth,curDate} = e.detail.calendar
    currentMonth =  curYear+'-'+curMonth+'-'+curDate
    console.log(currentMonth)
    
  },
  /**
   * 日期点击事件（此事件会完全接管点击事件），需自定义配置 takeoverTap 值为真才能生效
   * currentSelect 当前点击的日期
   */
  takeoverTap(e) {
    console.log('takeoverTap', e) // => { year: 2019, month: 12, date: 3, ...}
  },
  /**
   * 选择日期后执行的事件
   */
  afterTapDate(e) {
    var selectDateJson = e.detail
    
    if(selectDateJson.month<10){
      selectDateJson.month = '0' + selectDateJson.month
    }
    if(selectDateJson.date<10){
      selectDateJson.date = '0' + selectDateJson.date
    }
    this.data.selectDateJson = selectDateJson

    console.log('afterTapDate', this.data.selectDateJson) // => { year: 2019, month: 12, date: 3, ...}

    this.addSchedule()
   
  
  },
  /**
   * 当日历滑动时触发(适用于周/月视图)
   * 可在滑动时按需在该方法内获取当前日历的一些数据
   */
  onSwipe(e) {
    console.log('onSwipe', e.detail)
  },
  /**
   * 当改变月份时触发
   * => current 当前年月 / next 切换后的年月
   */
  whenChangeMonth(e) {
    console.log('whenChangeMonth', e.detail)
    // => { current: { month: 3, ... }, next: { month: 4, ... }}

    var {year,month} = e.detail.next
    currentMonth =  year+'-'+month+'-'+'01'
    console.log(currentMonth)
  },


  getCurrentSchedule(){
    const{ year,month,date } = this.data.selectDateJson
    const workdate = year + '-' + month + '-' + date
    console.log(workdate)
    wx.cloud.callFunction({
      name:'schedule',
      data:{
        workdate,
        $url:'getCurrentSchedule'
      },
      
    }).then(res=>{
       console.log(res)
    }).catch(err=>{
      console.log('err')
       console.log(err)
    })
  },
  addSchedule(){
    wx.navigateTo({
      url: '../editSchedule/editSchedule?dateJson=' + JSON.stringify(this.data.selectDateJson),
    })

  },
  getSiginXslClick(e){
   var type = e.target.dataset.type
    var workdate = currentMonth
    wx.showLoading({
      title: '正在导出',
    })
    wx.cloud.callFunction({
      name:'xlsxgenerate',
      data:{
        workdate,
        $url:type == 1 ? 'signXlsx2' : 'signXlsx'
      },
    }).then(res=>{
      console.log(res)
      wx.hideLoading()
      const fileID = res.result.fileID;
      //下载文件
      // wx.cloud.downloadFile({
      //   fileID
      // }).then(res1 => {
      // console.log(res1)
      // this.writePhotosAlbumAuth(res1)//保存文件到相册
      // this.delCloudFile(fileID)//删除云存储文件
      // }).catch(error => {
      //  console.log(error)
      // })

      this.getFileUrl(fileID)
        
       
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })
     
  },
  //获取云存储文件下载地址，这个地址有效期一天
  getFileUrl(fileID) {
    let that = this;
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        // get temp file URL
        const fileUrl =  res.fileList[0].tempFileURL
        console.log("文件下载链接", fileUrl)
        this.copyFileUrl(fileUrl)

      },
      fail: err => {
        // handle error
      }
    })
  },
  //复制excel文件下载链接
  copyFileUrl(fileUrl) {
    wx.setClipboardData({
      data: fileUrl,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log("复制成功",res.data) // data
            wx.showToast({
              title: '签到表生成,链接已经复制了，去浏览器粘贴链接并下载',
              duration:4000,
              icon:'none'

            })
          }
        })
      }
    })
  },





 //保存文件到本地相册
 saveFileToPhotosAlbum(res){
  // 保存文件
  var saveTempPath = wx.env.USER_DATA_PATH + "/exportFile"+new Date().getTime()+".jpg"
  console.log(saveTempPath)
  console.log(res.tempFilePath)
  wx.saveFile({
    tempFilePath: res.tempFilePath,
    filePath: saveTempPath ,
    success:res1=> {
      //获取了相册的访问权限，使用 wx.saveImageToPhotosAlbum 将图片保存到相册中
      console.log(res1)
      wx.saveImageToPhotosAlbum({
        filePath: saveTempPath ,
        success: res2 => {
          //保存成功弹出提示，告知一下用户
          wx.hideLoading();
          wx.showModal({
            title: '文件已保存到手机相册',
            content: '文件位于tencent/MicroMsg/WeiXin下 \r\n将保存的文件重命名改为[ .xlsx ]后缀即可正常打开',
            confirmColor: '#0bc183',
            confirmText: '知道了',
            showCancel: false
          });
        },
        fail(err2) {
          console.log(err2)
        }
      })
    }
  });

 },
 //微信图片保存到本地相册授权
 writePhotosAlbumAuth(res){
  var that = this
  wx.getSetting({
    success(res1) {
      if (!res1.authSetting['scope.writePhotosAlbum']) {
        wx.authorize({
          scope:'scope.writePhotosAlbum',
          success() {
            // 授权成功
            that.saveFileToPhotosAlbum(res)

          }
        })
      }else{
        // 已经授权
        that.saveFileToPhotosAlbum(res)

      }
    }
  })
},
//删除云存储文件
delCloudFile(fileID){
  const fileIDs=[];
  fileIDs.push(fileID);
  //删除云存储中的excel文件
  wx.cloud.deleteFile({
    fileList: fileIDs,
    success: res => {
      // handle success
      console.log(res.fileList);
    },
    fail: console.error
  })
},
getWeekCaseClick(){
   wx.navigateTo({
     url: '../WeekCase/WeekCase?dateJson=' + JSON.stringify(this.data.selectDateJson),
   })
}

})