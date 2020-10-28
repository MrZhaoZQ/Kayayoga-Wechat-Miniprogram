// pages/landing/landing.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperlist: [
      {
        "img": "https://api.maniyoga.fugumobile.cn/public/imgs/landing/1.jpg", "txt": "瑜伽(1)是一个非常古老的能量知识修炼方法，集哲学、科学和艺术于一身。"},
      { "img": "https://api.maniyoga.fugumobile.cn/public/imgs/landing/2.jpg", "txt": "瑜伽(2)是一个非常古老的能量知识修炼方法，集哲学、科学和艺术于一身。" },
      { "img": "https://api.maniyoga.fugumobile.cn/public/imgs/landing/3.jpg", "txt": "瑜伽(3)是一个非常古老的能量知识修炼方法，集哲学、科学和艺术于一身。" },
      { "img": "https://api.maniyoga.fugumobile.cn/public/imgs/landing/4.jpg", "txt": "瑜伽(4)是一个非常古老的能量知识修炼方法，集哲学、科学和艺术于一身。" }
    ],
    indicatorDots: true,
    autoplay: false,
    current: 0,
    interval: 5000,
    duration: 1000
  },
  
  swiperChangeFn: function (e) {
    //console.log(e.detail.current);
    this.setData({
      current: e.detail.current
    });
  },
  enterFn: function () {
    wx.switchTab({
      url: '../index/index'
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let opId = wx.getStorageSync('openId');
    if (opId) {
      wx.switchTab({
        url: '../index/index'
      })
    } else {
      wx.setStorage({
        key: 'openId',
        data: app.globalData.openId
      })
    }
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
    return {
      title: '',
      path: '/pages/index/index?shareby=' + app.globalData.openId,
      imageUrl: 'https://api.maniyoga.fugumobile.cn/public/imgs/share.jpg'
    }
  }
})