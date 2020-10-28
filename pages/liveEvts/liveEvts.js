// pages/liveEvts/liveEvts.js
const app = getApp()
const http = require("../../utils/http.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperlist: [],
    countdown: [
      { "days": "02", "hours": "12", "mins": "48" },
      { "days": "02", "hours": "12", "mins": "48" },
      { "days": "02", "hours": "12", "mins": "48" }
    ],
    autoplay: false,
    current: 0,
    interval: 5000,
    duration: 1000,
    timer: "",
    selectlist: ["全部", "价格", "时间"],
    selectedIndex: 0,
    evtlist: [],
    page: 1,
    no_more: false
  },

  toSearchFn: function () {
    wx.navigateTo({
      url: '../search/search'
    })
  },
  swiperChangeFn: function (e) {
    //console.log(e.detail.current);
    this.setData({
      current: e.detail.current
    });
  },
  joinFn: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../evtDetail/evtDetail?evtId=' + id
    })
  },
  subscribeFn: function (e) {
    if (wx.requestSubscribeMessage) {
      let that = this, id = e.currentTarget.dataset.id;
      wx.requestSubscribeMessage({
        tmplIds: ['HU4rSrihN2LSmayvkAPEEbpzehuSNAjDdvzllqc_xoE'],
        success(res) {
          //console.log(res)
          //res.HU4rSrihN2LSmayvkAPEEbpzehuSNAjDdvzllqc_xoE => "accept" /"reject"
          if (res.HU4rSrihN2LSmayvkAPEEbpzehuSNAjDdvzllqc_xoE == "accept") {
            that.setReminderFn(id)
          }
        },
        fail(err) {
          console.log(err)
        }
      })
    } else {
      wx.showModal({
        title: '',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
      })
    }
  },
  setReminderFn(id) {
    let that = this;
    http.Post("api/Mptemplatemsg/setReminder", { "openid": app.globalData.openId, "activityID": id }, function (res) {
      if (res.code == 1) {

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
  bindPickerChangeFn: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      selectedIndex: e.detail.value,
      evtlist: [],
      page: 1,
      no_more: false
    })
    this.getEvtlistFn(Number(e.detail.value) + 1)
  },
  getLiveEvtsFn: function () {
    let that = this;
    http.Post("api/Mpactivities/GetActivitySlideList", { "openid": app.globalData.openId }, function (res) {
      //console.log(res);
      if(res.code==1){
        let list = res.data, arr = [];
        for (let i in list) {
          list[i].date = list[i].start_time.substr(5, 2) + " / " + list[i].start_time.substr(8, 2);
          list[i].time = list[i].start_time.substr(11, 5) + "~" + list[i].end_time.substr(11, 5);
          arr.push(that.countdownFn(list[i].start_time));
        }
        that.setData({
          swiperlist: list,
          countdown: arr
        });
      }else{
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
  countdownFn: function(t){
    let delta = new Date(t.replace(/-/g, "/")).getTime() - new Date().getTime();
    let days = parseInt(delta / 86400000);
    let hours = parseInt(delta % 86400000 / 3600000);
    let mins = parseInt(delta % 86400000 % 3600000 / 60000);
    //console.log(days, hours, mins)
    return { "days": days, "hours": hours, "mins": mins, "start": t };
  },
  startCountdownFn: function(){
    let that = this;
    this.setData({
      timer: setInterval(function () {
        let countdownArr = [];
        for (let i = 0; i < that.data.countdown.length; i++) {
          countdownArr.push(that.countdownFn(that.data.countdown[i].start))
        }
        that.setData({
          countdown: countdownArr
        })
      }, 5000)
    });
  },
  getEvtlistFn: function (by) {
    let that = this;
    let prm = { "openid": app.globalData.openId, "page": that.data.page, "pagesize": 10, "sort": by };
    http.Post("api/Mpactivities/GetActivityList", prm, function (res) {
      //console.log(res);
      if (res.code == 1) {
        let list = res.data;
        if (list.length < 1) {
          that.setData({
            no_more: true
          });
          return false;
        } else {
          let evts = that.data.evtlist;
          let pg = that.data.page + 1;
          for (let i in list) {
            list[i].time = list[i].start_time.substr(11, 5) + "~" + list[i].end_time.substr(11, 5);
            evts.push(list[i]);
          }
          that.setData({
            evtlist: evts,
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
    this.getLiveEvtsFn();
    this.getEvtlistFn(this.data.selectedIndex + 1);
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
    //console.log("show");
    this.startCountdownFn();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //console.log("hide");
    let that = this;
    clearInterval(that.data.timer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let that = this;
    clearInterval(that.data.timer);
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
      let by = Number(this.data.selectedIndex) + 1;
      this.getEvtlistFn(by);
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