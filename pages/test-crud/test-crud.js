// pages/test-crud/test-crud.js
// 数据库CRUD操作测试页面

const { supabase } = require('../../utils/supabase')
const { testDatabaseConnectionSimple } = require('../../utils/test-connection-simple')

Page({
  data: {
    // 测试状态
    testStep: 'ready', // ready, running, completed
    currentStep: '',
    testResults: [],
    testUserId: null,
    testOpenId: '',
    
    // 测试结果统计
    totalTests: 0,
    successTests: 0,
    failedTests: 0,
    warningTests: 0,
    
    // UI状态
    isLoading: false,
    currentTest: ''
  },

  onLoad: function () {
    this.generateTestOpenId()
  },

  // 生成测试用的OpenID
  generateTestOpenId() {
    const testOpenId = 'test_crud_' + Date.now()
    this.setData({
      testOpenId: testOpenId
    })
  },

  // 添加测试结果
  addTestResult(operation, status, message, data = null) {
    const result = {
      timestamp: new Date().toLocaleTimeString(),
      operation,
      status,
      message,
      data
    }
    
    this.setData({
      testResults: [...this.data.testResults, result],
      currentTest: `${operation}: ${message}`
    })

    // 更新统计
    let { totalTests, successTests, failedTests, warningTests } = this.data
    totalTests++
    
    if (status === '成功') successTests++
    else if (status === '失败') failedTests++
    else if (status === '警告') warningTests++

    this.setData({
      totalTests,
      successTests,
      failedTests,
      warningTests
    })

    // 滚动到底部
    this.scrollToBottom()
  },

  // 滚动到页面底部
  scrollToBottom() {
    wx.pageScrollTo({
      scrollTop: 9999,
      duration: 300
    })
  },

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  // 步骤1: 测试创建用户（Create）
  async testCreate() {
    console.log('📝 步骤1: 测试创建用户（Create）')
    this.addTestResult('CREATE', '开始', '开始测试创建用户')

    try {
      const testUserData = {
        openid: this.data.testOpenId,
        user_id: 'test_user_crud_' + Date.now(),
        nickname: 'CRUD测试用户',
        avatar_url: 'https://via.placeholder.com/100x100/FF5722/ffffff?text=CRUD',
        avatarUri: 'https://via.placeholder.com/100x100/FF5722/ffffff?text=CRUD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      this.addTestResult('CREATE', '尝试', '使用insert函数创建用户', testUserData)
      
      const result = await supabase.insert('users', testUserData)
      
      if (result && result.length > 0) {
        const createdUser = result[0]
        this.setData({
          testUserId: createdUser.id
        })
        this.addTestResult('CREATE', '成功', '用户创建成功', createdUser)
        return true
      } else {
        this.addTestResult('CREATE', '警告', 'insert返回空数据，尝试验证用户是否存在')
        
        // 验证用户是否已创建
        await this.delay(1000)
        const verifyUser = await supabase
          .from('users')
          .select('*')
          .eq('openid', this.data.testOpenId)
          .single()

        if (verifyUser) {
          this.setData({
            testUserId: verifyUser.id
          })
          this.addTestResult('CREATE', '成功', '通过查询验证用户已创建', verifyUser)
          return true
        } else {
          throw new Error('用户创建验证失败')
        }
      }

    } catch (error) {
      this.addTestResult('CREATE', '失败', `创建用户失败: ${error.message}`)
      return false
    }
  },

  // 步骤2: 测试查询用户（Read）
  async testRead() {
    console.log('🔍 步骤2: 测试查询用户（Read）')
    this.addTestResult('READ', '开始', '开始测试查询用户')

    try {
      if (!this.data.testUserId) {
        throw new Error('没有可用的测试用户ID')
      }

      // 按ID查询
      this.addTestResult('READ', '尝试', '按ID查询用户')
      const userById = await supabase
        .from('users')
        .select('*')
        .eq('id', this.data.testUserId)
        .single()

      if (userById) {
        this.addTestResult('READ', '成功', '按ID查询成功', {
          id: userById.id,
          nickname: userById.nickname,
          openid: userById.openid
        })
      } else {
        this.addTestResult('READ', '警告', '按ID查询返回空')
      }

      // 按openid查询
      this.addTestResult('READ', '尝试', '按openid查询用户')
      const userByOpenId = await supabase
        .from('users')
        .select('*')
        .eq('openid', this.data.testOpenId)
        .single()

      if (userByOpenId) {
        this.addTestResult('READ', '成功', '按openid查询成功', {
          id: userByOpenId.id,
          nickname: userByOpenId.nickname
        })
      } else {
        this.addTestResult('READ', '警告', '按openid查询返回空')
      }

      // 列表查询
      this.addTestResult('READ', '尝试', '查询用户列表（限制5条）')
      const userList = await supabase
        .from('users')
        .select('id, openid, nickname, created_at')
        .limit(5)

      if (userList && userList.length > 0) {
        this.addTestResult('READ', '成功', `查询到 ${userList.length} 个用户`, {
          count: userList.length,
          sampleUser: userList[0]
        })
      } else {
        this.addTestResult('READ', '警告', '用户列表为空')
      }

      return true

    } catch (error) {
      this.addTestResult('READ', '失败', `查询用户失败: ${error.message}`)
      return false
    }
  },

  // 步骤3: 测试更新用户（Update）
  async testUpdate() {
    console.log('✏️ 步骤3: 测试更新用户（Update）')
    this.addTestResult('UPDATE', '开始', '开始测试更新用户')

    try {
      if (!this.data.testUserId) {
        throw new Error('没有可用的测试用户ID')
      }

      const updateData = {
        nickname: 'CRUD测试用户_已更新',
        avatar_url: 'https://via.placeholder.com/100x100/4CAF50/ffffff?text=UPDATED',
        updated_at: new Date().toISOString()
      }

      this.addTestResult('UPDATE', '尝试', '更新用户信息', updateData)
      
      const result = await supabase.update('users', updateData, {
        id: this.data.testUserId
      })

      // 处理返回结果
      let updatedUser
      if (result && result.length > 0) {
        updatedUser = result[0]
        this.addTestResult('UPDATE', '成功', '用户更新成功', updatedUser)
      } else {
        // 更新可能成功但没有返回数据，验证更新结果
        this.addTestResult('UPDATE', '信息', '更新操作完成，验证结果...')
        
        await this.delay(1000)
        const verifyUser = await supabase
          .from('users')
          .select('*')
          .eq('id', this.data.testUserId)
          .single()

        if (verifyUser && verifyUser.nickname === updateData.nickname) {
          this.addTestResult('UPDATE', '成功', '更新验证成功', verifyUser)
          updatedUser = verifyUser
        } else {
          throw new Error('更新验证失败')
        }
      }

      return true

    } catch (error) {
      this.addTestResult('UPDATE', '失败', `更新用户失败: ${error.message}`)
      return false
    }
  },

  // 步骤4: 测试删除用户（Delete）
  async testDelete() {
    console.log('🗑️ 步骤4: 测试删除用户（Delete）')
    this.addTestResult('DELETE', '开始', '开始测试删除用户')

    try {
      if (!this.data.testUserId) {
        throw new Error('没有可用的测试用户ID')
      }

      // 验证用户存在
      this.addTestResult('DELETE', '尝试', '验证用户存在')
      const userBeforeDelete = await supabase
        .from('users')
        .select('*')
        .eq('id', this.data.testUserId)
        .single()

      if (!userBeforeDelete) {
        throw new Error('用户不存在，无法删除')
      }
      this.addTestResult('DELETE', '成功', '用户存在验证通过', {
        id: userBeforeDelete.id,
        nickname: userBeforeDelete.nickname
      })

      // 执行删除
      this.addTestResult('DELETE', '尝试', '删除用户')
      await supabase.delete('users', { id: this.data.testUserId })

      // 验证删除结果
      this.addTestResult('DELETE', '尝试', '验证删除结果')
      await this.delay(1000)
      
      const userAfterDelete = await supabase
        .from('users')
        .select('*')
        .eq('id', this.data.testUserId)
        .single()

      if (!userAfterDelete) {
        this.addTestResult('DELETE', '成功', '用户删除成功，验证通过')
      } else {
        throw new Error('用户删除失败，用户仍然存在')
      }

      return true

    } catch (error) {
      this.addTestResult('DELETE', '失败', `删除用户失败: ${error.message}`)
      return false
    }
  },

  // 运行完整测试
  async runFullTest() {
    this.setData({
      testStep: 'running',
      isLoading: true,
      currentTest: '开始CRUD测试...'
    })

    try {
      this.addTestResult('SYSTEM', '开始', '数据库CRUD测试开始')

      // 步骤1: 创建
      this.setData({ currentTest: '步骤1: 创建用户...' })
      const createSuccess = await this.testCreate()
      if (!createSuccess) {
        throw new Error('创建测试失败，中止后续测试')
      }
      await this.delay(2000)

      // 步骤2: 查询
      this.setData({ currentTest: '步骤2: 查询用户...' })
      await this.testRead()
      await this.delay(2000)

      // 步骤3: 更新
      this.setData({ currentTest: '步骤3: 更新用户...' })
      const updateSuccess = await this.testUpdate()
      if (!updateSuccess) {
        throw new Error('更新测试失败，中止后续测试')
      }
      await this.delay(2000)

      // 步骤4: 删除
      this.setData({ currentTest: '步骤4: 删除用户...' })
      await this.testDelete()

      this.addTestResult('SYSTEM', '完成', '数据库CRUD测试完成')
      
      // 生成测试报告
      this.generateTestReport()

    } catch (error) {
      this.addTestResult('SYSTEM', '错误', `测试过程中断: ${error.message}`)
      this.generateTestReport()
    } finally {
      this.setData({
        testStep: 'completed',
        isLoading: false,
        currentTest: '测试完成'
      })
    }
  },

  // 生成测试报告
  generateTestReport() {
    const { totalTests, successTests, failedTests, warningTests } = this.data
    
    this.addTestResult('REPORT', '统计', `总测试数: ${totalTests}, 成功: ${successTests}, 失败: ${failedTests}, 警告: ${warningTests}`)
    
    const successRate = totalTests > 0 ? ((successTests / totalTests) * 100).toFixed(1) : 0
    
    if (failedTests === 0) {
      this.addTestResult('REPORT', '成功', '🎉 所有CRUD测试通过！数据库功能正常')
    } else {
      this.addTestResult('REPORT', '警告', `⚠️ 部分测试失败，成功率: ${successRate}%`)
    }
  },

  // 开始测试按钮点击
  async startTest() {
    // 重置数据
    this.setData({
      testResults: [],
      totalTests: 0,
      successTests: 0,
      failedTests: 0,
      warningTests: 0,
      testUserId: null
    })
    
    // 生成新的测试ID
    this.generateTestOpenId()
    
    // 先运行简化版连接测试
    await this.runConnectionTest()
    
    // 如果连接测试通过，运行完整CRUD测试
    if (this.data.testResults.filter(r => r.status === '失败').length === 0) {
      this.runFullTest()
    }
  },

  // 运行简化版连接测试
  async runConnectionTest() {
    this.setData({ 
      isTesting: true, 
      currentStep: '连接测试...'
    })
    
    try {
      console.log('开始简化版数据库连接测试...')
      const result = await testDatabaseConnectionSimple()
      
      if (result.success) {
        console.log('✅ 连接测试成功')
        // 将测试结果添加到页面
        result.results.forEach(r => {
          this.addTestResult(r.step, r.status, r.message, r.data)
        })
      } else {
        console.log('❌ 连接测试失败')
        this.addTestResult('连接测试', '失败', result.error || '连接测试失败')
      }
    } catch (error) {
      console.error('连接测试异常:', error)
      this.addTestResult('连接测试', '失败', '测试异常: ' + error.message)
    }
  },

  // 清空结果
  clearResults() {
    this.setData({
      testResults: [],
      totalTests: 0,
      successTests: 0,
      failedTests: 0,
      warningTests: 0,
      testStep: 'ready',
      testUserId: null
    })
  },

  // 复制测试结果
  copyResults() {
    const resultsText = this.data.testResults.map(result => 
      `[${result.timestamp}] ${result.operation}: ${result.status} - ${result.message}`
    ).join('\n')
    
    wx.setClipboardData({
      data: resultsText,
      success: () => {
        wx.showToast({
          title: '测试结果已复制',
          icon: 'success'
        })
      }
    })
  },

  // 返回首页
  goBack() {
    wx.navigateBack()
  }
})