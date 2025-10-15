// 数据库CRUD操作测试脚本
// 测试Supabase数据库的增删改查功能

const { supabase } = require('./utils/supabase')

class DatabaseCRUDTest {
  constructor() {
    this.testUserId = null
    this.testOpenId = 'test_crud_user_' + Date.now()
    this.testUserData = {
      openid: this.testOpenId,
      user_id: 'test_user_crud_' + Date.now(),
      nickname: 'CRUD测试用户',
      avatar_url: 'https://via.placeholder.com/100x100/FF5722/ffffff?text=CRUD',
      avatarUri: 'https://via.placeholder.com/100x100/FF5722/ffffff?text=CRUD'
    }
    this.testResults = []
  }

  // 添加测试结果
  addTestResult(operation, status, message, data = null) {
    const result = {
      timestamp: new Date().toLocaleString(),
      operation,
      status,
      message,
      data
    }
    this.testResults.push(result)
    console.log(`[${operation}] ${status}: ${message}`)
    if (data) {
      console.log('数据:', JSON.stringify(data, null, 2))
    }
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 步骤1: 测试创建用户（Create）
  async testCreate() {
    console.log('\n📝 步骤1: 测试创建用户（Create）')
    this.addTestResult('CREATE', '开始', '开始测试创建用户')

    try {
      // 方法1: 使用insert函数
      this.addTestResult('CREATE', '尝试', '使用insert函数创建用户')
      const createdUser = await supabase.insert('users', this.testUserData)
      
      if (createdUser && createdUser.length > 0) {
        this.testUserId = createdUser[0].id
        this.addTestResult('CREATE', '成功', '用户创建成功', createdUser[0])
        return true
      } else {
        this.addTestResult('CREATE', '警告', 'insert返回空数据，尝试使用查询验证')
      }

      // 方法2: 验证用户是否已创建
      await this.delay(1000)
      const verifyUser = await supabase
        .from('users')
        .select('*')
        .eq('openid', this.testOpenId)
        .single()

      if (verifyUser) {
        this.testUserId = verifyUser.id
        this.addTestResult('CREATE', '成功', '通过查询验证用户已创建', verifyUser)
        return true
      } else {
        throw new Error('用户创建验证失败')
      }

    } catch (error) {
      this.addTestResult('CREATE', '失败', `创建用户失败: ${error.message}`)
      return false
    }
  }

  // 步骤2: 测试查询用户（Read）
  async testRead() {
    console.log('\n🔍 步骤2: 测试查询用户（Read）')
    this.addTestResult('READ', '开始', '开始测试查询用户')

    try {
      if (!this.testUserId) {
        throw new Error('没有可用的测试用户ID')
      }

      // 方法1: 按ID查询
      this.addTestResult('READ', '尝试', '按ID查询用户')
      const userById = await supabase
        .from('users')
        .select('*')
        .eq('id', this.testUserId)
        .single()

      if (userById) {
        this.addTestResult('READ', '成功', '按ID查询成功', userById)
      } else {
        this.addTestResult('READ', '警告', '按ID查询返回空')
      }

      // 方法2: 按openid查询
      this.addTestResult('READ', '尝试', '按openid查询用户')
      const userByOpenId = await supabase
        .from('users')
        .select('*')
        .eq('openid', this.testOpenId)
        .single()

      if (userByOpenId) {
        this.addTestResult('READ', '成功', '按openid查询成功', userByOpenId)
      } else {
        this.addTestResult('READ', '警告', '按openid查询返回空')
      }

      // 方法3: 列表查询（限制10条）
      this.addTestResult('READ', '尝试', '查询用户列表')
      const userList = await supabase
        .from('users')
        .select('id, openid, nickname, created_at')
        .limit(10)

      if (userList && userList.length > 0) {
        this.addTestResult('READ', '成功', `查询到 ${userList.length} 个用户`, {
          count: userList.length,
          sample: userList[0]
        })
      } else {
        this.addTestResult('READ', '警告', '用户列表为空')
      }

      return true

    } catch (error) {
      this.addTestResult('READ', '失败', `查询用户失败: ${error.message}`)
      return false
    }
  }

  // 步骤3: 测试更新用户（Update）
  async testUpdate() {
    console.log('\n✏️ 步骤3: 测试更新用户（Update）')
    this.addTestResult('UPDATE', '开始', '开始测试更新用户')

    try {
      if (!this.testUserId) {
        throw new Error('没有可用的测试用户ID')
      }

      const updateData = {
        nickname: 'CRUD测试用户_已更新',
        avatar_url: 'https://via.placeholder.com/100x100/4CAF50/ffffff?text=UPDATED',
        updated_at: new Date().toISOString()
      }

      this.addTestResult('UPDATE', '尝试', '更新用户信息')
      
      // 使用update函数
      const updatedResult = await supabase.update('users', updateData, {
        id: this.testUserId
      })

      // 处理返回结果
      let updatedUser
      if (updatedResult && updatedResult.length > 0) {
        updatedUser = updatedResult[0]
        this.addTestResult('UPDATE', '成功', '用户更新成功', updatedUser)
      } else {
        // 更新可能成功但没有返回数据，验证更新结果
        this.addTestResult('UPDATE', '信息', '更新操作完成，验证结果...')
        
        await this.delay(1000)
        const verifyUser = await supabase
          .from('users')
          .select('*')
          .eq('id', this.testUserId)
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
  }

  // 步骤4: 测试删除用户（Delete）
  async testDelete() {
    console.log('\n🗑️ 步骤4: 测试删除用户（Delete）')
    this.addTestResult('DELETE', '开始', '开始测试删除用户')

    try {
      if (!this.testUserId) {
        throw new Error('没有可用的测试用户ID')
      }

      // 先验证用户存在
      this.addTestResult('DELETE', '尝试', '验证用户存在')
      const userBeforeDelete = await supabase
        .from('users')
        .select('*')
        .eq('id', this.testUserId)
        .single()

      if (!userBeforeDelete) {
        throw new Error('用户不存在，无法删除')
      }
      this.addTestResult('DELETE', '成功', '用户存在验证通过', { id: userBeforeDelete.id, nickname: userBeforeDelete.nickname })

      // 执行删除
      this.addTestResult('DELETE', '尝试', '删除用户')
      await supabase.delete('users', { id: this.testUserId })

      // 验证删除结果
      this.addTestResult('DELETE', '尝试', '验证删除结果')
      await this.delay(1000)
      
      const userAfterDelete = await supabase
        .from('users')
        .select('*')
        .eq('id', this.testUserId)
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
  }

  // 运行完整测试
  async runFullTest() {
    console.log('🚀 开始数据库CRUD操作完整测试')
    console.log('='.repeat(50))
    
    this.addTestResult('SYSTEM', '开始', '数据库CRUD测试开始')

    try {
      // 测试创建
      const createSuccess = await this.testCreate()
      if (!createSuccess) {
        throw new Error('创建测试失败，中止后续测试')
      }
      await this.delay(2000)

      // 测试查询
      const readSuccess = await this.testRead()
      if (!readSuccess) {
        console.log('⚠️ 查询测试失败，但继续后续测试')
      }
      await this.delay(2000)

      // 测试更新
      const updateSuccess = await this.testUpdate()
      if (!updateSuccess) {
        throw new Error('更新测试失败，中止后续测试')
      }
      await this.delay(2000)

      // 测试删除
      const deleteSuccess = await this.testDelete()
      if (!deleteSuccess) {
        console.log('⚠️ 删除测试失败')
      }

      this.addTestResult('SYSTEM', '完成', '数据库CRUD测试完成')
      
      // 生成测试报告
      this.generateTestReport()

    } catch (error) {
      this.addTestResult('SYSTEM', '错误', `测试过程中断: ${error.message}`)
      this.generateTestReport()
    }
  }

  // 生成测试报告
  generateTestReport() {
    console.log('\n📊 测试报告')
    console.log('='.repeat(50))
    
    const totalTests = this.testResults.length
    const successTests = this.testResults.filter(r => r.status === '成功').length
    const failedTests = this.testResults.filter(r => r.status === '失败').length
    const warningTests = this.testResults.filter(r => r.status === '警告').length

    console.log(`总测试数: ${totalTests}`)
    console.log(`成功: ${successTests}`)
    console.log(`失败: ${failedTests}`)
    console.log(`警告: ${warningTests}`)
    console.log(`成功率: ${((successTests / totalTests) * 100).toFixed(1)}%`)

    console.log('\n详细结果:')
    this.testResults.forEach((result, index) => {
      const statusIcon = {
        '成功': '✅',
        '失败': '❌',
        '警告': '⚠️',
        '信息': 'ℹ️',
        '开始': '🚀',
        '尝试': '🔍'
      }
      console.log(`${index + 1}. ${statusIcon[result.status] || '📝'} [${result.operation}] ${result.status}: ${result.message}`)
    })

    // 保存测试结果到文件（可选）
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        success: successTests,
        failed: failedTests,
        warning: warningTests,
        successRate: ((successTests / totalTests) * 100).toFixed(1) + '%'
      },
      results: this.testResults
    }

    // 这里可以添加保存到文件的代码
    console.log('\n💾 测试数据已准备完毕，可以保存到文件')
  }

  // 获取测试结果
  getTestResults() {
    return this.testResults
  }
}

// 导出测试类
module.exports = {
  DatabaseCRUDTest
}

// 如果直接运行此脚本，执行测试
if (require.main === module) {
  const tester = new DatabaseCRUDTest()
  tester.runFullTest().catch(console.error)
}