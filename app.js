//app.js
const ald = require('./utils/ald-stat.js')
const http = require("./utils/http.js")
App({
  onLaunch: function (options) {
    // Do something when launch.
    let res = wx.getSystemInfoSync();
    this.globalData.ww = res.windowWidth;
    this.globalData.wh = res.windowHeight;
  },
  onShow(options) {
    // Do something when show.
    // console.log(options)
    this.globalData.shareBy = options.query.shareby ? options.query.shareby : "";
    let that = this;
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        http.Post("api/Mpmanage/authorization", { "code": res.code }, function (res) {
          //console.log(res);
          if (res.code == 1) {
            that.globalData.sessionKey = res.data.session_key
            that.globalData.openId = res.data.openid
            that.globalData.released = res.data.publish
            wx.aldstat.sendOpenid(res.data.openid)
          } else {
            console.log(res.errmsg)
          }
        }, function (err) {
          console.log(err)
        });
      }
    });
    wx.getStorage({
      key: 'hasUserInfo',
      complete: function (res) {
        if (res.data) {
          that.globalData.hasUserInfo = Number(res.data)
        }
      }
    });
  },
  onHide() {
    
  },
  onError(msg) {
    console.log(msg)
  },
  globalData: {
    released: 1,
    hasUserInfo: 0,
    shareBy: "",
    openId: "",
    liveEvt: {} // 当前处于小窗的直播活动
  }
})