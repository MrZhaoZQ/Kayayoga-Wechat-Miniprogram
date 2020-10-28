// pages/more/more.js
const app = getApp()
const http = require("../../utils/http.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    catId: "",
    listTitle: "",
    id: "",
    morelist: [],
    page: 1,
    no_more: false
  },

  backFn: function () {
    wx.navigateBack()
  },
  toSearchFn: function () {
    wx.navigateTo({
      url: '../search/search'
    })
  },
  toVideoDetailFn: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../videoDetail/videoDetail?vId=' + id
    })
  },
  likeFn: function (e) {
    let i = e.currentTarget.dataset.i;
    let that = this, list = that.data.morelist;
    http.Post("api/Mplike/Addlike", { "openid": app.globalData.openId, "mpvideo_id": list[i].id }, res => {
      //console.log(res)
      if (res.code == 1) {
        list[i].isLike = list[i].isLike ? false : true;
        list[i].isLike ? list[i].like_count++ : list[i].like_count--;
        that.setData({
          morelist: list
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
  getListFn: function (type, id) {
    let that = this;
    let prm = { "openid": app.globalData.openId, "type": this.data.catId, "id": this.data.id, "page": this.data.page, "pagesize": "10" };
    http.Post("api/Mpvideo/GetMoreVideo", prm, function (res) {
      //console.log(res);
      if (res.code == 1) {
        let list = res.data;
        if (list.length < 1) {
          that.setData({
            no_more: true
          });
        } else {
          let more = that.data.morelist;
          let pg = that.data.page + 1;
          for (let i in list) {
            more.push(list[i]);
          }
          that.setData({
            morelist: more,
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
    console.log(options)
    //type or catId: "0"=>全部 "1"=>付费 "2"=>免费 "3"=>最新 "4"=>大家都在看 "5"=>进阶课程 且 无子分类(id)
    //type or catId: "6"=>老师 "7"=>等级 "8"=>功能 "9"=>免费 且 有子分类(id)
    this.setData({
      catId: options.cId,
      listTitle: options.listTitle,
      id: options.id ? options.id : "",
    })
    this.getListFn()
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
    if (!this.data.no_more){
      this.getListFn();
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