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
    storageKeys: [] //缓存key值
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    let port = app.globalData.port;
    wx.getStorageInfo({
      success: function(res) {
        that.setData({
          storageKeys: res.keys,
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
    wx.request({
      url: port+'/api/app/checkUser/task/' + app.globalData.task_id + '/workList',
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
        console.log('任务列表',res);
        var workList = res.data.data;
        var keys = that.data.storageKeys;
        for(var i=0;i<keys.length;i++){
          for(var j=0;j<workList.length;j++){
            if(keys[i].indexOf(workList[j].id) != -1){
              workList[j].state = '暂存';
            }
          }
        }
        that.setData({
          workList: workList
        })
      },
      fail: function (res) { 
        wx.showModal({
          title: '系统提示',
          content: '获取作业列表失败',
          showCancel: true,
          confirmText: '知道了',
        })
        console.log(res);
      },
      complete: function (res) { },
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
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
  }
})