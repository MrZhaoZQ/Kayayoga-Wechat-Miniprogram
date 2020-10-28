// pages/livePlayer/livePlayer.js
const app = getApp()
const http = require("../../utils/http.js")

var lastFrameTime = 0;
var ctx = null;
var factor = {
  speed: .008, // 运动速度，值越小越慢
  t: 0 //  贝塞尔函数系数
};
var timer = null; // 循环定时器

Page({

  /**
   * 页面的初始数据
   */
  data: {
    backTop: '',
    liveUrl: "",
    pipmode: ["push", "pop"],
    playing: false,
    connecting: false,
    current: 1,
    msg: "",
    scrollTop: 566,//scroll-view高度为566rpx
    btnStyle: '',
    hideCanvas: false,
    viewers: [],
    comments: []
  },

  backFn() {
    wx.navigateBack()
  },
  mySwiperChangeFn(e){
    this.setData({
      current: e.detail.current,
      hideCanvas: true
    })
  },
  statechange(e) {
    console.log('live-player code:', e.detail.code)
    let that = this
    if (!this.data.playing && e.detail.code == 2004) {
      this.setData({
        playing: true
      })
      app.globalData.playing = true
    }
    // if (this.data.playing && e.detail.code == -2301) {
    if (e.detail.code == -2301) {
      this.setData({
        playing: false
      })
      app.globalData.playing = false
      wx.showModal({
        content: '直播活动已结束，感谢您的观看',
        complete(){
          wx.redirectTo({ url: '../evtDetail/evtDetail?evtId=' + that.data.evtId })
        }
      })
    }
  },
  error(e) {
    console.error('live-player error:', e.detail.errMsg)
  },
  enterPIPFn() {
    app.globalData.onPIPmode = true
  },

  tapLikeBtnFn: function () {
    //点击心形的时候动画效果
    let that = this;
    ctx.clearRect(0, 0, 90, 400);
    this.setData({
      btnStyle: 'transform: scale(1.3);',
      hideCanvas: false
    })
    setTimeout(function () {
      that.setData({
        btnStyle: 'transform: scale(1);'
      })
    }, 500)
    this.startDraw();
  },
  startDraw: function () {
    this.drawImage([[{ x: 30, y: 400 }, { x: 70, y: 300 }, { x: -50, y: 150 }, { x: 30, y: 0 }], [{ x: 30, y: 400 }, { x: 30, y: 300 }, { x: 80, y: 150 }, { x: 30, y: 0 }], [{ x: 30, y: 400 }, { x: 0, y: 90 }, { x: 80, y: 100 }, { x: 30, y: 0 }]])
  },
  drawImage: function (dt) {
    let that = this;

    var p10 = dt[0][0]; // 三阶贝塞尔曲线起点坐标值
    var p11 = dt[0][1]; // 三阶贝塞尔曲线第一个控制点坐标值
    var p12 = dt[0][2]; // 三阶贝塞尔曲线第二个控制点坐标值
    var p13 = dt[0][3]; // 三阶贝塞尔曲线终点坐标值

    var p20 = dt[1][0];
    var p21 = dt[1][1];
    var p22 = dt[1][2];
    var p23 = dt[1][3];

    var p30 = dt[2][0];
    var p31 = dt[2][1];
    var p32 = dt[2][2];
    var p33 = dt[2][3];

    var t = factor.t;

    /*计算多项式系数*/
    var cx1 = 3 * (p11.x - p10.x);
    var bx1 = 3 * (p12.x - p11.x) - cx1;
    var ax1 = p13.x - p10.x - cx1 - bx1;

    var cy1 = 3 * (p11.y - p10.y);
    var by1 = 3 * (p12.y - p11.y) - cy1;
    var ay1 = p13.y - p10.y - cy1 - by1;

    /*计算xt yt坐标值 */
    var xt1 = ax1 * (t * t * t) + bx1 * (t * t) + cx1 * t + p10.x;
    var yt1 = ay1 * (t * t * t) + by1 * (t * t) + cy1 * t + p10.y;

    /** 计算多项式系数*/
    var cx2 = 3 * (p21.x - p20.x);
    var bx2 = 3 * (p22.x - p21.x) - cx2;
    var ax2 = p23.x - p20.x - cx2 - bx2;

    var cy2 = 3 * (p21.y - p20.y);
    var by2 = 3 * (p22.y - p21.y) - cy2;
    var ay2 = p23.y - p20.y - cy2 - by2;

    /*计算xt yt坐标值*/
    var xt2 = ax2 * (t * t * t) + bx2 * (t * t) + cx2 * t + p20.x;
    var yt2 = ay2 * (t * t * t) + by2 * (t * t) + cy2 * t + p20.y;


    /** 计算多项式系数*/
    var cx3 = 3 * (p31.x - p30.x);
    var bx3 = 3 * (p32.x - p31.x) - cx3;
    var ax3 = p33.x - p30.x - cx3 - bx3;

    var cy3 = 3 * (p31.y - p30.y);
    var by3 = 3 * (p32.y - p31.y) - cy3;
    var ay3 = p33.y - p30.y - cy3 - by3;

    /*计算xt yt坐标值*/
    var xt3 = ax3 * (t * t * t) + bx3 * (t * t) + cx3 * t + p30.x;
    var yt3 = ay3 * (t * t * t) + by3 * (t * t) + cy3 * t + p30.y;
    factor.t += factor.speed;
    ctx.drawImage("../../imgs/heart1.png", xt1, yt1, 30, 30);
    ctx.drawImage("../../imgs/heart2.png", xt2, yt2, 30, 30);
    ctx.drawImage("../../imgs/heart3.png", xt3, yt3, 30, 30);
    ctx.draw();
    if (factor.t > 1) {
      factor.t = 0;
      that.cancelTimer(timer, false);//传入true动画重复
    } else {
      timer = that.requestAnimationFrame(function () {
        that.drawImage([[{ x: 30, y: 400 }, { x: 70, y: 300 }, { x: -50, y: 150 }, { x: 30, y: 0 }], [{ x: 30, y: 400 }, { x: 30, y: 300 }, { x: 80, y: 150 }, { x: 30, y: 0 }], [{ x: 30, y: 400 }, { x: 0, y: 90 }, { x: 80, y: 100 }, { x: 30, y: 0 }]])
      })
    }
  },
  requestAnimationFrame(callback) {//不断绘制图片到cavans
    var currTime = new Date().getTime();
    //手机屏幕刷新率一般为60Hz，大概16ms刷新一次，这里为了使页面看上去更流畅自然,通过改变timedis的值可以控制动画的快慢
    var timedis = 16 - (currTime - lastFrameTime)
    var timeToCall = Math.max(0, timedis);
    var id = setTimeout(callback, timeToCall);
    lastFrameTime = currTime + timeToCall;
    return id;
  },
  cancelTimer(timer, isrepeat) {//清除定时器
    clearTimeout(timer);
    if (isrepeat) {
      this.startDraw()
    } else {//如果不重复动画则将图片回到原始位置
      ctx.drawImage("../../imgs/heart1.png", 30, 400, 30, 30);
      ctx.drawImage("../../imgs/heart2.png", 30, 400, 30, 30);
      ctx.drawImage("../../imgs/heart3.png", 30, 400, 30, 30);
      ctx.draw();
    }
  },
  sendFn() {
    if (!this.data.msg) return false;
    //socket发送信息
    let that = this
    let dt = {
      "openid": app.globalData.openId,
      "eventid": this.data.evtId,
      "msg": escape(that.data.msg),
      "type": "2"
    }
    console.log("before:" + dt)
    wx.sendSocketMessage({
      data: JSON.stringify(dt),
      success: function(res){
        that.setData({
          msg: ""
        })
        setTimeout(()=>{
          that.setData({
            msg: ""
          })
        },100)
      }
    })
  },
  inputFn(e) {
    this.setData({
      msg: e.detail.value
    })
  },
  getMoreViewerFn() {//滚动到底部/右边时触发

  },
  getMoreMsgFn() {//滚动到顶部/左边时触发

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options)
    let rect = wx.getMenuButtonBoundingClientRect();
    this.setData({
      backTop: rect.top ? rect.top : '',
      evtId: options.evtId,
      liveUrl: options.liveUrl,
      pusher: app.globalData.livePusher
    })
    let that = this

    //建立连接
    wx.connectSocket({
      url: 'wss://maniyoga.fugumobile.cn:2346'
    })

    //连接成功
    wx.onSocketOpen(function (res) {
      //console.log(res)
      let dt = {
        "openid": app.globalData.openId,
        "eventid": that.data.evtId,
        "msg": escape(""), //聊天消息
        "type": "1" //1:获取历史聊天记录, 2:发聊天消息, 3:点赞, 4:退出直播
      }
      wx.sendSocketMessage({
        data: JSON.stringify(dt),
      })
      that.setData({
        connecting: true
      })
    })

    //接收数据
    wx.onSocketMessage(function (res) {
      console.log(JSON.parse(res.data));
      let dt = JSON.parse(res.data), list = that.data.comments;
      if (dt.comment && Object.prototype.toString.call(dt.comment) == "[object Array]") {
        for (let i in dt.comment) {
          dt.comment[i].msg = unescape(dt.comment[i].msg)
          list.push(dt.comment[i])
        }
      } else if (dt.comment && Object.prototype.toString.call(dt.comment) == "[object Object]") {
        list.push(dt.comment)
      }
      let users = dt.user ? dt.user : that.data.viewers;
      that.setData({
        viewers: users,
        comments: list,
        scrollTop: list.length * 566
      })
    })

    //连接失败
    wx.onSocketError(function () {
      console.log('websocket连接失败！');
    })

    //连接关闭
    wx.onSocketClose((res) => {
      console.log(res)
      that.setData({
        connecting: false
      })
      //1000=>normal closure, 1001=> stream end encountered 1006=>abnormal closure
      if (res.code == 10000 || res.code == 1001) {
        return false
      } else {
        wx.connectSocket({
          url: 'wss://maniyoga.fugumobile.cn:2346'
        })
      }
    })

    ctx = wx.createCanvasContext('mycanvas')//获取canvas实例
    app.globalData.playing = this.data.playing
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
    console.log("hide")
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("unload")
    let that = this;
    if (timer != null) {
      that.cancelTimer(timer, false)
    }
    // wx.sendSocketMessage({
    //   data: JSON.stringify({ "openid": app.globalData.openId, "eventid": that.data.evtId, "msg": "", "type": "4" }),
    // });
    wx.closeSocket();
    if (wx.createLivePlayerContext('myPlayer').exitPictureInPicture) {
      console.log('exitPictureInPicture because of page unload')
      wx.createLivePlayerContext('myPlayer').exitPictureInPicture()
      app.globalData.onPIPmode = false
    }
    app.globalData.playing = false
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
      title: app.globalData.liveEvt.name ? app.globalData.liveEvt.name : '',
      path: '/pages/evtDetail/evtDetail?evtId=' + that.data.evtId + '&shareby=' + app.globalData.openId,
      imageUrl: app.globalData.liveEvt.avatar ? app.globalData.liveEvt.avatar : 'https://api.maniyoga.fugumobile.cn/public/imgs/share.jpg'
    }
  }
})