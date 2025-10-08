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

    const tests = wx.getStorageSync('testResults') || []
    this.setData({
      recentTests: tests.slice(0, 3) // 只显示最近3条
    })
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

  // 登录功能
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
        app.globalData.userInfo = userInfo
        app.globalData.isLoggedIn = true

        // 这里可以添加登录后的逻辑，比如同步到Supabase
        this.syncUserToSupabase(userInfo)

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

  // 同步用户信息到Supabase
  async syncUserToSupabase(userInfo) {
    try {
      // 首先获取微信登录code
      const { code } = await wx.login()

      // 创建用户记录到Supabase
      const userData = {
        openid: code, // 这里应该用实际的openid
        nickname: userInfo.nickName,
        avatar_url: userInfo.avatarUrl,
        gender: userInfo.gender,
        country: userInfo.country,
        province: userInfo.province,
        city: userInfo.city,
        updated_at: new Date().toISOString()
      }

      // 检查用户是否已存在
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('openid', userData.openid)
        .single()

      if (existingUser) {
        // 更新现有用户
        await supabase
          .from('users')
          .update(userData)
          .eq('openid', userData.openid)
      } else {
        // 创建新用户
        await supabase
          .from('users')
          .insert([userData])
      }
    } catch (error) {
      console.error('同步用户信息到Supabase失败:', error)
    }
  }
})