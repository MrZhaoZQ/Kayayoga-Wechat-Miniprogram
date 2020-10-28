// pages/membership/membership.js
const app = getApp()
const http = require("../../utils/http.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_authorize_hidden: true,
    page_name: "membership",
    tabbars: ["会员包", "我的会员资格"],
    activeIndex: 0,
    myaccount: 0,
    phone: '',
    mylist: [[], []],
    page: [1, 1],
    no_more: [false, false]
  },

  tabbarFn: function (e) {
    let ind = e.currentTarget.id;
    this.setData({
      activeIndex: ind
    });
    this.getListFn(ind);
  },
  getPhoneNumberFn(e){
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
    if (!e.detail.iv || !e.detail.encryptedData) {
      wx.showModal({ content: '获取手机号失败，请稍后重试' })
      return false
    }
    let that = this;
    wx.checkSession({
      success () {
        //session_key 未过期，并且在本生命周期一直有效
        that.decryptPhoneNumberFn(app.globalData.sessionKey, e.detail.iv, e.detail.encryptedData)
      },
      fail () {
        // session_key 已经失效，需要重新执行登录流程
        wx.login({//重新登录
          success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            http.Post("api/Mpmanage/authorization", { "code": res.code }, function (res) {
              //console.log(res);
              if (res.code == 1) {
                app.globalData.sessionKey = res.data.session_key;
                app.globalData.openId = res.data.openid;
                that.decryptPhoneNumberFn(app.globalData.sessionKey, e.detail.iv, e.detail.encryptedData);
              } else {
                console.log(res.errmsg)
              }
            }, function (err) {
              console.log(err)
            });
          }
        });
      }
    })
  },
  decryptPhoneNumberFn(sk, iv, dt){
    let that = this;
    http.Post("api/Mpmanage/bindingPhone", {
      "session": sk,
      "iv": iv,
      "encryptedData": dt,
      "openid": app.globalData.openId
    }, function (res) {
      console.log(res)
      if (res.code == 1) {
        that.setData({
          phone: res.data.mobile ? res.data.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : ''
        })
      } else {
        wx.showModal({ content: res.msg })
      }
    }, function (err) {
      wx.showModal({ content: err })
    });
  },
  unbindFn(){
    let that = this;
    http.Post("api/Mpmanage/unBindingPhone", { "openid": app.globalData.openId }, function (res) {
      if (res.code == 1) {
        that.setData({ phone: '' })
      } else {
        wx.showModal({ content: res.msg })
      }
    }, function (err) {
      wx.showModal({ content: err })
    });
  },
  clickCartFn(e){
    this.creatOrderFn(e.currentTarget.dataset.id);
  },
  getMyaccountFn: function () {
    let that = this;
    http.Post("", { "openid": app.globalData.openId }, function (res) {
      if (res.code == 1) {
        that.setData({
          myaccount: res.data
        })
      } else {
        wx.showModal({ content: res.msg })
      }
    }, function (err) {
      wx.showModal({ content: err })
    });
  },
  getListFn: function (active) {
    let apiUrls = ["api/Mptopuppackage/GetPackageInfo", "api/Mporder/getOrderList"];
    let pgs = this.data.page;
    let nms = this.data.no_more;
    let prm = { "openid": app.globalData.openId, "page": pgs[active], "pagesize": "10" };
    let that = this;
    http.Post(apiUrls[active], prm, function (res) {
      //console.log(res);
      if (res.code == 1) {
        if (active==1) {
          that.setData({
            myaccount: res.data.balance,
            phone: res.data.mobile ? res.data.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : ''
          })
        }
        let  list = active==1 ? res.data.History : res.data;
        if (list.length < 1) {
          nms[active] = true
          that.setData({
            no_more: nms
          })
        } else {
          let more = that.data.mylist;
          pgs[active] += 1;
          for (let i in list) {
            more[active].push(list[i]);
          }
          that.setData({
            mylist: more,
            page: pgs
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
  creatOrderFn: function (id) {
    let that = this;
    http.Post("api/Mporder/createorder", { "openid": app.globalData.openId, "packageID": id }, function (res) {
      if (res.code == 1) {
        if (res.data.paytype == 1) {
          that.checkPaymentFn(res.data.ordernumber)
        } else {
          wx.showModal({ content: '购买成功' })
        }
      } else {
        wx.showModal({ content: res.msg })
      }
    }, function (err) {
      wx.showModal({ content: err })
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
              content: '付款成功'
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
        wx.showModal({ content: res.msg })
      }
    }, function (err) {
      wx.showModal({ content: err })
    });
  },
  onMyEvent: function (e) {
    app.globalData.hasUserInfo = 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getListFn(0);
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
    
    // let that = this;
    // wx.getStorage({
    //   key: 'membership',
    //   success(res) {
    //     console.log(res)
    //     if (res.data == "mutation") {//判断是否有新的购买记录
    //       //如果有新的购买记录，则重新获取购买记录的数据
          
    //       wx.removeStorage({key: 'membership'})
    //     }
    //   }
    // })
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
    let ai = this.data.activeIndex
    if (!this.data.no_more[ai]) {
      this.getListFn(ai);
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