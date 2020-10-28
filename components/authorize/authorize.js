// components/authorize/authorize.js
const app = getApp()
const http = require("../../utils/http.js")
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    authorizeHidden: {
      type: Boolean,
      value: true
    }, //这里定义了authorizeHidden属性，属性值可以在组件使用时指定.写法为authorize-hidden
    fromPage: {
      type: String,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    authorizeHidden: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show: function () {
      this.setData({
        authorizeHidden: false
      })
    },
    hide: function () {
      this.setData({
        authorizeHidden: true
      })
    },
    getUserInfo: function (e) {
      //console.log(this.properties)
      if (!e.detail.userInfo) {
        console.log("拒绝授权")
        if (this.properties.fromPage != "mine" || this.properties.fromPage != "membership"){
          this.setData({
            authorizeHidden: true
          })
        }
        return false
      }
      
      //app.globalData.userInfo = e.detail.userInfo;
      //console.log(e.detail);
      let param = {
        "session": app.globalData.sessionKey,
        "iv": e.detail.iv,
        "encryptedData": e.detail.encryptedData
      };
      let that = this;
      http.Post("api/Mpmanage/getMPUserInfo", param, function (res) { //更新userInfo到数据库
        console.log(res);
        if (res.code == 1) {
          //更新用户数据成功
          app.globalData.userInfo = res.data;
          wx.setStorage({
            key: 'hasUserInfo',
            data: '1',
          });
          // if (that.properties.fromPage == "video") {

          // }
          // if (that.properties.fromPage == "event") {

          // }
          // var myEventDetail = {
          //   userInfo: res.data
          // };
          // that.triggerEvent('myevent', myEventDetail);
          that.triggerEvent('myevent')
        } else {
          //更新用户数据失败
        }
      }, function (err) {
        console.log(err);
      });
      
      this.setData({
        authorizeHidden: true
      }); 
    }
  }
})
