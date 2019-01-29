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
    status:'',//作业状态
    work:'',
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
    files: [],//最后上传到服务器的附件信息
    imgs: [],//在前端展示的图片路径信息
    display:'',//控制上传图片的添加按钮是否可用
    tempImgPath:[] //上传的图片的临时路径
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var status = options.status;
    var work = JSON.parse(options.work);
    var jumpUrl = '';
    var port = app.globalData.port;
    that.setData({
      workId: options.workId,
      work: options.work,
      workInfo: work,
      status: status
    });
    // jumpUrl = port + '/api/app/checkUser/work/' + that.data.workId + '/info';
    // wx.request({
    //   url: jumpUrl,
    //   data: '',
    //   header: {
    //     'Authorization': app.globalData.authorization
    //   },
    //   method: 'GET',
    //   dataType: 'json',
    //   responseType: 'text',
    //   success: function (res) {
    //     that.setData({
    //       workResult: res.data.data
    //     });
    //     if (status === '已提交' || status === '已完成') {
    //       //console.log('检查结果', res.data.data);
    //       var result = that.data.workResult.matter_check_result;
    //       var isPass = res.data.data.is_pass;
    //       var checked;
    //       if (isPass === '合格') {
    //         checked = true;
    //       } else if (isPass === '不合格') {
    //         checked = false;
    //       }
    //       if (result != null) {
    //         var resultList = [];
    //         for (var i = 0; i < result.length; i++) {
    //           resultList.push(result[i].result);
    //         }
    //       }
    //       var files = [];//附件信息
    //       if (res.data.data.files.length > 0) {
    //         //files = res.data.data.files;
    //         for (var i = 0; i < res.data.data.files.length; i++) {
    //           files.push(port + res.data.data.files[i].url);
    //         }
    //       } else {
    //         files = [];
    //       }
    //       that.setData({
    //         date: {
    //           value: that.data.workResult.check_date,
    //           disabled: true
    //         },
    //         disabled: true,
    //         safeList: resultList,
    //         approver: res.data.data.audit_user_name,
    //         checked: checked,
    //         checkResult: res.data.data.check_result,
    //         placeholder: '', //提示文本清空
    //         imgs: files,
    //         display: 'none'//不可再上传图片
    //       })
    //     } else if (status === '暂存') {
    //       //console.log('检查结果', res.data.data);
    //       var result = that.data.workResult.matter_check_result;
    //       var isPass = res.data.data.is_pass;
    //       var checked;
    //       if (isPass === '合格') {
    //         checked = true;
    //       } else if (isPass === '不合格') {
    //         checked = false;
    //       }
    //       if (result != null) {
    //         var resultList = [];
    //         for (var i = 0; i < result.length; i++) {
    //           resultList.push(result[i].result);
    //         }
    //       }
    //       var files = [];//附件信息
    //       if (res.data.data.files.length > 0) {
    //         for (var i = 0; i < res.data.data.files.length;i++){
    //           files.push(port + res.data.data.files[i].url);
    //         }
    //       } else {
    //         files = [];
    //       }
    //       var checkResult = res.data.data.check_result;//检查结果
    //       that.setData({
    //         date: {
    //           value: that.data.workResult.check_date,
    //           disabled: false
    //         },
    //         disabled: false,
    //         safeList: resultList,
    //         approver: res.data.data.audit_user_name,
    //         approverId: res.data.data.audit_user_id,
    //         checked: checked,
    //         checkResult: checkResult,
    //         placeholder: '', //提示文本清空
    //         imgs: files,
    //         files: res.data.data.files,
    //         radioValue: isPass,
    //       })
    //       //that.getStorage();
    //     } else {//如果是本地缓存状态，读取缓存
    //       that.getStorage();
    //     }
    //   },
    //   fail: function (res) {
    //     wx.showModal({
    //       title: '系统提示',
    //       content: '系统出错，请尽快联系系统管理员',
    //       showCancel: false,
    //       confirmText: '好',
    //       success: function(res) {
    //         if(res.confirm){
    //           wx.navigateBack({
    //             delta: 1,
    //           })
    //         }
    //       }
    //     })
    //   },
    //   complete: function (res) { },
    // });
    // wx.request({
    //   url: port + '/api/app/org/getAuditUserList',
    //   data: '',
    //   header: {
    //     'Authorization': app.globalData.authorization
    //   },
    //   method: 'GET',
    //   dataType: 'json',
    //   responseType: 'text',
    //   success: function (res) {
    //     that.setData({
    //       leaderList: res.data.data
    //     })
    //   },
    //   fail: function (res) {
    //     wx.showModal({
    //       title: '系统提示',
    //       content: '获取审批人员列表失败',
    //       showCancel: false,
    //       confirmText: '返回上一层',
    //       success: function(res) {
    //         if(res.confirm){
    //           wx.navigateBack({
    //             delta: 1,
    //           })
    //         }
    //       }
    //     })
    //   },
    //   complete: function (res) { },
    // });
    // wx.request({
    //   url: port + '/api/app/resultNameList',
    //   data: '',
    //   header: {
    //     'Authorization': app.globalData.authorization
    //   },
    //   method: 'GET',
    //   dataType: 'json',
    //   responseType: 'text',
    //   success: function (res) {
    //     that.setData({
    //       list: res.data.data
    //     });
    //     var arr = that.data.safeList;
    //     var list = that.data.list;
    //     //给中间量的list初始化值
    //     for (var i = 0; i < list.length; i++) {
    //       arr.push("请输入检查结果");
    //     }
    //     that.setData({
    //       safeList: arr
    //     });
    //   },
    //   fail: function (res) {
    //     wx.showModal({
    //       title: '系统提示',
    //       content: '检查事项结果加载失败',
    //       showCancel: false,
    //       confirmText: '知道了',
    //       success: function(res) {}
    //     })
    //   },
    //   complete: function (res) { },
    // });
  },

  // //显示日期
  // showDate: function (e) {
  //   var that = this;
  //   that.setData({
  //     date: {
  //       value: e.detail.value
  //     }
  //   })
  // },

  // //选择检查结果值改变事件方法
  // pickerValChange: function (e) {
  //   var that = this;
  //   var arr = that.data.safeList;
  //   var list = that.data.list;
  //   var value = e.detail.value;
  //   var index = e.currentTarget.dataset.index;
  //   //点击了哪个选择器，就修改哪个下标的值，然后就可以展示出去了
  //   arr[index] = list[value];
  //   that.setData({
  //     safeList: arr
  //   })
  // },

  // //选择审批人改变事件方法
  // auditPickerChange: function (e) {
  //   var that = this;
  //   that.setData({
  //     approver: that.data.leaderList[e.detail.value].user_name,
  //     approverId: that.data.leaderList[e.detail.value].user_id
  //   })
  // },

  // //单选框勾选变化事件
  // checkChange: function (e) {
  //   var that = this;
  //   that.setData({
  //     radioValue: e.detail.value
  //   })
  // },

  // //本地输入数据缓存
  // saveEntry: function (e) {
  //   var that = this;
  //   //验证是不是必填都填了
  //   var canSave = that.validateForm(that.data);
  //   if (canSave) {
  //     var workId = app.globalData.work_id;//工作id，根绝每个工作的id区分缓存
  //     wx.setStorage({ //检查结果明细
  //       key: 'checkResult' + workId,
  //       data: that.data.checkResult,
  //       success: function (res) { },
  //       fail: function (res) {
  //         wx.showModal({
  //           title: '系统提示',
  //           content: '主要检查情况本地缓存失败',
  //           showCancel: false,
  //           confirmText: '知道了'
  //         })
  //       },
  //       complete: function (res) { },
  //     })
  //     wx.setStorage({ //检查日期
  //       key: 'checkDate' + workId,
  //       data: that.data.date.value,
  //       success: function (res) { },
  //       fail: function (res) {
  //         wx.showModal({
  //           title: '系统提示',
  //           content: '检查日期本地缓存失败',
  //           showCancel: false,
  //           confirmText: '知道了'
  //         })
  //       },
  //       complete: function (res) { },
  //     })
  //     wx.setStorage({ //是够合格
  //       key: 'checkValue' + workId,
  //       data: that.data.radioValue,
  //       success: function (res) { },
  //       fail: function (res) {
  //         wx.showModal({
  //           title: '系统提示',
  //           content: '检查是否合格本地缓存失败',
  //           showCancel: false,
  //           confirmText: '知道了'
  //         })
  //       },
  //       complete: function (res) { },
  //     })
  //     wx.setStorage({ //检查结果列表
  //       key: 'matterResult' + workId,
  //       data: that.data.safeList,
  //       success: function (res) { },
  //       fail: function (res) {
  //         wx.showModal({
  //           title: '系统提示',
  //           content: '承办人意见本地缓存失败',
  //           showCancel: false,
  //           confirmText: '知道了'
  //         })
  //       },
  //       complete: function (res) { },
  //     })
  //     wx.setStorage({ //审批人
  //       key: 'approver' + workId,
  //       data: {
  //         approverId: that.data.approverId,
  //         approver: that.data.approver
  //       },
  //       success: function (res) { },
  //       fail: function (res) {
  //         wx.showModal({
  //           title: '系统提示',
  //           content: '审批人员本地缓存失败',
  //           showCancel: false,
  //           confirmText: '知道了'
  //         })
  //       },
  //       complete: function (res) { },
  //     })
  //     wx.setStorage({//附件文件
  //       key: 'files' + workId,
  //       data: that.data.files,
  //       success: function (res) { },
  //       fail: function (res) {
  //         wx.showModal({
  //           title: '系统提示',
  //           content: '附件本地缓存失败',
  //           showCancel: false,
  //           confirmText: '知道了'
  //         })
  //       },
  //       complete: function (res) { },
  //     })
  //     wx.setStorage({//图片
  //       key: 'imgs' + workId,
  //       data: that.data.imgs,
  //       success: function (res) { },
  //       fail: function (res) {
  //         wx.showModal({
  //           title: '系统提示',
  //           content: '图片路径本地缓存失败',
  //           showCancel: false,
  //           confirmText: '知道了'
  //         })
  //       },
  //       complete: function (res) { },
  //     })
  //     wx.showToast({
  //       title: '暂存成功',
  //       icon: 'success',
  //       duration: 20000,
  //       mask: true
  //     })
  //     wx.navigateBack({
  //       delta: 1,
  //     })
  //   }
  // },

  // //重置
  // reset: function (e) {

  // },

  // //提交到服务器保存
  // submit: function (e) {
  //   var that = this;
  //   //先把图片上传,上传完文件后，再调用上传其他信息方法
  //   that.uploadFile(that.data.tempImgPath);
  // },

  // //上传结果
  // submitResult: function () {
  //   var that = this;
  //   var matterCheckResultList = [];
  //   var checkResultObj = {};
  //   var list = that.data.workInfo.matter;
  //   let port = app.globalData.port;
  //   for (var i = 0; i < list.length; i++) {
  //     checkResultObj = {
  //       code: list[i].code,
  //       name: list[i].name,
  //       result: that.data.safeList[i],
  //       law: '',
  //       remark: ''
  //     }
  //     matterCheckResultList.push(checkResultObj);
  //   }
  //   console.log('files:',that.data.files);
  //   console.log('imgs:',that.data.imgs);
  //   wx.request({
  //     url: port + '/api/app/checkUser/work/' + that.data.workId + '/submitCheckResult',
  //     data: {
  //       check_result: that.data.checkResult,
  //       operate: '暂存',
  //       check_date: that.data.date.value,
  //       is_pass: that.data.radioValue,
  //       audit_user_id: that.data.approverId,
  //       audit_user_name: that.data.approver,
  //       matter_check_result: matterCheckResultList,
  //       files: that.data.files
  //     },
  //     header: {
  //       'Authorization': app.globalData.authorization
  //     },
  //     method: 'post',
  //     dataType: 'json',
  //     responseType: 'text',
  //     success: function (res) {
  //       wx.navigateBack({
  //         delta: 1,
  //       })
  //     },
  //     fail: function (res) {
  //       wx.showModal({
  //         title: '系统提示',
  //         content: '检查结果提交失败',
  //         showCancel: false,
  //         confirmText: '知道了'
  //       })
  //     },
  //     complete: function (res) {},
  //   })
  // },

  // //上传文件
  // uploadFile: function (e) {
  //   let port = app.globalData.port;
  //   var that = this;
  //   wx.showToast({//提示正在上传
  //     title: '正在上传...',
  //     icon: 'loading',
  //     mask: true,
  //     duration: 10000
  //   })
  //   var filePaths = e;
  //   console.log(filePaths);
  //   if(filePaths.length > 0){
  //     var files = that.data.files;
  //     var successNum = e.successNum ? e.successNum : 0;//上传成功次数
  //     var failNum = e.failNum ? e.failNum : 0;//上传失败次数
  //     var uploadTime = e.uploadTime ? e.uploadTime : 0;//上传次数
  //     wx.uploadFile({
  //       url: port + '/api/app/upload/result',
  //       filePath: filePaths[uploadTime],
  //       name: 'files',
  //       header: {
  //         'Authorization': app.globalData.authorization
  //       },
  //       success: function (res) {
  //         var data = JSON.parse(res.data);
  //         if (data.code === 0) {//上传请求成功状态码
  //           //新增一个文件对象
  //           var file = {
  //             name: data.data.name,
  //             status: data.data.status,
  //             thumbUrl: data.data.thumbUrl,
  //             uid: data.data.uid,
  //             url: data.data.url,
  //             type: data.data.type
  //           }
  //           //统计上传文件的个数
  //           successNum += 1;
  //           //把文件对象放在文件列表里
  //           files.push(file);
  //           console.log('上传成功次数:' + successNum + ',这是第' + (uploadTime + 1) + '次上传');
  //           that.setData({
  //             files: files
  //           })
  //         } else {
  //           wx.showModal({
  //             title: '错误提示',
  //             content: '上传图片失败',
  //             showCancel: false,
  //             success: function (res) { }
  //           })
  //         }
  //       },
  //       fail: function (res) {
  //         failNum += 1;
  //         console.log('上传失败次数:' + failNum + ',这是第' + (uploadTime + 1) + '次上传');
  //         wx.showModal({
  //           title: '错误提示',
  //           content: '上传图片失败',
  //           showCancel: false,
  //           success: function (res) { }
  //         })
  //       },
  //       complete: function (res) {
  //         uploadTime++;
  //         if (uploadTime == e.length) {
  //           wx.hideToast();
  //           console.log('上传完毕，其中成功' + successNum + '次，失败' + failNum + '次');
  //           that.submitResult();
  //         } else {
  //           e.successNum = successNum;
  //           e.failNUm = failNum;
  //           e.uploadTime = uploadTime;
  //           that.uploadFile(e);
  //         }
  //       },
  //     })
  //   }else{
  //     that.submitResult();
  //   }
  // },

  // //图片上传
  // chooseImage: function (e) {
  //   var that = this;
  //   wx.chooseImage({
  //     sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
  //     sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
  //     success: function (res) {
  //       wx.showToast({//提示正在上传
  //         title: '正在上传...',
  //         icon: 'loading',
  //         mask: true,
  //         duration: 1000
  //       })
  //       // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
  //       that.setData({
  //         imgs: that.data.imgs.concat(res.tempFilePaths),
  //         tempImgPath: that.data.tempImgPath.concat(res.tempFilePaths)//把临时路径存起来
  //       });
  //     }
  //   })
  // },

  // //图片预览
  // previewImage: function (e) {
  //   wx.previewImage({
  //     current: e.currentTarget.id, // 当前显示图片的http链接
  //     urls: this.data.imgs // 需要预览的图片http链接列表
  //   })
  // },

  // //删除图片
  // delImg: function(e){
  //   var that = this;
  //   var imgs = that.data.imgs;
  //   var files = that.data.files;//需要上传的附件信息
  //   var index = e.currentTarget.dataset.index;
  //   wx.showModal({
  //     title: '提示',
  //     content: '是否删除照片',
  //     showCancel: true,
  //     cancelText: '否',
  //     cancelColor: '',
  //     confirmText: '是',
  //     confirmColor: '',
  //     success: function(res) {
  //       if(res.confirm){
  //         imgs.splice(index, 1);
  //         files.splice(index, 1);
  //         console.log("确认删除了");
  //       }else if(res.cancel){
  //         console.log("取消删除");
  //         return false;
  //       }
  //       that.setData({
  //         imgs: imgs
  //       })
  //     }
  //   })
  // },

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

  // //文本区域输入事件
  // tetxareaInput: function (e) {
  //   var that = this;
  //   if (e.detail) {
  //     that.setData({
  //       checkResult: e.detail.value
  //     })
  //   }
  // },

  // //获取本地缓存
  // getStorage: function () {
  //   var checkDate;//检查日期
  //   var checkResult;//主要检查情况
  //   var radioValue;//是否合格
  //   var matterResultList = [];//承办人意见列表
  //   var approver = {};//审批人
  //   var files = [{ name: "请选择附件" }];//附件列表
  //   var that = this;
  //   var workId = app.globalData.work_id;//工作id
  //   var imgs = [];
  //   //检查日期
  //   wx.getStorage({
  //     key: 'checkDate' + workId,
  //     success: function (res) {
  //       if (res.data) {
  //         checkDate = res.data;
  //       } else {
  //         checkDate = '';
  //       }
  //       that.setData({
  //         date: {
  //           value: checkDate,
  //           disabled: false
  //         }
  //       })
  //     },
  //     fail: function (res) {
  //       wx.showModal({
  //         title: '系统提示',
  //         content: '获取检查日期缓存失败',
  //         showCancel: false,
  //         confirmText: '知道了'
  //       })
  //     },
  //     complete: function (res) { },
  //   })
  //   //主要检查情况
  //   wx.getStorage({
  //     key: 'checkResult' + workId,
  //     success: function (res) {
  //       if (res.data) {
  //         checkResult = res.data;
  //       } else {
  //         checkResult = '';
  //       }
  //       that.setData({
  //         checkResult: checkResult
  //       })
  //     },
  //     fail: function (res) {
  //       wx.showModal({
  //         title: '系统提示',
  //         content: '获取主要检查情况缓存失败',
  //         showCancel: false,
  //         confirmText: '知道了'
  //       })
  //     },
  //     complete: function (res) { },
  //   })
  //   //是否合格
  //   wx.getStorage({
  //     key: 'checkValue' + workId,
  //     success: function (res) {
  //       var checked;
  //       if (res.data) {
  //         radioValue = res.data;
  //       } else {
  //         radioValue = '';
  //       }
  //       if (radioValue === '合格') {
  //         checked = true;
  //       } else if (radioValue === '不合格') {
  //         checked = false;
  //       }
  //       that.setData({
  //         radioValue: radioValue,
  //         checked: checked
  //       })
  //     },
  //     fail: function (res) {
  //       wx.showModal({
  //         title: '系统提示',
  //         content: '获取检查结果是否合格缓存失败',
  //         showCancel: false,
  //         confirmText: '知道了'
  //       })
  //     },
  //     complete: function (res) { },
  //   })
  //   //承办人意见
  //   wx.getStorage({
  //     key: 'matterResult' + workId,
  //     success: function (res) {
  //       if (res.data) {
  //         matterResultList = res.data;
  //       }
  //       that.setData({
  //         safeList: matterResultList,
  //       })
  //     },
  //     fail: function (res) {
  //       wx.showModal({
  //         title: '系统提示',
  //         content: '获取承办人意见缓存失败',
  //         showCancel: false,
  //         confirmText: '知道了'
  //       })
  //     },
  //     complete: function (res) { },
  //   })
  //   //审批人
  //   wx.getStorage({
  //     key: 'approver' + workId,
  //     success: function (res) {
  //       if (res.data) {
  //         approver = res.data;
  //       }
  //       that.setData({
  //         approver: approver.approver,
  //         approverId: approver.approverId
  //       })
  //     },
  //     fail: function (res) {
  //       wx.showModal({
  //         title: '系统提示',
  //         content: '获取审批人缓存失败',
  //         showCancel: false,
  //         confirmText: '知道了'
  //       })
  //     },
  //     complete: function (res) { },
  //   })
  //   //附件信息
  //   wx.getStorage({
  //     key: 'files' + workId,
  //     success: function (res) {
  //       if (res.data.length > 0) {
  //         files = res.data;
  //       }
  //       that.setData({
  //         files: files
  //       })
  //     },
  //     fail: function (res) {
  //       wx.showModal({
  //         title: '系统提示',
  //         content: '获取附件信息缓存失败',
  //         showCancel: false,
  //         confirmText: '知道了'
  //       })
  //     },
  //     complete: function (res) { },
  //   })
  //   //图片附件信息
  //   wx.getStorage({
  //     key: 'imgs' + workId,
  //     success: function (res) {
  //       if (res.data.length > 0) {
  //         imgs = res.data;
  //       }
  //       that.setData({
  //         imgs: imgs
  //       })
  //     },
  //     fail: function (res) {
  //       wx.showModal({
  //         title: '系统提示',
  //         content: '获取图片路径缓存失败',
  //         showCancel: false,
  //         confirmText: '知道了'
  //       })
  //     },
  //     complete: function (res) { },
  //   })
  //   that.setData({
  //     disabled: false,
  //     placeholder: '' //提示文本清空
  //   })
  // },

  // //验证表单方法
  // validateForm: function (data) {
  //   if (!data.checkResult) {
  //     wx.showToast({
  //       title: '主要检查情况不能为空!',
  //       icon: 'none',
  //       duration: 2000,
  //       mask: true,
  //     })
  //     return false;
  //   }
  //   //默认的意见列表全是一样的“请输入检查意见”，通过判断有多少个一样的默认值来判断是否都选了
  //   if (data.safeList) {
  //     var defaultNum = 0;//默认的结果个数
  //     var changeNum = 0;//改变了的结果个数
  //     for (var i = 0; i < data.safeList.length; i++) {
  //       if (data.safeList[i] === '请输入检查结果') {
  //         defaultNum += 1;
  //       } else {
  //         changeNum += 1;
  //       }
  //     }
  //     if (changeNum < data.workInfo.matter.length) {
  //       wx.showToast({
  //         title: '请选择承办人意见',
  //         icon: 'none',
  //         duration: 2000,
  //         mask: true,
  //       })
  //       return false;
  //     }
  //   }
  //   if (data.approver === '请选择审核人员') {
  //     wx.showToast({
  //       title: '请选择一个审批人!',
  //       icon: 'none',
  //       duration: 2000,
  //       mask: true,
  //     })
  //     return false;
  //   }
  //   return true;
  // }
})