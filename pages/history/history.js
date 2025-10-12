// pages/history/history.js
Page({
  data: {
    testHistory: [],
    isEmpty: true,
    isLoading: true
  },

  onLoad: function (options) {
    this.loadTestHistory()
  },

  onShow: function () {
    // 每次显示页面时刷新历史记录
    this.loadTestHistory()
  },

  // 加载测试历史
  loadTestHistory: function () {
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

      // 获取当前用户的测试历史
      const userHistoryKey = `testResults_${userInfo.userId || userInfo.openid || 'anonymous'}`
      const history = wx.getStorageSync(userHistoryKey) || []

      console.log(`加载用户 ${userInfo.nickName} 的历史记录:`, history.length, '条')

      this.setData({
        testHistory: history,
        isEmpty: history.length === 0,
        isLoading: false
      })
    } catch (error) {
      console.error('加载历史记录失败:', error)
      this.setData({
        isLoading: false,
        isEmpty: true
      })
    }
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