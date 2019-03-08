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
    hidden: true,//是否隐藏一键提交按钮
    //dataList: [], 
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
    var type = options.type;
    var workIds = app.globalData.workIds;
    that.loadWorkList(type, workIds);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (type, workIds) {
    var that = this;
    wx.showNavigationBarLoading();
    setTimeout(function () {
      wx.hideNavigationBarLoading();
    }, 500)
    wx.getStorageInfo({
      success: function (res) {
        that.setData({
          storageKeys: res.keys,
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
    setTimeout(function(){
      var workList = that.data.workList;
      var keys = that.data.storageKeys;
      for (var i = 0; i < keys.length; i++) {
        for (var j = 0; j < workList.length; j++) {
          if (keys[i].indexOf("_wid" + workList[j].id) != -1) {
            workList[j].state = '本地暂存';
          }
          //隐藏录入按钮
          if (workList[j].state === '已提交' || workList[j].state === '已完成') {
            workList[j]['hidden'] = true;
          } else {
            workList[j]['false'] = true;
          }
        }
      }
      that.setData({
        workList: workList
      })
    },200)
  },

  //加载工作列表
  loadWorkList(type,workIds){
    var that = this;
    let port = app.globalData.port;
    wx.getStorageInfo({
      success: function (res) {
        that.setData({
          storageKeys: res.keys,
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
    if (type === "normal"){
      wx.setNavigationBarTitle({
        title: '作业列表',
      })
      setTimeout(function () {
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
            if (res.data.code === 0) {
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
                  if (keys[i].indexOf("_wid" + workList[j].id) != -1) {
                    workList[j].state = '本地暂存';
                  }
                  //隐藏录入按钮
                  if (workList[j].state === '已提交' || workList[j].state === '已完成') {
                    workList[j]['hidden'] = true;
                  } else {
                    workList[j]['false'] = true;
                  }
                }
              }
              setTimeout(function () {
                that.setData({
                  workList: workList
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
                content: '获取作业列表失败,请联系管理员',
                showCancel: false,
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
      }, 500)
    }else{
      wx.setNavigationBarTitle({
        title: '暂存作业列表',
      })
      wx.hideToast();
      wx.showToast({
        title: '加载成功',
        icon: 'success',
        duration: 500,
        mask: true,
      })
      setTimeout(function (){
        var keys = that.data.storageKeys;
        var workList = [];
        for(let i=0; i<workIds.length; i++){
          wx.getStorage({
            key: 'work_wid'+workIds[i],
            success: function(res) {
              res.data.state = '本地暂存';
              workList.push(res.data);
              that.setData({
                hidden: false,
                workList: workList
              })
            },
            fail: function(res) {}
          })
        }
        wx.hideToast();
      },500)
    }
  },

  //转到工作详情页面
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
  },

  //一键提交所有暂存任务
  submitAllWork: function(){
    var that = this;
    var workList = that.data.workList;
    var dataList = [];
    var imgList = [];
    var files = [];
    var unionImgList = [];
    for(let i=0;i<workList.length;i++){
      wx.getStorage({
        key: 'data_wid' + workList[i].id,
        success: function(res) {
          console.log(res.data);
          dataList.push(res.data);
        },
        fail: function(res) {},
        complete: function(res) {},
      })
      wx.getStorage({
        key: 'imgs_wid' + workList[i].id,
        success: function(res) {
          console.log(res.data);
          imgList.push(res.data);
        },
        fail: function(res) {},
        complete: function(res) {},
      })
      wx.getStorage({
        key: 'unionImgs_wid' + workList[i].id,
        success: function (res) {
          console.log(res.data);
          unionImgList.push(res.data);
        },
        fail: function (res) { },
        complete: function (res) { },
      })
      wx.getStorage({
        key: 'files_wid' + workList[i].id,
        success: function (res) {
          console.log(res.data);
          files.push(res.data);
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    }
    setTimeout(function(){
      console.log("dataList",dataList);
      console.log("imgList",imgList);
      console.log("unionImgList",unionImgList);
      console.log("files",files);
      for(let i=0;i<dataList.length;i++){
        var path = app.filterImgPath(imgList[i]);
        var port = app.globalData.port;
        //循环调用提交事件
        app.uploadFile(path, "暂存", port,unionImgList[i],files[i],dataList[i]);
      }
    },300)
  }
})