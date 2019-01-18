// miniprogram/pages/login/login.js
var base64 = require('../../js/base64.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //从缓存拿token，实现自动登录，过期自动清除缓存
    wx.getStorage({
      key: 'outTime',
      success: function (res) {
        var timestamp = Date.parse(new Date());
        var timestampCache = res.data.timestampCache;
        if ((timestamp - timestampCache) > res.data.outTime) {
          console.log("过期了");
          wx.showToast({
            title: '登录信息已过期！请重新登录',
            icon: 'none',
            image: '',
            duration: 1500,
            mask: true,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
          wx.removeStorage({
            key: 'token',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
          wx.removeStorage({
            key: 'outTime',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
    wx.getStorage({
      key: 'token',
      success: function (res) {
        if (res.data) {
          app.globalData.token = res.data;
          wx.navigateTo({
            url: '../taskList/taskList',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
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

  },

  fromSubmit: function (e) {
    if (e.detail.value.userName.length == 0 || e.detail.value.password.length == 0) {
      wx.showToast({
        title: '用户名和密码不能为空',
        icon: 'none',
        image: '',
        duration: 2000,
        mask: true,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
    } else {
      let port = app.globalData.port;
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        image: '',
        duration: 2000,
        mask: true,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
      wx.request({
        url: port+'/api/auth',
        data: {
          username: e.detail.value.userName,
          password: base64.CusBASE64.encoder(e.detail.value.password)
        },
        header: {
          'content-type': 'application/json'
        },
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success: function (res) {
          if(res.data.code === 0){
            app.globalData.token = res.data.token;
            wx.setStorage({//缓存token
              key: 'token',
              data: res.data.token,
              success: function (res) { },
              fail: function (res) { },
              complete: function (res) { },
            })
            var timestampCache = Date.parse(new Date());
            wx.setStorage({//存一个过期时间
              key: 'outTime',
              data: {
                timestampCache: timestampCache,
                outTime: 1200000
              },
              success: function (res) { },
              fail: function (res) { },
              complete: function (res) { },
            })
            wx.navigateTo({
              url: '../taskList/taskList',
              success: function (res) { },
              fail: function (res) { },
              complete: function (res) { },
            })
          }else{
            wx.showToast({
              title: '用户名或密码错误',
              icon: 'none',
              image: '',
              duration: 2000,
              mask: true,
              success: function (res) { },
              fail: function (res) { },
              complete: function (res) { },
            })
          }
        },
        fail: function (res) { console.log(res) },
        complete: function (res) { },
      })
    }
  }
})