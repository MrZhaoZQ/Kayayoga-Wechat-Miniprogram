// pages/aboutus/aboutus.js
const app = getApp()
const http = require("../../utils/http.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addrList: [
      { name: "苏河店:", addr: "上海南苏州路381号2F", tels: "021-31006866、18616510748" },
      { name: "静安店:", addr: "上海延平路135号B605", tels: "021-31006886、18221750357" },
      { name: "八佰伴店:", addr: "浦东新区张扬路579号三鑫世界商厦9楼南区（八佰伴商厦对面）", tels: "021-31006697" }
    ],
    selectable: true,
    fullname: "",
    phone: "" ,
    email: "",
    msg: ""
  },

  //functions
  submitFn(){
    let dt = this.data;
    if (dt.fullname == "") {
      wx.showModal({
        title: '',
        content: '请输入姓名'
      });
      return false;
    }
    if (dt.phone == "" || /^1[3456789]\d{9}$/.test(dt.phone) == false) {
      wx.showModal({
        title: '',
        content: '请输入正确的联系电话'
      });
      return false;
    }
    if (dt.email == "") {
      wx.showModal({
        title: '',
        content: '请输入正确的联系邮箱'
      });
      return false;
    }
    if (dt.msg == "") {
      wx.showModal({
        title: '',
        content: '请输入留言内容'
      });
      return false;
    }
    let that = this;
    http.Post("api/Mpmessage/add", { 
      "name": dt.fullname,
      "tel": dt.phone,
      "email": dt.email,
      "message": dt.msg
    }, function (res) {
      wx.showModal({
        title: '',
        content: '谢谢，您的信息已成功提交！\r\n 我们会尽快联系您！',
        complete: function () {
          wx.switchTab({
            url: '../index/index'
          })
        }
      })
    }, function (err) {
      wx.showModal({
        title: '',
        content: err
      })
    })
  },
  inputNameFn(e){
    this.setData({
      fullname: e.detail.value
    })
  },
  inputPhoneFn(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  inputEmailFn(e) {
    this.setData({
      email: e.detail.value
    })
  },
  inputMsgFn(e) {
    this.setData({
      msg: e.detail.value
    })
  },
  saveQRcodeFn() {
    if (this.data.qrCode) {
      this.save2albumFn(res.tempFilePath);
    } else {
      let that = this;
      wx.downloadFile({
        url: "https://api.maniyoga.fugumobile.cn/public/imgs/gzh.jpg",
        success: function (res) {
          if (res.statusCode === 200) {
            that.save2albumFn(res.tempFilePath);
            that.setData({
              qrCode: res.tempFilePath
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
  save2albumFn(imgSrc){
    let that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              that.saveFn(imgSrc)
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
          that.saveFn(imgSrc)
        }
      }
    })
  },
  saveFn(imgPath) {
    wx.saveImageToPhotosAlbum({
      filePath: imgPath,
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