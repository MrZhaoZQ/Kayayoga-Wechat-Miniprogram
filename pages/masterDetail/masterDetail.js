// pages/masterDetail/masterDetail.js
// pages/master/master.js
const app = getApp()
const http = require("../../utils/http.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    masterId: "",
    masterInfo: {},
    showSharePopup: false,
    showPoster: false,
    liveEvtlist: {},
    videolist: [],
    page: 1,
    no_more: false
  },

  toHomeFn: function () {
    wx.switchTab({
      url: '../index/index'
    })
  },
  toVideoDetailFn: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../videoDetail/videoDetail?vId=' + id
    });
  },
  toEvtDetailFn: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../evtDetail/evtDetail?evtId=' + id
    });
  },
  followFn: function () {
    let that = this, id = this.data.masterId;
    http.Post("api/Mplike/Addlike", { "openid": app.globalData.openId, "mpteacher_id": id }, function (res) {
      if (res.code == 1) {
        let info = that.data.masterInfo;
        info.liked = info.liked == 0 ? 1 : 0;
        that.setData({
          masterInfo: info
        })
        wx.setStorage({
          key: 'mId',
          data: id,
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
  getMasterInfoFn: function (id) {
    let that = this;
    http.Post("api/Mpteacher/GetTeacherDetail", { "openid": app.globalData.openId, "id": id }, function (res) {
      //console.log(res);
      if (res.code == 1) {
        that.setData({
          masterInfo: res.data
        })
        wx.setNavigationBarTitle({
          title: res.data.name + "的介绍"
        })
      } else {
        wx.showModal({
          content: res.msg,
          complete: function(){
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
  getEvtlistFn: function () {
    let that = this;
    let prm = { "id": this.data.masterId, "openid": app.globalData.openId };
    http.Post("api/Mpactivities/GetActivityTeacher", prm, function (res) {
      if (res.code == 1) {
        let list = res.data
        for (let i in list) {
          list[i].time = list[i].start_time.substr(11, 5) + "~" + list[i].end_time.substr(11, 5);
        }
        that.setData({
          liveEvtlist: list
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
  getVideolistFn: function () {
    let that = this;
    let prm = { "id": this.data.masterId, "page": this.data.page, "pagesize": 10 };
    http.Post("api/Mpvideo/getTeacherVideos", prm, function (res) {
      if (res.code == 1) {
        let list = res.data;
        if (list.length < 1) {
          that.setData({
            no_more: true
          });
        } else {
          let arr = that.data.videolist;
          let pg = that.data.page + 1;
          for (let i in list) {
            arr.push(list[i]);
          }
          that.setData({
            videolist: arr,
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
    this.getMasterImgFn();
  },
  hidePosterFn: function () {
    this.setData({
      showPoster: false
    })
  },
  getMasterImgFn: function () {
    let mImg = this.data.masterImg;
    if (mImg) {
      this.getQrCodeFn(mImg);
    } else {
      let that = this;
      wx.downloadFile({
        url: that.data.masterInfo.avatar,
        success: function (res) {
          if (res.statusCode === 200) {
            that.getQrCodeFn(res.tempFilePath);
            that.setData({
              masterImg: res.tempFilePath
            });
          } else {
            //console.log("download fail")
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
  getQrCodeFn: function (mImgSrc) {
    let qr = this.data.qrCodeImg;
    if (qr) {
      this.drawPosterFn(mImgSrc, qr);//真正的绘图方法
    } else {
      let that = this, mQR = that.data.masterInfo.miniQR;
      mQR = mQR.indexOf("http") > -1 ? mQR : "https://api.maniyoga.fugumobile.cn/public" + mQR;
      wx.downloadFile({
        url: mQR,
        success: function (res) {
          if (res.statusCode === 200) {
            that.drawPosterFn(mImgSrc, res.tempFilePath);//真正的绘图方法
            that.setData({
              qrCodeImg: res.tempFilePath
            });
          } else {
            //console.log("download fail")
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
      that.drawText(ctx, that.data.masterInfo.name, w * 0.1, h * 0.62, w * 0.8);
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options)
    this.setData({
      masterId: options.mId,
      released: app.globalData.released
    });
    this.getMasterInfoFn(options.mId);
    this.getEvtlistFn();
    this.getVideolistFn();
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
      this.getVideolistFn();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this;
    return {
      title: that.data.masterInfo.name,
      path: '/pages/masterDetail/masterDetail?mId=' + that.data.masterId + '&shareby=' + app.globalData.openId,
      imageUrl: that.data.masterInfo.avatar
    }
  }
})