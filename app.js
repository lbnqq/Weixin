// app.js
App({
  onLaunch: function () {
    // 初始化TDesign主题
    this.initTheme()

    // 检查登录状态
    this.checkLoginStatus()
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
    }
  },

  // 全局数据
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    theme: null,
    supabaseUrl: 'https://klmgbsjigdwpwzczhdkp.supabase.co', // 需要替换为实际的Supabase URL
    supabaseKey: 'YeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbWdic2ppZ2R3cHd6Y3poZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MjE0NTksImV4cCI6MjA3NTI5NzQ1OX0.ygaQJVxZ9W2E25xXFf18irpG7pSalO1CvZvItdllePw', // 需要替换为实际的Supabase Key
    aiApiUrl: 'YOUR_AI_API_URL' // 需要替换为实际的质谱AI API地址
  }
})