// 检查 Supabase 连接和 RLS 策略状态
// 在微信开发者工具控制台中运行此脚本

const checkSupabaseStatus = async function() {
  console.log('=== 检查 Supabase 连接和 RLS 策略状态 ===')
  
  try {
    const { supabase } = require('./utils/supabase.js')
    const config = require('./utils/config.js')
    
    console.log('Supabase URL:', supabase.url)
    console.log('Supabase Key:', supabase.key ? '已设置' : '未设置')
    
    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      console.error('用户未登录，请先登录')
      return
    }
    
    console.log('当前用户信息:', userInfo)
    console.log('用户ID:', userInfo.userId)
    console.log('用户OpenID:', userInfo.openid)
    
    // 测试查询用户信息
    console.log('\n--- 测试查询用户信息 ---')
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.key}`,
      'apikey': supabase.key,
      'Prefer': 'return=representation'
    }
    
    if (userInfo.userId) {
      headers['x-user-id'] = userInfo.userId.toString()
      headers['x-user-openid'] = userInfo.openid || ''
    }
    
    // 查询用户信息
    wx.request({
      url: `${supabase.url}/rest/v1/users?id=eq.${userInfo.userId}`,
      method: 'GET',
      header: headers,
      success: (res) => {
        console.log('查询结果状态码:', res.statusCode)
        console.log('查询结果数据:', res.data)
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ 查询成功')
          
          if (res.data && res.data.length > 0) {
            const user = res.data[0]
            console.log('用户昵称:', user.nickname)
            console.log('用户头像:', user.avatar_url)
            
            // 测试更新用户信息
            console.log('\n--- 测试更新用户信息 ---')
            const testNickname = `测试昵称_${Date.now()}`
            
            wx.request({
              url: `${supabase.url}/rest/v1/users?id=eq.${userInfo.userId}`,
              method: 'PATCH',
              header: headers,
              data: {
                nickname: testNickname,
                updated_at: new Date().toISOString()
              },
              success: (updateRes) => {
                console.log('更新结果状态码:', updateRes.statusCode)
                console.log('更新结果数据:', updateRes.data)
                
                if (updateRes.statusCode >= 200 && updateRes.statusCode < 300) {
                  console.log('✅ 更新成功')
                  
                  // 验证更新结果
                  wx.request({
                    url: `${supabase.url}/rest/v1/users?id=eq.${userInfo.userId}`,
                    method: 'GET',
                    header: headers,
                    success: (verifyRes) => {
                      console.log('验证查询结果:', verifyRes.data)
                      
                      if (verifyRes.statusCode >= 200 && verifyRes.statusCode < 300 && verifyRes.data.length > 0) {
                        const updatedUser = verifyRes.data[0]
                        console.log('更新后的昵称:', updatedUser.nickname)
                        
                        if (updatedUser.nickname === testNickname) {
                          console.log('✅ 更新验证成功！RLS策略正常工作')
                        } else {
                          console.log('❌ 更新验证失败：昵称不匹配')
                        }
                      } else {
                        console.log('❌ 验证查询失败')
                      }
                    },
                    fail: (err) => {
                      console.log('❌ 验证查询网络错误:', err)
                    }
                  })
                } else {
                  console.log('❌ 更新失败，可能是RLS策略问题')
                  console.log('错误详情:', updateRes.data)
                }
              },
              fail: (err) => {
                console.log('❌ 更新网络错误:', err)
              }
            })
          } else {
            console.log('❌ 用户不存在')
          }
        } else {
          console.log('❌ 查询失败，可能是RLS策略问题')
          console.log('错误详情:', res.data)
        }
      },
      fail: (err) => {
        console.log('❌ 查询网络错误:', err)
      }
    })
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error)
  }
  
  console.log('=== 检查完成 ===')
}

// 提供一个简化的RLS策略修复SQL
const generateRLSFixSQL = function() {
  console.log(`
=== RLS策略修复SQL ===
请在Supabase SQL编辑器中执行以下SQL：

-- 1. 完全禁用RLS（最简单的解决方案）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. 如果需要启用RLS，使用以下策略
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. 删除所有现有策略
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- 4. 创建新的策略
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (id = current_setting('app.current_user_id', true)::bigint);

CREATE POLICY "Users can update by openid" ON users
    FOR UPDATE USING (openid = current_setting('app.current_user_openid', true));

CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (id = current_setting('app.current_user_id', true)::bigint OR openid = current_setting('app.current_user_openid', true));

-- 5. 验证策略
SELECT 'RLS策略修复完成' AS status;
`)
}

console.log('Supabase状态检查脚本已加载')
console.log('运行 checkSupabaseStatus() 检查当前状态')
console.log('运行 generateRLSFixSQL() 获取修复SQL')