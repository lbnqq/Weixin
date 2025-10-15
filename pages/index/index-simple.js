// pages/index/index.js
// 简化版本 - 修复严格模式函数声明问题

const { supabase } = require('../../utils/supabase')

Page({
  data: {
    userInfo: null,
    originalUserInfo: null,
    isLoggedIn: false,
    isLoading: false,
    testResults: [],
    newNickName: '',
    newAvatarUrl: '',
    testStep: 'ready',
    currentTest: '',
    connectionStatus: '未测试',
    syncStatus: '未测试'
  },

  onLoad: function (options) {
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        originalUserInfo: JSON.parse(JSON.stringify(userInfo)),
        isLoggedIn: true
      })
    }
  },

  // 添加测试结果
  addTestResult: function (message, type = 'info', data = null) {
    const timestamp = new Date().toLocaleTimeString()
    const result = {
      time: timestamp,
      message: message,
      type: type,
      data: data
    }
    
    this.setData({
      testResults: [...this.data.testResults, result]
    })
    
    setTimeout(() => {
      wx.pageScrollTo({
        scrollTop: 9999
      })
    }, 100)
  },

  // 测试数据库连接
  testConnection: function () {
    this.setData({
      isLoading: true,
      currentTest: '测试数据库连接...'
    })

    const startTime = Date.now()
    
    supabase.from('users').select('id').limit(1)
      .then(result => {
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        this.addTestResult(`✅ 数据库连接正常，响应时间: ${responseTime}ms`, 'success')
        this.setData({
          connectionStatus: '连接正常'
        })
      })
      .catch(error => {
        this.addTestResult(`❌ 数据库连接失败: ${error.message}`, 'error')
        this.setData({
          connectionStatus: '连接异常'
        })
      })
      .finally(() => {
        this.setData({
          isLoading: false,
          currentTest: ''
        })
      })
  },

  // 更新用户信息
  updateUserInfo: function () {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    if (!this.data.newNickName && !this.data.newAvatarUrl) {
      wx.showToast({
        title: '请输入要修改的内容',
        icon: 'none'
      })
      return
    }

    const userInfo = this.data.userInfo
    const updateData = {}

    if (this.data.newNickName) {
      updateData.nickname = this.data.newNickName
    }
    if (this.data.newAvatarUrl) {
      updateData.avatar_url = this.data.newAvatarUrl
    }

    updateData.updated_at = new Date().toISOString()

    this.setData({
      isLoading: true,
      currentTest: '更新用户信息...'
    })

    supabase.update('users', updateData, {
      openid: userInfo.openid
    })
      .then(result => {
        this.addTestResult(`✅ 更新成功: ${updateData.nickname || userInfo.nickName}`, 'success')
        this.setData({
          syncStatus: '同步成功'
        })

        // 更新本地用户信息
        const updatedUserInfo = {
          ...userInfo,
          nickName: updateData.nickname || userInfo.nickName,
          avatarUrl: updateData.avatar_url || userInfo.avatarUrl
        }
        wx.setStorageSync('userInfo', updatedUserInfo)
        this.setData({
          userInfo: updatedUserInfo,
          newNickName: '',
          newAvatarUrl: ''
        })
      })
      .catch(error => {
        this.addTestResult(`❌ 更新失败: ${error.message}`, 'error')
        this.setData({
          syncStatus: '同步失败'
        })
      })
      .finally(() => {
        this.setData({
          isLoading: false,
          currentTest: ''
        })
      })
  },

  // 同步用户数据
  syncUserData: function () {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    this.setData({
      testStep: 'testing',
      isLoading: true,
      currentTest: '同步用户数据...'
    })

    // 查询用户信息
    this.queryUserInfo()
  },

  // 查询用户信息
  queryUserInfo: function () {
    const userInfo = this.data.userInfo
    
    this.setData({
      isLoading: true,
      currentTest: '查询用户信息...'
    })

    supabase.from('users')
      .select('*')
      .eq('openid', userInfo.openid)
      .single()
      .then(data => {
        if (data) {
          this.addTestResult(`✅ 查询成功: ${data.nickname || data.nickName} (${data.id})`, 'success')
          
          // 自动进行下一步测试
          setTimeout(() => {
            this.updateUserInfo()
          }, 1000)
        } else {
          this.addTestResult('⚠️ 用户不存在，正在创建用户...', 'info')
          this.createUser()
        }
      })
      .catch(error => {
        console.error('查询用户信息失败:', error)
        this.addTestResult(`❌ 查询失败: ${error.message}`, 'error')
        this.setData({
          testStep: 'ready'
        })
      })
      .finally(() => {
        this.setData({
          isLoading: false
        })
      })
  },

  // 创建用户
  createUser: function () {
    const userInfo = this.data.userInfo
    
    this.setData({
      isLoading: true,
      currentTest: '创建用户...'
    })

    const userData = {
      openid: userInfo.openid,
      user_id: userInfo.userId || 'user_' + Date.now(),
      nickname: userInfo.nickName || '测试用户',
      avatar_url: userInfo.avatarUrl || 'https://via.placeholder.com/100x100/4CAF50/ffffff?text=TEST',
      avatarUri: userInfo.avatarUrl || 'https://via.placeholder.com/100x100/4CAF50/ffffff?text=TEST',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    supabase.insert('users', userData)
      .then(result => {
        if (result && result.length > 0) {
          const createdUser = result[0]
          this.addTestResult(`✅ 用户创建成功: ${createdUser.nickname} (${createdUser.id})`, 'success')
          
          // 自动进行下一步测试
          setTimeout(() => {
            this.updateUserInfo()
          }, 1000)
        } else {
          throw new Error('创建用户失败：未返回数据')
        }
      })
      .catch(error => {
        this.addTestResult(`❌ 创建失败: ${error.message}`, 'error')
        this.setData({
          testStep: 'ready'
        })
      })
      .finally(() => {
        this.setData({
          isLoading: false
        })
      })
  },

  // 表单输入处理
  onInputChange: function (e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [field]: value
    })
  },

  // 运行完整测试
  runFullTest: function () {
    this.clearResults()
    this.addTestResult('🚀 开始完整测试流程', 'info')
    
    setTimeout(() => {
      this.testConnection()
    }, 500)
  },

  // 清空结果
  clearResults: function () {
    this.setData({
      testResults: []
    })
  },

  // 返回上一页
  goBack: function () {
    wx.navigateBack()
  }
})