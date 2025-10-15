// pages/dynamic-crud-test/dynamic-crud-test.js
// 动态数据库CRUD测试页面 - 实时交互式测试

const { supabase } = require('../../utils/supabase')

Page({
  data: {
    // 测试数据管理
    testUsers: [],
    currentUser: null,
    
    // 实时状态
    connectionStatus: '未测试',
    isConnected: false,
    
    // 操作日志
    operationLogs: [],
    
    // 动态表单
    createForm: {
      openid: '',
      user_id: '',
      nickname: '',
      avatar_url: ''
    },
    
    // UI状态
    isLoading: false,
    activeTab: 'connection'
  },

  onLoad: function () {
    this.generateTestData()
    this.testConnection()
  },

  // 生成测试数据
  generateTestData() {
    const timestamp = Date.now()
    this.setData({
      createForm: {
        openid: `test_dynamic_${timestamp}`,
        user_id: `user_dynamic_${timestamp}`,
        nickname: `动态测试用户${timestamp % 1000}`,
        avatar_url: `https://via.placeholder.com/100x100/${this.getRandomColor()}/ffffff?text=D${timestamp % 100}`
      }
    })
  },

  // 获取随机颜色
  getRandomColor() {
    const colors = ['FF5722', '4CAF50', '2196F3', 'FF9800', '9C27B0', '00BCD4']
    return colors[Math.floor(Math.random() * colors.length)]
  },

  // 添加操作日志
  addLog(operation, status, message, data = null) {
    const log = {
      id: Date.now(),
      operation,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString(),
      color: this.getStatusColor(status)
    }
    
    this.setData({
      operationLogs: [log, ...this.data.operationLogs.slice(0, 49)] // 保留最近50条
    })
    
    console.log(`[${log.timestamp}] ${operation}: ${status} - ${message}`, data)
  },

  // 获取状态颜色
  getStatusColor(status) {
    const colors = {
      '成功': '#4CAF50',
      '失败': '#f44336', 
      '警告': '#ff9800',
      '信息': '#2196f3',
      '进行中': '#9c27b0'
    }
    return colors[status] || '#666'
  },

  // 测试数据库连接
  async testConnection() {
    this.setData({ isLoading: true })
    this.addLog('连接测试', '进行中', '正在测试数据库连接...')
    
    try {
      const startTime = Date.now()
      const result = await supabase
        .from('users')
        .select('id')
        .limit(1)
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      this.setData({
        connectionStatus: '连接正常',
        isConnected: true
      })
      
      this.addLog('连接测试', '成功', `数据库连接正常，响应时间: ${responseTime}ms`)
      
      // 自动加载用户列表
      this.loadUsers()
      
    } catch (error) {
      this.setData({
        connectionStatus: '连接失败',
        isConnected: false
      })
      
      this.addLog('连接测试', '失败', `数据库连接失败: ${error.message}`)
    } finally {
      this.setData({ isLoading: false })
    }
  },

  // 动态创建用户
  async createUser() {
    if (!this.data.isConnected) {
      this.addLog('创建用户', '失败', '数据库未连接')
      return
    }
    
    this.setData({ isLoading: true })
    const formData = this.data.createForm
    
    this.addLog('创建用户', '进行中', '正在创建用户...', formData)
    
    try {
      const userData = {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const result = await supabase.insert('users', userData)
      
      if (result && result.length > 0) {
        const createdUser = result[0]
        this.addLog('创建用户', '成功', `用户创建成功: ${createdUser.nickname} (ID: ${createdUser.id})`, createdUser)
        
        // 更新用户列表
        this.setData({
          testUsers: [createdUser, ...this.data.testUsers],
          currentUser: createdUser
        })
        
        // 生成新的测试数据
        this.generateTestData()
        
      } else {
        // 验证是否创建成功
        const verifyUser = await supabase
          .from('users')
          .select('*')
          .eq('openid', formData.openid)
          .single()
        
        if (verifyUser) {
          this.addLog('创建用户', '成功', '通过查询验证用户已创建', verifyUser)
          this.setData({
            testUsers: [verifyUser, ...this.data.testUsers],
            currentUser: verifyUser
          })
        } else {
          throw new Error('创建验证失败')
        }
      }
      
    } catch (error) {
      this.addLog('创建用户', '失败', `创建用户失败: ${error.message}`)
    } finally {
      this.setData({ isLoading: false })
    }
  },

  // 动态查询用户
  async loadUsers() {
    if (!this.data.isConnected) return
    
    this.setData({ isLoading: true })
    this.addLog('查询用户', '进行中', '正在加载用户列表...')
    
    try {
      // 查询最近创建的10个用户
      const users = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (users && Array.isArray(users)) {
        this.addLog('查询用户', '成功', `查询到 ${users.length} 个用户`)
        this.setData({
          testUsers: users
        })
        
        if (users.length > 0 && !this.data.currentUser) {
          this.setData({
            currentUser: users[0]
          })
        }
      } else {
        this.addLog('查询用户', '警告', '用户列表为空或格式异常')
        this.setData({
          testUsers: []
        })
      }
      
    } catch (error) {
      this.addLog('查询用户', '失败', `查询用户失败: ${error.message}`)
    } finally {
      this.setData({ isLoading: false })
    }
  },

  // 动态更新用户
  async updateUser(userId, newData) {
    if (!this.data.isConnected) {
      this.addLog('更新用户', '失败', '数据库未连接')
      return
    }
    
    this.setData({ isLoading: true })
    this.addLog('更新用户', '进行中', `正在更新用户ID: ${userId}`, newData)
    
    try {
      const updateData = {
        ...newData,
        updated_at: new Date().toISOString()
      }
      
      const result = await supabase.update('users', updateData, { id: userId })
      
      if (result && result.length > 0) {
        const updatedUser = result[0]
        this.addLog('更新用户', '成功', `用户更新成功: ${updatedUser.nickname}`, updatedUser)
        
        // 更新本地用户列表
        const updatedUsers = this.data.testUsers.map(user => 
          user.id === userId ? updatedUser : user
        )
        this.setData({
          testUsers: updatedUsers,
          currentUser: updatedUser
        })
        
      } else {
        // 验证更新结果
        const verifyUpdate = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (verifyUpdate) {
          this.addLog('更新用户', '成功', '更新验证成功', verifyUpdate)
          
          const updatedUsers = this.data.testUsers.map(user => 
            user.id === userId ? verifyUpdate : user
          )
          this.setData({
            testUsers: updatedUsers,
            currentUser: verifyUpdate
          })
        } else {
          throw new Error('更新验证失败')
        }
      }
      
    } catch (error) {
      this.addLog('更新用户', '失败', `更新用户失败: ${error.message}`)
    } finally {
      this.setData({ isLoading: false })
    }
  },

  // 动态删除用户
  async deleteUser(userId, nickname) {
    if (!this.data.isConnected) {
      this.addLog('删除用户', '失败', '数据库未连接')
      return
    }
    
    this.setData({ isLoading: true })
    this.addLog('删除用户', '进行中', `正在删除用户: ${nickname} (ID: ${userId})`)
    
    try {
      await supabase.delete('users', { id: userId })
      
      // 验证删除结果
      const verifyDelete = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (!verifyDelete) {
        this.addLog('删除用户', '成功', `用户删除成功: ${nickname}`)
        
        // 更新本地用户列表
        const remainingUsers = this.data.testUsers.filter(user => user.id !== userId)
        this.setData({
          testUsers: remainingUsers,
          currentUser: remainingUsers.length > 0 ? remainingUsers[0] : null
        })
        
      } else {
        throw new Error('用户删除失败，验证时发现用户仍然存在')
      }
      
    } catch (error) {
      this.addLog('删除用户', '失败', `删除用户失败: ${error.message}`)
    } finally {
      this.setData({ isLoading: false })
    }
  },

  // 批量测试所有功能
  async runFullDynamicTest() {
    this.addLog('批量测试', '开始', '🚀 开始动态批量测试所有功能...')
    
    const steps = [
      { name: '连接测试', func: () => this.testConnection() },
      { name: '创建用户', func: () => this.createUser() },
      { name: '查询用户', func: () => this.loadUsers() },
      { name: '更新用户', func: () => this.updateCurrentUser() },
      { name: '删除用户', func: () => this.deleteCurrentUser() }
    ]
    
    for (const step of steps) {
      try {
        await step.func()
        await this.delay(1000) // 等待1秒再执行下一步
      } catch (error) {
        this.addLog('批量测试', '失败', `${step.name}失败: ${error.message}`)
        break
      }
    }
    
    this.addLog('批量测试', '完成', '✅ 动态批量测试完成')
  },

  // 更新当前用户（用于批量测试）
  async updateCurrentUser() {
    if (!this.data.currentUser) {
      this.addLog('更新测试', '警告', '没有当前用户可更新')
      return
    }
    
    const updateData = {
      nickname: this.data.currentUser.nickname + '_已更新',
      avatar_url: `https://via.placeholder.com/100x100/${this.getRandomColor()}/ffffff?text=UPDATED`
    }
    
    await this.updateUser(this.data.currentUser.id, updateData)
  },

  // 删除当前用户（用于批量测试）
  async deleteCurrentUser() {
    if (!this.data.currentUser) {
      this.addLog('删除测试', '警告', '没有当前用户可删除')
      return
    }
    
    await this.deleteUser(this.data.currentUser.id, this.data.currentUser.nickname)
  },

  // 清空日志
  clearLogs() {
    this.setData({
      operationLogs: []
    })
    this.addLog('系统', '信息', '日志已清空')
  },

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  // 表单输入处理
  onFormInput(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`createForm.${field}`]: value
    })
  },

  // 选择当前用户
  selectCurrentUser(e) {
    const { user } = e.currentTarget.dataset
    this.setData({
      currentUser: user
    })
    this.addLog('选择用户', '信息', `已选择用户: ${user.nickname}`)
  },

  // 快速更新当前用户
  quickUpdateCurrentUser() {
    if (!this.data.currentUser) {
      wx.showToast({
        title: '请先选择一个用户',
        icon: 'none'
      })
      return
    }
    
    const updateData = {
      nickname: this.data.currentUser.nickname + '_快速更新',
      avatar_url: `https://via.placeholder.com/100x100/${this.getRandomColor()}/ffffff?text=Q${Date.now() % 100}`
    }
    
    this.updateUser(this.data.currentUser.id, updateData)
  },

  // 快速删除当前用户
  quickDeleteCurrentUser() {
    if (!this.data.currentUser) {
      wx.showToast({
        title: '请先选择一个用户',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除用户 "${this.data.currentUser.nickname}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          this.deleteUser(this.data.currentUser.id, this.data.currentUser.nickname)
        }
      }
    })
  },

  // 刷新用户列表
  refreshUsers() {
    this.loadUsers()
  },

  // 生成新的测试数据
  generateNewTestData() {
    this.generateTestData()
    this.addLog('测试数据', '信息', '已生成新的测试数据')
  }
})