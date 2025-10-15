// 微信小程序数据库测试工具
// 直接在小程序环境中测试数据库连接

const { supabase } = require('../../utils/supabase')

// 简化版的数据库连接测试
async function testDatabaseConnectionSimple() {
  console.log('🚀 开始数据库连接测试...')
  
  const testResults = []
  
  function addResult(step, status, message, data = null) {
    const result = {
      step,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }
    testResults.push(result)
    console.log(`[${result.timestamp}] ${step}: ${status} - ${message}`)
    return result
  }
  
  try {
    // 1. 测试数据库连接
    addResult('连接测试', '开始', '正在测试数据库连接...')
    
    const startTime = Date.now()
    const connectionTest = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    if (connectionTest !== null && connectionTest !== undefined) {
      addResult('连接测试', '成功', `数据库连接正常，响应时间: ${responseTime}ms`)
    } else {
      addResult('连接测试', '警告', '数据库连接返回空数据，但连接成功')
    }
    
    // 2. 测试表结构
    addResult('表结构测试', '开始', '正在检查users表结构...')
    
    const tableTest = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (tableTest && Array.isArray(tableTest)) {
      addResult('表结构测试', '成功', `users表存在，包含 ${tableTest.length} 条数据`)
      if (tableTest.length > 0) {
        const columns = Object.keys(tableTest[0])
        addResult('表结构测试', '信息', `字段列表: ${columns.join(', ')}`)
      }
    } else {
      addResult('表结构测试', '失败', 'users表查询异常')
    }
    
    // 3. 测试创建功能
    addResult('创建测试', '开始', '正在测试创建功能...')
    
    const testUserData = {
      openid: 'test_wechat_' + Date.now(),
      user_id: 'test_user_' + Date.now(),
      nickname: '微信小程序测试用户',
      avatar_url: 'https://via.placeholder.com/100x100/4CAF50/ffffff?text=WECHAT',
      avatarUri: 'https://via.placeholder.com/100x100/4CAF50/ffffff?text=WECHAT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const createResult = await supabase.insert('users', testUserData)
    
    if (createResult && createResult.length > 0) {
      const createdUser = createResult[0]
      addResult('创建测试', '成功', `用户创建成功，ID: ${createdUser.id}`, createdUser)
      
      // 4. 测试查询功能
      addResult('查询测试', '开始', '正在测试查询功能...')
      
      const queryResult = await supabase
        .from('users')
        .select('*')
        .eq('id', createdUser.id)
        .single()
      
      if (queryResult) {
        addResult('查询测试', '成功', `查询成功，用户: ${queryResult.nickname}`, queryResult)
        
        // 5. 测试更新功能
        addResult('更新测试', '开始', '正在测试更新功能...')
        
        const updateData = {
          nickname: '微信小程序测试用户_已更新',
          updated_at: new Date().toISOString()
        }
        
        const updateResult = await supabase.update('users', updateData, {
          id: createdUser.id
        })
        
        if (updateResult && updateResult.length > 0) {
          addResult('更新测试', '成功', '更新成功', updateResult[0])
        } else {
          // 验证更新结果
          const verifyUpdate = await supabase
            .from('users')
            .select('*')
            .eq('id', createdUser.id)
            .single()
          
          if (verifyUpdate && verifyUpdate.nickname === updateData.nickname) {
            addResult('更新测试', '成功', '更新验证成功', verifyUpdate)
          } else {
            addResult('更新测试', '失败', '更新验证失败')
          }
        }
        
        // 6. 测试删除功能
        addResult('删除测试', '开始', '正在测试删除功能...')
        
        await supabase.delete('users', { id: createdUser.id })
        
        // 验证删除结果
        const verifyDelete = await supabase
          .from('users')
          .select('*')
          .eq('id', createdUser.id)
          .single()
        
        if (!verifyDelete) {
          addResult('删除测试', '成功', '用户删除成功，验证通过')
        } else {
          addResult('删除测试', '失败', '用户删除失败，用户仍然存在')
        }
        
      } else {
        addResult('查询测试', '失败', '查询失败')
      }
      
    } else {
      addResult('创建测试', '失败', '用户创建失败')
    }
    
    // 生成测试报告
    console.log('\n' + '='.repeat(50))
    console.log('📊 数据库连接测试报告')
    console.log('='.repeat(50))
    
    const successCount = testResults.filter(r => r.status === '成功').length
    const failedCount = testResults.filter(r => r.status === '失败').length
    const totalCount = testResults.length
    
    console.log(`总测试步骤: ${totalCount}`)
    console.log(`成功: ${successCount}`)
    console.log(`失败: ${failedCount}`)
    console.log(`成功率: ${((successCount / totalCount) * 100).toFixed(1)}%`)
    
    console.log('\n详细结果:')
    testResults.forEach((result, index) => {
      const icon = result.status === '成功' ? '✅' : result.status === '失败' ? '❌' : 'ℹ️'
      console.log(`${index + 1}. ${icon} [${result.step}] ${result.status}: ${result.message}`)
    })
    
    return {
      success: failedCount === 0,
      results: testResults,
      summary: {
        total: totalCount,
        success: successCount,
        failed: failedCount,
        successRate: ((successCount / totalCount) * 100).toFixed(1) + '%'
      }
    }
    
  } catch (error) {
    console.error('❌ 数据库连接测试失败:', error)
    addResult('系统错误', '失败', error.message)
    
    return {
      success: false,
      error: error.message,
      results: testResults
    }
  }
}

module.exports = {
  testDatabaseConnectionSimple
}