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
  },
  /**
   * 日期点击事件（此事件会完全接管点击事件），需自定义配置 takeoverTap 值为真才能生效
   * currentSelect 当前点击的日期
   */
  takeoverTap(e) {
    this.data.selectDateJson = e.detail
    console.log('takeoverTap', this.data.selectDateJson) // => { year: 2019, month: 12, date: 3, ...}
  },
  /**
   * 选择日期后执行的事件
   */
  afterTapDate(e) {
    this.data.selectDateJson = e.detail
    console.log('afterTapDate', this.data.selectDateJson) // => { year: 2019, month: 12, date: 3, ...}
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
  },
  addSchedule(){
    
    wx.navigateTo({
      url: '../addSchedule/addSchedule?dateJson=' + JSON.stringify(this.data.selectDateJson),
    })



    return;
    var {year,month,date}= this.data.selectDateJson
    const calendar = this.selectComponent('#calendar').calendar



    const dates = [
      {
        year,
        month,
        date,
        todoText:'hello'
      }
    ]
    calendar["setTodos"]({
      showLabelAlways: true,
      dates
    })
  }

})