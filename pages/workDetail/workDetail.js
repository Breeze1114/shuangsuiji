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
    // wx.showToast({
    //   title: '加载中',
    //   icon: 'loading',
    //   image: '',
    //   duration: 250,
    //   mask: true,
    // })
    // setTimeout(function(){
    //   wx.hideToast();
    //   wx.showToast({
    //     title: '加载成功',
    //     icon: 'success',
    //     image: '',
    //     duration: 250,
    //     mask: true,
    //   })
    //   setTimeout(function(){
        //转换一下
        work = that.turnNull(work);
        that.setData({
          workId: options.workId,
          work: options.work,
          workInfo: work,
          status: status
        });
    //     wx.hideToast();
    //   },250)
    // },250)
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
      title: '作业详情',
    })
  },

  //导航方法
  gotoLocation: function (e) {
    wx.showToast({
      title: '请稍等',
      icon: 'loading',
      duration: 10000,
      mask: true,
    })
    var that = this;
    //地址转坐标
    setTimeout(function(){
      qqmapsdk.geocoder({
        address: that.data.workInfo.business_address, //地址参数，例：固定地址，address: '北京市海淀区彩和坊路海淀西大街74号'
        success: function (res) {//成功后的回调
          wx.hideToast();
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
            success: function (res) { 
              console.log(res);
            },
            fail: function (res) {
              wx.showModal({
                title: '系统提示',
                content: '导航出错,请联系管理员',
                showCancel: false,
                confirmText: '知道了',
                confirmColor: '',
                success: function (res) { if (res.confirm) { wx.hideToast(); } },
                fail: function (res) { },
                complete: function (res) { },
              })
            },
            complete: function (res) { },
          })
        },
        fail: function (error) {
          console.error(error);
          wx.showModal({
            title: '系统提示',
            content: '导航出错,请联系管理员',
            showCancel: false,
            confirmText: '知道了',
            confirmColor: '',
            success: function(res) {if(res.confirm){wx.hideToast();}},
            fail: function(res) {},
            complete: function(res) {},
          })
        },
        complete: function (res) {
          console.log(res);
        }
      })
    },500)
  },

  //把null值转成“ ”
  turnNull: function(work){
    var that = this;
    if(work.ep_phone === null || work.ep_phone === "null"){
      work.ep_phone = "";
    }
    if(work.check_users){
      for(var i=0;i<work.check_users.length;i++){
        if (work.check_users[i].law_number === null || work.check_users[i].law_number === "null"){
          work.check_users[i].law_number = "";
        }
        if (work.check_users[i].mobile_no === null || work.check_users[i].mobile_no === "null"){
          work.check_users[i].mobile_no = "";
        }
      }
    }
    return work;
  },

  //跳转到检查结果录入界面
  turnToInput: function(){
    var that = this;
    var status = that.data.status;
    var workId = app.globalData.work_id;
    var work = that.data.work;
    wx.navigateTo({
      url: "../workResultInput/workResultInput?status="+status+"&workId="+workId+"&work="+work+"",
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  }
})