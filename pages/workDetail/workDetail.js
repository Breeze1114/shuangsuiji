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
    that.setData({
      workId: options.workId,
      work: options.work,
      workInfo: work,
      status: status
    });
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
})