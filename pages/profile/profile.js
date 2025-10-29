// pages/profile/profile.js
const app = getApp()
const { CloudAuth } = require('../../utils/cloud-auth')

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    stats: {
      totalTests: 0,
      latestDate: null,
      averageScore: 0
    },
    showLoginModal: false,
    agreedToAgreement: false
  },

  onLoad: function (options) {
    this.checkLoginStatus()
    this.loadUserStats()
  },

  onShow: function () {
    this.checkLoginStatus()
    this.loadUserStats()
    
    // 检查是否是从协议页面返回的
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage.options && currentPage.options.fromModal === 'true' && !this.data.isLoggedIn) {
      // 如果是从协议页面返回且用户未登录，重新显示登录弹窗
      this.showLoginModal()
    }
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
    if (!this.data.isLoggedIn) {
      this.setData({
        stats: {
          totalTests: 0,
          latestDate: null,
          averageScore: 0
        }
      })
      return
    }

    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo) return

      // 获取当前用户的测试历史
      const userHistoryKey = `testResults_${userInfo.userId || userInfo.openid || 'anonymous'}`
      const testResults = wx.getStorageSync(userHistoryKey) || []

      console.log(`加载用户 ${userInfo.nickName} 的统计数据:`, testResults.length, '条记录')

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
      } else {
        this.setData({
          stats: {
            totalTests: 0,
            latestDate: null,
            averageScore: 0
          }
        })
      }
    } catch (error) {
      console.error('加载用户统计数据失败:', error)
      this.setData({
        stats: {
          totalTests: 0,
          latestDate: null,
          averageScore: 0
        }
      })
    }
  },

  // 登录
  handleLogin: function () {
    this.showLoginModal()
  },

  // 显示登录弹窗
  showLoginModal: function () {
    this.setData({
      showLoginModal: true,
      agreedToAgreement: false
    })
  },

  // 隐藏登录弹窗
  hideLoginModal: function () {
    this.setData({
      showLoginModal: false
    })
  },

  // 切换协议同意状态
  toggleAgreement: function () {
    this.setData({
      agreedToAgreement: !this.data.agreedToAgreement
    })
  },

  // 确认登录
  confirmLogin: function () {
    if (!this.data.agreedToAgreement) {
      wx.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none'
      })
      return
    }
    
    this.hideLoginModal()
    this.getUserProfile()
  },

  // 查看用户协议
  viewAgreement: function () {
    wx.navigateTo({
      url: '/pages/agreement/agreement'
    })
  },

  // 查看隐私政策
  viewPrivacy: function () {
    wx.navigateTo({
      url: '/pages/privacy/privacy'
    })
  },

  // 在弹窗中查看用户协议
  viewAgreementInModal: function () {
    // 不关闭弹窗，直接跳转到协议页面
    wx.navigateTo({
      url: '/pages/agreement/agreement?fromModal=true'
    })
  },

  // 在弹窗中查看隐私政策
  viewPrivacyInModal: function () {
    // 不关闭弹窗，直接跳转到隐私政策页面
    wx.navigateTo({
      url: '/pages/privacy/privacy?fromModal=true'
    })
  },

  // 编辑资料
  editProfile: function () {
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'error'
      })
      return
    }

    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    })
  },

  // 获取用户信息并登录
  async getUserProfile() {
    try {
      wx.showLoading({
        title: '登录中...'
      })

      const cloudAuth = new CloudAuth()
      const loginResult = await cloudAuth.login()

      wx.hideLoading()

      if (loginResult.success) {
        this.setData({
          userInfo: loginResult.data,
          isLoggedIn: true
        })

        console.log(`用户 ${loginResult.data.nickName} 已登录`)

        // 加载用户统计数据
        this.loadUserStats()

        wx.showToast({
          title: loginResult.isNewUser ? '注册成功' : '登录成功',
          icon: 'success'
        })
      } else {
        throw new Error(loginResult.error)
      }
    } catch (error) {
      wx.hideLoading()
      console.error('登录失败:', error)
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'error'
      })
    }
  },

  
  // 退出登录
  handleLogout: function () {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？退出后将清除当前用户的本地数据。',
      confirmText: '退出',
      confirmColor: '#E34D59',
      success: (res) => {
        if (res.confirm) {
          try {
            // 使用云开发认证登出
            const cloudAuth = new CloudAuth()
            cloudAuth.logout()

            // 获取当前用户信息用于清理数据
            const userInfo = wx.getStorageSync('userInfo')

            // 清除用户测试记录数据
            if (userInfo) {
              const userHistoryKey = `testHistory_${userInfo._openid || 'anonymous'}`
              wx.removeStorageSync(userHistoryKey)
              console.log(`已清除用户 ${userInfo.nickName} 的测试记录数据`)
            }

            // 清除测试进度数据
            wx.removeStorageSync('testProgress')

            // 清除临时结果数据
            wx.removeStorageSync('tempResult')
            wx.removeStorageSync('currentTestAnswers')

            // 清除旧的测试记录数据（如果存在）
            this.cleanupOldData()

            // 更新页面状态
            this.setData({
              userInfo: null,
              isLoggedIn: false,
              stats: {
                totalTests: 0,
                latestDate: null,
                averageScore: 0
              }
            })

            console.log(`用户 ${userInfo ? userInfo.nickName : 'unknown'} 已退出登录，本地数据已清除`)

            // 调用全局登出方法
            app.globalLogout()

            wx.showToast({
              title: '已退出登录',
              icon: 'success'
            })
          } catch (error) {
            console.error('退出登录失败:', error)
            wx.showToast({
              title: '退出失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 清理旧数据
  cleanupOldData: function() {
    try {
      // 清除旧的通用测试记录键
      const oldTestData = wx.getStorageSync('testResults')
      if (oldTestData) {
        wx.removeStorageSync('testResults')
        console.log('已清除旧的测试记录数据')
      }
    } catch (error) {
      console.error('清理旧数据失败:', error)
    }
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
    const isUserLoggedIn = this.data.isLoggedIn
    const content = isUserLoggedIn
      ? `确定要清除 ${this.data.userInfo.nickName} 的所有本地数据吗？包括测试记录和用户信息。`
      : '确定要清除所有本地数据吗？包括测试记录和用户信息。'

    wx.showModal({
      title: '清除数据',
      content: content,
      confirmText: '清除',
      confirmColor: '#E34D59',
      success: (res) => {
        if (res.confirm) {
          try {
            if (isUserLoggedIn) {
              // 只清除当前用户的数据
              const userInfo = wx.getStorageSync('userInfo')
              if (userInfo) {
                const userHistoryKey = `testResults_${userInfo.userId || userInfo.openid || 'anonymous'}`
                wx.removeStorageSync(userHistoryKey)
                console.log(`已清除用户 ${userInfo.nickName} 的测试数据`)
              }

              // 清除用户登录信息
              wx.removeStorageSync('userInfo')
              wx.removeStorageSync('loginCode')

              // 清除通用数据
              wx.removeStorageSync('testProgress')
              wx.removeStorageSync('tempResult')
              wx.removeStorageSync('currentTestAnswers')
            } else {
              // 如果未登录，清除所有数据
              wx.clearStorageSync()
            }

            // 更新页面状态
            this.setData({
              userInfo: null,
              isLoggedIn: false,
              stats: {
                totalTests: 0,
                latestDate: null,
                averageScore: 0
              }
            })

            // 调用全局登出方法
            app.globalLogout()

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
  },

  
  // 简单的字符串哈希函数
  hashCode: function(str) {
    let hash = 0
    if (str.length === 0) return hash
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash)
  },

  // 测试数据隔离功能（开发调试用）
  testDataIsolation: function() {
    console.log('=== 测试数据隔离功能 ===')

    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo')
    console.log('当前用户:', userInfo)

    // 检查用户特定的存储键
    if (userInfo) {
      const userHistoryKey = `testResults_${userInfo.userId || userInfo.openid || 'anonymous'}`
      const userData = wx.getStorageSync(userHistoryKey)
      console.log(`用户 ${userInfo.nickName} 的测试记录:`, userData ? userData.length : 0, '条')
    }

    // 检查旧的数据键
    const oldData = wx.getStorageSync('testResults')
    console.log('旧数据键 testResults:', oldData ? oldData.length : 0, '条')

    // 检查通用数据
    const progress = wx.getStorageSync('testProgress')
    console.log('测试进度:', progress ? '存在' : '不存在')

    console.log('=== 测试完成 ===')
  }
})