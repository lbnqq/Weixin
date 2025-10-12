// 测试Supabase连接和用户信息保存功能

const app = getApp()
const supabaseModule = require('./utils/supabase.js')
const { wechatAuth } = require('./utils/wechat-auth.js')
const config = require('./utils/config.js')

console.log('test-supabase.js loaded, supabaseModule:', supabaseModule)
const { supabase } = supabaseModule
console.log('test-supabase.js loaded, supabase instance:', supabase)
console.log('test-supabase.js loaded, supabase.from type:', typeof supabase.from)

Page({
  data: {
    testResult: '',
    isLoading: false,
    userInfo: null,
    showUserInfoButton: false
  },

  onLoad: function () {
    console.log('开始测试Supabase连接...')
    this.testConnection()
  },

  // 测试Supabase连接
  testConnection: function () {
    this.setData({ isLoading: true, testResult: '正在测试连接...' })

    try {
      // 检查配置
      if (!config.config.supabaseUrl || !config.config.supabaseKey) {
        throw new Error('Supabase配置缺失')
      }

      console.log('Supabase配置:', {
        url: config.config.supabaseUrl,
        key: config.config.supabaseKey.substring(0, 10) + '...'
      })

      // 测试基本连接
      try {
        console.log('开始创建查询...')
        
        // 尝试直接创建SupabaseQuery实例
        const { SupabaseClient, SupabaseQuery } = supabaseModule
        console.log('SupabaseClient type:', typeof SupabaseClient)
        console.log('SupabaseQuery type:', typeof SupabaseQuery)
        
        const client = new SupabaseClient()
        console.log('客户端创建成功:', client)
        
        const query = new SupabaseQuery(client, 'users')
        console.log('查询对象创建成功:', query)
        console.log('查询对象类型:', typeof query)
        console.log('查询对象select方法类型:', typeof query.select)
        
        if (typeof query.select === 'function') {
          console.log('开始调用select方法...')
          const selectQuery = query.select('*')
          console.log('select方法调用成功:', selectQuery)
          console.log('selectQuery对象类型:', typeof selectQuery)
          console.log('selectQuery对象limit方法类型:', typeof selectQuery.limit)
          
          if (typeof selectQuery.limit === 'function') {
            console.log('开始调用limit方法...')
            const limitQuery = selectQuery.limit(1)
            console.log('limit方法调用成功:', limitQuery)
            
            if (typeof limitQuery.execute === 'function') {
              console.log('开始执行查询...')
              limitQuery.execute()
                .then(res => {
                  console.log('连接测试成功:', res)
                  this.setData({ 
                    testResult: '✅ Supabase连接成功！\n\n现在可以测试用户登录功能。',
                    isLoading: false 
                  })
                })
                .catch(err => {
                  console.error('连接测试失败:', err)
                  this.setData({ 
                    testResult: '❌ 连接失败: ' + err.message,
                    isLoading: false 
                  })
                })
            } else {
              throw new Error('limitQuery.execute不是函数')
            }
          } else {
            throw new Error('selectQuery.limit不是函数')
          }
        } else {
          throw new Error('query.select不是函数')
        }
      } catch (error) {
        console.error('创建查询时出错:', error)
        this.setData({ 
          testResult: '❌ 创建查询失败: ' + error.message,
          isLoading: false 
        })
      }
    } catch (error) {
      console.error('配置检查失败:', error)
      this.setData({ 
        testResult: '❌ 配置错误: ' + error.message,
        isLoading: false 
      })
    }
  },

  // 测试用户登录
  testUserLogin: function () {
    this.setData({ isLoading: true, testResult: '请点击下方按钮授权用户信息...' })
    
    // 注意：getUserProfile必须由用户直接点击触发，不能在代码中自动调用
    // 所以我们需要先显示一个按钮，让用户点击后再调用getUserProfile
    this.setData({ 
      testResult: '请点击"授权用户信息"按钮完成登录',
      showUserInfoButton: true,
      isLoading: false 
    })
  },

  // 用户点击授权按钮
  handleUserInfoAuth: function() {
    this.setData({ isLoading: true, testResult: '正在获取用户信息...' })

    // 直接调用getUserProfile
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('获取用户信息成功:', res.userInfo)
        
        // 使用获取到的用户信息进行登录
        this.processUserLogin(res.userInfo)
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err)
        this.setData({ 
          testResult: '❌ 获取用户信息失败: ' + err.errMsg,
          isLoading: false,
          showUserInfoButton: false
        })
      }
    })
  },

  // 处理用户登录流程
  processUserLogin: function(userInfo) {
    // 先获取微信登录凭证
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          console.log('获取登录凭证成功:', loginRes.code)
          
          // 构造用户信息对象
          const userInfoData = {
            openid: '', // 开发环境使用模拟值
            unionid: '',
            nickname: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.gender,
            country: userInfo.country,
            province: userInfo.province,
            city: userInfo.city,
            language: userInfo.language
          }
          
          // 处理用户认证
          this.handleUserAuth(loginRes.code, userInfoData)
        } else {
          throw new Error('获取登录凭证失败')
        }
      },
      fail: (err) => {
        console.error('wx.login失败:', err)
        this.setData({ 
          testResult: '❌ 登录失败: ' + err.errMsg,
          isLoading: false,
          showUserInfoButton: false
        })
      }
    })
  },

  // 处理用户认证
  handleUserAuth: function(code, userInfo) {
    // 开发环境模拟处理
    const mockOpenId = 'mock_openid_' + Date.now()
    userInfo.openid = mockOpenId
    
    // 检查用户是否已存在
    const { supabase } = require('./utils/supabase.js')
    
    supabase.from('users')
      .select('*')
      .eq('openid', mockOpenId)
      .limit(1)
      .execute()
      .then(res => {
        console.log('查询用户结果:', res)
        
        let userId
        let isNewUser = false
        
        if (res && res.length > 0) {
          // 用户已存在，更新信息
          userId = res[0].id
          return supabase.update('users', {
            nickname: userInfo.nickname,
            avatar_url: userInfo.avatarUrl,
            gender: userInfo.gender,
            country: userInfo.country,
            province: userInfo.province,
            city: userInfo.city,
            language: userInfo.language,
            last_login_at: new Date().toISOString()
          }, { id: userId })
        } else {
          // 新用户，创建记录
          return supabase.insert('users', {
            openid: userInfo.openid,
            nickname: userInfo.nickname,
            avatar_url: userInfo.avatarUrl,
            gender: userInfo.gender,
            country: userInfo.country,
            province: userInfo.province,
            city: userInfo.city,
            language: userInfo.language
          })
        }
      })
      .then(res => {
        console.log('用户操作结果:', res)
        
        // 确定用户ID和新用户状态
        let userId, isNewUser
        if (Array.isArray(res) && res.length > 0) {
          userId = res[0].id
          isNewUser = true
        } else if (res && res.id) {
          userId = res.id
          isNewUser = false
        } else {
          throw new Error('无法确定用户ID')
        }
        
        // 保存用户信息到本地存储
        const userInfoLocal = {
          openid: userInfo.openid,
          nickName: userInfo.nickname,
          avatarUrl: userInfo.avatarUrl,
          userId: userId
        }
        wx.setStorageSync('userInfo', userInfoLocal)
        
        // 更新全局状态
        app.globalData.userInfo = userInfoLocal
        app.globalData.isLoggedIn = true
        
        this.setData({ 
          userInfo: userInfoLocal,
          testResult: `✅ 用户登录成功！\n\n用户ID: ${userId}\n昵称: ${userInfo.nickname}\nOpenID: ${userInfo.openid}\n是否新用户: ${isNewUser ? '是' : '否'}`,
          isLoading: false,
          showUserInfoButton: false
        })
      })
      .catch(err => {
        console.error('用户认证失败:', err)
        this.setData({ 
          testResult: '❌ 用户认证失败: ' + err.message,
          isLoading: false,
          showUserInfoButton: false
        })
      })
  },

  // 测试查询用户信息
  testQueryUser: function () {
    if (!this.data.userInfo) {
      this.setData({ testResult: '❌ 请先登录用户' })
      return
    }

    this.setData({ isLoading: true, testResult: '正在查询用户信息...' })

    const openid = this.data.userInfo.openid
    
    supabase.from('users')
      .select('*')
      .eq('openid', openid)
      .single()
      .execute()
      .then(res => {
        console.log('查询用户信息成功:', res)
        this.setData({ 
          testResult: `✅ 查询用户信息成功！\n\n用户ID: ${res.id}\n昵称: ${res.nickname}\n头像: ${res.avatar_url}\n性别: ${res.gender}\n国家: ${res.country || '未设置'}\n省份: ${res.province || '未设置'}\n城市: ${res.city || '未设置'}\n创建时间: ${res.created_at}\n最后登录: ${res.last_login_at || '首次登录'}`,
          isLoading: false 
        })
      })
      .catch(err => {
        console.error('查询用户信息失败:', err)
        this.setData({ 
          testResult: '❌ 查询失败: ' + err.message,
          isLoading: false 
        })
      })
  },

  // 测试更新用户信息
  testUpdateUser: function () {
    if (!this.data.userInfo) {
      this.setData({ testResult: '❌ 请先登录用户' })
      return
    }

    this.setData({ isLoading: true, testResult: '正在更新用户信息...' })

    const openid = this.data.userInfo.openid
    const newNickname = this.data.userInfo.nickName + '_测试更新'
    
    supabase.update('users', { 
        nickname: newNickname,
        updated_at: new Date().toISOString()
      }, { openid: openid })
      .then(res => {
        console.log('更新用户信息成功:', res)
        
        // 更新本地存储
        this.data.userInfo.nickName = newNickname
        wx.setStorageSync('userInfo', this.data.userInfo)
        
        this.setData({ 
          userInfo: this.data.userInfo,
          testResult: `✅ 更新用户信息成功！\n\n新昵称: ${newNickname}\n更新时间: ${new Date().toLocaleString()}`,
          isLoading: false 
        })
      })
      .catch(err => {
        console.error('更新用户信息失败:', err)
        this.setData({ 
          testResult: '❌ 更新失败: ' + err.message,
          isLoading: false 
        })
      })
  },

  // 清除测试数据
  clearTestData: function () {
    this.setData({ isLoading: true, testResult: '正在清除测试数据...' })

    if (!this.data.userInfo) {
      this.setData({ 
        testResult: '✅ 没有用户数据需要清除',
        isLoading: false 
      })
      return
    }

    const openid = this.data.userInfo.openid
    
    supabase.delete('users', { openid: openid })
      .then(res => {
        console.log('清除测试数据成功:', res)
        
        // 清除本地存储
        wx.removeStorageSync('userInfo')
        app.globalData.userInfo = null
        app.globalData.isLoggedIn = false
        
        this.setData({ 
          userInfo: null,
          testResult: '✅ 清除测试数据成功！\n\n用户数据已从Supabase和本地存储中删除。',
          isLoading: false 
        })
      })
      .catch(err => {
        console.error('清除测试数据失败:', err)
        this.setData({ 
          testResult: '❌ 清除失败: ' + err.message,
          isLoading: false 
        })
      })
  },

  // 查看所有用户
  viewAllUsers: function () {
    this.setData({ isLoading: true, testResult: '正在查询所有用户...' })

    supabase.from('users')
      .select('id, nickname, avatar_url, created_at')
      .order('created_at', false)
      .limit(10)
      .execute()
      .then(res => {
        console.log('查询所有用户成功:', res)
        
        let userList = '✅ 查询所有用户成功！\n\n'
        if (res && res.length > 0) {
          res.forEach((user, index) => {
            userList += `${index + 1}. ${user.nickname} (ID: ${user.id})\n   创建时间: ${user.created_at}\n\n`
          })
        } else {
          userList += '暂无用户数据'
        }
        
        this.setData({ 
          testResult: userList,
          isLoading: false 
        })
      })
      .catch(err => {
        console.error('查询所有用户失败:', err)
        this.setData({ 
          testResult: '❌ 查询失败: ' + err.message,
          isLoading: false 
        })
      })
  }
})