// pages/master/master.js
const app = getApp()
const http = require("../../utils/http.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    masters: [],
    page: 1,
    no_more: false
  },

  toMDFn: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../masterDetail/masterDetail?mId=' + id
    })
  },
  followFn: function (e) {
    let i = Number(e.currentTarget.dataset.id);
    let that = this, arr = this.data.masters;
    let param = { "openid": app.globalData.openId, "mpteacher_id": arr[i].id };
    http.Post("api/Mplike/Addlike", param, function (res) {
      console.log(res);
      if (res.code == 1) {
        if (arr[i].liked == 0) {
          arr[i].liked = 1;
          arr[i].count_like += 1;
          let item = arr[i]
          arr.splice(i, 1)
          arr.unshift(item)
        } else {
          arr[i].liked = 0;
          arr[i].count_like -= 1;
          let item = arr[i]
          arr.splice(i, 1)
          arr.push(item)
        }
        that.setData({
          masters: arr
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
  getMasterListFn: function () {
    let that = this;
    let prm = { "openid": app.globalData.openId, "page": this.data.page, "pagesize": "10" };
    http.Post("api/Mpteacher/GetTeacherList", prm, function (res) {
      //console.log(res);
      if (res.code == 1) {
        let list = res.data;
        if (list.length < 1) {
          that.setData({
            no_more: true
          });
        } else {
          let more = that.data.masters;
          let pg = that.data.page + 1;
          for (let i in list) {
            more.push(list[i]);
          }
          that.setData({
            masters: more,
            page: pg
          });
        }
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
    this.getMasterListFn();
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
    let that = this;
    wx.getStorage({
      key: 'mId',
      complete: function(res) {
        if (res.data) {
          that.setData({
            masters: [],
            page: 0
          })
          that.getMasterListFn()
          wx.removeStorage({ key: 'mId' })
        }
      }
    })
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
    if (!this.data.no_more) {
      this.getMasterListFn()
    }
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