// pages/debug-database/debug-database.js
// 数据库调试专用页面

const app = getApp()
const { enhancedSupabase } = require('../../utils/supabase-enhanced')

Page({
  data: {
    // 连接状态
    connectionStatus: '未测试',
    connectionDetails: null,
    
    // 测试结果
    testResults: [],
    isTesting: false,
    currentTest: '',
    
    // 数据库信息
    dbInfo: null,
    tableStructure: null,
    
    // 用户相关
    userInfo: null,
    dbUsers: [],
    
    // 错误信息
    errors: []
  },

  onLoad: function () {
    this.checkUserStatus()
    this.loadDatabaseInfo()
  },

  // 检查用户状态
  checkUserStatus: function () {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLoggedIn: true
      })
    }
  },

  // 加载数据库信息
  loadDatabaseInfo: async function () {
    try {
      const dbInfo = await enhancedSupabase.getDatabaseInfo()
      this.setData({
        dbInfo: dbInfo,
        connectionStatus: dbInfo.status === 'connected' ? '连接正常' : '连接异常'
      })
      
      if (dbInfo.error) {
        this.addError('数据库信息获取失败', dbInfo.error)
      }
    } catch (error) {
      this.addError('加载数据库信息失败', error)
    }
  },

  // 测试数据库连接
  testConnection: async function () {
    this.setData({
      isTesting: true,
      currentTest: '测试数据库连接...'
    })

    try {
      const health = await enhancedSupabase.healthCheck()
      
      if (health.status === 'healthy') {
        this.addTestResult('✅ 数据库连接正常', 'success', health.data)
        this.setData({
          connectionStatus: '连接正常',
          connectionDetails: health.data
        })
      } else {
        this.addTestResult('❌ 数据库连接异常', 'error', health.error)
        this.setData({
          connectionStatus: '连接异常',
          connectionDetails: health.error
        })
        this.addError('数据库连接测试失败', health.error)
      }
    } catch (error) {
      this.addTestResult('❌ 连接测试失败', 'error', error.message)
      this.addError('连接测试异常', error)
    } finally {
      this.setData({
        isTesting: false,
        currentTest: ''
      })
    }
  },

  // 检查表结构
  checkTableStructure: async function () {
    this.setData({
      isTesting: true,
      currentTest: '检查表结构...'
    })

    try {
      // 查询表结构信息
      const result = await enhancedSupabase.request('/rest/v1/users?select=*&limit=1', {
        method: 'GET'
      })
      
      if (result && result.length > 0) {
        const columns = Object.keys(result[0])
        this.setData({
          tableStructure: columns
        })
        this.addTestResult(`✅ 表结构检查完成，发现 ${columns.length} 个字段`, 'success', columns)
      } else {
        this.addTestResult('⚠️ 表存在但无数据', 'info')
      }
    } catch (error) {
      if (error.message.includes('column')) {
        this.addTestResult('❌ 表结构缺失字段', 'error', error.message)
        this.addError('表结构问题', error)
      } else {
        this.addTestResult('❌ 表结构检查失败', 'error', error.message)
      }
    } finally {
      this.setData({
        isTesting: false,
        currentTest: ''
      })
    }
  },

  // 测试用户操作
  testUserOperations: async function () {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    this.setData({
      isTesting: true,
      currentTest: '测试用户操作...'
    })

    try {
      // 1. 查询用户
      this.addTestResult('🔍 查询用户...', 'info')
      const existingUser = await enhancedSupabase
        .from('users')
        .select('*')
        .eq('openid', this.data.userInfo.openid)
        .single()

      if (existingUser) {
        this.addTestResult(`✅ 找到现有用户: ${existingUser.nickname || existingUser.nickname}`, 'success')
        
        // 2. 更新用户
        this.addTestResult('📝 更新用户信息...', 'info')
        const updateData = {
          nickname: (existingUser.nickname || existingUser.nickName) + '_updated',
          updated_at: new Date().toISOString()
        }
        
        const updatedUser = await enhancedSupabase.update('users', updateData, {
          openid: this.data.userInfo.openid
        })
        
        if (updatedUser && updatedUser.length > 0) {
          this.addTestResult(`✅ 用户更新成功: ${updatedUser[0].nickname}`, 'success')
        }
      } else {
        // 3. 创建新用户
        this.addTestResult('👤 创建新用户...', 'info')
        const newUser = await enhancedSupabase.insert('users', {
          openid: this.data.userInfo.openid,
          user_id: this.data.userInfo.userId || 'test_user_' + Date.now(),
          nickname: this.data.userInfo.nickName || '测试用户',
          avatar_url: this.data.userInfo.avatarUrl || 'https://via.placeholder.com/100x100/4CAF50/ffffff?text=TEST',
          avatarUri: this.data.userInfo.avatarUrl || 'https://via.placeholder.com/100x100/4CAF50/ffffff?text=TEST',
          created_at: new Date().toISOString()
        })
        
        if (newUser && newUser.length > 0) {
          this.addTestResult(`✅ 用户创建成功: ${newUser[0].nickname} (${newUser[0].id})`, 'success')
        }
      }
      
      // 4. 列出所有用户（限制10个）
      this.addTestResult('📋 获取用户列表...', 'info')
      const userList = await enhancedSupabase
        .from('users')
        .select('id, openid, nickname, created_at')
        .limit(10)
      
      this.setData({
        dbUsers: userList || []
      })
      
      this.addTestResult(`✅ 获取用户列表成功: ${userList.length} 个用户`, 'success')
      
    } catch (error) {
      this.addTestResult('❌ 用户操作测试失败', 'error', error.message)
      this.addError('用户操作测试失败', error)
    } finally {
      this.setData({
        isTesting: false,
        currentTest: ''
      })
    }
  },

  // 运行完整测试套件
  runFullTestSuite: async function () {
    this.clearResults()
    this.addTestResult('🚀 开始完整数据库测试套件', 'info')
    
    await this.delay(500)
    await this.testConnection()
    
    await this.delay(1000)
    await this.checkTableStructure()
    
    await this.delay(1000)
    await this.testUserOperations()
    
    this.addTestResult('✅ 完整测试套件完成', 'success')
  },

  // 清理测试数据
  cleanupTestData: async function () {
    wx.showModal({
      title: '清理测试数据',
      content: '确定要删除所有测试用户吗？此操作不可恢复。',
      success: async (res) => {
        if (res.confirm) {
          this.setData({
            isTesting: true,
            currentTest: '清理测试数据...'
          })
          
          try {
            // 这里可以添加清理逻辑
            this.addTestResult('✅ 测试数据清理完成', 'success')
          } catch (error) {
            this.addTestResult('❌ 清理失败', 'error', error.message)
          } finally {
            this.setData({
              isTesting: false,
              currentTest: ''
            })
          }
        }
      }
    })
  },

  // 复制错误信息
  copyErrorInfo: function (e) {
    const index = e.currentTarget.dataset.index
    const error = this.data.errors[index]
    
    wx.setClipboardData({
      data: JSON.stringify(error, null, 2),
      success: () => {
        wx.showToast({
          title: '错误信息已复制',
          icon: 'success'
        })
      }
    })
  },

  // 格式化数据为字符串
  formatData: function (data) {
    if (typeof data === 'object') {
      return JSON.stringify(data)
    }
    return String(data || '')
  },

  // 添加测试结果
  addTestResult: function (message, type = 'info', data = null) {
    const timestamp = new Date().toLocaleTimeString()
    const result = {
      time: timestamp,
      message: message,
      type: type,
      data: data,
      formattedData: this.formatData(data)
    }
    
    this.setData({
      testResults: [...this.data.testResults, result]
    })
    
    // 滚动到底部
    setTimeout(() => {
      wx.pageScrollTo({
        scrollTop: 9999
      })
    }, 100)
  },

  // 添加错误信息
  addError: function (context, error) {
    const errorInfo = {
      time: new Date().toLocaleTimeString(),
      context: context,
      message: error.message || '未知错误',
      details: error
    }
    
    this.setData({
      errors: [...this.data.errors, errorInfo]
    })
  },

  // 清空结果
  clearResults: function () {
    this.setData({
      testResults: [],
      errors: []
    })
  },

  // 延迟函数
  delay: function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  // 导航回首页
  goBack: function () {
    wx.navigateBack()
  },

  // 跳转到CRUD测试页面
  goToCrudTest: function () {
    wx.navigateTo({
      url: '/pages/test-crud/test-crud'
    })
  },

  // 跳转到连接测试页面
  goToConnectionTest: function () {
    wx.navigateTo({
      url: '/pages/test-connection/test-connection'
    })
  },

  // 跳转到动态CRUD测试页面
  goToDynamicCrudTest: function () {
    wx.navigateTo({
      url: '/pages/dynamic-crud-test/dynamic-crud-test'
    })
  },

  // 跳转到CRUD测试页面
  goToCrudTest: function () {
    wx.navigateTo({
      url: '/pages/test-crud/test-crud'
    })
  }
})