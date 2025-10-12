// 简单的Supabase连接测试
const supabaseModule = require('./utils/supabase.js')

console.log('=== Supabase调试测试 ===')
console.log('supabaseModule:', supabaseModule)
console.log('supabaseModule.supabase:', supabaseModule.supabase)
console.log('supabaseModule.supabase.from type:', typeof supabaseModule.supabase.from)

try {
  const query = supabaseModule.supabase.from('users')
  console.log('query对象:', query)
  console.log('query类型:', typeof query)
  console.log('query.select类型:', typeof query.select)
  
  if (typeof query.select === 'function') {
    console.log('✅ query.select是函数')
    const selectQuery = query.select('*')
    console.log('selectQuery对象:', selectQuery)
    console.log('selectQuery.limit类型:', typeof selectQuery.limit)
    
    if (typeof selectQuery.limit === 'function') {
      console.log('✅ selectQuery.limit是函数')
      const limitQuery = selectQuery.limit(1)
      console.log('limitQuery对象:', limitQuery)
      console.log('limitQuery.execute类型:', typeof limitQuery.execute)
      
      if (typeof limitQuery.execute === 'function') {
        console.log('✅ limitQuery.execute是函数，准备执行查询')
        limitQuery.execute()
          .then(result => {
            console.log('✅ 查询执行成功:', result)
          })
          .catch(error => {
            console.error('❌ 查询执行失败:', error)
          })
      } else {
        console.error('❌ limitQuery.execute不是函数')
      }
    } else {
      console.error('❌ selectQuery.limit不是函数')
    }
  } else {
    console.error('❌ query.select不是函数')
  }
} catch (error) {
  console.error('❌ 测试过程中发生错误:', error)
}