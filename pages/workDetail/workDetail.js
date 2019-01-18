// miniprogram/pages/workDetail/workDetail.js
const app = getApp()
// 引入SDK核心类
var QQMapWX = require('../../js/qqmap-wx-jssdk.js');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: '5ARBZ-WIR3K-2AIJN-AQCZC-YQLM6-KLBAQ' // 开发者秘钥
});

Page({

  /**
   * 页面的初始数据
   */
  data: {
    token: app.globalData.token,
    workId: app.globalData.work_id,
    workResult: {},
    workInfo: {},
    date: {
      value: '',
      disabled: false
    },
    list: [],
    index: 0, //数组循环的下标
    listIndex: 0,
    safeList: [], //作为中间量的结果list
    leaderList: [],
    approver: "请选择审核人员",
    approverId: '', //审批人id
    disabled: false, //选择器是否可用
    checked: true, //是否选中
    placeholder: '请输入主要检查内容', //提示内容
    checkResult: '', //检查结果
    radioValue: '', //单选框默认值
    files: [{ name: "请选择附件" }],//附件信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var status = options.status;
    var work = JSON.parse(options.work);
    var jumpUrl = '';
    let port = app.globalData.port;
    that.setData({
      workId: options.workId,
      workInfo: work,
    });
    jumpUrl = port + '/api/app/checkUser/work/' + that.data.workId + '/info';
    wx.request({
      url: jumpUrl,
      data: '',
      header: {
        'Authorization': 'Bearer ' + app.globalData.token
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          workResult: res.data.data
        });
        if (status === '已提交' || status === '已完成') {
          var result = that.data.workResult.matter_check_result;
          var isPass = res.data.data.is_pass;
          var checked;
          if (isPass === '合格') {
            checked = true;
          } else if (isPass === '不合格') {
            checked = false;
          }
          if (result != null) {
            var resultList = [];
            for (var i = 0; i < result.length; i++) {
              resultList.push(result[i].result);
            }
          }
          var files = [];//附件信息
          if (res.data.data.files.length > 0) {
            files = res.data.data.files;
          } else {
            files = [{ name: "请选择附件" }];
          }
          that.setData({
            date: {
              value: that.data.workResult.check_date,
              disabled: true
            },
            disabled: true,
            safeList: resultList,
            approver: res.data.data.audit_user_name,
            checked: checked,
            checkResult: res.data.data.check_result,
            placeholder: '', //提示文本清空
            files: files,
          })
        } else if (status === '暂存') {
          console.log('检查结果', res.data.data);
          // var result = that.data.workResult.matter_check_result;
          // var isPass = res.data.data.is_pass;
          // var checked;
          // if (isPass === '合格') {
          //   checked = true;
          // } else if (isPass === '不合格') {
          //   checked = false;
          // }
          // if (result != null) {
          //   var resultList = [];
          //   for (var i = 0; i < result.length; i++) {
          //     resultList.push(result[i].result);
          //   }
          // }
          // var files = [];//附件信息
          // if (res.data.data.files.length > 0) {
          //   files = res.data.data.files;
          // } else {
          //   files = [{ name: "请选择附件" }];
          // }
          // var checkResult = res.data.data.check_result;//检查结果
          // console.log(checkResult);
          // that.setData({
          //   date: {
          //     value: that.data.workResult.check_date,
          //     disabled: false
          //   },
          //   disabled: false,
          //   safeList: resultList,
          //   approver: res.data.data.audit_user_name,
          //   approverId: res.data.data.audit_user_id,
          //   checked: checked,
          //   checkResult: checkResult,
          //   placeholder: '', //提示文本清空
          //   files: files,
          //   radioValue: isPass,
          // })
          that.getStorage();
        }else{//如果是本地缓存状态，读取缓存
          that.getStorage();
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    });
    wx.request({
      url: port +'/api/app/org/getAuditUserList',
      data: '',
      header: {
        'Authorization': 'Bearer ' + app.globalData.token
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          leaderList: res.data.data
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    });
    wx.request({
      url: port +'/api/app/resultNameList',
      data: '',
      header: {
        'Authorization': 'Bearer ' + app.globalData.token
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          list: res.data.data
        });
        var arr = that.data.safeList;
        var list = that.data.list;
        //给中间量的list初始化值
        for (var i = 0; i < list.length; i++) {
          arr.push("请输入检查结果");
        }
        that.setData({
          safeList: arr
        });
      },
      fail: function (res) { },
      complete: function (res) { },
    });
  },

  //显示日期
  showDate: function (e) {
    var that = this;
    that.setData({
      date: {
        value: e.detail.value
      }
    })
  },

  //选择检查结果值改变事件方法
  pickerValChange: function (e) {
    var that = this;
    var arr = that.data.safeList;
    var list = that.data.list;
    var value = e.detail.value;
    var index = e.currentTarget.dataset.index;
    //点击了哪个选择器，就修改哪个下标的值，然后就可以展示出去了
    arr[index] = list[value];
    that.setData({
      safeList: arr
    })
  },

  //选择审批人改变事件方法
  auditPickerChange: function (e) {
    var that = this;
    that.setData({
      approver: that.data.leaderList[e.detail.value].user_name,
      approverId: that.data.leaderList[e.detail.value].user_id
    })
  },

  //单选框勾选变化事件
  checkChange: function (e) {
    var that = this;
    that.setData({
      radioValue: e.detail.value
    })
  },

  //本地输入数据缓存
  saveEntry: function (e) {
    var that = this;
    var canSave = that.validateForm(that.data);
    if(canSave){
      var workId = app.globalData.work_id;//工作id，根绝每个工作的id区分缓存
      wx.setStorage({ //检查结果明细
        key: 'checkResult' + workId,
        data: that.data.checkResult,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
      wx.setStorage({ //检查日期
        key: 'checkDate' + workId,
        data: that.data.date.value,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
      wx.setStorage({ //是够合格
        key: 'checkValue' + workId,
        data: that.data.radioValue,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
      wx.setStorage({ //检查结果列表
        key: 'matterResult' + workId,
        data: that.data.safeList,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
      wx.setStorage({ //审批人
        key: 'approver' + workId,
        data: {
          approverId: that.data.approverId,
          approver: that.data.approver
        },
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
      wx.setStorage({//附件文件
        key: 'files' + workId,
        data: that.data.files,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
      wx.showToast({
        title: '暂存成功',
        icon: 'success',
        image: '',
        duration: 20000,
        mask: true,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
      wx.navigateBack({
        delta: 1,
      })
    }
  },

  //重置
  reset: function (e) {

  },

  //提交到服务器保存
  submit: function (e) {
    console.log(e);
    // var that = this;
    // var matterCheckResultList = [];
    // var checkResultObj = {};
    // var list = that.data.workInfo.matter;
    // let port = app.globalData.port;
    // for (var i = 0; i < list.length; i++) {
    //   checkResultObj = {
    //     code: list[i].code,
    //     name: list[i].name,
    //     result: that.data.safeList[i],
    //     law: '',
    //     remark: ''
    //   }
    //   matterCheckResultList.push(checkResultObj);
    // }
    // wx.request({
    //   url: port +'/api/app/checkUser/work/' + that.data.workId + '/submitCheckResult',
    //   data: {
    //     check_result: that.data.checkResult,
    //     operate: '暂存',
    //     check_date: that.data.date.value,
    //     is_pass: that.data.radioValue,
    //     audit_user_id: that.data.approverId,
    //     audit_user_name: that.data.approver,
    //     matter_check_result: matterCheckResultList,
    //     files: []
    //   },
    //   header: {
    //     'Authorization': 'Bearer ' + app.globalData.token
    //   },
    //   method: 'post',
    //   dataType: 'json',
    //   responseType: 'text',
    //   success: function (res) {
    //     wx.navigateBack({
    //       delta: 1,
    //     })
    //   },
    //   fail: function (res) { },
    //   complete: function (res) { },
    // })
  },

  //上传文件
  uploadFile: function (e) {
    let port = app.globalData.port;
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        console.log(res);
        wx.showToast({//提示正在上传
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 10000
        }) 
        var filePaths = res.tempFilePaths;
        wx.uploadFile({
          url: port +'/api/app/upload/result',
          filePath: filePaths[0],
          name: 'files',
          header: {
            'Authorization': 'Bearer ' + app.globalData.token
          },
          success: function (res) { 
            var data = JSON.parse(res.data);
            var files = [];
            if(data.code === 0){//上传请求成功状态码
              //新增一个文件对象
              var file = {
                name: data.data.name,
                status: data.data.status,
                thumbUrl: data.data.thumbUrl,
                uid: data.data.uid,
                url: data.data.url,
                type: data.data.type
              }
              //把文件对象放在文件列表里
              files.push(file);
              
              that.setData({
                files: files
              })
            }else{
              wx.showModal({
                title: '错误提示',
                content: '上传图片失败',
                showCancel: false,
                success: function (res) { }
              })
            }
          },
          fail: function (res) {
            wx.showModal({
              title: '错误提示',
              content: '上传图片失败',
              showCancel: false,
              success: function (res) { }
            })
          },
          complete: function (res) {
            wx.hideToast();//隐藏提示框
          },
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
    
  },

  //导航方法
  gotoLocation: function (e) {
    var that = this;
    //地址转坐标
    qqmapsdk.geocoder({
      address: that.data.workInfo.business_address, //地址参数，例：固定地址，address: '北京市海淀区彩和坊路海淀西大街74号'
      success: function (res) {//成功后的回调
        console.log(res);
        var res = res.result;
        var latitude = res.location.lat;
        var longitude = res.location.lng;
        //根据经纬度，打开导航
        wx.openLocation({
          latitude: latitude,
          longitude: longitude,
          scale: 18,
          name: that.data.workInfo.business_address,
          address: that.data.workInfo.business_address,
          success: function (res) { console.log(res) },
          fail: function (res) { },
          complete: function (res) { },
        })
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    })
  },

  //文本区域输入事件
  tetxareaInput: function(e){
    var that = this;
    if (e.detail) {
      that.setData({
        checkResult: e.detail.value
      })
    }
  },

  //获取本地缓存
  getStorage: function(){
    var checkDate;//检查日期
    var checkResult;//主要检查情况
    var radioValue;//是否合格
    var matterResultList = [];//承办人意见列表
    var approver = {};//审批人
    var files = [{ name: "请选择附件" }];//附件列表
    var that = this;
    var workId = app.globalData.work_id;//工作id
    //检查日期
    wx.getStorage({
      key: 'checkDate' + workId,
      success: function(res) {
        if(res.data){
          checkDate = res.data;
        }else{
          checkDate = '';
        }
        that.setData({
          date: {
            value: checkDate,
            disabled: false
          }
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
    //主要检查情况
    wx.getStorage({
      key: 'checkResult' + workId,
      success: function(res) {
        if (res.data) {
          checkResult = res.data;
        } else {
          checkResult = '';
        }
        that.setData({
          checkResult: checkResult
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
    //是否合格
    wx.getStorage({
      key: 'checkValue' + workId,
      success: function(res) {
        var checked;
        if (res.data) {
          radioValue = res.data;
        } else {
          radioValue = '';
        }
        if (radioValue === '合格') {
          checked = true;
        } else if (radioValue === '不合格') {
          checked = false;
        }
        that.setData({
          radioValue: radioValue,
          checked: checked
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
    //承办人意见
    wx.getStorage({
      key: 'matterResult' + workId,
      success: function(res) {
        if(res.data){
          matterResultList = res.data;
        }
        that.setData({
          safeList: matterResultList,
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
    //审批人
    wx.getStorage({
      key: 'approver' + workId,
      success: function(res) {
        if(res.data){
          approver = res.data;
        }
        that.setData({
          approver:approver.approver,
          approverId: approver.approverId
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
    //附件信息
    wx.getStorage({
      key: 'files' + workId,
      success: function(res) {
        if(res.data.length > 0){
          files = res.data;
        }
        that.setData({
          files: files
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
    that.setData({
      disabled: false,
      placeholder: '' //提示文本清空
    })
  },

  //验证表单方法
  validateForm: function(data){
    if(!data.checkResult){
      wx.showToast({
        title: '主要检查情况不能为空!',
        icon: 'none',
        duration: 2000,
        mask: true,
      })
      return false;
    }
    //默认的意见列表全是一样的“请输入检查意见”，通过判断有多少个一样的默认值来判断是否都选了
    if (data.safeList) {
      var defaultNum = 0;//默认的结果个数
      var changeNum = 0;//改变了的结果个数
      for(var i = 0;i<data.safeList.length;i++){
        if (data.safeList[i] === '请输入检查结果'){
          defaultNum += 1;
        }else{
          changeNum += 1;
        }
      }
      if(changeNum < data.workInfo.matter.length){
        wx.showToast({
          title: '请选择承办人意见',
          icon: 'none',
          duration: 2000,
          mask: true,
        })
        return false;
      }
    }
    if (data.approver === '请选择审核人员') {
      wx.showToast({
        title: '请选择一个审批人!',
        icon: 'none',
        duration: 2000,
        mask: true,
      })
      return false;
    }
    return true;
  }
})