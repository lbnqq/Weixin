// pages/index/index.js
const app = getApp()
const { loadProgress } = require('../../utils/calculation')
const { TestService } = require('../../utils/test-service')

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
  async loadRecentTests() {
    if (!this.data.isLoggedIn) return

    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo) {
        this.setData({
          recentTests: []
        })
        return
      }

      // 优先从云端加载最近测试记录
      const testService = new TestService()
      const cloudResult = await testService.getTestHistory({
        page: 1,
        pageSize: 3
      })

      let recentTests = []
      if (cloudResult.success && cloudResult.data.records.length > 0) {
        // 将云端数据转换为显示格式
        recentTests = cloudResult.data.records.map(record => ({
          testId: record.testId,
          testType: record.testType,
          testDate: this.formatDate(record.testDate),
          scores: record.scores,
          duration: record.duration,
          // 添加显示需要的额外字段
          formattedScores: this.formatScoresForDisplay(record.scores),
          summary: this.generateTestSummary(record.scores)
        }))

        console.log(`从云端加载用户 ${userInfo.nickName} 的最近测试记录:`, recentTests.length, '条')
      } else {
        // 如果云端没有数据，尝试从本地加载
        const userHistoryKey = `testHistory_${userInfo._openid || 'anonymous'}`
        const localTests = wx.getStorageSync(userHistoryKey) || []

        recentTests = localTests.slice(0, 3).map(test => ({
          ...test,
          testDate: this.formatDate(test.testDate || test.timestamp),
          formattedScores: this.formatScoresForDisplay(test.scores),
          summary: this.generateTestSummary(test.scores)
        }))

        console.log(`从本地加载用户 ${userInfo.nickName} 的最近测试记录:`, recentTests.length, '条')
      }

      this.setData({
        recentTests: recentTests
      })
    } catch (error) {
      console.error('加载最近测试记录失败:', error)
      this.setData({
        recentTests: []
      })
    }
  },

  // 格式化日期显示
  formatDate: function(dateString) {
    if (!dateString) return '未知时间'

    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = now - date
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return '今天'
      } else if (diffDays === 1) {
        return '昨天'
      } else if (diffDays < 7) {
        return `${diffDays}天前`
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return `${weeks}周前`
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return `${months}个月前`
      } else {
        const years = Math.floor(diffDays / 365)
        return `${years}年前`
      }
    } catch (error) {
      return '未知时间'
    }
  },

  // 格式化分数显示
  formatScoresForDisplay: function(scores) {
    if (!scores) return {}

    // 如果是简单数字格式，转换为显示格式
    if (typeof scores.openness === 'number') {
      return {
        openness: scores.openness,
        conscientiousness: scores.conscientiousness,
        extraversion: scores.extraversion,
        agreeableness: scores.agreeableness,
        neuroticism: scores.neuroticism
      }
    }

    // 如果是复杂对象格式，提取百分比
    if (scores.openness && typeof scores.openness === 'object') {
      return {
        openness: parseFloat(scores.openness.percentage || 0),
        conscientiousness: parseFloat(scores.conscientiousness.percentage || 0),
        extraversion: parseFloat(scores.extraversion.percentage || 0),
        agreeableness: parseFloat(scores.agreeableness.percentage || 0),
        neuroticism: parseFloat(scores.neuroticism.percentage || 0)
      }
    }

    return {}
  },

  // 生成测试摘要
  generateTestSummary: function(scores) {
    if (!scores) return '性格分析'

    let formattedScores = this.formatScoresForDisplay(scores)
    if (!formattedScores || Object.keys(formattedScores).length === 0) {
      return '性格分析'
    }

    // 找出最高分的特质
    let highestTrait = ''
    let highestScore = 0
    const traitNames = {
      openness: '开放性',
      conscientiousness: '尽责性',
      extraversion: '外向性',
      agreeableness: '宜人性',
      neuroticism: '神经质'
    }

    Object.keys(formattedScores).forEach(trait => {
      if (formattedScores[trait] > highestScore) {
        highestScore = formattedScores[trait]
        highestTrait = traitNames[trait]
      }
    })

    return `突出特质：${highestTrait} (${highestScore}分)`
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
  }
})