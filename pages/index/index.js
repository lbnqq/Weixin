// pages/index/index.js
const app = getApp()
const { supabase } = require('../../utils/supabase')
const { loadProgress } = require('../../utils/calculation')

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    testProgress: null,
    recentTests: [],
    isLoading: false,
    theme: app.globalData.theme || {}
  },

  onLoad: function (options) {
    // 设置主题
    this.setData({
      theme: app.globalData.theme || {}
    })

    // 检查登录状态
    this.checkLoginStatus()

    // 加载测试进度
    this.loadTestProgress()

    // 加载最近的测试记录
    this.loadRecentTests()
  },

  onShow: function () {
    // 每次显示页面时刷新数据
    this.checkLoginStatus()
    this.loadTestProgress()
    this.loadRecentTests()
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLoggedIn: true
      })
      app.globalData.userInfo = userInfo
      app.globalData.isLoggedIn = true
    } else {
      this.setData({
        userInfo: null,
        isLoggedIn: false
      })
    }
  },

  // 加载测试进度
  loadTestProgress: function () {
    const progress = loadProgress()
    if (progress) {
      this.setData({
        testProgress: progress
      })
    }
  },

  // 加载最近的测试记录
  loadRecentTests: function () {
    if (!this.data.isLoggedIn) return

    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo) {
        this.setData({
          recentTests: []
        })
        return
      }

      // 获取当前用户的测试历史
      const userHistoryKey = `testResults_${userInfo.userId || userInfo.openid || 'anonymous'}`
      const tests = wx.getStorageSync(userHistoryKey) || []

      console.log(`加载用户 ${userInfo.nickName} 的最近测试记录:`, tests.length, '条')

      this.setData({
        recentTests: tests.slice(0, 3) // 只显示最近3条
      })
    } catch (error) {
      console.error('加载最近测试记录失败:', error)
      this.setData({
        recentTests: []
      })
    }
  },

  // 开始测试
  startTest: function () {
    if (this.data.testProgress) {
      // 如果有未完成的测试，询问是否继续
      wx.showModal({
        title: '继续测试',
        content: `您有一个未完成的测试，进度 ${this.data.testProgress.current}/50，是否继续？`,
        confirmText: '继续',
        cancelText: '重新开始',
        success: (res) => {
          if (res.confirm) {
            // 继续测试
            wx.navigateTo({
              url: `/pages/test/test?currentQuestion=${this.data.testProgress.currentQuestion}`
            })
          } else {
            // 重新开始
            this.restartTest()
          }
        }
      })
    } else {
      // 开始新测试
      wx.navigateTo({
        url: '/pages/test/test'
      })
    }
  },

  // 重新开始测试
  restartTest: function () {
    wx.showModal({
      title: '重新开始',
      content: '确定要重新开始测试吗？当前进度将被清除。',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 清除进度
          wx.removeStorageSync('testProgress')
          this.setData({
            testProgress: null
          })

          // 开始新测试
          wx.navigateTo({
            url: '/pages/test/test'
          })
        }
      }
    })
  },

  // 查看测试结果
  viewResult: function (e) {
    const index = e.currentTarget.dataset.index
    const result = this.data.recentTests[index]

    // 将结果保存到临时存储，供结果页面使用
    wx.setStorageSync('tempResult', result)

    wx.navigateTo({
      url: '/pages/result/result?fromHistory=true'
    })
  },

  // 查看历史记录
  viewHistory: function () {
    wx.switchTab({
      url: '/pages/history/history'
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

  // 分享到朋友圈
  onShareTimeline: function () {
    return {
      title: '大五人格测试 - 了解自己的性格特征',
      imageUrl: ''
    }
  },

  
})