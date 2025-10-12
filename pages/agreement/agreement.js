// pages/agreement/agreement.js
Page({
  data: {
    isLoading: false
  },

  onLoad: function (options) {
    // 页面加载时可以记录来源
    console.log('用户协议页面加载')
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
      title: '大五人格测试 - 用户协议',
      path: '/pages/agreement/agreement'
    }
  }
})