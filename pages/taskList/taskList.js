// miniprogram/pages/taskList/taskList.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    token: app.globalData.token,
    taskList: {},
    userFullName:"", //用户名
    userOrgName:""//用户所在机构
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this//搭桥，直接用this访问不了
    wx.getStorageInfo({
      success: function(res) {console.log("StorageInfo",res)},
      fail: function(res) {},
      complete: function(res) {},
    })
    wx.getNetworkType({
      success: function(res) {console.log("网络状态√",res)},
      fail: function (res) { console.log("网络状态×", res)},
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      image: '',
      duration: 60000,
      mask: true,
    })
    //that.loadTaskList();
    wx.getStorage({
      key: 'token',
      success: function (res) {
        if (res.data) {
          console.log("token", res);
          app.globalData.token = res.data;
          app.globalData.authorization = 'Bearer ' + res.data;
        }
      },
      fail: function (res) {
        console.log("获取token失败",res);
        // if (res.errMsg == "getStorage:fail data not found"){
          wx.showToast({
            title: '系统未检测到有登录信息,请先登录!',
            icon: 'none',
            duration: 1500,
            mask: true,
            success: function (res) { },
          })
          //转到登录页面
          setTimeout(function () {
            wx.redirectTo({
              url: '../index/index',
            })
          }, 1500)
        }
      // },
    })
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
            duration: 1500,
            mask: true,
            success: function (res) {},
          })
          //清除并退出
          setTimeout(function () {
            that.clearLoginInfoStorage();
          }, 1500)
        }else{
          setTimeout(function () {
            that.loadTaskList();
          }, 500)
        }
      },
      fail: function (res) { },
    })
  },

  //加载任务列表
  loadTaskList: function () {
    var that = this;
    let port = app.globalData.port;
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
    })
    //获取用户名
    wx.getStorage({
      key: 'userFullName',
      success: function (res) {
        console.log("用户名", res);
        if (res.data) {
          that.setData({
            userFullName: res.data
          })
        }
      },
      fail: function (res) { },
    })
    //获取用户机构
    wx.getStorage({
      key: 'userOrgName',
      success: function (res) {
        console.log("机构名", res);
        if (res.data) {
          that.setData({
            userOrgName: res.data
          })
        }
      },
      fail: function (res) {},
    })
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
          that.clearLoginInfoStorage();
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  //清除登录信息相关缓存,并返回首页
  clearLoginInfoStorage: function(){
    wx.removeStorage({
      key: 'token',
      success: function (res) { console.log("token已清除") },
      fail: function (res) { console.log("token清除失败") },
    })
    wx.removeStorage({
      key: 'outTime',
      success: function (res) { console.log("过期时间已清除") },
      fail: function (res) { console.log("过期时间清除失败") },
    })
    wx.removeStorage({
      key: 'userFullName',
      success: function (res) { console.log("用户名已清除") },
      fail: function (res) { console.log("用户名清除失败") },
    })
    wx.removeStorage({
      key: 'userOrgName',
      success: function (res) { console.log("机构名已清除") },
      fail: function (res) { console.log("机构名清除失败") },
    })
    setTimeout(function () {
      wx.redirectTo({
        url: '../index/index',
      })
    }, 200)
  }

})