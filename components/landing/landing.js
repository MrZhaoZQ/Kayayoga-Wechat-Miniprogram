// components/landing/landing.js
const app = getApp()
const http = require("../../utils/http.js")
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    landingHidden: {
      type: Boolean,
      value: true
    }, //这里定义了landingHidden属性，属性值可以在组件使用时指定.写法为landing-hidden
  },

  /**
   * 组件的初始数据
   */
  data: {
    swiperlist: [],
    current: 0,
    moveFn: "easeOutCubic",
    duration: 200
  },

  /**
   * 组件的方法列表
   */
  methods: {
    swiperChangeFn: function (e) {
      this.setData({
        current: e.detail.current
      });
    },
    enterFn: function () {
      this.setData({
        landingHidden: true
      });
      wx.showTabBar();
      wx.setStorage({
        key: 'openId',
        data: getApp().globalData.openId
      });
    },
    getLandingsFn: function () {
      let that = this;
      http.Post("api/Mpindex/GetLandingInfo", { "openid": "" }, function (res) {
        if (res.code == 1) {
          //console.log(res)
          that.setData({
            swiperlist: res.data
          })
        } else {
          wx.showModal({
            title: '',
            content: res.msg
          })
        }
      }, function (err) {
        wx.showModal({
          title: '',
          content: err
        })
      });
    }
  },

  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      this.getLandingsFn()
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  pageLifetimes: {
    show: function () {
      // 页面被展示
    },
    hide: function () {
      // 页面被隐藏
    },
    resize: function (size) {
      // 页面尺寸变化
    }
  }
})
