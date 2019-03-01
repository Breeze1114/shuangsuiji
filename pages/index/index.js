// miniprogram/pages/login/login.js
var base64 = require('../../js/base64.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userName:"",
    password:""
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
          console.log("登录信息过期");
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
          console.log("token",res);
          app.globalData.token = res.data;
          app.globalData.authorization = 'Bearer ' + res.data;
          wx.redirectTo({
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '登录',
    })
  },

  fromSubmit: function (e) {
    // var userName = e.detail.value.userName;
    // var password = e.detail.value.password;
    var that = this;
    var userName = that.data.userName;
    var password = that.data.password;
    if (userName.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名和密码不能为空',
        icon: 'none',
        image: '',
        duration: 2000,
        mask: true
      })
    } else {
      wx.showToast({
        title: '登录中',
        icon: 'loading',
        duration: 60000,
        mask: true,
      })
      let port = app.globalData.port;
      wx.request({
        url: port+'/api/auth',
        data: {
          username: userName,
          password: base64.CusBASE64.encoder(password)
        },
        header: {
          'content-type': 'application/json'
        },
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success: function (res) {
          if(res.data.code === 0){
            console.log(res);
            wx.hideToast();
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              image: '',
              duration: 500,
              mask: true
            })
            app.globalData.token = res.data.token;
            app.globalData.authorization = 'Bearer ' + res.data.token;
            wx.setStorage({//缓存token
              key: 'token',
              data: res.data.token,
              success: function (res) {console.log('缓存token成功')},
              fail: function (res) {
                wx.showModal({
                  title: '系统提示',
                  content: '缓存本地登录信息失败',
                  showCancel: false,
                  confirmText: '知道了'
                })
              },
              complete: function (res) { },
            })
            var timestampCache = Date.parse(new Date());
            wx.setStorage({//存一个过期时间
              key: 'outTime',
              data: {
                timestampCache: timestampCache,
                outTime: 604800000 //一个星期
              }
            })
            //缓存用户姓名
            wx.setStorage({
              key: 'userName',
              data: res.data.fullname,
            })
            setTimeout(function(){
              wx.redirectTo({
                url: '../taskList/taskList'
              })
            },500)
          }else{
            wx.showToast({
              title: '用户名或密码错误',
              icon: 'none',
              image: '',
              duration: 2000,
              mask: true
            })
          }
        },
        fail: function (res) {
          console.log(res);
          if (res.errMsg == 'request:fail socket time out timeout:60000') {
            wx.showModal({
              title: '登录超时',
              content: '请检查网络状态是否良好',
              showCancel: false,
              confirmText: '知道了',
              success: function(res){
                if(res.confirm){
                  wx.hideToast();
                }
              }
            })
          }
        },
        complete: function (res) { },
      })
    }
  },

  userNameChange: function(e){
    var that = this;
    that.setData({
      userName: e.detail.value,
    })
  },

  psdChange: function (e) {
    var that = this
    that.setData({
      password: e.detail.value,
    })
  }
})