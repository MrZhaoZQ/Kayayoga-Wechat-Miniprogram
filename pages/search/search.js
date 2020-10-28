// pages/search/search.js
const app = getApp()
const http = require("../../utils/http.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword: "",
    tipKeywordlist: [],
    hotlist: [],
    reslist: [],
    reslength: 0,
    searched: false,
    page: 1,
    no_more: false
  },

  inputFn: function (e) {
    //console.log(e.detail.value);
    this.setData({
      keyword: e.detail.value
    });
    this.getTipKeywordlistFn(e.detail.value);
  },
  comfirmFn: function (e) {
    //console.log(e);
    let kw = e.detail.value;
    if(kw){
      this.setData({
        keyword: e.detail.value,
        reslist: [],
        searched: true,
        page: 1
      });
      this.searchFn(kw);
    }else{
      this.setData({
        keyword: e.detail.value,
        searched: false
      })
    }
  },
  searchBtnFn: function () {
    this.searchFn(this.data.keyword);
  },
  getTipKeywordlistFn: function (currentKW) {
    let that = this;
    http.Post("api/Mpsearchkeywork/getKeywordTip", { "name": currentKW }, function (res) {
      if (res.code == 1) {
        that.setData({
          tipKeywordlist: res.data
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
  getHotKWFn: function () {
    let that = this;
    http.Post("api/Mpsearchkeywork/getKeyword", {}, function (res) {
      if (res.code == 1) {
        that.setData({
          hotlist: res.data
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
  searchTipKeywordFn: function (e) {
    let i = e.currentTarget.dataset.i;
    let kw = this.data.tipKeywordlist[i];
    this.setData({
      keyword: kw,
      tipKeywordlist: [],
      reslist: [],
      searched: true,
      page: 1
    });
    this.searchFn(kw);
  },
  searchHotKeywordFn: function (e) {
    let i = e.currentTarget.dataset.i;
    let kw = this.data.hotlist[i].name;
    this.setData({
      keyword: kw,
      reslist: [],
      searched: true,
      page: 1
    });
    this.searchFn(kw);
  },
  searchFn: function (kw) {
    let that = this;
    let prm = { "info": kw, "page": this.data.page, "pagesize": "10" };
    http.Post("api/Mpvideo/getVideoByinfo", prm, function (res) {
      //console.log(res);
      if (res.code == 1) {
        let list = res.data.VideoInfo;
        if (list.length < 1) {
          that.setData({
            tipKeywordlist: [],
            reslength: res.data.TotalCount,
            no_more: true
          });
        } else {
          let result = that.data.reslist;
          let pg = that.data.page + 1;
          for (let i in list) {
            result.push(list[i]);
          }
          that.setData({
            tipKeywordlist: [],
            reslist: result,
            reslength: res.data.TotalCount,
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
  toVideoDetailFn: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../videoDetail/videoDetail?vId=' + id
    });
  },
  likeFn: function (e) {
    let i = e.currentTarget.dataset.i;
    let that = this, list = that.data.reslist;
    http.Post("api/Mplike/Addlike", { "openid": app.globalData.openId, "mpvideo_id": list[i].id }, res => {
      //console.log(res)
      if (res.code == 1) {
        list[i].isLike = list[i].isLike ? false : true;
        list[i].isLike ? list[i].like_count++ : list[i].like_count--;
        that.setData({
          reslist: list
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({released: app.globalData.released})
    this.getHotKWFn()
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
    if (!this.data.no_more) {
      this.searchFn(this.data.keyword);
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