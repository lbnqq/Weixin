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

  onUnload: function() {
    // 页面卸载时，如果有fromModal参数，需要清除它
    const pages = getCurrentPages()
    if (pages.length > 1) {
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage.route === 'pages/profile/profile') {
        // 清除fromModal参数，避免重复触发登录弹窗
        if (prevPage.options && prevPage.options.fromModal) {
          delete prevPage.options.fromModal
        }
      }
    }
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '大五人格测试 - 隐私政策',
      path: '/pages/privacy/privacy'
    }
  }
})