// 测试用户信息更新功能
// 在微信开发者工具控制台中运行此脚本

// 1. 首先执行RLS策略修复脚本
// 在Supabase SQL编辑器中运行 fix-user-update-policy.sql 文件内容

// 2. 测试用户信息更新
const testUserUpdate = async function() {
  console.log('=== 开始测试用户信息更新功能 ===')
  
  try {
    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      console.error('用户未登录，请先登录')
      return
    }
    
    console.log('当前用户信息:', userInfo)
    
    // 准备测试数据
    const testNickname = '测试昵称_' + Date.now()
    const testAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
    
    // 更新用户信息
    const { supabase } = require('./utils/supabase.js')
    
    // 设置请求头
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
    
    // 发送更新请求
    wx.request({
      url: `${supabase.url}/rest/v1/users?id=eq.${userInfo.userId}`,
      method: 'PATCH',
      header: headers,
      data: {
        nickname: testNickname,
        avatar_url: testAvatarUrl,
        updated_at: new Date().toISOString()
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ 用户信息更新成功:', res.data)
          
          // 验证更新结果
          wx.request({
            url: `${supabase.url}/rest/v1/users?id=eq.${userInfo.userId}`,
            method: 'GET',
            header: headers,
            success: (getRes) => {
              if (getRes.statusCode >= 200 && getRes.statusCode < 300) {
                const updatedUser = getRes.data[0]
                console.log('✅ 验证更新结果:', updatedUser)
                
                if (updatedUser.nickname === testNickname && updatedUser.avatar_url === testAvatarUrl) {
                  console.log('✅ 用户信息更新验证通过！')
                } else {
                  console.error('❌ 用户信息更新验证失败')
                }
              } else {
                console.error('❌ 获取更新后的用户信息失败:', getRes)
              }
            },
            fail: (err) => {
              console.error('❌ 获取更新后的用户信息网络错误:', err)
            }
          })
        } else {
          console.error('❌ 用户信息更新失败:', res)
        }
      },
      fail: (err) => {
        console.error('❌ 用户信息更新网络错误:', err)
      }
    })
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
  
  console.log('=== 测试完成 ===')
}

// 3. 在控制台运行测试
// testUserUpdate()

console.log('测试脚本已加载，请在控制台运行 testUserUpdate() 函数进行测试')
console.log('注意：请先确保已在Supabase中执行了 fix-user-update-policy.sql 脚本')