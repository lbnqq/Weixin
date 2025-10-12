// pages/privacy/privacy.js
Page({
  data: {
    isLoading: false
  },

  onLoad: function (options) {
    // 页面加载时可以记录来源
    console.log('隐私政策页面加载')
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '大五人格测试 - 隐私政策',
      path: '/pages/privacy/privacy'
    }
  }
})