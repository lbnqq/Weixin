// 完整的 Supabase 用户信息更新测试脚本
// 测试登录后修改用户头像和昵称，验证 Supabase 后台是否能正确更新

const testSupabaseUserUpdate = async function() {
  console.log('=== 开始 Supabase 用户信息更新完整测试 ===')
  
  try {
    // 1. 检查当前登录状态
    console.log('\n--- 1. 检查当前登录状态 ---')
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      console.error('❌ 用户未登录，请先登录小程序')
      return false
    }
    
    console.log('✅ 用户已登录:', userInfo.nickName)
    console.log('用户ID:', userInfo.userId)
    console.log('用户OpenID:', userInfo.openid)
    console.log('当前昵称:', userInfo.nickName)
    console.log('当前头像:', userInfo.avatarUrl)
    
    // 2. 测试 Supabase 连接
    console.log('\n--- 2. 测试 Supabase 连接 ---')
    const { supabase } = require('./utils/supabase.js')
    console.log('✅ Supabase 配置加载成功')
    console.log('Supabase URL:', supabase.url)
    
    // 3. 查询当前用户在 Supabase 中的信息
    console.log('\n--- 3. 查询 Supabase 中的用户信息 ---')
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.key}`,
      'apikey': supabase.key,
      'Prefer': 'return=representation'
    }
    
    // 设置用户上下文
    if (userInfo.userId) {
      headers['x-user-id'] = userInfo.userId.toString()
      headers['x-user-openid'] = userInfo.openid || ''
    }
    
    // 查询用户信息
    const queryUrl = userInfo.userId 
      ? `${supabase.url}/rest/v1/users?id=eq.${userInfo.userId}`
      : `${supabase.url}/rest/v1/users?openid=eq.${userInfo.openid}`
    
    console.log('查询URL:', queryUrl)
    
    const currentUser = await new Promise((resolve, reject) => {
      wx.request({
        url: queryUrl,
        method: 'GET',
        header: headers,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            reject(new Error(`查询失败: ${res.statusCode} - ${JSON.stringify(res.data)}`))
          }
        },
        fail: (err) => {
          reject(new Error(`网络错误: ${err.errMsg}`))
        }
      })
    })
    
    if (!currentUser || currentUser.length === 0) {
      console.error('❌ 在 Supabase 中未找到用户信息')
      return false
    }
    
    const supabaseUser = currentUser[0]
    console.log('✅ 找到 Supabase 用户信息:')
    console.log('数据库用户ID:', supabaseUser.id)
    console.log('数据库昵称:', supabaseUser.nickname)
    console.log('数据库头像:', supabaseUser.avatar_url)
    console.log('最后更新时间:', supabaseUser.updated_at)
    
    // 4. 准备测试数据
    console.log('\n--- 4. 准备测试更新数据 ---')
    const testNickname = `测试昵称_${Date.now()}`
    const testAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
    
    console.log('测试昵称:', testNickname)
    console.log('测试头像:', testAvatarUrl)
    
    // 5. 执行更新操作
    console.log('\n--- 5. 执行用户信息更新 ---')
    const updateData = {
      nickname: testNickname,
      avatar_url: testAvatarUrl,
      updated_at: new Date().toISOString()
    }
    
    console.log('更新数据:', updateData)
    
    const updateResult = await new Promise((resolve, reject) => {
      wx.request({
        url: queryUrl,
        method: 'PATCH',
        header: headers,
        data: updateData,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            reject(new Error(`更新失败: ${res.statusCode} - ${JSON.stringify(res.data)}`))
          }
        },
        fail: (err) => {
          reject(new Error(`网络错误: ${err.errMsg}`))
        }
      })
    })
    
    console.log('✅ 更新请求成功:', updateResult)
    
    // 6. 验证更新结果
    console.log('\n--- 6. 验证更新结果 ---')
    
    // 等待一下确保数据已更新
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const verifyResult = await new Promise((resolve, reject) => {
      wx.request({
        url: queryUrl,
        method: 'GET',
        header: headers,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            reject(new Error(`验证查询失败: ${res.statusCode} - ${JSON.stringify(res.data)}`))
          }
        },
        fail: (err) => {
          reject(new Error(`验证查询网络错误: ${err.errMsg}`))
        }
      })
    })
    
    if (!verifyResult || verifyResult.length === 0) {
      console.error('❌ 验证时未找到用户信息')
      return false
    }
    
    const updatedUser = verifyResult[0]
    console.log('✅ 验证查询成功:')
    console.log('更新后昵称:', updatedUser.nickname)
    console.log('更新后头像:', updatedUser.avatar_url)
    console.log('更新时间:', updatedUser.updated_at)
    
    // 7. 检查更新是否成功
    console.log('\n--- 7. 检查更新结果 ---')
    
    const nicknameMatch = updatedUser.nickname === testNickname
    const avatarMatch = updatedUser.avatar_url === testAvatarUrl
    
    if (nicknameMatch && avatarMatch) {
      console.log('✅ 测试通过！Supabase 用户信息更新成功')
      console.log('✅ 昵称已正确更新:', updatedUser.nickname)
      console.log('✅ 头像已正确更新:', updatedUser.avatar_url)
      
      // 8. 恢复原始数据（可选）
      console.log('\n--- 8. 恢复原始数据 ---')
      const restoreData = {
        nickname: userInfo.nickName,
        avatar_url: userInfo.avatarUrl,
        updated_at: new Date().toISOString()
      }
      
      await new Promise((resolve, reject) => {
        wx.request({
          url: queryUrl,
          method: 'PATCH',
          header: headers,
          data: restoreData,
          success: (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log('✅ 原始数据已恢复')
              resolve(res.data)
            } else {
              console.log('⚠️ 恢复原始数据失败，但测试已通过')
              resolve(res.data)
            }
          },
          fail: (err) => {
            console.log('⚠️ 恢复原始数据网络错误，但测试已通过')
            resolve()
          }
        })
      })
      
      return true
    } else {
      console.error('❌ 测试失败！')
      if (!nicknameMatch) {
        console.error('❌ 昵称未正确更新')
        console.error('期望:', testNickname)
        console.error('实际:', updatedUser.nickname)
      }
      if (!avatarMatch) {
        console.error('❌ 头像未正确更新')
        console.error('期望:', testAvatarUrl)
        console.error('实际:', updatedUser.avatar_url)
      }
      return false
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
    return false
  } finally {
    console.log('\n=== 测试完成 ===')
  }
}

// 简化版测试函数 - 只测试基本更新功能
const quickTest = async function() {
  console.log('=== 快速测试 Supabase 用户更新 ===')
  
  try {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      console.error('❌ 请先登录')
      return
    }
    
    const { supabase } = require('./utils/supabase.js')
    const testNickname = `快速测试_${Date.now()}`
    
    console.log('用户:', userInfo.nickName)
    console.log('测试昵称:', testNickname)
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.key}`,
      'apikey': supabase.key
    }
    
    if (userInfo.userId) {
      headers['x-user-id'] = userInfo.userId.toString()
    }
    
    const url = `${supabase.url}/rest/v1/users?id=eq.${userInfo.userId}`
    
    // 更新
    await new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'PATCH',
        header: headers,
        data: { nickname: testNickname },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ 更新成功')
            resolve()
          } else {
            console.error('❌ 更新失败:', res)
            reject()
          }
        },
        fail: reject
      })
    })
    
    // 验证
    const result = await new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'GET',
        header: headers,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data[0])
          } else {
            reject()
          }
        },
        fail: reject
      })
    })
    
    if (result.nickname === testNickname) {
      console.log('✅ 快速测试通过！')
    } else {
      console.error('❌ 快速测试失败')
    }
    
  } catch (error) {
    console.error('❌ 快速测试错误:', error)
  }
}

console.log('Supabase 用户更新测试脚本已加载')
console.log('运行 testSupabaseUserUpdate() 进行完整测试')
console.log('运行 quickTest() 进行快速测试')