// pages/test-supabase/test-supabase.js
Page({
  data: {
    userInfo: null,
    originalUserInfo: null,
    testNickname: '',
    testAvatarUrl: '',
    logs: [],
    logScrollTop: 9999,
    testingConnection: false,
    testingQuery: false,
    testingUpdate: false,
    testingVerify: false,
    restoring: false,
    runningFullTest: false
  },

  onLoad: function (options) {
    this.loadUserInfo()
    this.addLog('页面加载完成', 'info')
  },

  // 加载用户信息
  loadUserInfo: function () {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        originalUserInfo: JSON.parse(JSON.stringify(userInfo)) // 深拷贝
      })
      this.addLog(`用户信息加载成功: ${userInfo.nickName}`, 'success')
    } else {
      this.addLog('用户未登录，请先登录', 'error')
    }
  },

  // 添加日志
  addLog: function (message, type = 'info') {
    const logs = this.data.logs
    logs.push({
      time: new Date().toLocaleTimeString(),
      message: message,
      type: type
    })
    
    this.setData({
      logs: logs,
      logScrollTop: 9999
    })
  },

  // 清空日志
  clearLogs: function () {
    this.setData({
      logs: [],
      logScrollTop: 0
    })
  },

  // 输入测试昵称
  onTestNicknameInput: function (e) {
    this.setData({
      testNickname: e.detail.value
    })
  },

  // 输入测试头像URL
  onTestAvatarUrlInput: function (e) {
    this.setData({
      testAvatarUrl: e.detail.value
    })
  },

  // 生成随机测试数据
  generateTestData: function () {
    const timestamp = Date.now()
    const randomNickname = `测试昵称_${timestamp}`
    const randomAvatar = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
    
    this.setData({
      testNickname: randomNickname,
      testAvatarUrl: randomAvatar
    })
    
    this.addLog('已生成随机测试数据', 'info')
  },

  // 测试连接
  testConnection: function () {
    this.setData({ testingConnection: true })
    this.addLog('开始测试 Supabase 连接...', 'info')
    
    try {
      const { supabase } = require('../../utils/supabase.js')
      this.addLog('Supabase 配置加载成功', 'success')
      this.addLog(`URL: ${supabase.url}`, 'info')
      this.addLog('连接测试完成', 'success')
    } catch (error) {
      this.addLog(`连接测试失败: ${error.message}`, 'error')
    } finally {
      this.setData({ testingConnection: false })
    }
  },

  // 测试查询
  testQuery: function () {
    if (!this.data.userInfo) {
      this.addLog('用户未登录，无法查询', 'error')
      return
    }

    this.setData({ testingQuery: true })
    this.addLog('开始查询用户信息...', 'info')

    const { supabase } = require('../../utils/supabase.js')
    const userInfo = this.data.userInfo
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.key}`,
      'apikey': supabase.key
    }

    if (userInfo.userId) {
      headers['x-user-id'] = userInfo.userId.toString()
    }

    const queryUrl = userInfo.userId 
      ? `${supabase.url}/rest/v1/users?id=eq.${userInfo.userId}`
      : `${supabase.url}/rest/v1/users?openid=eq.${userInfo.openid}`

    wx.request({
      url: queryUrl,
      method: 'GET',
      header: headers,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data && res.data.length > 0) {
            const user = res.data[0]
            this.addLog('查询成功', 'success')
            this.addLog(`数据库昵称: ${user.nickname}`, 'info')
            this.addLog(`数据库头像: ${user.avatar_url}`, 'info')
          } else {
            this.addLog('查询成功，但未找到用户数据', 'warning')
          }
        } else {
          this.addLog(`查询失败: ${res.statusCode}`, 'error')
        }
      },
      fail: (err) => {
        this.addLog(`查询网络错误: ${err.errMsg}`, 'error')
      },
      complete: () => {
        this.setData({ testingQuery: false })
      }
    })
  },

  // 测试更新
  testUpdate: function () {
    if (!this.data.userInfo) {
      this.addLog('用户未登录，无法更新', 'error')
      return
    }

    if (!this.data.testNickname || !this.data.testAvatarUrl) {
      this.addLog('请先输入测试数据', 'warning')
      return
    }

    this.setData({ testingUpdate: true })
    this.addLog('开始更新用户信息...', 'info')

    const { supabase } = require('../../utils/supabase.js')
    const userInfo = this.data.userInfo
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.key}`,
      'apikey': supabase.key
    }

    if (userInfo.userId) {
      headers['x-user-id'] = userInfo.userId.toString()
    }

    const updateUrl = userInfo.userId 
      ? `${supabase.url}/rest/v1/users?id=eq.${userInfo.userId}`
      : `${supabase.url}/rest/v1/users?openid=eq.${userInfo.openid}`

    const updateData = {
      nickname: this.data.testNickname,
      avatar_url: this.data.testAvatarUrl,
      updated_at: new Date().toISOString()
    }

    wx.request({
      url: updateUrl,
      method: 'PATCH',
      header: headers,
      data: updateData,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.addLog('更新成功', 'success')
          this.addLog(`更新昵称: ${this.data.testNickname}`, 'info')
          this.addLog(`更新头像: ${this.data.testAvatarUrl}`, 'info')
        } else {
          this.addLog(`更新失败: ${res.statusCode}`, 'error')
          this.addLog(`错误信息: ${JSON.stringify(res.data)}`, 'error')
        }
      },
      fail: (err) => {
        this.addLog(`更新网络错误: ${err.errMsg}`, 'error')
      },
      complete: () => {
        this.setData({ testingUpdate: false })
      }
    })
  },

  // 测试验证
  testVerify: function () {
    if (!this.data.userInfo) {
      this.addLog('用户未登录，无法验证', 'error')
      return
    }

    this.setData({ testingVerify: true })
    this.addLog('开始验证更新结果...', 'info')

    const { supabase } = require('../../utils/supabase.js')
    const userInfo = this.data.userInfo
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.key}`,
      'apikey': supabase.key
    }

    if (userInfo.userId) {
      headers['x-user-id'] = userInfo.userId.toString()
    }

    const queryUrl = userInfo.userId 
      ? `${supabase.url}/rest/v1/users?id=eq.${userInfo.userId}`
      : `${supabase.url}/rest/v1/users?openid=eq.${userInfo.openid}`

    wx.request({
      url: queryUrl,
      method: 'GET',
      header: headers,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data && res.data.length > 0) {
            const user = res.data[0]
            this.addLog('验证查询成功', 'success')
            this.addLog(`当前昵称: ${user.nickname}`, 'info')
            this.addLog(`当前头像: ${user.avatar_url}`, 'info')
            
            // 检查是否匹配测试数据
            const nicknameMatch = user.nickname === this.data.testNickname
            const avatarMatch = user.avatar_url === this.data.testAvatarUrl
            
            if (nicknameMatch && avatarMatch) {
              this.addLog('✅ 验证通过！数据已正确更新', 'success')
            } else {
              this.addLog('❌ 验证失败！数据未正确更新', 'error')
              if (!nicknameMatch) {
                this.addLog(`昵称不匹配: 期望=${this.data.testNickname}, 实际=${user.nickname}`, 'error')
              }
              if (!avatarMatch) {
                this.addLog(`头像不匹配: 期望=${this.data.testAvatarUrl}, 实际=${user.avatar_url}`, 'error')
              }
            }
          } else {
            this.addLog('验证失败：未找到用户数据', 'error')
          }
        } else {
          this.addLog(`验证查询失败: ${res.statusCode}`, 'error')
        }
      },
      fail: (err) => {
        this.addLog(`验证查询网络错误: ${err.errMsg}`, 'error')
      },
      complete: () => {
        this.setData({ testingVerify: false })
      }
    })
  },

  // 恢复原始数据
  restoreOriginal: function () {
    if (!this.data.originalUserInfo) {
      this.addLog('没有原始数据可恢复', 'warning')
      return
    }

    this.setData({ restoring: true })
    this.addLog('开始恢复原始数据...', 'info')

    const { supabase } = require('../../utils/supabase.js')
    const userInfo = this.data.userInfo
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.key}`,
      'apikey': supabase.key
    }

    if (userInfo.userId) {
      headers['x-user-id'] = userInfo.userId.toString()
    }

    const updateUrl = userInfo.userId 
      ? `${supabase.url}/rest/v1/users?id=eq.${userInfo.userId}`
      : `${supabase.url}/rest/v1/users?openid=eq.${userInfo.openid}`

    const restoreData = {
      nickname: this.data.originalUserInfo.nickName,
      avatar_url: this.data.originalUserInfo.avatarUrl,
      updated_at: new Date().toISOString()
    }

    wx.request({
      url: updateUrl,
      method: 'PATCH',
      header: headers,
      data: restoreData,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.addLog('原始数据恢复成功', 'success')
          this.addLog(`恢复昵称: ${this.data.originalUserInfo.nickName}`, 'info')
          this.addLog(`恢复头像: ${this.data.originalUserInfo.avatarUrl}`, 'info')
        } else {
          this.addLog(`恢复失败: ${res.statusCode}`, 'error')
        }
      },
      fail: (err) => {
        this.addLog(`恢复网络错误: ${err.errMsg}`, 'error')
      },
      complete: () => {
        this.setData({ restoring: false })
      }
    })
  },

  // 运行完整测试
  runFullTest: async function () {
    if (this.data.runningFullTest) return
    
    this.setData({ runningFullTest: true })
    this.addLog('=== 开始完整测试流程 ===', 'info')
    
    try {
      // 1. 生成测试数据
      this.addLog('步骤1: 生成测试数据', 'info')
      this.generateTestData()
      await this.sleep(500)
      
      // 2. 测试连接
      this.addLog('步骤2: 测试连接', 'info')
      await this.testConnection()
      await this.sleep(1000)
      
      // 3. 查询当前数据
      this.addLog('步骤3: 查询当前数据', 'info')
      await this.testQuery()
      await this.sleep(1000)
      
      // 4. 更新数据
      this.addLog('步骤4: 更新数据', 'info')
      await this.testUpdate()
      await this.sleep(1000)
      
      // 5. 验证更新
      this.addLog('步骤5: 验证更新', 'info')
      await this.testVerify()
      await this.sleep(1000)
      
      // 6. 恢复数据
      this.addLog('步骤6: 恢复原始数据', 'info')
      await this.restoreOriginal()
      
      this.addLog('=== 完整测试流程完成 ===', 'success')
      
    } catch (error) {
      this.addLog(`测试流程出错: ${error.message}`, 'error')
    } finally {
      this.setData({ runningFullTest: false })
    }
  },

  // 延时函数
  sleep: function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
})