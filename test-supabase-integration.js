// test-supabase-integration.js
// 完整的 Supabase 集成测试代码示例

const app = getApp()
const { supabase } = require('./utils/supabase')
// 如需增强版客户端，取消下面注释
// const { enhancedSupabase } = require('./utils/supabase-enhanced')

class SupabaseIntegrationTester {
  constructor() {
    this.testResults = []
    this.currentUser = null
  }

  // 添加测试结果
  addResult(test, status, message, data = null) {
    const result = {
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }
    this.testResults.push(result)
    console.log(`[${status.toUpperCase()}] ${test}: ${message}`, data || '')
    return result
  }

  // 获取所有测试结果
  getResults() {
    return this.testResults
  }

  // 清理测试结果
  clearResults() {
    this.testResults = []
  }

  // 测试1：基本连接测试
  async testConnection() {
    try {
      console.log('🚀 开始测试 Supabase 连接...')
      
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (error) {
        throw error
      }
      
      return this.addResult(
        '数据库连接',
        'success',
        '成功连接到 Supabase 数据库',
        { dataCount: data.length }
      )
    } catch (error) {
      return this.addResult(
        '数据库连接',
        'error',
        `连接失败: ${error.message}`,
        { error: error.message }
      )
    }
  }

  // 测试2：表结构验证
  async testTableStructure() {
    try {
      console.log('📊 验证表结构...')
      
      // 尝试查询各个字段
      const { data, error } = await supabase
        .from('users')
        .select('id, openid, user_id, nickname, avatar_url, avatarUri, created_at, updated_at')
        .limit(1)
      
      if (error) {
        throw error
      }
      
      // 检查返回的数据结构
      const hasRequiredFields = data && data.length > 0
      const sampleData = hasRequiredFields ? data[0] : null
      
      return this.addResult(
        '表结构验证',
        'success',
        '表结构完整，所有必要字段都存在',
        { sampleData, hasRequiredFields }
      )
    } catch (error) {
      return this.addResult(
        '表结构验证',
        'error',
        `表结构验证失败: ${error.message}`,
        { error: error.message }
      )
    }
  }

  // 测试3：创建测试用户
  async testUserCreation() {
    try {
      console.log('👤 测试用户创建...')
      
      // 生成测试数据
      const timestamp = Date.now()
      const testUser = {
        openid: `test_openid_${timestamp}`,
        user_id: `test_user_${timestamp}`,
        nickname: `测试用户${timestamp}`,
        avatar_url: `https://via.placeholder.com/100x100/4CAF50/ffffff?text=TEST${timestamp}`,
        avatarUri: `https://via.placeholder.com/100x100/4CAF50/ffffff?text=TEST${timestamp}`,
        created_at: new Date().toISOString()
      }
      
      console.log('创建用户数据:', testUser)
      
      const { data, error } = await supabase
        .from('users')
        .insert([testUser])
        .select()
      
      if (error) {
        throw error
      }
      
      if (!data || data.length === 0) {
        throw new Error('用户创建成功但返回数据为空')
      }
      
      this.currentUser = data[0]
      
      return this.addResult(
        '用户创建',
        'success',
        `用户创建成功: ${data[0].nickname} (ID: ${data[0].id})`,
        { user: data[0] }
      )
    } catch (error) {
      return this.addResult(
        '用户创建',
        'error',
        `用户创建失败: ${error.message}`,
        { error: error.message }
      )
    }
  }

  // 测试4：查询用户信息
  async testUserQuery() {
    if (!this.currentUser) {
      return this.addResult(
        '用户查询',
        'warning',
        '跳过测试：没有可用的测试用户'
      )
    }

    try {
      console.log('🔍 测试用户查询...')
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('openid', this.currentUser.openid)
        .single()
      
      if (error) {
        throw error
      }
      
      if (!data) {
        throw new Error('未找到用户数据')
      }
      
      return this.addResult(
        '用户查询',
        'success',
        `成功查询用户: ${data.nickname}`,
        { user: data }
      )
    } catch (error) {
      return this.addResult(
        '用户查询',
        'error',
        `用户查询失败: ${error.message}`,
        { error: error.message }
      )
    }
  }

  // 测试5：更新用户信息
  async testUserUpdate() {
    if (!this.currentUser) {
      return this.addResult(
        '用户更新',
        'warning',
        '跳过测试：没有可用的测试用户'
      )
    }

    try {
      console.log('✏️ 测试用户更新...')
      
      const updateData = {
        nickname: this.currentUser.nickname + '_已更新',
        avatar_url: 'https://via.placeholder.com/100x100/FF5722/ffffff?text=UPDATED',
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('openid', this.currentUser.openid)
        .select()
      
      if (error) {
        throw error
      }
      
      if (!data || data.length === 0) {
        throw new Error('更新成功但返回数据为空')
      }
      
      this.currentUser = data[0]
      
      return this.addResult(
        '用户更新',
        'success',
        `用户更新成功: ${data[0].nickname}`,
        { updatedUser: data[0] }
      )
    } catch (error) {
      return this.addResult(
        '用户更新',
        'error',
        `用户更新失败: ${error.message}`,
        { error: error.message }
      )
    }
  }

  // 测试6：删除测试用户
  async testUserDeletion() {
    if (!this.currentUser) {
      return this.addResult(
        '用户删除',
        'warning',
        '跳过测试：没有可用的测试用户'
      )
    }

    try {
      console.log('🗑️ 测试用户删除...')
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('openid', this.currentUser.openid)
      
      if (error) {
        throw error
      }
      
      const deletedUserId = this.currentUser.id
      this.currentUser = null
      
      return this.addResult(
        '用户删除',
        'success',
        `用户删除成功 (ID: ${deletedUserId})`
      )
    } catch (error) {
      return this.addResult(
        '用户删除',
        'error',
        `用户删除失败: ${error.message}`,
        { error: error.message }
      )
    }
  }

  // 测试7：性能测试
  async testPerformance() {
    try {
      console.log('⚡ 测试性能...')
      
      const startTime = Date.now()
      
      // 执行多次查询测试性能
      const promises = []
      for (let i = 0; i < 5; i++) {
        promises.push(
          supabase
            .from('users')
            .select('count')
            .limit(1)
        )
      }
      
      await Promise.all(promises)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      return this.addResult(
        '性能测试',
        'success',
        `5次并发查询耗时: ${duration}ms`,
        { duration, avgTime: Math.round(duration / 5) }
      )
    } catch (error) {
      return this.addResult(
        '性能测试',
        'error',
        `性能测试失败: ${error.message}`,
        { error: error.message }
      )
    }
  }

  // 运行完整测试套件
  async runFullTestSuite() {
    console.log('🎯 开始完整 Supabase 集成测试套件...')
    this.clearResults()
    
    const tests = [
      () => this.testConnection(),
      () => this.testTableStructure(),
      () => this.testUserCreation(),
      () => this.testUserQuery(),
      () => this.testUserUpdate(),
      () => this.testUserDeletion(),
      () => this.testPerformance()
    ]
    
    const results = []
    for (const test of tests) {
      const result = await test()
      results.push(result)
      
      // 如果关键测试失败，停止后续测试
      if (result.test === '数据库连接' && result.status === 'error') {
        console.log('❌ 数据库连接失败，停止后续测试')
        break
      }
      
      // 短暂延迟，避免请求过快
      await this.delay(500)
    }
    
    console.log('✅ 测试套件完成')
    return this.generateTestReport()
  }

  // 生成测试报告
  generateTestReport() {
    const total = this.testResults.length
    const passed = this.testResults.filter(r => r.status === 'success').length
    const failed = this.testResults.filter(r => r.status === 'error').length
    const warnings = this.testResults.filter(r => r.status === 'warning').length
    
    const report = {
      summary: {
        total,
        passed,
        failed,
        warnings,
        successRate: Math.round((passed / total) * 100)
      },
      results: this.testResults,
      recommendations: this.generateRecommendations()
    }
    
    console.log('📊 测试报告生成完成:', report.summary)
    return report
  }

  // 生成建议
  generateRecommendations() {
    const recommendations = []
    
    const hasConnectionError = this.testResults.some(r => 
      r.test === '数据库连接' && r.status === 'error'
    )
    
    const hasTableStructureError = this.testResults.some(r => 
      r.test === '表结构验证' && r.status === 'error'
    )
    
    if (hasConnectionError) {
      recommendations.push({
        priority: 'high',
        issue: '数据库连接失败',
        solution: '检查 Supabase URL、密钥配置和网络连接'
      })
    }
    
    if (hasTableStructureError) {
      recommendations.push({
        priority: 'high',
        issue: '表结构不完整',
        solution: '执行 fix-missing-columns.sql 脚本修复缺失的列'
      })
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'low',
        issue: '一切正常',
        solution: 'Supabase 集成测试通过，可以继续开发'
      })
    }
    
    return recommendations
  }

  // 辅助函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 创建全局测试器实例
const tester = new SupabaseIntegrationTester()

// 导出测试函数
module.exports = {
  SupabaseIntegrationTester,
  tester,
  
  // 快速测试函数
  async quickTest() {
    console.log('🚀 执行快速 Supabase 测试...')
    const report = await tester.runFullTestSuite()
    
    console.log('\n📋 快速测试结果:')
    console.log(`总测试数: ${report.summary.total}`)
    console.log(`通过: ${report.summary.passed}`)
    console.log(`失败: ${report.summary.failed}`)
    console.log(`成功率: ${report.summary.successRate}%`)
    
    if (report.summary.failed > 0) {
      console.log('\n❌ 失败的测试:')
      report.results
        .filter(r => r.status === 'error')
        .forEach(r => console.log(`- ${r.test}: ${r.message}`))
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 建议:')
      report.recommendations.forEach(rec => 
        console.log(`- ${rec.issue}: ${rec.solution}`)
      )
    }
    
    return report
  },
  
  // 详细测试函数
  async detailedTest() {
    console.log('🔍 执行详细 Supabase 测试...')
    const report = await tester.runFullTestSuite()
    
    console.log('\n📊 详细测试报告:')
    console.log(JSON.stringify(report, null, 2))
    
    return report
  }
}