// pages/history/history.js
const { TestService } = require('../../utils/test-service')

Page({
  data: {
    testHistory: [],
    isEmpty: true,
    isLoading: true,
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    hasMore: true,
    sortBy: 'date', // date, score
    sortOrder: 'desc' // desc, asc
  },

  onLoad: function (options) {
    this.loadTestHistory()
  },

  onShow: function () {
    // 每次显示页面时刷新历史记录
    this.loadTestHistory()
  },

  // 加载测试历史
  async loadTestHistory(loadMore = false) {
    try {
      // 检查用户登录状态
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo) {
        console.log('用户未登录，清空历史记录显示')
        this.setData({
          testHistory: [],
          isEmpty: true,
          isLoading: false
        })
        return
      }

      if (!loadMore) {
        this.setData({
          isLoading: true,
          currentPage: 1
        })
      }

      // 先从云端加载测试历史
      const testService = new TestService()
      const cloudResult = await testService.getTestHistory({
        page: this.data.currentPage,
        pageSize: this.data.pageSize
      })

      let newHistory = []
      let totalCount = 0

      if (cloudResult.success && cloudResult.data.records.length > 0) {
        // 将云端数据转换为显示格式
        newHistory = cloudResult.data.records.map(record => ({
          testId: record.testId,
          testType: record.testType,
          testDate: record.testDate,
          scores: record.scores,
          duration: record.duration,
          // 显示格式化字段
          formattedDate: this.formatDate(record.testDate),
          formattedScores: this.formatScoresForDisplay(record.scores),
          summary: this.generateTestSummary(record.scores),
          totalScore: this.calculateTotalScore(record.scores),
          // 为了兼容现有页面，添加一些额外字段
          timestamp: new Date(record.testDate).getTime(),
          mbtiResult: null,
          belbinResult: null
        }))

        totalCount = cloudResult.data.pagination.total
        console.log(`从云端加载用户 ${userInfo.nickName} 的历史记录:`, newHistory.length, '条，总数:', totalCount)
      } else {
        console.log('云端没有历史记录，尝试加载本地记录')
        // 如果云端没有数据，尝试加载本地历史记录
        const userHistoryKey = `testHistory_${userInfo._openid || 'anonymous'}`
        const localHistory = wx.getStorageSync(userHistoryKey) || []

        newHistory = localHistory.map(test => ({
          ...test,
          formattedDate: this.formatDate(test.testDate || test.timestamp),
          formattedScores: this.formatScoresForDisplay(test.scores),
          summary: this.generateTestSummary(test.scores),
          totalScore: this.calculateTotalScore(test.scores)
        }))

        totalCount = localHistory.length
      }

      // 合并或替换历史记录
      let finalHistory = loadMore ? [...this.data.testHistory, ...newHistory] : newHistory

      this.setData({
        testHistory: finalHistory,
        isEmpty: finalHistory.length === 0,
        isLoading: false,
        totalCount: totalCount,
        hasMore: finalHistory.length < totalCount,
        currentPage: loadMore ? this.data.currentPage + 1 : 2
      })
    } catch (error) {
      console.error('加载历史记录失败:', error)

      // 发生错误时，尝试加载本地历史记录作为备份
      try {
        const userInfo = wx.getStorageSync('userInfo')
        const userHistoryKey = `testHistory_${userInfo._openid || 'anonymous'}`
        const localHistory = wx.getStorageSync(userHistoryKey) || []

        const formattedHistory = localHistory.map(test => ({
          ...test,
          formattedDate: this.formatDate(test.testDate || test.timestamp),
          formattedScores: this.formatScoresForDisplay(test.scores),
          summary: this.generateTestSummary(test.scores),
          totalScore: this.calculateTotalScore(test.scores)
        }))

        this.setData({
          testHistory: formattedHistory,
          isEmpty: formattedHistory.length === 0,
          isLoading: false,
          totalCount: formattedHistory.length,
          hasMore: false
        })

        if (formattedHistory.length > 0) {
          console.log('使用本地历史记录作为备份')
        }
      } catch (localError) {
        console.error('加载本地历史记录也失败:', localError)
        this.setData({
          isLoading: false,
          isEmpty: true
        })
      }
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

    // 如果是简单数字格式，直接返回
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

  // 计算总分
  calculateTotalScore: function(scores) {
    let formattedScores = this.formatScoresForDisplay(scores)
    if (!formattedScores || Object.keys(formattedScores).length === 0) {
      return 0
    }

    let total = 0
    Object.values(formattedScores).forEach(score => {
      total += score || 0
    })

    return Math.round(total / Object.keys(formattedScores).length)
  },

  // 加载更多
  loadMore: function() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadTestHistory(true)
    }
  },

  // 刷新历史记录
  refreshHistory: function() {
    this.setData({
      currentPage: 1,
      testHistory: [],
      hasMore: true
    })
    this.loadTestHistory()
  },

  // 查看测试结果
  viewResult: function (e) {
    const index = e.currentTarget.dataset.index
    const result = this.data.testHistory[index]

    // 将结果保存到临时存储
    wx.setStorageSync('tempResult', result)

    // 跳转到结果页面
    wx.navigateTo({
      url: '/pages/result/result?fromHistory=true'
    })
  },

  // 开始新测试
  startNewTest: function() {
    wx.navigateTo({
      url: '/pages/test/test'
    })
  },

  // 分享历史记录
  shareHistory: function() {
    const userInfo = wx.getStorageSync('userInfo')
    const testCount = this.data.testHistory.length

    if (testCount === 0) return

    const shareContent = `我已经完成了${testCount}次大五人格测试！来看看我的性格分析结果吧。`

    wx.showShareMenu({
      withShareTicket: true
    })
  },

  // 删除测试记录
  deleteRecord: function (e) {
    const index = e.currentTarget.dataset.index
    const record = this.data.testHistory[index]

    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${record.testDate} 的测试记录吗？`,
      confirmText: '删除',
      confirmColor: '#E34D59',
      success: (res) => {
        if (res.confirm) {
          this.deleteHistoryRecord(index)
        }
      }
    })
  },

  // 删除历史记录
  deleteHistoryRecord: function (index) {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo) {
        wx.showToast({
          title: '用户未登录',
          icon: 'none'
        })
        return
      }

      const history = [...this.data.testHistory]
      history.splice(index, 1)

      // 更新当前用户的本地存储
      const userHistoryKey = `testResults_${userInfo.userId || userInfo.openid || 'anonymous'}`
      wx.setStorageSync(userHistoryKey, history)

      // 更新页面状态
      this.setData({
        testHistory: history,
        isEmpty: history.length === 0
      })

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('删除记录失败:', error)
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  },

  // 清空所有历史记录
  clearAllHistory: function () {
    if (this.data.testHistory.length === 0) return

    wx.showModal({
      title: '清空历史记录',
      content: '确定要清空所有测试历史记录吗？此操作不可恢复。',
      confirmText: '清空',
      confirmColor: '#E34D59',
      success: (res) => {
        if (res.confirm) {
          try {
            const userInfo = wx.getStorageSync('userInfo')
            if (!userInfo) {
              wx.showToast({
                title: '用户未登录',
                icon: 'none'
              })
              return
            }

            // 清空当前用户的历史记录
            const userHistoryKey = `testResults_${userInfo.userId || userInfo.openid || 'anonymous'}`
            wx.removeStorageSync(userHistoryKey)

            this.setData({
              testHistory: [],
              isEmpty: true
            })

            wx.showToast({
              title: '清空成功',
              icon: 'success'
            })
          } catch (error) {
            console.error('清空历史记录失败:', error)
            wx.showToast({
              title: '清空失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 开始新测试
  startNewTest: function () {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 格式化日期
  formatDate: function (timestamp) {
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  }
})