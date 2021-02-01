

//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env:'yuki-0gbql9nmaffb2b12',
        // env: 'product-env-4gxq75gu2a5a651d',
       traceUser: true,
      })
    }
    this.globalData = {}
    // this.userAuthoried()
    wx.getStorage({
      key: 'userInfo',
      success:res=>{
        if(res.data!=undefined){
          this.globalData.userInfo = res.data

          console.log('1234567890')
          console.log(this.globalData.userInfo);
        }
      }
         
    })

    
  },
  userAuthoried(){
      var that = this
      var a = new Promise(function(resolve, reject){
        wx.getStorage({
          key: 'is_login',
          success:res=>{
             that.globalData.isLogin = (res.data == undefined?false:res.data)
             resolve()
          },
          fail:err=>{
            resolve()
          }
        })
      })
      var b = new Promise(function(resolve, reject){
        wx.getSetting({
          success:res=>{
            var isAuthoried = res.authSetting['scope.userInfo']
            that.globalData.isAuthoried = (isAuthoried == undefined ? false:isAuthoried)
            resolve()
          },
          fail:err=>{
            resolve()
          }
        })
      })
      var c = new Promise(function(resolve, reject){
        wx.getStorage({ //获取本地缓存
          key:"is_teacher",
          success:res =>{
            that.globalData.isTeacher = (res.data == undefined?false:res.data)
            resolve()
          },
          fail:err=>{
            resolve()

          }
        })
      })

      Promise.all([a, b,c]).then((result) => {
        console.log('123')
        console.log(that.globalData.isTeacher)
        if(that.globalData.isTeacher != undefined){
          that.toHome()
        } else{
          that.toStart()
        }           
      }).catch(err=>{
        if(that.globalData.isTeacher != undefined){
          that.toHome()
        } else{
          that.toStart()
        } 

      }).finally(()=>{
        wx.showToast({
          title: 'finally',
        })
        if(that.globalData.isTeacher != undefined){
          that.toHome()
        } else{
          that.toStart()
        }
      })

      



    
  },
  toHome(){
    console.log('home')
    setTimeout(function(){
       const url = '../../pages/home/home'
        wx.switchTab({
          url
        })
    },1000)
   
  },
  toStart(){
   console.log("tostart")
   wx.showToast({
     title: 'tostart',
   })
   console.log(this.globalData.isTeacher)

   setTimeout(()=>{
    var pages = getCurrentPages()
    var currentPage = pages[pages.length - 1]
    currentPage.setData({
      isLauchPage:(this.globalData.isTeacher == undefined ? false:true)
    })
   },2000)
    
  },

})
