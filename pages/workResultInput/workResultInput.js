// miniprogram/pages/workDetail/workDetail.js
const app = getApp()
// 引入SDK核心类
var QQMapWX = require('../../js/qqmap-wx-jssdk.js');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: '5ARBZ-WIR3K-2AIJN-AQCZC-YQLM6-KLBAQ' // 开发者秘钥
});

//文件系统
const fileSys = wx.getFileSystemManager();

//格式化时间工具
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    token: app.globalData.token,
    workId: app.globalData.work_id,
    workResult: {},
    workInfo: {},
    isUnionHeadOrg: false,//是否为联合任务牵头部门(是则要上传联合总表)
    date: {
      value: '',
      disabled: false
    },
    list: [],
    index: 0, //数组循环的下标
    listIndex: 0,
    safeList: {
      result: [],//作为中间量的结果list
      law:[],
      remark:[]
    }, 
    leaderList: [],//审批人列表
    approver: "请选择",//审批人
    approverId: '', //审批人id
    disabled: false, //选择器是否可用
    checked: true, //是否选中
    placeholder: '请输入主要检查内容', //提示内容
    checkResult: '', //检查结果
    radioValue: '合格', //单选框默认值
    files: [],//最后上传到服务器的附件信息
    imgs: [],//在前端展示的图片路径信息
    unionImgs:[],//上传牵头总表图片
    display: '',//控制图片的删除按钮是否显示
    canUpload: true,//控制上传图片的按钮是否可用
    tempImgPath: [], //上传的图片的临时路径
    tempUnionImgPath: [],//上传的联合总表的临时路径
    today:"",//今天
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
    var today = util.formatTime(new Date());//拿到今天的日期并格式化成yyyy-mm-dd
    fileSys.getSavedFileList({
      success(res){console.log("本地缓存的文件列表",res)}
    })
    that.setData({
      workId: options.workId,
      workInfo: work,
      isUnionHeadOrg: work.is_union_head_org,
      today: today
    });
    console.log(that.data);
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
        that.setData({
          list: res.data.data
        });
        var arr = that.data.safeList.result;
        var arr1 = that.data.safeList.law;
        var arr2 = that.data.safeList.remark;
        var list = that.data.list;
        var workInfo = that.data.workInfo;
        for (var j = 0; j < workInfo.matter.length; j++) {
          workInfo.matter[j]['hidden'] = true;
          workInfo.matter[j]['remarkHidden'] = true;
        }
        //给中间量的list初始化值
        for (var i = 0; i < list.length; i++) {
          arr.push("未发现问题");
          arr1.push("");
          arr2.push("");
        }
        that.setData({
          workInfo: workInfo,
          safeList: {
            result: arr,
            law: arr1,
            remark: arr2
          }
        });
        //console.log("safelist", that.data.safeList);
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
      complete: function (res) { },
    });
    jumpUrl = port + '/api/app/checkUser/work/' + that.data.workId + '/info';
    wx.request({
      url: jumpUrl,
      data: '',
      header: {
        'Authorization': app.globalData.authorization
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          workResult: res.data.data
        });
        if (status === '已提交' || status === '已完成') {
          console.log('检查结果', res.data.data);
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
            var lawList = [];
            var remarkList = [];
            for (var i = 0; i < result.length; i++) {
              resultList.push(result[i].result);
              lawList.push(result[i].law);
              remarkList.push(result[i].remark);
            }
          }
          var workInfo = that.data.workInfo;
          for (var k = 0; k < workInfo.matter.length; k++) {
            if (resultList[k] != '未发现问题') {
              workInfo.matter[k].hidden = false;
            }
            if (resultList[k] == '其他情形') {
              workInfo.matter[k].remarkHidden = false;
            }
          }
          var files = [];//附件信息
          var unionFiles = [];//联合总表信息
          var data = res.data.data.files;
          if (data.length > 0) {
            //files = res.data.data.files;
            for (var i = 0; i < data.length; i++) {
              if(data[i].type != 'union'){
                files.push(port + data[i].url);
              }else{
                unionFiles.push(port + data[i].url);
              }
            }
          } else {
            files = [];
          }
          setTimeout(function(){
            that.setData({
              workInfo: workInfo,
              date: {
                value: that.data.workResult.check_date,
                disabled: true
              },
              disabled: true,
              safeList: {
                law: lawList,
                remark: remarkList,
                result: resultList
              },
              approver: res.data.data.audit_user_name,
              checked: checked,
              radioValue: res.data.data.is_pass,
              checkResult: res.data.data.check_result,
              placeholder: '', //提示文本清空
              imgs: files,
              unionImgs: unionFiles,
              display: "none", //不可再删除图片
              canUpload: false //不可再上传图片
            })
          },200)
        } else if (status === '暂存'|| status === '退回') {
          console.log('检查结果', res.data.data);
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
            var lawList = [];
            var remarkList = [];
            for (var i = 0; i < result.length; i++) {
              resultList.push(result[i].result);
              lawList.push(result[i].law);
              remarkList.push(result[i].remark);
            }
          }
          var workInfo = that.data.workInfo;
          for (var k = 0; k < workInfo.matter.length; k++) {
            if (resultList[k] != '未发现问题') {
              workInfo.matter[k].hidden = false;
            }
            if (resultList[k] == '其他情形') {
              workInfo.matter[k].remarkHidden = false;
            }
          }
          var files = [];//附件信息
          var unionFiles = [];//联合总表信息
          var data = res.data.data.files;
          if (data.length > 0) {
            //files = res.data.data.files;
            for (var i = 0; i < data.length; i++) {
              if (data[i].type != 'union') {
                files.push(port + data[i].url);
              } else {
                unionFiles.push(port + data[i].url);
              }
            }
          } else {
            files = [];
          }
          var checkResult = res.data.data.check_result;//检查结果
          setTimeout(function(){
            that.setData({
              workInfo: workInfo,
              date: {
                value: that.data.workResult.check_date,
                disabled: false
              },
              disabled: false,
              safeList: {
                law: lawList,
                remark: remarkList,
                result: resultList
              },
              approver: res.data.data.audit_user_name,
              checked: checked,
              radioValue: res.data.data.is_pass,
              checkResult: res.data.data.check_result,
              placeholder: '', //提示文本清空
              imgs: files,
              files: res.data.data.files,
              unionImgs: unionFiles,
              display: "", //不可再删除图片
              canUpload: true //不可再上传图片
            })
          },200)
        }  else {//如果是本地缓存状态，读取缓存
          that.getStorage();
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
      complete: function (res) { },
    });
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
        that.setData({
          leaderList: res.data.data
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
    var safeList = that.data.safeList;
    var arr = safeList.result;
    var list = that.data.list;
    var value = e.detail.value;
    var index = e.currentTarget.dataset.index;
    var workInfo = that.data.workInfo;
    //点击了哪个选择器，就修改哪个下标的值，然后就可以展示出去了
    arr[index] = list[value];
    //如果不是未发现问题，就可以选填法律法规
    if(arr[index] != '未发现问题'){
      workInfo.matter[index].hidden = false;
      if(arr[index] == '其他情形'){
        workInfo.matter[index].remarkHidden = false;
      }else{
        workInfo.matter[index].remarkHidden = true;
        //把填好的法律法规和其他情况清空
        safeList.remark[index] = "";
        safeList.law[index] = "";
      }
    }else{
      workInfo.matter[index].remarkHidden = true;
      workInfo.matter[index].hidden = true;
      //把填好的法律法规和其他情况清空
      safeList.remark[index] = "";
      safeList.law[index] = ""; 
    }
    that.setData({
      safeList: safeList,
      workInfo: workInfo,
      index: index,//更新一下下标
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

  //选择是否合格值改变事件
  checkChange: function (e) {
    var that = this;
    var val;
    if (e.detail.value === "0"){
      val = "合格";
    }else{
      val = "不合格";
    }
    that.setData({
      radioValue: val
    })
  },

  //本地输入数据缓存
  saveEntry: function (e) {
    var that = this;
    //验证是不是必填都填了
    var canSave = that.validateForm(that.data);
    if (canSave) {
      wx.showModal({
        title: '提示',
        content: '暂存信息可编辑',
        showCancel: true,
        cancelText: '取消',
        cancelColor: '',
        confirmText: '确认',
        confirmColor: '',
        success: function(res) {
          console.log("暂存时的data:",that.data);
          var workId = app.globalData.work_id;//工作id，根绝每个工作的id区分缓存
          if(res.confirm){
            wx.setStorage({ //检查结果明细
              key: 'checkResult_wid' + workId,
              data: that.data.checkResult,
              success: function (res) { },
              fail: function (res) {
                wx.showModal({
                  title: '系统提示',
                  content: '主要检查情况本地缓存失败',
                  showCancel: false,
                  confirmText: '知道了'
                })
              },
              complete: function (res) { },
            })
            wx.setStorage({ //检查日期
              key: 'checkDate_wid' + workId,
              data: that.data.date.value,
              success: function (res) { },
              fail: function (res) {
                wx.showModal({
                  title: '系统提示',
                  content: '检查日期本地缓存失败',
                  showCancel: false,
                  confirmText: '知道了'
                })
              },
              complete: function (res) { },
            })
            wx.setStorage({ //是否合格
              key: 'checkValue_wid' + workId,
              data: that.data.radioValue,
              success: function (res) { },
              fail: function (res) {
                wx.showModal({
                  title: '系统提示',
                  content: '检查是否合格本地缓存失败',
                  showCancel: false,
                  confirmText: '知道了'
                })
              },
              complete: function (res) { },
            })
            wx.setStorage({ //检查结果列表
              key: 'matterResult_wid' + workId,
              data: that.data.safeList.result,
              success: function (res) { },
              fail: function (res) {
                wx.showModal({
                  title: '系统提示',
                  content: '承办人意见本地缓存失败',
                  showCancel: false,
                  confirmText: '知道了'
                })
              },
              complete: function (res) { },
            })
            wx.setStorage({ //审批人
              key: 'approver_wid' + workId,
              data: {
                approverId: that.data.approverId,
                approver: that.data.approver
              },
              success: function (res) { },
              fail: function (res) {
                wx.showModal({
                  title: '系统提示',
                  content: '审批人员本地缓存失败',
                  showCancel: false,
                  confirmText: '知道了'
                })
              },
              complete: function (res) { },
            })
            wx.setStorage({//附件文件
              key: 'files_wid' + workId,
              data: that.data.files,
              success: function (res) { },
              fail: function (res) {
                wx.showModal({
                  title: '系统提示',
                  content: '附件本地缓存失败',
                  showCancel: false,
                  confirmText: '知道了'
                })
              },
              complete: function (res) { },
            })
            //选择上传图片后，获得的路径是临时文件的临时路径，
            //所以需要把临时文件存起来，不然在一段时间过后，临时路径会访问不到该文件
            var tempList = [];
            var tempUnionList = [];
            var imgPath = [];
            var imgList = that.data.imgs;//此时的图片路径
            var unionPath = [];
            var unionList = that.data.unionImgs;//此时的联合总表的路径
            //先删除掉那些临时的路径
            for (let j = 0; j < imgList.length; j++) {
              if (imgList[j].indexOf("tmp") != -1) {
                //imgPath.splice(j, 1);
              } else {
                imgPath.push(imgList[j]);
              }
            }
            for (let j = 0; j < unionList.length; j++) {
              if (unionList[j].indexOf("tmp") != -1) {
                //unionPath.splice(j, 1);
              } else {
                unionPath.push(unionList[j]);
              }
            }
            //把新上传的图片保存到本地
            for (var i = 0; i < that.data.tempImgPath.length; i++) {
              fileSys.saveFile({
                tempFilePath: that.data.tempImgPath[i],
                success(res) {
                  tempList.push(res.savedFilePath);
                  fileSys.getSavedFileList({
                    success(res) { console.log(res) }
                  })
                },
                fail(res) {
                  console.log(res);
                  fileSys.getSavedFileList({
                    success(res) { console.log(res) }
                  })
                  wx.showModal({
                    title: '错误提示',
                    content: '保存附件报错！',
                    showCancel: false,
                    confirmText: '知道了',
                    success: function (res) { },
                    fail: function (res) { },
                    complete: function (res) { },
                  })
                },
              });
            }
            for (var i = 0; i < that.data.tempUnionImgPath.length; i++) {
              fileSys.saveFile({
                tempFilePath: that.data.tempUnionImgPath[i],
                success(res) {
                  tempUnionList.push(res.savedFilePath);
                  fileSys.getSavedFileList({
                    success(res) { console.log(res) }
                  })
                },
                fail(res) {
                  console.log(res);
                  fileSys.getSavedFileList({
                    success(res) { console.log(res) }
                  })
                  wx.showModal({
                    title: '错误提示',
                    content: '保存联合总表报错！',
                    showCancel: false,
                    confirmText: '知道了',
                    success: function (res) { },
                    fail: function (res) { },
                    complete: function (res) { },
                  })
                },
              });
            }
            setTimeout(function () {
              that.setData({
                imgs: imgPath.concat(tempList),
                tempImgPath: imgPath.concat(tempList),//把路径存起来
                unionImgs: unionPath.concat(tempUnionList),
                tempUnionImgPath: unionPath.concat(tempUnionList)
              });
            }, 600)
            setTimeout(function () {
              //缓存普通图片
              wx.setStorage({
                key: 'imgs_wid' + workId,
                data: that.data.imgs,
                success: function (res) { },
                fail: function (res) {
                  wx.showModal({
                    title: '系统提示',
                    content: '图片路径本地缓存失败',
                    showCancel: false,
                    confirmText: '知道了'
                  })
                },
                complete: function (res) { },
              })

              // //保存本地的路径
              // wx.setStorage({
              //   key: 'imgPath_wid'+ workId,
              //   data: that.data.tempImgPath,
              //   success: function(res) {},
              //   fail: function(res) {
              //     wx.showModal({
              //       title: '系统提示',
              //       content: '图片路径本地缓存失败',
              //       showCancel: false,
              //       confirmText: '知道了'
              //     })
              //   },
              // })

              wx.setStorage({//联合总表图片
                key: 'unionImgs_wid' + workId,
                data: that.data.unionImgs,
                success: function (res) { },
                fail: function (res) {
                  wx.showModal({
                    title: '系统提示',
                    content: '联合总表本地缓存失败',
                    showCancel: false,
                    confirmText: '知道了'
                  })
                },
              })
              // //保存本地的路径
              // wx.setStorage({
              //   key: 'unionImgPath_wid' + workId,
              //   data: that.data.tempUnionImgPath,
              //   success: function (res) { },
              //   fail: function (res) {
              //     wx.showModal({
              //       title: '系统提示',
              //       content: '图片路径本地缓存失败',
              //       showCancel: false,
              //       confirmText: '知道了'
              //     })
              //   },
              // })
            }, 800)
            wx.setStorage({//法律法规
              key: 'law_wid' + workId,
              data: that.data.safeList.law,
              success: function (res) { },
              fail: function (res) {
                wx.showModal({
                  title: '系统提示',
                  content: '法律法规本地缓存失败',
                  showCancel: false,
                  confirmText: '知道了'
                })
              },
              complete: function (res) { },
            })
            wx.setStorage({//其他情形
              key: 'remark_wid' + workId,
              data: that.data.safeList.remark,
              success: function (res) { },
              fail: function (res) {
                wx.showModal({
                  title: '系统提示',
                  content: '其他情形本地缓存失败',
                  showCancel: false,
                  confirmText: '知道了'
                })
              },
              complete: function (res) { },
            })
            // //任务id
            // var taskId = app.globalData.task_id;
            wx.setStorage({//缓存工作信息
              key: 'work_wid' + workId,
              data: that.data.workInfo,
              success: function(res) {},
              fail: function(res) {
                wx.showModal({
                  title: '系统提示',
                  content: '工作信息本地缓存失败',
                  showCancel: false,
                  confirmText: '知道了'
                })
              },
              complete: function(res) {},
            })
            //缓存整个data
            wx.setStorage({
              key: 'data_wid'+ workId,
              data: that.data,
            })
            console.log("缓存的safelist", that.data.safeList);
            wx.showToast({
              title: '暂存成功',
              icon: 'success',
              duration: 1000,
              mask: true
            })
            setTimeout(function () {
              wx.navigateBack({
                delta: 2,
              })
            }, 1000)
          }
        },
      })      
    }
  },

  //提交到服务器保存
  submit: function (e) {
    var that = this;
    //先把图片上传,上传完文件后，再调用上传其他信息方法
    var canSumbit = that.validateForm(that.data);
    var path = that.data.imgs;
    var uploadPath = that.filterImgPath(path);
    console.log("uploadPath",uploadPath);
    if (canSumbit){
      wx.showModal({
        title: '提示',
        content: '请选择提交方式',
        showCancel: true,
        cancelText: '保存信息',
        cancelColor: '#576B95',
        confirmText: '提交审核',
        confirmColor: '#576B95',
        success: function(res) {
          if(res.confirm){
            // that.uploadFile(uploadPath,"提交审核");
            app.uploadFile(uploadPath, "提交审核", app.globalData.port, that.data.unionImgs, that.data.files, that.data);
          }else{
            // that.uploadFile(uploadPath,"暂存");
            app.uploadFile(uploadPath, "暂存", app.globalData.port, that.data.unionImgs, that.data.files, that.data);
          }
        },
      })
    }
  },

  //图片上传
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        wx.showToast({//提示正在上传
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 500
        });
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        setTimeout(function(){
          that.setData({
            imgs: that.data.imgs.concat(res.tempFilePaths),
            tempImgPath: that.data.tempImgPath.concat(res.tempFilePaths)//把临时路径存起来
          });
          console.log("选择完图片后的img",that.data.imgs);
          console.log("选择完图片后的tempImgPath",that.data.tempImgPath);
        },500)
      }
    })
  },

  //联合总表上传
  chooseUnionFile: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        wx.showToast({//提示正在上传
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 500
        })
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        setTimeout(function(){
          that.setData({
            unionImgs: that.data.unionImgs.concat(res.tempFilePaths),
            tempUnionImgPath: that.data.tempUnionImgPath.concat(res.tempFilePaths)//把临时路径存起来
          });
          console.log("选择完图片后的unionImgs", that.data.unionImgs);
          console.log("选择完图片后的tempUnionImgPath", that.data.tempUnionImgPath);
        },500)
      }
    })
  },

  //联合总表图片预览
  previewUnionImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.unionImgs // 需要预览的图片http链接列表
    })
  },

  //图片预览
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.imgs // 需要预览的图片http链接列表
    })
  },

  //删除图片
  delImg: function (e) {
    var that = this;
    var imgs = that.data.imgs;
    var tempFilePath = that.data.tempImgPath;
    var files = that.data.files;//需要上传的附件信息
    var index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '提示',
      content: '是否删除照片',
      showCancel: true,
      cancelText: '否',
      cancelColor: '',
      confirmText: '是',
      confirmColor: '',
      success: function (res) {
        if (res.confirm) {
          for(var i=0;i<files.length;i++){
            if(imgs[index].indexOf(files[i].name) != -1){
              files.splice(i, 1);
            }else if (imgs[index].indexOf(files[i].url) != -1){
              files.splice(i, 1);
            }
          }
          for (var j = 0; j < tempFilePath.length; j++) {
            if (imgs[index].indexOf(tempFilePath[j]) != -1) {
              tempFilePath.splice(j, 1);
            }
          }
          fileSys.removeSavedFile({
            filePath: imgs[index],
            success: function (res) { console.log("删除成功！") },
            fail: function (res) { console.log(res) },
          })
          imgs.splice(index, 1);
          console.log("确认删除了");
          console.log(files);
        } else if (res.cancel) {
          console.log("取消删除");
          return false;
        }
        that.setData({
          imgs: imgs,
          tempFilePath: tempFilePath
        })
      }
    })
  },

  //删除联合总表
  delUnionImg: function (e) {
    var that = this;
    var imgs = that.data.unionImgs;
    var tempFilePath = that.data.tempUnionImgPath;
    console.log(tempFilePath);
    console.log(imgs);
    var files = that.data.files;//需要上传的附件信息
    var index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '提示',
      content: '是否删除照片',
      showCancel: true,
      cancelText: '否',
      cancelColor: '',
      confirmText: '是',
      confirmColor: '',
      success: function (res) {
        if (res.confirm) {
          for (var i = 0; i < files.length; i++) {
            if (imgs[index].indexOf(files[i].name) != -1) {
              files.splice(i, 1);
            } else if (imgs[index].indexOf(files[i].url) != -1) {
              files.splice(i, 1);
            }
          }
          for(var j = 0;j<tempFilePath.length; j++){
            if (imgs[index].indexOf(tempFilePath[j]) != -1) { 
              tempFilePath.splice(j , 1);
            }
          }
          fileSys.removeSavedFile({
            filePath: imgs[index],
            success: function (res) { console.log("删除成功！") },
            fail: function (res) { console.log(res) },
          })
          imgs.splice(index, 1);
          console.log("确认删除了");
          console.log(files);
          console.log(tempFilePath);
        } else if (res.cancel) {
          console.log("取消删除");
          return false;
        }
        that.setData({
          unionImgs: imgs,
          tempUnionImgPath: tempFilePath
        })
      }
    })
  },

  //文本区域输入事件
  tetxareaInput: function (e) {
    var that = this;
    if (e.detail) {
      that.setData({
        checkResult: e.detail.value
      })
    }
  },

  //获取本地缓存
  getStorage: function () {
    var that = this;
    var safeList = that.data.safeList;
    var workInfo = that.data.workInfo;
    var checkDate;//检查日期
    var checkResult;//主要检查情况
    var radioValue;//是否合格
    var matterResultList = [];//承办人意见列表
    var approver = {};//审批人
    var files = [{ name: "请选择附件" }];//附件列表
    var that = this;
    var workId = app.globalData.work_id;//工作id
    var imgs = [];
    var unionImgs = [];
    var imgPath = [];//图片临时路径(上传用)
    var unionImgPath = [];
    //检查日期
    wx.getStorage({
      key: 'checkDate_wid' + workId,
      success: function (res) {
        if (res.data) {
          checkDate = res.data;
        } else {
          checkDate = '';
        }
        that.setData({
          date: {
            value: checkDate,
            disabled: false
          }
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
    //主要检查情况
    wx.getStorage({
      key: 'checkResult_wid' + workId,
      success: function (res) {
        if (res.data) {
          checkResult = res.data;
        } else {
          checkResult = '';
        }
        that.setData({
          checkResult: checkResult
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
    //是否合格
    wx.getStorage({
      key: 'checkValue_wid' + workId,
      success: function (res) {
        var checked;
        console.log("是否合格",res.data)
        if (res.data) {
          radioValue = res.data;
        } else {
          radioValue = '';
        }
        if (radioValue === '合格') {
          checked = true;
        } else if (radioValue === '不合格') {
          checked = false;
        } else if (radioValue === ''){//默认不选的时候，为合格
          checked = true;
          radioValue = '合格';
        }
        that.setData({
          radioValue: radioValue,
          checked: checked
        })
      },
      fail: function (res) {},
      complete: function (res) { },
    })
    //承办人意见
    wx.getStorage({
      key: 'matterResult_wid' + workId,
      success: function (res) {
        if (res.data) {
          safeList.result = res.data;
          for (var i = 0; i < workInfo.matter.length; i++) {
            if (safeList.result[i] != '未发现问题') {
              workInfo.matter[i].hidden = false;
            }
            if (safeList.result[i] == '其他情形'){
              workInfo.matter[i].remarkHidden = false;
            }
          }
        }
        safeList = safeList;
        that.setData({
          safeList: safeList,
          workInfo: workInfo,
        })
      },
      fail: function (res) {},
      complete: function (res) { },
    })
    //审批人
    wx.getStorage({
      key: 'approver_wid' + workId,
      success: function (res) {
        if (res.data) {
          approver = res.data;
        }
        that.setData({
          approver: approver.approver,
          approverId: approver.approverId
        })
      },
      fail: function (res) {},
      complete: function (res) { },
    })
    //附件信息
    wx.getStorage({
      key: 'files_wid' + workId,
      success: function (res) {
        if (res.data.length > 0) {
          files = res.data;
        }
        that.setData({
          files: files
        })
        console.log("附件信息",res.data);
      },
      fail: function (res) {},
      complete: function (res) { },
    })
    //图片附件信息
    wx.getStorage({
      key: 'imgs_wid' + workId,
      success: function (res) {
        if (res.data.length > 0) {
          imgs = res.data;
        }
        that.setData({
          imgs: imgs
        })
        console.log("图片信息", res.data);
      },
      fail: function (res) {},
      complete: function (res) { },
    })
    //图片临时路径
    wx.getStorage({
      key: 'imgPath_wid' + workId,
      success: function(res) {
        if(res.data.length>0){
          imgPath = res.data;
        }
        that.setData({
          tempImgPath: imgPath
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
    //联合总表信息
    wx.getStorage({
      key: 'unionImgs_wid' + workId,
      success: function (res) {
        if (res.data.length > 0) {
          unionImgs = res.data;
        }
        that.setData({
          unionImgs: unionImgs
        })
        console.log("联合总表信息", res.data);
      },
      fail: function (res) {},
    })
    //图片临时路径
    wx.getStorage({
      key: 'unionImgPath_wid' + workId,
      success: function (res) {
        if (res.data.length > 0) {
          unionImgPath = res.data;
        }
        that.setData({
          tempUnionImgPath: unionImgPath
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
    //法律法规
    wx.getStorage({
      key: 'law_wid' + workId,
      success: function (res) {
        if (res.data) {
          safeList.law = res.data;
        }
        that.setData({
          safeList: safeList
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })

    //其他情形
    wx.getStorage({
      key: 'remark_wid' + workId,
      success: function (res) {
        if (res.data) {
          safeList.remark = res.data;
        }
        that.setData({
          safeList: safeList
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
    that.setData({
      disabled: false,
      placeholder: '' //提示文本清空
    })
  },

  //清除指定的作业的本地缓存
  clearStorage: function(workId){
    wx.removeStorage({
      key: 'checkDate_wid' + workId,
    })
    wx.removeStorage({
      key: 'checkResult_wid' + workId,
    })
    wx.removeStorage({
      key: 'checkValue_wid' + workId,
    })
    wx.removeStorage({
      key: 'matterResult_wid' + workId,
    })
    wx.removeStorage({
      key: 'approver_wid' + workId,
    })
    wx.removeStorage({
      key: 'files_wid' + workId,
    })
    wx.removeStorage({
      key: 'imgs_wid' + workId,
    })
    wx.removeStorage({
      key: 'unionImgs_wid' + workId,
    })
    wx.removeStorage({
      key: 'imgPath_wid' + workId,
    })
    wx.removeStorage({
      key: 'unionImgPath_wid' + workId,
    })
    wx.removeStorage({
      key: 'law_wid' + workId,
    })
    wx.removeStorage({
      key: 'remark_wid' + workId,
    })
  },

  //验证表单方法
  validateForm: function (data) {
    if (!data.checkResult) {
      wx.showToast({
        title: '主要检查情况不能为空!',
        icon: 'none',
        duration: 2000,
        mask: true,
      })
      return false;
    }
    //默认的意见列表全是一样的“请输入检查意见”，通过判断有多少个一样的默认值来判断是否都选了
    if (data.safeList.result) {
      var defaultNum = 0;//默认的结果个数
      var changeNum = 0;//改变了的结果个数
      for (var i = 0; i < data.safeList.result.length; i++) {
        if (data.safeList.result[i] === '请输入检查结果') {
          defaultNum += 1;
        } else {
          changeNum += 1;
        }
      }
      if (changeNum < data.workInfo.matter.length) {
        wx.showToast({
          title: '请选择承办人意见',
          icon: 'none',
          duration: 2000,
          mask: true,
        })
        return false;
      }
    }
    if (data.date.value === '' || data.date.value === null){
      wx.showToast({
        title: '检查日期不能为空!',
        icon: 'none',
        duration: 2000,
        mask: true,
      })
      return false;
    }
    if (data.approver === '请选择') {
      wx.showToast({
        title: '请选择一个审批人!',
        icon: 'none',
        duration: 2000,
        mask: true,
      })
      return false;
    }
    if(data.isUnionHeadOrg){
      for(var i=0;i<data.files.length;i++){
        if(data.files[i].type === "union"){
          
        }
      }
      if (data.tempUnionImgPath.length > 0){
        
      }else if(data.unionImgs.length > 0){
        
      }else{
        wx.showToast({
          title: '请上传联合总表!',
          icon: 'none',
          duration: 2000,
          mask: true,
        })
        return false;
      }
    }
    for(var j=0;j<data.workInfo.matter.length;j++){
      if (data.workInfo.matter[j].remarkHidden == false){
        if(data.safeList.remark[j] != ''){
          
        }else{
          wx.showToast({
            title: '请输入其他情形!',
            icon: 'none',
            duration: 2000,
            mask: true,
          })
          return false;
        }
      }
    }
    return true;
  },

  //法律法规输入改变事件
  lawChange: function(e){
    var that = this;
    var safeList = that.data.safeList;
    var index = that.data.index;
    if (e.detail) {
      safeList.law[index] = e.detail.value;
      that.setData({
        safeList: safeList
      })
    }
  },

  //其他情形输入改变事件
  remarkChange: function (e) {
    var that = this;
    var safeList = that.data.safeList;
    var index = that.data.index;
    if (e.detail) {
      safeList.remark[index] = e.detail.value;
      that.setData({
        safeList: safeList
      })
    }
  },

  //删除本地缓存的图片文件
  delSavedImage: function(imgsPath){
    if(imgsPath.length>0){
      for (let i = 0; i < imgsPath.length; i++) {
        fileSys.removeSavedFile({
          filePath: imgsPath[i],
          success: function (res) { console.log("删除成功！") },
          fail: function (res) { console.log(res) },
          complete: function (res) { },
        })
      }
    }
  },

  //筛选出需要上传的图片路径
  filterImgPath: function(imgsPath){
    var uploadPath = [];//需要上传的图片路径
    //筛选出需要上传的图片
    if (imgsPath.length > 0) {
      for (let i = 0; i < imgsPath.length; i++) {
        //如果是已经缓存到本地的文件或者新上传的图片
        if (imgsPath[i].indexOf("store_") != -1) {
          uploadPath.push(imgsPath[i]);
        } else if (imgsPath[i].indexOf("tmp_") != -1) {
          uploadPath.push(imgsPath[i]);
        }
      }
    }
    return uploadPath;
  }
})