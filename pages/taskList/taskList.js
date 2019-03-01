// miniprogram/pages/taskList/taskList.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    token: app.globalData.token,
    taskList: {},
    userName:"" //用户名
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this//搭桥，直接用this访问不了
    let port = app.globalData.port;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      image: '',
      duration: 60000,
      mask: true,
    })
    // var load = that.verifyLoginStatus();debugger;
    // if(load){
      setTimeout(function () {
        wx.request({
          url: port + '/api/app/checkUser/taskList',
          data: {
            page: 1,
            rows: 10
          },
          header: { 'Authorization': app.globalData.authorization },
          method: 'GET',
          dataType: 'json',
          responseType: 'text',
          success: function (res) {
            if (res.data.code == 0) {
              wx.hideToast();
              wx.showToast({
                title: '加载成功',
                icon: 'success',
                duration: 500,
                mask: true,
              })
              that.data.taskList = res.data.data
              setTimeout(function () {
                that.setData({
                  taskList: res.data.data
                })
                wx.hideToast();
              }, 250)
            } else {
              wx.showModal({
                title: '系统提示',
                content: res.data.msg,
                showCancel: false,
                confirmText: '知道了',
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { },
              })
            }
          },
          fail: function (res) {
            if (res.errMsg == 'request:fail socket time out timeout:60000') {
              wx.showModal({
                title: '加载超时',
                content: '请检查网络状态是否良好',
                showCancel: false,
                confirmText: '知道了',
                success: function (res) {
                  if (res.confirm) {
                    wx.hideToast();
                  }
                }
              })
            } else {
              wx.showModal({
                title: '系统提示',
                content: '获取任务列表失败,请联系管理员',
                showCancel: false,
                confirmText: '知道了',
                success: function (res) {
                  if (res.confirm) {
                    wx.hideToast();
                  }
                }
              })
            }
          },
          complete: function (res) { },
        })
      }, 500)
    // }
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
    var that = this;
    wx.showNavigationBarLoading();
    setTimeout(function(){
      wx.hideNavigationBarLoading();
    },500)
    wx.setNavigationBarTitle({
      title: '任务列表',
    })
    wx.getStorage({
      key: 'userName',
      success: function(res) {
        console.log("用户名",res);
        if(res.data){
          that.setData({
            userName: res.data
          })
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  showWorkList: function (e) {
    var taskId = e.currentTarget.id;
    //赋值给全局变量，在别的页面取 
    app.globalData.task_id = taskId;
    wx.navigateTo({
      url: '../workList/workList',
    })
  },

  //账号登出
  logout: function(){
    var that = this;
    wx.showModal({
      title: '系统提示',
      content: '是否要当前用户',
      showCancel: true,
      cancelText: '否',
      cancelColor: 'red',
      confirmText: '是',
      confirmColor: '',
      success: function(res) {
        if(res.confirm){
          wx.removeStorage({
            key: 'token',
            success: function(res) {console.log("token已清除")},
            fail: function(res) {console.log("token清除失败")},
          })
          wx.removeStorage({
            key: 'outTime',
            success: function (res) { console.log("过期时间已清除") },
            fail: function (res) { console.log("过期时间清除失败") },
          })
          wx.removeStorage({
            key: 'userName',
            success: function (res) { console.log("用户名已清除") },
            fail: function (res) { console.log("用户名清除失败") },
          })
          setTimeout(function(){
            wx.redirectTo({
              url: '../index/index',
            })
          },200)
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  }

  // verifyLoginStatus: function(){
  //   //从缓存拿token，实现自动登录，过期自动清除缓存
  //   var returnVal = false;
  //   wx.getStorage({
  //     key: 'outTime',
  //     success: function (res) {
  //       var timestamp = Date.parse(new Date());
  //       var timestampCache = res.data.timestampCache;
  //       if ((timestamp - timestampCache) > res.data.outTime) {
  //         console.log("登录信息过期");
  //         wx.showToast({
  //           title: '登录信息已过期！请重新登录',
  //           icon: 'none',
  //           image: '',
  //           duration: 1500,
  //           mask: true,
  //           success: function (res) { },
  //           fail: function (res) { },
  //           complete: function (res) { },
  //         })
  //         wx.removeStorage({
  //           key: 'token',
  //           success: function (res) { },
  //           fail: function (res) { },
  //           complete: function (res) { },
  //         })
  //         wx.removeStorage({
  //           key: 'outTime',
  //           success: function (res) { },
  //           fail: function (res) { },
  //           complete: function (res) { },
  //         })
  //         wx.redirectTo({
  //           url: '../index/index',
  //           success: function (res) {},
  //           fail: function (res) { },
  //           complete: function (res) { },
  //         })
  //       }
  //     },
  //     fail: function (res) { },
  //     complete: function (res) { },
  //   })
  //   wx.getStorage({
  //     key: 'token',
  //     success: function (res) {
  //       if (res.data) {
  //         app.globalData.token = res.data;
  //         app.globalData.authorization = 'Bearer ' + res.data;
  //         returnVal = true;
  //       }
  //     },
  //     fail: function (res) {
  //       wx.showToast({
  //         title: '尚未登录，请先登录',
  //         icon: 'none',
  //         duration: 500,
  //         mask: true,
  //       })
  //       setTimeout(function () {
  //         wx.redirectTo({
  //           url: '../index/index',
  //         })
  //       }, 500)
  //     },
  //     complete: function (res) { },
  //   })
  //   return returnVal;
  // }
})