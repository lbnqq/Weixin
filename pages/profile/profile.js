// pages/profile/profile.js
Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    stats: {
      totalTests: 0,
      latestDate: null,
      averageScore: 0
    }
  },

  onLoad: function (options) {
    this.checkLoginStatus()
    this.loadUserStats()
  },

  onShow: function () {
    this.checkLoginStatus()
    this.loadUserStats()
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo,
      isLoggedIn: !!userInfo
    })
  },

  // 加载用户统计数据
  loadUserStats: function () {
    const testResults = wx.getStorageSync('testResults') || []

    if (testResults.length > 0) {
      const totalTests = testResults.length
      const latestDate = testResults[0].testDate
      const totalAverage = testResults.reduce((sum, result) => {
        return sum + parseFloat(result.totalAverage || 0)
      }, 0)
      const averageScore = (totalAverage / totalTests).toFixed(1)

      this.setData({
        stats: {
          totalTests,
          latestDate,
          averageScore
        }
      })
    }
  },

  // 登录
  handleLogin: function () {
    this.getUserProfile()
  },

  // 获取用户信息
  getUserProfile: function () {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const userInfo = res.userInfo
        this.setData({
          userInfo: userInfo,
          isLoggedIn: true
        })

        // 保存用户信息
        wx.setStorageSync('userInfo', userInfo)

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err)
        wx.showToast({
          title: '登录失败',
          icon: 'error'
        })
      }
    })
  },

  // 退出登录
  handleLogout: function () {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      confirmColor: '#E34D59',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo')
          this.setData({
            userInfo: null,
            isLoggedIn: false
          })

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },

  // 查看历史记录
  viewHistory: function () {
    wx.switchTab({
      url: '/pages/history/history'
    })
  },

  // 开始测试
  startTest: function () {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 分享应用
  shareApp: function () {
    wx.showActionSheet({
      itemList: ['分享给朋友'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.onShareAppMessage()
        }
      }
    })
  },

  // 关于我们
  aboutUs: function () {
    wx.showModal({
      title: '关于我们',
      content: '大五人格测试小程序基于专业的心理学理论，通过AI智能分析帮助用户深入了解自己的性格特征。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 意见反馈
  feedback: function () {
    wx.showModal({
      title: '意见反馈',
      content: '如有问题或建议，请联系开发者。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 清除数据
  clearData: function () {
    wx.showModal({
      title: '清除数据',
      content: '确定要清除所有本地数据吗？包括测试记录和用户信息。',
      confirmText: '清除',
      confirmColor: '#E34D59',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync()
            this.setData({
              userInfo: null,
              isLoggedIn: false,
              stats: {
                totalTests: 0,
                latestDate: null,
                averageScore: 0
              }
            })

            wx.showToast({
              title: '清除成功',
              icon: 'success'
            })
          } catch (error) {
            console.error('清除数据失败:', error)
            wx.showToast({
              title: '清除失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: '大五人格测试 - 了解自己的性格特征',
      path: '/pages/index/index',
      imageUrl: ''
    }
  }
})