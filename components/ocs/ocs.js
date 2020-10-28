// components/ocs/ocs.js
var app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pageName: {
      type: String,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleContactFn () {
      console.log(this.properties.pageName)
    },
    moveFn: function(e) {
      var w = app.globalData.ww, h = app.globalData.wh;
      var half = app.globalData.ww / 750 * 127 / 2;
      var x = e.touches[0].clientX - half, y = e.touches[0].clientY - half;
      // console.log(half,x,y);
      if (x < 0) x = 0;
      if (x > w - 2 * half) x = w - 2 * half;
      if (y < 0) y = 0;
      if (y > h - 2 * half) y = h - 2 * half;
      this.setData({
        x: x + "px",
        y: y + "px"
      })
    }
  }
})
