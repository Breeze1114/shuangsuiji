// miniprogram/pages/workList/workList.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    token: app.globalData.token,
    taskId: app.globalData.task_id,
    workList: {},
    taskStatus: "",
    storageKeys: [], //缓存key值
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    let port = app.globalData.port;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      image: '',
      duration: 60000,
      mask: true,
    })
    wx.getStorageInfo({
      success: function(res) {
        that.setData({
          storageKeys: res.keys,
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
    setTimeout(function(){
      wx.request({
        url: port + '/api/app/checkUser/task/' + app.globalData.task_id + '/workList',
        data: {
          page: "1",
          rows: "10",
          state: "all"
        },
        header: { 'Authorization': app.globalData.authorization },
        method: 'GET',
        dataType: 'json',
        responseType: 'text',
        success: function (res) {
          if(res.data.code === 0){
            console.log('任务列表', res);
            wx.hideToast();
            wx.showToast({
              title: '加载成功',
              icon: 'success',
              duration: 500,
              mask: true,
            })
            var workList = res.data.data;
            var keys = that.data.storageKeys;
            for (var i = 0; i < keys.length; i++) {
              for (var j = 0; j < workList.length; j++) {
                if (keys[i].indexOf(workList[j].id) != -1) {
                  workList[j].state = '暂存';
                }
                //隐藏录入按钮
                if (workList[j].state === '已提交'){
                  workList[j]['hidden'] = true;
                }else{
                  workList[j]['false'] = true;
                }
              }
            }
            setTimeout(function(){
              that.setData({
                workList: workList
              })
              wx.hideToast();
            },250)
          }else{
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
              content: '获取作业列表失败,请联系管理员',
              showCancel: true,
              confirmText: '知道了',
              success: function (res) {
                if (res.confirm) {
                  wx.hideToast();
                }
              }
            })
            console.log(res);
          }
        },
        complete: function (res) { },
      })
    },500)

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    wx.showNavigationBarLoading();
    setTimeout(function () {
      wx.hideNavigationBarLoading();
    }, 500)
    wx.setNavigationBarTitle({
      title: '作业列表',
    })
    that.onLoad();
  },

  showWorkDetail: function (e) {
    var workId = e.currentTarget.id;
    var status = e.currentTarget.dataset.status;
    var work = JSON.stringify(e.currentTarget.dataset.work);
    //赋值给全局变量，在别的页面取 
    app.globalData.work_id = workId;
    wx.navigateTo({
      url: '../workDetail/workDetail?status=' + status + '&workId=' + workId + '&work=' + work,
    })
  },

  //转到录入页面
  turntoInput: function(e){
    var workId = e.currentTarget.id;
    var status = e.currentTarget.dataset.status;
    var work = JSON.stringify(e.currentTarget.dataset.work);
    //赋值给全局变量，在别的页面取 
    app.globalData.work_id = workId;
    wx.navigateTo({
      url: "../workResultInput/workResultInput?status=" + status + "&workId=" + workId + "&work=" + work,
    })
  }
})