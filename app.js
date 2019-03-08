//app.js
App({
  onLaunch: function () {
    
  },

  //上传附件
  uploadFile: function (imgPath, type, port, path, files, data) {
    var that = this;
    wx.showToast({//提示正在上传
      title: '正在上传...',
      icon: 'loading',
      mask: true,
      duration: 1000
    })
    var filePaths = imgPath;
    //var path = that.data.unionImgs;//联合总表的临时路径
    var unionFilePaths = that.filterImgPath(path);
    console.log("附件path：", filePaths);
    console.log("files：", files);
    if (filePaths.length > 0) {
      var files = files;
      var successNum = imgPath.successNum ? imgPath.successNum : 0;//上传成功次数
      var failNum = imgPath.failNum ? imgPath.failNum : 0;//上传失败次数
      var uploadTime = imgPath.uploadTime ? imgPath.uploadTime : 0;//上传次数
      wx.uploadFile({
        url: port + '/api/app/upload/result',
        filePath: filePaths[uploadTime],
        name: 'files',
        header: {
          'Authorization': that.globalData.authorization
        },
        success: function (res) {
          var data = JSON.parse(res.data);
          if (data.code === 0) {//上传请求成功状态码
            //新增一个文件对象
            var file = {
              name: data.data.name,
              status: data.data.status,
              thumbUrl: data.data.thumbUrl,
              uid: data.data.uid,
              url: data.data.url,
              type: data.data.type
            }
            //统计上传文件的个数
            successNum += 1;
            //把文件对象放在文件列表里
            files.push(file);
            console.log('上传成功次数:' + successNum + ',这是第' + (uploadTime + 1) + '次上传');
            // that.setData({
            //   files: files
            // })
            that.globalData.files = files;
          } else {
            wx.showModal({
              title: '错误提示',
              content: '上传图片失败',
              showCancel: false,
              success: function (res) { }
            })
          }
        },
        fail: function (res) {
          failNum += 1;
          console.log('上传失败次数:' + failNum + ',这是第' + (uploadTime + 1) + '次上传');
          wx.showModal({
            title: '错误提示',
            content: '上传图片失败',
            showCancel: false,
            success: function (res) { }
          })
        },
        complete: function (res) {
          uploadTime++;
          if (uploadTime == imgPath.length) {
            wx.hideToast();
            console.log('上传完毕，其中成功' + successNum + '次，失败' + failNum + '次');
            if (unionFilePaths.length > 0) {
              that.uploadUnionFile(unionFilePaths, type, imgPath, port, data, that.globalData.files);
            } else {
              that.submitResult(type, imgPath, [], data, port, that.globalData.files);
            }
          } else {
            imgPath.successNum = successNum;
            imgPath.failNUm = failNum;
            imgPath.uploadTime = uploadTime;
            that.uploadFile(imgPath, type, port, path, that.globalData.files, data);
          }
        },
      })
    } else if (unionFilePaths.length > 0) {
      that.uploadUnionFile(unionFilePaths, type, imgPath, port, data, files);
    } else {
      that.submitResult(type, imgPath, [], data, port ,files);
    }
  },

  //上传联合总表
  uploadUnionFile: function (e, submitType, imgPath, port, data, files) {
    //let port = app.globalData.port;
    var that = this;
    wx.showToast({//提示正在上传
      title: '正在上传...',
      icon: 'loading',
      mask: true,
      duration: 1000
    })
    var filePaths = e;
    console.log("联合总表path：", filePaths);
    console.log("files：", files);
    if (filePaths.length > 0) {
      var files = files;
      var successNum = e.successNum ? e.successNum : 0;//上传成功次数
      var failNum = e.failNum ? e.failNum : 0;//上传失败次数
      var uploadTime = e.uploadTime ? e.uploadTime : 0;//上传次数
      wx.uploadFile({
        url: port + '/api/app/upload/result?type=union',
        filePath: filePaths[uploadTime],
        name: 'files',
        header: {
          'Authorization': that.globalData.authorization
        },
        success: function (res) {
          var data = JSON.parse(res.data);
          if (data.code === 0) {//上传请求成功状态码
            //新增一个文件对象
            var file = {
              name: data.data.name,
              status: data.data.status,
              thumbUrl: data.data.thumbUrl,
              uid: data.data.uid,
              url: data.data.url,
              type: data.data.type
            }
            //统计上传文件的个数
            successNum += 1;
            //把文件对象放在文件列表里
            files.push(file);
            console.log('上传成功次数:' + successNum + ',这是第' + (uploadTime + 1) + '次上传');
            that.globalData.files = files;
          } else {
            wx.showModal({
              title: '错误提示',
              content: '上传图片失败',
              showCancel: false,
              success: function (res) { }
            })
          }
        },
        fail: function (res) {
          failNum += 1;
          console.log('上传失败次数:' + failNum + ',这是第' + (uploadTime + 1) + '次上传');
          wx.showModal({
            title: '错误提示',
            content: '上传图片失败',
            showCancel: false,
            success: function (res) { }
          })
        },
        complete: function (res) {
          uploadTime++;
          if (uploadTime == e.length) {
            wx.hideToast();
            console.log('上传完毕，其中成功' + successNum + '次，失败' + failNum + '次');
            that.submitResult(submitType, imgPath, e, data, port, that.globalData.files);
          } else {
            e.successNum = successNum;
            e.failNUm = failNum;
            e.uploadTime = uploadTime;
            that.uploadUnionFile(e, submitType, imgPath, port, data, that.globalData.files);
          }
        },
      })
    } else {
      that.submitResult(submitType, imgPath, e, data, port, files);
    }
  },

  //上传结果
  submitResult: function (type, imgPath, unionImgPath, data, port, files) {
    var that = this;
    var matterCheckResultList = [];
    var checkResultObj = {};
    var list = data.workInfo.matter;
    //let port = app.globalData.port;
    for (var i = 0; i < list.length; i++) {
      checkResultObj = {
        code: list[i].code,
        name: list[i].name,
        result: data.safeList.result[i],
        law: data.safeList.law[i],
        remark: data.safeList.remark[i]
      }
      matterCheckResultList.push(checkResultObj);
    }
    wx.request({
      url: port + '/api/app/checkUser/work/' + data.workId + '/submitCheckResult',
      data: {
        check_result: data.checkResult,
        operate: type,//暂定提交审核，到时候需要再改
        check_date: data.date.value,
        is_pass: data.radioValue,
        audit_user_id: data.approverId,
        audit_user_name: data.approver,
        matter_check_result: matterCheckResultList,
        files: files
      },
      header: {
        'Authorization': that.globalData.authorization
      },
      method: 'post',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        console.log(res);
        if (res.data.code != 1) {
          setTimeout(function () {
            wx.navigateBack({
              delta: 2,
            })
          }, 1000)
          wx.showToast({
            title: '提交成功！',
            icon: 'success',
            duration: 1000,
            mask: true,
          })
          that.delSavedImage(imgPath);//删除本地缓存的图片信息
          that.delSavedImage(unionImgPath);
          that.clearStorage(data.workId);//提交到服务器后移除本地的缓存
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false,
            confirmText: '返回',
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 2,
                })
              }
            },
            fail: function (res) { },
            complete: function (res) { },
          })
        }
      },
      fail: function (res) {
        wx.showModal({
          title: '系统提示',
          content: '检查结果提交失败',
          showCancel: false,
          confirmText: '知道了'
        })
      },
      complete: function (res) { },
    })
  },

  //删除本地缓存的图片文件
  delSavedImage: function (imgsPath) {
    var fileSys = wx.getFileSystemManager();
    if (imgsPath.length > 0) {
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
  filterImgPath: function (imgsPath) {
    var uploadPath = [];//需要上传的图片路径
    //筛选出需要上传的图片
    if (imgsPath != undefined && imgsPath.length > 0) {
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
  },

  //清除指定的作业的本地缓存
  clearStorage: function (workId) {
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
    wx.removeStorage({
      key: 'work_wid' + workId,
    })
    wx.removeStorage({
      key: 'data_wid' + workId,
    })
  },

  globalData: {
    token: null,
    task_id: "",
    work_id: "",
    workIds:[],
    port:'https://wx5.vtoone.com',//端口号
    authorization: '',
    files:[],
  }
})