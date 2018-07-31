var Bmob = require('utils/bmob.js');
import { ToastPannel } from './component/toastTest/toastTest';
if (!Array.prototype.findIndex) {
  require('./utils/array-findIndex')
}
// var BmobSocketIo = require('utils/bmobSocketIo.js').BmobSocketIo;
// const BmobSocketIo = require('utils/tunnel');
Bmob.initialize(
  '726327fabf1f8ed5f4777b94bc3f6df8',
  'a1850ef26199fa76821567eec122e684'
)
// Bmob.initialize("983bc08c5a6d2e9bafa83b2c550a8175", "1a388a666e3bf56dedbcdd9d54a60e11");
App({
  ToastPannel,
  onLaunch: function () {
    var user = new Bmob.User() //开始注册用户
    user.auth().then(function (obj) {
      console.log('登陆成功')
    },
      function (err) {
        console.log('失败了', err)
      });
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == 'function' && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == 'function' && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData: {
    userInfo: null
  }
})
