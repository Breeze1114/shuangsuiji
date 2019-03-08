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
    // wx.getStorage({
    //   key: 'outTime',
    //   success: function (res) {
    //     var timestamp = Date.parse(new Date());
    //     var timestampCache = res.data.timestampCache;
    //     if ((timestamp - timestampCache) > res.data.outTime) {
    //       console.log("登录信息过期");
    //       wx.showToast({
    //         title: '登录信息已过期！请重新登录',
    //         icon: 'none',
    //         image: '',
    //         duration: 1500,
    //         mask: true,
    //         success: function (res) { },
    //         fail: function (res) { },
    //         complete: function (res) { },
    //       })
    //       wx.removeStorage({
    //         key: 'token',
    //         success: function (res) { },
    //         fail: function (res) { },
    //         complete: function (res) { },
    //       })
    //       wx.removeStorage({
    //         key: 'outTime',
    //         success: function (res) { },
    //         fail: function (res) { },
    //         complete: function (res) { },
    //       })
    //     }
    //   },
    //   fail: function (res) { },
    //   complete: function (res) { },
    // })
    // wx.getStorage({
    //   key: 'token',
    //   success: function (res) {
    //     if (res.data) {
    //       console.log("token",res);
    //       app.globalData.token = res.data;
    //       app.globalData.authorization = 'Bearer ' + res.data;
    //       wx.redirectTo({
    //         url: '../taskList/taskList',
    //         success: function (res) { },
    //         fail: function (res) { },
    //         complete: function (res) { },
    //       })
    //     }
    //   },
    //   fail: function (res) { },
    //   complete: function (res) { },
    // })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // wx.setNavigationBarTitle({
    //   title: '登录',
    // })
  },

  //登录按钮点击事件
  fromSubmit: function (e) {
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
              key: 'userFullName',
              data: res.data.fullname,
            })
            //缓存用户所在机构名称
            wx.setStorage({
              key: 'userOrgName',
              data: res.data.org_name,
            })
            //缓存用户的uid
            wx.setStorage({
              key: 'uid',
              data: res.data.uid,
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

  //用户名输入框值改变事件
  userNameChange: function(e){
    var that = this;
    that.setData({
      userName: e.detail.value,
    })
  },

  //密码输入框值改变事件
  psdChange: function (e) {
    var that = this
    that.setData({
      password: e.detail.value,
    })
  },

  //缓存接口返回的数据到本地，实现离线访问
  setApiResultStorage: function(uid){
    let port = app.globalData.port;
    //获取任务列表
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
          wx.setStorage({
            key: 'taskList'+uid,
            data: res.data.data,
            success: function (res) { console.log("缓存taskList成功!")},
          })
          console.log(res.data.data);
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
        }
      },
    })
    //获取审批人列表
    wx.request({
      url: port + '/api/app/resultNameList',
      data: '',
      header: {
        'Authorization': app.globalData.authorization
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        wx.setStorage({
          key: 'resultNameList_' + uid,
          data: res.data.data,
          success: function(res) {console.log("缓存检查结果列表成功！")},
        })
      },
      fail: function (res) {
        wx.showModal({
          title: '系统提示',
          content: '检查事项结果加载失败',
          showCancel: false,
          confirmText: '知道了',
          success: function (res) { }
        })
      },
    });
    //获取检查结果列表
    wx.request({
      url: port + '/api/app/org/getAuditUserList',
      data: '',
      header: {
        'Authorization': app.globalData.authorization
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        wx.setStorage({
          key: 'auditUserList',
          data: res.data.data,
          success: function (res) { console.log("缓存审批人员列表成功！") },
        })
      },
      fail: function (res) {
        wx.showModal({
          title: '系统提示',
          content: '获取审批人员列表失败',
          showCancel: false,
          confirmText: '返回',
          success: function (res) {
            if (res.confirm) {
              wx.navigateBack({
                delta: 1,
              })
            }
          }
        })
      },
    });
  },

  //根据taskId获取工作列表，并缓存起来
  getWorkList: function (port, taskId, authorization, stateType, loadType) {
    wx.request({
      url: port + '/api/app/checkUser/task/' + taskId + '/workList',
      data: {
        page: "1",
        rows: "10",
        state: stateType
      },
      header: { 'Authorization': authorization },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code === 0) {
          console.log('任务列表', res);
          if (loadType === 'show') {
            wx.hideToast();
            wx.showToast({
              title: '加载成功',
              icon: 'success',
              duration: 500,
              mask: true,
            })
          }
          var workList = res.data.data;
          // var keys = that.data.storageKeys;
          // for (var i = 0; i < keys.length; i++) {
          //   for (var j = 0; j < workList.length; j++) {
          //     if (keys[i].indexOf(workList[j].id) != -1) {
          //       workList[j].state = '暂存';
          //     }
          //     //隐藏录入按钮
          //     if (workList[j].state === '已提交') {
          //       workList[j]['hidden'] = true;
          //     } else {
          //       workList[j]['false'] = true;
          //     }
          //   }
          // }
          //缓存起来workList
          wx.setStorage({
            key: 'workList_' + taskId,
            data: workList,
            success: function (res) { console.log("工作列表", workList) },
          })
          // setTimeout(function () {
          //   that.setData({
          //     workList: workList
          //   })
          //   wx.hideToast();
          // }, 250)
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
    })
  },

  //根据workId获取该工作的检查结果信息
  getWorkCheckResult: function (port, workId, authorization) {
    wx.request({
      url: port + '/api/app/checkUser/work/' + workId + '/info',
      data: '',
      header: {
        'Authorization': authorization
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code === 0) {
          var workResult = res.data.data;
          wx.setStorage({
            key: 'workResult_' + workId,
            data: workResult,
            success: function (res) { console.log("检查结果", workResult) },
          })
        } else {
          wx.showModal({
            title: '系统提示',
            content: res.data.msg,
            showCancel: false,
            confirmText: '知道了',
          })
        }
      },
      fail: function (res) {
        wx.showModal({
          title: '系统提示',
          content: '系统出错，请尽快联系系统管理员',
          showCancel: false,
          confirmText: '知道了',
          success: function (res) {
            if (res.confirm) {
              wx.navigateBack({
                delta: 1,
              })
            }
          }
        })
      },
    });
  }
})