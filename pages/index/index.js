//index.js
const app = getApp()
const http = require("../../utils/http.js")

Page({
  
  data: {
    is_landing_hidden: false,
    navlist: ["全部", "付费", "浏览"],
    activeIndex: 0,
    categoryList: ["Category one", "Category two", "Category three", "Category four"],
    showCategory: false,
    likelist: [],
    newlist: [],
    hotlist: [],
    advanced: [],
    evtslist: [],
    notifylist: [],
    currentN: 0,
    cNindex: 0,
    vertical: true,
    circular: true,
    autoplay: true,
    interval: 4000,
    currentL: 0,
    indicatorDots: true,
    duration: 1000
  },

  //事件处理函数
  navClickFn: function (e) {
    let id = e.currentTarget.id;
    // this.setData({
    //   activeIndex: e.currentTarget.id
    // });
    wx.navigateTo({
      url: '../more/more?cId=' + id + '&listTitle=' + this.data.navlist[id]
    })
  },
  toSearchFn: function () {
    wx.navigateTo({
      url: '../search/search'
    })
  },
  toFilterFn() {
    wx.navigateTo({
      url: '../filter/filter'
    })
  },
  likeClickFn: function (e) {
    let i = e.currentTarget.dataset.i
    wx.navigateTo({
      url: '../videoDetail/videoDetail?vId=' + this.data.likelist[i].id
    })
  },
  toMoreFn: function (e) {
    let cId = e.currentTarget.dataset.catid;
    let title = "";
    if (cId == 3) {
      title = "最新"
    } else if (cId == 4) {
      title = "大家都在看"
    } else if (cId == 5) {
      title = "进阶课程"
    }
    wx.navigateTo({
      url: '../more/more?cId=' + cId + '&listTitle=' + title
    })
  },
  toEvtDetailFn: function () {
    let i = this.data.cNindex, evts = this.data.notifylist;
    wx.navigateTo({
      url: '../evtDetail/evtDetail?evtId=' + evts[i].id
    })
  },
  toVideoDetailFn: function (e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../videoDetail/videoDetail?vId=' + id
    })
  },
  joinFn: function (e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../evtDetail/evtDetail?evtId=' + id
    })
  },
  likeFn: function (i, name) {
    let that = this, list = [];
    if (name == "new") {
      list = that.data.newlist;
    } else if (name == "hot") {
      list = that.data.hotlist;
    } else if (name == "advanced") {
      list = that.data.advanced;
    }
    http.Post("api/Mplike/Addlike", { "openid": app.globalData.openId, "mpvideo_id": list[i].id  }, res => {
      //console.log(res)
      if (res.code == 1) {
        list[i].isLike = list[i].isLike ? false : true;
        list[i].isLike ? list[i].like_count++ : list[i].like_count--;
        if (name == "new") {
          that.setData({
            newlist: list
          })
        } else if (name == "hot") {
          that.setData({
            hotlist: list
          })
        } else if (name == "advanced") {
          that.setData({
            advanced: list
          })
        }
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
  likeVideoFn: function (e) {
    let i = e.currentTarget.dataset.i;
    let name = e.currentTarget.dataset.list;
    this.likeFn(i, name);
  },
  swiperNotifyChangeFn: function (e) {
    this.setData({
      cNindex: e.detail.current
    });
  },
  swiperLiveEvtChangeFn: function (e) {
    this.setData({
      currentL: e.detail.current
    });
  },
  getHomeInfoFn: function (oID) {
    let that = this;
    http.Post("api/Mpindex/GetIndexInfo", { "openid": oID }, function (res) {
      //console.log(res);
      if (res.code == 1) {
        let likes = res.data.CollectionInfo, likeArr = [];
        let list = res.data.ActivitiesInfo;
        for (let i in likes) {
          if (likes[i].type == 1) {
            likes[i].time = likes[i].start_dt + " " + likes[i].start_time.substr(11, 5) + "-" + likes[i].end_time.substr(11, 5);
            likeArr.push(likes[i]);
          } else if (likes[i].type == 3) {
            likes[i].time = likes[i].longinfo;
            likeArr.push(likes[i]);
          }
        }
        for (let j in list) {
          list[j].date = list[j].start_time.substr(5, 2) + " / " + list[j].start_time.substr(8, 2);
          list[j].time = list[j].start_time.substr(11, 5) + "~" + list[j].end_time.substr(11, 5);
        }
        that.setData({
          notifylist: res.data.UserActivitiesReminder,
          likelist: likeArr,
          newlist: res.data.NewestInfo,
          hotlist: res.data.PopularInfo,
          advanced: res.data.AdvancedInfo,
          evtslist: list
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
    if (wx.getStorageSync('openId')) {
      this.setData({
        is_landing_hidden: true
      });
      wx.showTabBar();
    } else {
      this.setData({
        is_landing_hidden: false
      });
      wx.hideTabBar();
      wx.setStorage({
        key: 'openId',
        data: getApp().globalData.openId
      });
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
    let oID = wx.getStorageSync('openId') || getApp().globalData.openId || "";
    this.getHomeInfoFn(oID);
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
