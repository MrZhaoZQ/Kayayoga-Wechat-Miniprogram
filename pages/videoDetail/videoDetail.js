// pages/videoDetail/videoDetail.js
const http = require("../../utils/http.js")
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_authorize_hidden: true,
    page_name: "video",
    controls: true,
    showCenterPlayBtn: false,
    showFullscreenBtn: true,
    gesture: true,
    playing: false,
    canPlay: true,
    vInfo: {},
    mInfo: {},
    recommlist: [],
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
  toMoreFn: function () {
    wx.navigateTo({
      url: '../more/more?id=1&category=为你推荐'
    })
  },
  getVideoInfoFn: function (id, paid) {
    let that = this;
    http.Post("api/Mpvideo/GetVideoDetail", { "openid": app.globalData.openId, "id": id }, function (res) {
      if (res.code == 1) {
        that.setData({
          vInfo: res.data
        });
        if (paid) return false;//paid means user has bought the video
        that.getMasterInfoFn(res.data.mpteacher_ids);
        that.getRecommlistFn(res.data.mpvideotype_ids);
      } else {
        wx.showModal({
          title: '',
          content: res.msg,
          complete(){
            wx.navigateBack()
          }
        })
      }
    }, function (err) {
      console.log(err)
      wx.showModal({
        title: '',
        content: 'Network exception, please try again later',
        complete(){
          wx.navigateBack()
        }
      })
    });
  },
  getMasterInfoFn: function (id) {
    let that = this;
    http.Post("api/Mpteacher/GetTeacherDetail", { "openid": app.globalData.openId, "id": id}, function (res) {
      if (res.code == 1) {
        that.setData({
          mInfo: res.data
        })
      } else {
        wx.showModal({
          title: '',
          content: res.msg,
          complete(){
            wx.navigateBack()
          }
        })
      }
    }, function (err) {
      console.log(err)
      wx.showModal({
        title: '',
        content: 'Network exception, please try again later',
        complete(){
          wx.navigateBack()
        }
      })
    });
  },
  countFn: function () {
    let that = this;
    http.Post("api/Mpplay/addPlay", { "openid": app.globalData.openId, "mpvideo_id": that.data.vId }, function (res) {
      if (res.code == 1) {
        //播放或观看次数+1
      } else {
        console.log(res.msg)
      }
    }, function (err) {
      console.log(res.msg)
    });
  },
  playBtnFn: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
    if (this.data.playing) {
      this.data.videoCtx.pause();
    } else {
      this.data.videoCtx.play();
      this.data.videoCtx.requestFullScreen({"direction": 0});
    }
  },
  playingFn: function () {
    this.setData({
      playing: true
    });
    this.countFn();
  },
  pauseFn: function (e) {
    this.setData({
      playing: false
    })
  },
  endedFn: function (e) {
    this.setData({
      playing: false
    })
    let that = this
    if (!this.data.vInfo.file) {
      wx.showModal({
        title: '',
        content: '当前为试看视频，请付费'+that.data.vInfo.price+'元购买观看完整版',
        confirmText: '付款',
        success(res) {
          if (res.confirm) {
            //console.log('用户点击付款');
            that.creatOrderFn();
          } else if (res.cancel) {
            //console.log('用户点击取消');
          }
        }
      })
    }
  },
  buyFn(){
    let that = this;
    if (this.data.vInfo.price > 0) {
      wx.showModal({
        content: '您确定要购买这个金额为'+that.data.vInfo.price+'元的视频吗',
        confirmText: '是',
        cancelText: '否',
        success(rs) {
          if (rs.confirm) that.creatOrderFn()
        }
      })
    }
  },
  previewFn: function (e) {   //bindtimeupdate="previewFn"
    console.log(e.detail);
    if (e.detail.currentTime>=6){
      //this.data.videoCtx.seek(6);
      this.data.videoCtx.pause();
      this.setData({
        canPlay: false
      });
      let that = this;
      if(!this.data.canPlay){
        //提示当前视频只能试看xx秒，请付费继续观看
      }
    }
  },
  creatOrderFn: function () {
    let that = this;
    http.Post("api/Mporder/createorder", { "openid": app.globalData.openId, "videoID": that.data.vId, "shareby": app.globalData.shareBy }, function (res) {
      if (res.code == 1) {
        if (res.data.paytype == 1) {
          that.checkPaymentFn(res.data.ordernumber)
        } else {
          that.getVideoInfoFn(that.data.vId, 'paid')
          wx.showModal({ content: '购买成功，您已获得观看此视频完整版的特权' })
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
      //console.log(res)
      if (res.code == 1) {
        wx.requestPayment({
          "timeStamp": res.data.timestamp,
          "nonceStr": res.data.nonceStr,
          "package": res.data.package,
          "signType": res.data.signType,
          "paySign": res.data.paySign,
          success(rs) {
            console.log(rs)
            that.getVideoInfoFn(that.data.vId, 'paid')
            wx.showModal({
              content: '付款成功，您已获得观看此视频完整版的特权'
            })
          },
          fail(err) {
            console.log(err);
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
  getRecommlistFn: function (typeId) {
    let that = this;
    let prm = { "id": typeId, "page": 1, "pagesize": 5 };
    http.Post("api/Mpvideo/getSeamCategoryVideos", prm, function (res) {
      if (res.code == 1) {
        that.setData({
          recommlist: res.data
        });
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
  likeVofListFn: function (e) {
    let i = e.currentTarget.dataset.i;
    let that = this, list = that.data.recommlist;
    http.Post("api/Mplike/Addlike", { "openid": app.globalData.openId, "mpvideo_id": list[i].id }, res => {
      //console.log(res)
      if (res.code == 1) {
        list[i].isLike = list[i].isLike ? false : true;
        list[i].isLike ? list[i].like_count++ : list[i].like_count--;
        that.setData({
          recommlist: list
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
  likeFn: function(){
    let that = this;
    http.Post("api/Mplike/Addlike", { "openid": app.globalData.openId, "mpvideo_id": that.data.vId }, res => {
      if (res.code == 1) {
        let v = that.data.vInfo;
        if (v.isLike) {
          v.isLike = false
          v.like_count -= 1
        } else {
          v.isLike = true
          v.like_count += 1
        }
        that.setData({
          vInfo: v
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
  colletFn: function () {
    let that = this;
    http.Post("api/MpCollect/AddCollect", { "openid": app.globalData.openId, "mpvideo_id": that.data.vId }, res => {
      if (res.code == 1) {
        let v = that.data.vInfo;
        let collet = v.isCollection ? false : true;
        v.isCollection = collet;
        that.setData({
          vInfo: v
        });
        wx.setStorage({
          key: "mine",
          data: "mutation"
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
    this.getVideoImgFn();
  },
  hidePosterFn: function () {
    this.setData({
      showPoster: false
    })
  },
  getVideoImgFn: function () {
    let vImg = this.data.videoImg;
    if (vImg) {
      this.getQrCodeFn(vImg);
    } else {
      let that = this;
      wx.downloadFile({
        url: that.data.vInfo.avatar,
        success: function (res) {
          if (res.statusCode === 200) {
            that.getQrCodeFn(res.tempFilePath);
            that.setData({
              videoImg: res.tempFilePath
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
  getQrCodeFn: function (vImgSrc) {
    let qr = this.data.qrCodeImg;
    if (qr) {
      this.drawPosterFn(vImgSrc, qr);//真正的绘图方法
    } else {
      let that = this;
      wx.downloadFile({
        url: that.data.vInfo.miniQR,
        success: function (res) {
          if (res.statusCode === 200) {
            that.drawPosterFn(vImgSrc, res.tempFilePath);//真正的绘图方法
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
      that.drawText(ctx, that.data.vInfo.name, w * 0.1, h * 0.62, w * 0.8);
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
    // for (let j = 0; j < 6; j++) { //超出6行，加...
    //   var str = rows[j];
    //   if (j == 5) {
    //     str = str.substring(0, str.length - 1) + '...';
    //   }
    //   ctx.fillText(str, x, y + (j + 1) * 16);
    // }
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
      that.getVideoInfoFn(id)
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
      vId: options.vId,
      videoCtx: wx.createVideoContext("video"),
      released: app.globalData.released
    });
    // console.log(options.vId);
    // this.getVideoInfoFn(options.vId);
    this.recursiveFn(options.vId);
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
    let that = this;
    return {
      title: that.data.vInfo.name,
      path: '/pages/videoDetail/videoDetail?vId=' + that.data.vId + '&shareby=' + app.globalData.openId,
      imageUrl: that.data.vInfo.avatar
    }
  }
})