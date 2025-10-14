// app.js
App({
  onLaunch: function () {
    // 加载配置
    this.loadConfig()
    
    // 初始化TDesign主题
    this.initTheme()

    // 清理旧数据
    this.cleanupOldData()

    // 检查登录状态
    this.checkLoginStatus()
  },

  // 加载配置
  loadConfig: function() {
    try {
      const config = require('./utils/config.js')
      this.globalData.config = config.config
      
      // 设置Supabase连接信息
      this.globalData.supabaseUrl = config.config.supabaseUrl
      this.globalData.supabaseKey = config.config.supabaseKey
      
      console.log('配置加载成功')
    } catch (error) {
      console.error('配置加载失败:', error)
    }
  },

  // 初始化TDesign浅色主题
  initTheme: function() {
    const theme = {
      colorBrand: '#0052D9',        // 品牌色
      colorSuccess: '#00A870',      // 成功色
      colorWarning: '#ED7B2F',      // 警告色
      colorError: '#E34D59',        // 错误色
      colorBgContainer: '#FFFFFF',  // 容器背景
      colorBgLayout: '#F3F4F5',     // 布局背景
      colorTextPrimary: '#1F2937',  // 主要文字
      colorTextSecondary: '#6B7280' // 次要文字
    }

    this.globalData.theme = theme
  },

  // 检查登录状态
  checkLoginStatus: function() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
    } else {
      this.globalData.userInfo = null
      this.globalData.isLoggedIn = false
    }
  },

  // 全局登出方法
  globalLogout: function() {
    // 清除全局状态
    this.globalData.userInfo = null
    this.globalData.isLoggedIn = false

    // 清除登录凭证
    wx.removeStorageSync('loginCode')

    console.log('全局登出状态已更新')
  },

  // 清理旧数据
  cleanupOldData: function() {
    try {
      // 清除旧的通用测试记录键
      const oldTestData = wx.getStorageSync('testResults')
      if (oldTestData) {
        wx.removeStorageSync('testResults')
        console.log('应用启动：已清除旧的测试记录数据')
      }
    } catch (error) {
      console.error('应用启动清理旧数据失败:', error)
    }
  },

  // 全局数据
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    theme: null,
    supabaseUrl: '', // 从配置文件中获取
    supabaseKey: '', // 从配置文件中获取
    aiApiUrl: '', // 从配置文件中获取
    config: null // 配置对象
  }
})