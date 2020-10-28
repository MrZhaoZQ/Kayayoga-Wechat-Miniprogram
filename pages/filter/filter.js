// pages/filter/filter.js
const app = getApp()
const http = require("../../utils/http.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    itemNames: ["老师", "等级", "功能", "流派"]
  },

  backFn: function () {
    wx.navigateBack()
  },
  toSearchFn: function () {
    wx.navigateTo({
      url: '../search/search'
    })
  },
  toMoreFn: function (e) {
    let i = e.currentTarget.dataset.i, x = e.currentTarget.dataset.idx;
    let list = this.data.list[x], cId = Number(x) + 6;
    wx.navigateTo({
      url: '../more/more?cId=' + cId + '&listTitle=' + list[i].name + "&id=" + list[i].id
    })
  },
  getFilterListFn() {
    let that = this;
    http.Post("api/Mpvideo/GetVideoCategoryList", { "openid": app.globalData.openId }, function (res) {
      if (res.code == 1) {
        let arr = that.data.list
        arr.push(res.data.TeacherList)
        arr.push(res.data.LevelList)
        arr.push(res.data.FunctionList)
        arr.push(res.data.LineageList)
        that.setData({
          list: arr
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getFilterListFn()
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