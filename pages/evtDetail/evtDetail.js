// pages/evtDetail/evtDetail.js
const http = require("../../utils/http.js")
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_authorize_hidden: true,
    page_name: "event",
    evtInfo: {},
    mInfo: {},
    countdown: {},
    evtState: "", //""=>未开始 "started"=>已开始 "ended"=>已结束
    recommlist: [],
    btnSrc: "buy",
    showSharePopup: false,
    showPoster: false
  },

  onMyEvent: function (e) {
    app.globalData.hasUserInfo = 1
  },
  toHomeFn: function () {
    wx.switchTab({
      url: '../index/index'
    })
  },
  toMasterFn: function () {
    wx.navigateTo({
      url: '../masterDetail/masterDetail?mId=' + this.data.mInfo.id
    })
  },
  btnBtnFn: function () {
    let bs = this.data.btnSrc, that = this;
    //bs = "join1";
    if (bs == "buy") {
      if (this.data.evtState == 'started') {
        wx.showModal({ content: '该直播已经开始，购买通道已关闭' });
        return false;
      }
      this.creatOrderFn()
    } else if (bs == "join0") {//活动未开始或已结束

    } else if (bs == "join1") {
      // 如果有正处于小窗状态的其他的直播活动，先关闭、再打开新的
      if (app.globalData.playing && (app.globalData.liveEvt.id && app.globalData.liveEvt.id != that.data.evtId) && wx.createLivePlayerContext('myPlayer').exitPictureInPicture) {
        console.log('exitPictureInPicture because of Live event switching')
        wx.createLivePlayerContext('myPlayer').exitPictureInPicture()
      }
      app.globalData.liveEvt = {
        "id": that.data.evtId,
        "name": that.data.evtInfo.name,
        "avatar": that.data.evtInfo.avatar
      }
      wx.navigateTo({
        url: '../livePlayer/livePlayer?evtId=' + this.data.evtId + '&liveUrl=' + this.data.evtInfo.live_url
      })
    }
  },
  creatOrderFn: function () {
    let that = this;
    http.Post("api/Mporder/createorder", { "openid": app.globalData.openId, "activityID": that.data.evtId, "shareby": app.globalData.shareBy }, function (res) {
      if (res.code == 1) {
        if (res.data.paytype == 1) {
          that.checkPaymentFn(res.data.ordernumber)
        } else {
          if (that.data.evtState=="started") {//直播已开始的
            wx.navigateTo({
              url: '../livePlayer/livePlayer?evtId=' + that.data.evtId + '&liveUrl=' + that.data.evtInfo.live_url
            })
          } else {//直播未开始的,提示付款成功、记得查看活动通知
            let evt = that.data.evtInfo
            evt.isPurchase = true
            that.setData({
              evtInfo: evt,
              btnSrc: 'join0'
            })
            wx.showModal({
              content: '付款成功，请注意查收您购买活动的开始通知'
            })
          }
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
  checkPaymentFn: function (orderNum) {
    let that = this;
    http.Post("api/Mpmanage/pay", { "openid": app.globalData.openId, "OrderNumber": orderNum }, function (res) {
      console.log(res)
      if (res.code == 1) {
        wx.requestPayment({
          "timeStamp": res.data.timestamp,
          "nonceStr": res.data.nonceStr,
          "package": res.data.package,
          "signType": res.data.signType,
          "paySign": res.data.paySign,
          success(res) {
            if (that.data.evtState=="started") {//直播已开始的
              wx.navigateTo({
                url: '../livePlayer/livePlayer?evtId=' + that.data.evtId + '&liveUrl=' + that.data.evtInfo.live_url
              })
            } else {//直播未开始的,提示付款成功、记得查看活动通知
              let evt = that.data.evtInfo
              evt.isPurchase = true
              that.setData({
                evtInfo: evt,
                btnSrc: 'join0'
              })
              wx.showModal({
                content: '付款成功，请注意查收您购买活动的开始通知'
              })
            }
          },
          fail(err) {
            wx.showModal({
              content: '付款失败，请稍后重试'
            })
          }
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
  countdownFn: function (s, e) {
    if (new Date(e.replace(/-/g, "/")).getTime() <= new Date().getTime()) {
      this.setData({
        evtState: "ended",
        btnSrc: "join0"
      })
    }
    let delta = new Date(s.replace(/-/g, "/")).getTime() - new Date().getTime();
    delta = Math.abs(delta)
    let days = parseInt(delta / 86400000);
    days = days < 10 ? "0" + days : days;
    let hours = parseInt(delta % 86400000 / 3600000);
    hours = hours < 10 ? "0" + hours : hours;
    let mins = parseInt(delta % 86400000 % 3600000 / 60000);
    mins = mins < 10 ? "0" + mins : mins;
    //console.log(days, hours, mins)
    return { "days": days, "hours": hours, "mins": mins, "start": s, "end": e };
  },
  startCountdownFn: function () {
    let that = this;
    this.setData({
      timer: setInterval(function () {
        that.setData({
          countdown: that.countdownFn(that.data.countdown.start, that.data.countdown.end)
        })
      }, 5000)
    });
  },
  subscribeFn: function (e) {
    if (wx.requestSubscribeMessage) {
      let that = this, id = e.currentTarget.dataset.id;
      wx.requestSubscribeMessage({
        tmplIds: ['HU4rSrihN2LSmayvkAPEEbpzehuSNAjDdvzllqc_xoE'],
        success(res) {
          if (res.HU4rSrihN2LSmayvkAPEEbpzehuSNAjDdvzllqc_xoE == "accept") {
            that.setReminderFn(that.data.evtId)
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
      if (res.code != 1) {
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
  getEvtInfoFn: function (id) {
    let that = this;
    http.Post("api/Mpactivities/GetActivityDetail", { "openid": app.globalData.openId, "id": id }, function (res) {
      if (res.code == 1) {
        let btn = "", es = that.data.evtState;
        if (new Date().getTime() >= new Date(res.data.start_time.replace(/-/g, "/")).getTime()) {
          es = "started"
        }
        if (!res.data.isPurchase) {
          btn = "buy"
        } else {
          btn = es == "started" ? "join1" : "join0"
        }
        that.setData({
          evtInfo: res.data,
          countdown: that.countdownFn(res.data.start_time, res.data.end_time),
          evtState: es,
          btnSrc: btn
        });
        that.getMasterInfoFn(res.data.mpteacher_id);
      } else {
        wx.showModal({
          content: res.msg,
          complete(){
            wx.navigateBack()
          }
        })
      }
    }, function (err) {
      console.log(err)
      wx.showModal({
        content: 'Network exception, please try again later',
        complete(){
          wx.navigateBack()
        }
      })
    });
  },
  getMasterInfoFn: function (id) {
    let that = this;
    http.Post("api/Mpteacher/GetTeacherDetail", { "openid": app.globalData.openId, "id": id }, function (res) {
      if (res.code == 1) {
        that.setData({
          mInfo: res.data
        })
        app.globalData.livePusher = {
          "id": res.data.id,
          "name": res.data.name,
          "avatar": res.data.avatar
        }
      } else {
        wx.showModal({
          content: res.msg,
          complete(){
            wx.navigateBack()
          }
        })
      }
    }, function (err) {
      console.log(err)
      wx.showModal({
        content: 'Network exception, please try again later',
        complete(){
          wx.navigateBack()
        }
      })
    });
  },
  likeFn: function () {
    let that = this;
    http.Post("api/Mplike/Addlike", { "openid": app.globalData.openId, "mpactivities_id": that.data.evtId }, res => {
      if (res.code == 1) {
        let evt = that.data.evtInfo;
        let like = evt.isLike ? false : true;
        evt.isLike = like;
        that.setData({
          evtInfo: evt
        });
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
  showSharePopupFn: function () {
    this.setData({
      showSharePopup: true
    })
  },
  hideSharePopupFn: function () {
    this.setData({
      showSharePopup: false
    })
  },
  showPosterFn: function () {
    this.setData({
      showSharePopup: false,
      showPoster: true
    });
    wx.showLoading();
    this.getEvtImgFn();
  },
  hidePosterFn: function () {
    this.setData({
      showPoster: false
    })
  },
  getEvtImgFn: function () {
    let evtImg = this.data.eventImg;
    if (evtImg) {
      this.getQrCodeFn(evtImg);
    } else {
      let that = this;
      wx.downloadFile({
        url: that.data.evtInfo.avatar,
        success: function (res) {
          //console.log(res)
          if (res.statusCode === 200) {
            that.getQrCodeFn(res.tempFilePath);
            that.setData({
              eventImg: res.tempFilePath
            });
          } else {
            wx.hideLoading();
            wx.showModal({
              title: '',
              content: '资源加载失败，请稍后重试',
            })
          }
        }
      })
    }
  },
  getQrCodeFn: function (evtImgSrc) {
    let qr = this.data.qrCodeImg;
    if (qr) {
      this.drawPosterFn(evtImgSrc, qr);//真正的绘图方法
    } else {
      let that = this;
      wx.downloadFile({
        url: that.data.evtInfo.miniQR,
        success: function (res) {
          //console.log(res)
          if (res.statusCode === 200) {
            that.drawPosterFn(evtImgSrc, res.tempFilePath);//真正的绘图方法
            that.setData({
              qrCodeImg: res.tempFilePath
            });
          } else {
            wx.hideLoading();
            wx.showModal({
              title: '',
              content: '资源加载失败，请稍后重试',
            })
          }
        }
      })
    }
  },
  drawPosterFn: function (img, qr) {
    let that = this;
    let ctx = wx.createCanvasContext('poster');
    wx.createSelectorQuery().select('#poster').boundingClientRect(function (rect) {
      console.log(rect);
      // let w = rect.width;
      // let h = rect.height;
      let w = rect ? rect.width : 315;
      let h = rect ? rect.height : 540;
      that.setData({
        cvs: { "cw": w, "ch": h }
      });
      let oX = w * 0.14;
      let oY = h * 0.72;

      ctx.beginPath();//创建一个新路径
      if (img) {  //画视频海报图
        ctx.drawImage(img, 0.1 * w, 0.1 * h, 0.8 * w, 0.8 * w)
      }
      if (qr) {  //画小程序码
        ctx.drawImage(qr, w * 0.16, h * 0.76, w * 0.26, w * 0.26)
      }
      //填充文字
      ctx.setFontSize(16);
      ctx.setFillStyle('#333');
      ctx.setTextAlign('left');
      that.drawText(ctx, that.data.evtInfo.name, w * 0.1, h * 0.62, w * 0.8);
      ctx.setFontSize(14);
      ctx.fillText("长按保存图片", w * 0.54, h * 0.84);
    }).exec();

    setTimeout(function () {
      ctx.draw(false, function () {
        wx.hideLoading();
        wx.canvasToTempFilePath({
          canvasId: 'poster',
          success: (res) => {
            that.setData({
              poster: res.tempFilePath,
              showPoster: true
            })
          }
        });
      });
    }, 1000)
  },
  drawText: function (ctx, txts, x, y, w) {
    let chr = txts.split(""), temp = "", rows = [];
    for (let i = 0; i < chr.length; i++) {  //context.measureText(text).width  测量文本text的宽度
      if (ctx.measureText(temp).width < w && ctx.measureText(temp + (chr[i])).width <= w) {
        temp += chr[i];
      } else {
        rows.push(temp);
        temp = chr[i];
      }
    }
    rows.push(temp);
    for (let j = 0; j < rows.length; j++) {
      ctx.fillText(rows[j], x, y + (j + 1) * 20); //行高20
    }
  },
  save2AlbumFn: function () {
    let that = this;
    if (this.data.poster) {
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success() {
                that.saveImgFn()
              },
              fail() {
                wx.showModal({
                  title: '',
                  content: '是否授权允许小程序访问相册',
                  success(res) {
                    if (res.confirm) {
                      wx.openSetting({
                        success(res) {
                          console.log(res.authSetting)
                        }
                      })
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              }
            })
          } else {
            that.saveImgFn()
          }
        }
      })
    } else {
      wx.showModal({
        title: '',
        content: '海报生成失败，请返回重试',
      })
    }
  },
  saveImgFn: function () {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.poster,
      success: (res) => {
        wx.showModal({
          title: '',
          content: '图片保存成功',
        })
      },
      fail: (err) => {
        wx.showModal({
          title: '',
          content: '图片保存失败',
        })
      }
    })
  },
  recursiveFn(id){
    let that = this
    if(app.globalData.openId){
      that.getEvtInfoFn(id)
    }else{
      setTimeout(function(){
        that.recursiveFn(id)
      }, 300)
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      evtId: options.evtId
    });
    // this.getEvtInfoFn(options.evtId);
    this.recursiveFn(options.evtId);
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
    this.startCountdownFn();
    if (app.globalData.hasUserInfo) {
      this.setData({
        is_authorize_hidden: true
      })
    } else {
      this.setData({
        is_authorize_hidden: false
      })
    }
    if (!app.globalData.playing && wx.createLivePlayerContext('myPlayer').exitPictureInPicture) {
      console.log(wx.createLivePlayerContext('myPlayer'))
      wx.createLivePlayerContext('myPlayer').exitPictureInPicture()
    }
    if (!wx.createLivePlayerContext('myPlayer').exitPictureInPicture) {
      console.log("Your version of wechat does not support the function of live-player on small window")
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      timer: ""
    })
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
    let that = this;
    return {
      title: that.data.evtInfo.name,
      path: '/pages/evtDetail/evtDetail?evtId=' + that.data.evtId + '&shareby=' + app.globalData.openId,
      imageUrl: that.data.evtInfo.avatar
    }
  }
})