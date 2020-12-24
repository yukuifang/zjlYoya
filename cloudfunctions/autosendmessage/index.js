// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()


// 云函数入口函数
exports.main = async (event, context) => {
  const result = await cloud.openapi.subscribeMessage.send({
    touser: 'opIkL0e3d7sBuNCggrLkh92jqp_A', //要推送给那个用户
    page: 'pages/mine/mine', //要跳转到那个小程序页面
    lang: 'zh_CN',
    data: { //推送的内容
      name1: {
        value: 'aa'
      },
      name10: {
        value: "bb"
      },
      thing2: {
        value: "cc"
      },
      date3: {
        value: "2019/10/14"
      },
      thing8: {
        value: "kk"
      },


    },
    templateId: 'UgxSFEgfxASQgj6E1IW_vLyQu07aasNidkbeQqHq-Ig', //模板id
    miniprogramState: 'developer'
  })

  return '推送成功'
}