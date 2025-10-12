// 测试Supabase数据存储功能
const { supabase } = require('./utils/supabase.js')
const config = require('./utils/config.js')

Page({
  data: {
    testResult: '',
    isLoading: false,
    testUserId: null
  },

  onLoad: function () {
    console.log('开始测试Supabase数据存储...')
    this.setData({ testResult: '准备测试数据存储功能...\n\n请点击下方按钮开始测试' })
  },

  // 测试创建用户
  testCreateUser: function () {
    this.setData({ isLoading: true, testResult: '正在创建测试用户...' })

    // 生成随机测试数据
    const testUser = {
      openid: 'test_openid_' + Date.now(),
      nickname: '测试用户_' + Math.floor(Math.random() * 1000),
      avatar_url: 'https://via.placeholder.com/100x100?text=Test',
      gender: Math.floor(Math.random() * 3), // 0:未知 1:男 2:女
      country: '中国',
      province: '北京',
      city: '北京',
      language: 'zh_CN'
    }

    console.log('创建测试用户:', testUser)

    // 插入用户数据
    supabase.insert('users', testUser)
      .then(res => {
        console.log('用户创建成功:', res)
        
        if (res && res.length > 0) {
          const userId = res[0].id
          this.setData({ 
            testUserId: userId,
            testResult: `✅ 用户创建成功！\n\n用户ID: ${userId}\n昵称: ${testUser.nickname}\nOpenID: ${testUser.openid}\n性别: ${testUser.gender === 1 ? '男' : testUser.gender === 2 ? '女' : '未知'}\n地区: ${testUser.country} ${testUser.province} ${testUser.city}\n\n现在可以测试查询和更新功能`,
            isLoading: false 
          })
        } else {
          throw new Error('创建用户成功但未返回用户ID')
        }
      })
      .catch(err => {
        console.error('创建用户失败:', err)
        this.setData({ 
          testResult: '❌ 创建用户失败: ' + err.message,
          isLoading: false 
        })
      })
  },

  // 测试查询用户
  testQueryUser: function () {
    if (!this.data.testUserId) {
      this.setData({ testResult: '❌ 请先创建测试用户' })
      return
    }

    this.setData({ isLoading: true, testResult: '正在查询用户信息...' })

    supabase.from('users')
      .select('*')
      .eq('id', this.data.testUserId)
      .limit(1)
      .execute()
      .then(res => {
        console.log('查询用户成功:', res)
        
        if (res && res.length > 0) {
          const user = res[0]
          this.setData({ 
            testResult: `✅ 查询用户成功！\n\n用户ID: ${user.id}\n昵称: ${user.nickname}\n头像: ${user.avatar_url}\n性别: ${user.gender === 1 ? '男' : user.gender === 2 ? '女' : '未知'}\n国家: ${user.country || '未设置'}\n省份: ${user.province || '未设置'}\n城市: ${user.city || '未设置'}\n语言: ${user.language || '未设置'}\n创建时间: ${user.created_at}\n最后登录: ${user.last_login_at || '首次登录'}`,
            isLoading: false 
          })
        } else {
          throw new Error('未找到用户信息')
        }
      })
      .catch(err => {
        console.error('查询用户失败:', err)
        this.setData({ 
          testResult: '❌ 查询用户失败: ' + err.message,
          isLoading: false 
        })
      })
  },

  // 测试更新用户
  testUpdateUser: function () {
    if (!this.data.testUserId) {
      this.setData({ testResult: '❌ 请先创建测试用户' })
      return
    }

    this.setData({ isLoading: true, testResult: '正在更新用户信息...' })

    const updateData = {
      nickname: '更新后的测试用户_' + Date.now(),
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('更新用户数据:', updateData)

    supabase.update('users', updateData, { id: this.data.testUserId })
      .then(res => {
        console.log('更新用户成功:', res)
        this.setData({ 
          testResult: `✅ 更新用户成功！\n\n新昵称: ${updateData.nickname}\n更新时间: ${new Date().toLocaleString()}\n\n可以再次查询用户信息确认更新结果`,
          isLoading: false 
        })
      })
      .catch(err => {
        console.error('更新用户失败:', err)
        this.setData({ 
          testResult: '❌ 更新用户失败: ' + err.message,
          isLoading: false 
        })
      })
  },

  // 测试删除用户
  testDeleteUser: function () {
    if (!this.data.testUserId) {
      this.setData({ testResult: '❌ 请先创建测试用户' })
      return
    }

    this.setData({ isLoading: true, testResult: '正在删除测试用户...' })

    supabase.delete('users', { id: this.data.testUserId })
      .then(res => {
        console.log('删除用户成功:', res)
        this.setData({ 
          testUserId: null,
          testResult: '✅ 删除测试用户成功！\n\n测试数据已清理完毕',
          isLoading: false 
        })
      })
      .catch(err => {
        console.error('删除用户失败:', err)
        this.setData({ 
          testResult: '❌ 删除用户失败: ' + err.message,
          isLoading: false 
        })
      })
  },

  // 查看所有用户
  testViewAllUsers: function () {
    this.setData({ isLoading: true, testResult: '正在查询所有用户...' })

    supabase.from('users')
      .select('id, nickname, avatar_url, gender, created_at')
      .order('created_at', false)
      .limit(10)
      .execute()
      .then(res => {
        console.log('查询所有用户成功:', res)
        
        let userList = '✅ 查询所有用户成功！\n\n'
        if (res && res.length > 0) {
          res.forEach((user, index) => {
            userList += `${index + 1}. ${user.nickname} (ID: ${user.id})\n   性别: ${user.gender === 1 ? '男' : user.gender === 2 ? '女' : '未知'}\n   创建时间: ${user.created_at}\n\n`
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
  },

  // 清理所有测试数据
  cleanTestData: function () {
    this.setData({ isLoading: true, testResult: '正在清理测试数据...' })

    // 删除所有以test_openid_开头的用户
    supabase.from('users')
      .select('id, openid')
      .like('openid', 'test_openid_%')
      .execute()
      .then(res => {
        console.log('找到测试用户:', res)
        
        if (res && res.length > 0) {
          // 逐个删除测试用户
          const deletePromises = res.map(user => 
            supabase.delete('users', { id: user.id })
          )
          
          return Promise.all(deletePromises)
        } else {
          return Promise.resolve([])
        }
      })
      .then(() => {
        this.setData({ 
          testUserId: null,
          testResult: '✅ 清理测试数据成功！\n\n所有测试用户已被删除',
          isLoading: false 
        })
      })
      .catch(err => {
        console.error('清理测试数据失败:', err)
        this.setData({ 
          testResult: '❌ 清理失败: ' + err.message,
          isLoading: false 
        })
      })
  }
})