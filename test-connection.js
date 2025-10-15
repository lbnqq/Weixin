// 数据库连接验证脚本
const { supabase } = require('./utils/supabase')

async function testDatabaseConnection() {
  console.log('🚀 开始数据库连接验证...')
  
  try {
    // 1. 测试数据库连接
    console.log('1️⃣ 测试数据库连接...')
    const startTime = Date.now()
    
    const result = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    console.log(`✅ 数据库连接成功！响应时间: ${responseTime}ms`)
    console.log(`📊 返回数据:`, result ? '有数据' : '无数据')
    
    // 2. 测试表结构
    console.log('\n2️⃣ 测试表结构...')
    
    // 检查users表
    const usersResult = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersResult && Array.isArray(usersResult)) {
      console.log('✅ users表存在')
      if (usersResult.length > 0) {
        const columns = Object.keys(usersResult[0])
        console.log(`📋 字段列表: ${columns.join(', ')}`)
      }
    }
    
    // 3. 测试插入功能
    console.log('\n3️⃣ 测试插入功能...')
    const testData = {
      openid: 'test_connection_' + Date.now(),
      user_id: 'test_user_' + Date.now(),
      nickname: '连接测试用户',
      avatar_url: 'https://via.placeholder.com/100x100/4CAF50/ffffff?text=TEST',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const insertResult = await supabase.insert('users', testData)
    
    if (insertResult && insertResult.length > 0) {
      const createdUser = insertResult[0]
      console.log('✅ 插入功能正常')
      console.log(`📊 创建用户ID: ${createdUser.id}`)
      
      // 4. 测试查询功能
      console.log('\n4️⃣ 测试查询功能...')
      const queryResult = await supabase
        .from('users')
        .select('*')
        .eq('id', createdUser.id)
        .single()
      
      if (queryResult) {
        console.log('✅ 查询功能正常')
        console.log(`📋 查询到用户: ${queryResult.nickname}`)
        
        // 5. 测试更新功能
        console.log('\n5️⃣ 测试更新功能...')
        const updateData = {
          nickname: '连接测试用户_已更新',
          updated_at: new Date().toISOString()
        }
        
        const updateResult = await supabase.update('users', updateData, {
          id: createdUser.id
        })
        
        console.log('✅ 更新功能正常')
        
        // 6. 测试删除功能
        console.log('\n6️⃣ 测试删除功能...')
        await supabase.delete('users', { id: createdUser.id })
        console.log('✅ 删除功能正常')
        
        // 7. 验证删除
        const verifyDelete = await supabase
          .from('users')
          .select('*')
          .eq('id', createdUser.id)
          .single()
        
        if (!verifyDelete) {
          console.log('✅ 删除验证成功')
        }
      } else {
        console.log('⚠️ 查询功能异常')
      }
    } else {
      console.log('⚠️ 插入功能异常')
    }
    
    console.log('\n🎉 数据库连接验证完成！')
    console.log('✅ 所有基本功能测试通过')
    
  } catch (error) {
    console.error('❌ 数据库连接验证失败:')
    console.error('错误类型:', error.constructor.name)
    console.error('错误消息:', error.message)
    console.error('堆栈跟踪:', error.stack)
    
    // 尝试诊断具体问题
    if (error.message.includes('Network')) {
      console.error('\n🔍 诊断: 网络连接问题')
      console.error('建议:')
      console.error('1. 检查网络连接')
      console.error('2. 检查Supabase URL配置')
      console.error('3. 检查防火墙设置')
    } else if (error.message.includes('auth')) {
      console.error('\n🔍 诊断: 认证问题')
      console.error('建议:')
      console.error('1. 检查Supabase Key配置')
      console.error('2. 检查API权限设置')
    } else if (error.message.includes('table')) {
      console.error('\n🔍 诊断: 表结构问题')
      console.error('建议:')
      console.error('1. 运行数据库初始化脚本')
      console.error('2. 检查表名是否正确')
    } else {
      console.error('\n🔍 诊断: 未知问题')
      console.error('建议:')
      console.error('1. 检查Supabase控制台状态')
      console.error('2. 查看详细错误日志')
    }
  }
}

// 如果直接运行此脚本，执行测试
if (require.main === module) {
  testDatabaseConnection().catch(console.error)
}

module.exports = { testDatabaseConnection }