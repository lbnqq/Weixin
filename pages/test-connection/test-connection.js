// pages/test-connection/test-connection.js
// 微信小程序数据库连接测试页面

const { supabase } = require('../../utils/supabase')

Page({
  data: {
    // 连接状态
    connectionStatus: 'unknown',
    connectionStatusText: '未测试',
    responseTime: null,
    isConnected: false,
    
    // 测试结果
    testResults: [],
    isTesting: false,
    testComplete: false,
    
    // 统计信息
    totalTests: 0,
    successTests: 0,
    failedTests: 0,
    successRate: '0%'
  },

  onLoad: function () {
    // 页面加载时自动开始测试
    // this.startConnectionTest()
  },

  // 添加测试结果
  addTestResult(step, status, message, data = null) {
    const statusText = status === 'success' ? '成功' : status === 'error' ? '失败' : '信息'
    const result = {
      step,
      status,
      statusText,
      message,
      data: data ? JSON.stringify(data, null, 2) : null,
      timestamp: new Date().toLocaleTimeString()
    }
    
    this.setData({
      testResults: [...this.data.testResults, result]
    })
    
    // 更新统计
    let { totalTests, successTests, failedTests } = this.data
    totalTests++
    
    if (status === 'success') successTests++
    else if (status === 'error') failedTests++
    
    const successRate = totalTests > 0 ? ((successTests / totalTests) * 100).toFixed(1) + '%' : '0%'
    
    this.setData({
      totalTests,
      successTests,
      failedTests,
      successRate
    })
    
    // 滚动到底部
    setTimeout(() => {
      wx.pageScrollTo({
        scrollTop: 9999
      })
    }, 100)
  },

  // 开始连接测试
  async startConnectionTest() {
    this.setData({
      isTesting: true,
      testComplete: false,
      testResults: [],
      connectionStatus: 'testing',
      connectionStatusText: '正在测试连接...'
    })
    
    try {
      console.log('🚀 开始数据库连接测试...')
      
      // 1. 基础连接测试
      this.addTestResult('网络连接', 'info', '正在测试到Supabase的网络连接...')
      
      const startTime = Date.now()
      
      try {
        // 尝试查询users表
        const result = await supabase
          .from('users')
          .select('id, openid, nickname')
          .limit(1)
        
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        if (result !== null && result !== undefined) {
          this.addTestResult('网络连接', 'success', `连接成功，响应时间: ${responseTime}ms`)
          this.setData({
            connectionStatus: 'success',
            connectionStatusText: '连接正常',
            responseTime: responseTime,
            isConnected: true
          })
        } else {
          this.addTestResult('网络连接', 'warning', '连接成功但返回空数据')
          this.setData({
            connectionStatus: 'warning',
            connectionStatusText: '连接异常',
            responseTime: responseTime,
            isConnected: false
          })
        }
        
      } catch (error) {
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        this.addTestResult('网络连接', 'error', `连接失败: ${error.message}`)
        this.setData({
          connectionStatus: 'error',
          connectionStatusText: '连接失败',
          responseTime: responseTime,
          isConnected: false
        })
        
        // 诊断错误类型
        this.diagnoseError(error)
      }
      
      // 2. 表结构测试
      if (this.data.isConnected) {
        this.addTestResult('表结构', 'info', '正在检查表结构...')
        
        try {
          const tableResult = await supabase
            .from('users')
            .select('*')
            .limit(1)
          
          if (tableResult && Array.isArray(tableResult)) {
            this.addTestResult('表结构', 'success', `users表存在，包含 ${tableResult.length} 条数据`)
            
            if (tableResult.length > 0) {
              const columns = Object.keys(tableResult[0])
              this.addTestResult('表结构', 'info', `字段列表: ${columns.join(', ')}`)
            }
          } else {
            this.addTestResult('表结构', 'error', '表结构查询异常')
          }
        } catch (error) {
          this.addTestResult('表结构', 'error', `表结构检查失败: ${error.message}`)
        }
      }
      
      // 3. 权限测试
      this.addTestResult('权限测试', 'info', '正在测试数据库权限...')
      
      try {
        // 尝试插入测试数据
        const testData = {
          openid: 'test_permission_' + Date.now(),
          user_id: 'test_user_' + Date.now(),
          nickname: '权限测试用户',
          avatar_url: 'https://via.placeholder.com/100x100/FF5722/ffffff?text=TEST',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const insertResult = await supabase.insert('users', testData)
        
        if (insertResult && insertResult.length > 0) {
          const createdUser = insertResult[0]
          this.addTestResult('权限测试', 'success', `权限正常，成功创建测试用户: ${createdUser.id}`)
          
          // 清理测试数据
          try {
            await supabase.delete('users', { id: createdUser.id })
            this.addTestResult('权限测试', 'success', '测试数据清理成功')
          } catch (deleteError) {
            this.addTestResult('权限测试', 'warning', `测试数据清理失败: ${deleteError.message}`)
          }
        } else {
          this.addTestResult('权限测试', 'error', '权限测试失败，无法创建数据')
        }
        
      } catch (error) {
        this.addTestResult('权限测试', 'error', `权限测试失败: ${error.message}`)
      }
      
      console.log('✅ 连接测试完成')
      
    } catch (error) {
      console.error('❌ 连接测试异常:', error)
      this.addTestResult('系统错误', 'error', `测试异常: ${error.message}`)
    } finally {
      this.setData({
        isTesting: false,
        testComplete: true
      })
    }
  },

  // 错误诊断
  diagnoseError(error) {
    if (error.message.includes('Network')) {
      this.addTestResult('诊断', 'info', '网络连接问题 - 请检查网络设置')
    } else if (error.message.includes('auth')) {
      this.addTestResult('诊断', 'info', '认证失败 - 请检查Supabase Key配置')
    } else if (error.message.includes('table')) {
      this.addTestResult('诊断', 'info', '表不存在 - 请运行数据库初始化脚本')
    } else if (error.message.includes('permission')) {
      this.addTestResult('诊断', 'info', '权限不足 - 请检查RLS策略配置')
    } else {
      this.addTestResult('诊断', 'info', `未知错误: ${error.message}`)
    }
  },

  // 开始完整CRUD测试
  async startFullCrudTest() {
    if (!this.data.isConnected) {
      wx.showToast({
        title: '请先通过连接测试',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      isTesting: true
    })
    
    try {
      console.log('🚀 开始完整CRUD测试...')
      
      // 1. 创建测试
      this.addTestResult('CREATE', 'info', '📝 开始创建测试...')
      
      const testUserData = {
        openid: 'test_crud_' + Date.now(),
        user_id: 'test_user_' + Date.now(),
        nickname: 'CRUD测试用户',
        avatar_url: 'https://via.placeholder.com/100x100/FF5722/ffffff?text=CRUD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const createResult = await supabase.insert('users', testUserData)
      
      if (createResult && createResult.length > 0) {
        const createdUser = createResult[0]
        this.addTestResult('CREATE', 'success', '✅ 用户创建成功', createdUser)
        
        // 2. 查询测试
        this.addTestResult('READ', 'info', '🔍 开始查询测试...')
        
        const queryResult = await supabase
          .from('users')
          .select('*')
          .eq('id', createdUser.id)
          .single()
        
        if (queryResult) {
          this.addTestResult('READ', 'success', '✅ 查询成功', queryResult)
          
          // 3. 更新测试
          this.addTestResult('UPDATE', 'info', '✏️ 开始更新测试...')
          
          const updateData = {
            nickname: 'CRUD测试用户_已更新',
            updated_at: new Date().toISOString()
          }
          
          const updateResult = await supabase.update('users', updateData, {
            id: createdUser.id
          })
          
          if (updateResult && updateResult.length > 0) {
            this.addTestResult('UPDATE', 'success', '✅ 更新成功', updateResult[0])
          } else {
            // 验证更新结果
            const verifyUpdate = await supabase
              .from('users')
              .select('*')
              .eq('id', createdUser.id)
              .single()
            
            if (verifyUpdate && verifyUpdate.nickname === updateData.nickname) {
              this.addTestResult('UPDATE', 'success', '✅ 更新验证成功', verifyUpdate)
            } else {
              this.addTestResult('UPDATE', 'error', '❌ 更新验证失败')
            }
          }
          
          // 4. 删除测试
          this.addTestResult('DELETE', 'info', '🗑️ 开始删除测试...')
          
          await supabase.delete('users', { id: createdUser.id })
          
          // 验证删除结果
          const verifyDelete = await supabase
            .from('users')
            .select('*')
            .eq('id', createdUser.id)
            .single()
          
          if (!verifyDelete) {
            this.addTestResult('DELETE', 'success', '✅ 删除验证成功')
          } else {
            this.addTestResult('DELETE', 'error', '❌ 删除验证失败')
          }
          
        } else {
          this.addTestResult('READ', 'error', '❌ 查询失败')
        }
        
      } else {
        this.addTestResult('CREATE', 'error', '❌ 创建失败')
      }
      
      console.log('✅ 完整CRUD测试完成')
      
    } catch (error) {
      console.error('❌ CRUD测试异常:', error)
      this.addTestResult('CRUD测试', 'error', `测试异常: ${error.message}`)
    } finally {
      this.setData({
        isTesting: false
      })
    }
  },

  // 跳转到高级CRUD测试
  goToCrudTest() {
    wx.navigateTo({
      url: '/pages/test-crud/test-crud'
    })
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
})