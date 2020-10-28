// pages/mine/mine.js
const app = getApp()
const http = require("../../utils/http.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_authorize_hidden: true,
    page_name: "mine",
    tabbars: ["已收藏", "已购买"],
    activeIndex: 0,
    mylist: [[], []],
    page: 1,
    no_more: false
  },

  tabbarFn: function (e) {
    let ind = e.currentTarget.id;
    this.setData({
      activeIndex: ind,
      mylist: [[], []],
      page: 1,
      no_more: false
    });
    this.getListFn(ind);
  },
  toVideoDetailFn: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../videoDetail/videoDetail?vId=' + id
    });
  },
  likeFn: function (e) {
    let i = e.currentTarget.dataset.i;
    let tab = this.data.activeIndex;
    let that = this, list = that.data.mylist;
    http.Post("api/Mplike/Addlike", { "openid": app.globalData.openId, "mpvideo_id": list[tab][i].id }, res => {
      //console.log(res)
      if (res.code == 1) {
        list[tab][i].isLike = list[tab][i].isLike ? false : true;
        list[tab][i].isLike ? list[tab][i].like_count++ : list[tab][i].like_count--;
        that.setData({
          mylist: list
        })
      } else {
        wx.showModal({
          title: '',
          content: res.msg
        })
      }
    }, err => {
      wx.showModal({
        title: '',
        content: err
      })
    });
  },
  getListFn: function (active) {
    let apiUrl = "api/Mpvideo/getCollectionVideo";
    let prm = { "openid": app.globalData.openId, "page": this.data.page, "pagesize": "10" };
    if (active == 1) {
      apiUrl = "api/Mpvideo/getBuyVideo";
      prm = { "openid": app.globalData.openId, "page": this.data.page, "pagesize": "10" };
    }
    let that = this;
    http.Post(apiUrl, prm, function (res) {
      //console.log(res);
      if (res.code == 1) {
        let list = res.data;
        if (list.length < 1) {
          that.setData({
            no_more: true
          })
        } else {
          let more = that.data.mylist;
          let pg = that.data.page + 1;
          for (let i in list) {
            more[active].push(list[i]);
          }
          that.setData({
            mylist: more,
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
  onMyEvent: function (e) {
    app.globalData.hasUserInfo = 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getStorage({
      key: 'mine',
      complete(res) {
        if (res.data != "mutation") {//判断是否在视频详情页对视频操作了“收藏”按钮
          that.getListFn(0);
        }
      }
    })
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
    if (app.globalData.hasUserInfo) {
      this.setData({
        is_authorize_hidden: true
      })
    } else {
      this.setData({
        is_authorize_hidden: false
      })
    }
    let that = this;
    wx.getStorage({
      key: 'mine',
      success(res) {
        console.log(res)
        if (res.data == "mutation") {
          that.setData({
            mylist: [[], []],
            page: 1,
            no_more: false
          });
          that.getListFn(that.data.activeIndex);
          wx.removeStorage({key: 'mine'})
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
      this.getListFn(this.data.activeIndex);
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