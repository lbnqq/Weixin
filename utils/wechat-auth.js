// utils/wechat-auth.js
// 微信小程序认证工具类

const app = getApp()
const { supabase } = require('./supabase.js')
const config = require('./config.js')

class WeChatAuth {
  constructor() {
    this.config = config.config
  }

  /**
   * 微信登录
   * @returns {Promise} 登录结果
   */
  async login() {
    try {
      console.log('开始微信登录流程...')
      
      // 1. 获取微信登录凭证
      const loginResult = await this.getWxLoginCode()
      if (!loginResult.code) {
        throw new Error('获取微信登录凭证失败')
      }

      // 2. 获取用户信息
      const userInfo = await this.getUserProfile()
      if (!userInfo) {
        throw new Error('获取用户信息失败')
      }

      // 3. 处理用户登录（保存到Supabase）
      const authResult = await this.handleUserAuth(loginResult.code, userInfo)
      
      console.log('微信登录成功:', authResult)
      
      return {
        success: true,
        data: authResult
      }
    } catch (error) {
      console.error('微信登录失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 获取微信登录凭证
   * @returns {Promise} 包含code的对象
   */
  getWxLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res)
          } else {
            reject(new Error('获取登录凭证失败: ' + res.errMsg))
          }
        },
        fail: (err) => {
          reject(new Error('wx.login调用失败: ' + err.errMsg))
        }
      })
    })
  }

  /**
   * 获取用户信息
   * @returns {Promise} 用户信息对象
   */
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          const userInfo = res.userInfo
          resolve({
            openid: '', // 需要通过后端API获取
            unionid: '',
            nickname: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.gender,
            country: userInfo.country,
            province: userInfo.province,
            city: userInfo.city,
            language: userInfo.language
          })
        },
        fail: (err) => {
          reject(new Error('获取用户信息失败: ' + err.errMsg))
        }
      })
    })
  }

  /**
   * 处理用户认证（模拟后端处理）
   * @param {string} code 微信登录凭证
   * @param {object} userInfo 用户信息
   * @returns {Promise} 认证结果
   */
  async handleUserAuth(code, userInfo) {
    // 开发环境模拟处理
    if (config.isDevelopment) {
      // 模拟OpenID
      const mockOpenId = 'mock_openid_' + Date.now()
      userInfo.openid = mockOpenId
      
      // 检查用户是否已存在
      const { data: existingUsers, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('openid', mockOpenId)
        .limit(1)

      if (queryError) {
        throw new Error('查询用户失败: ' + queryError.message)
      }

      let userId
      let isNewUser = false

      if (existingUsers && existingUsers.length > 0) {
        // 用户已存在，更新信息
        userId = existingUsers[0].id
        const { error: updateError } = await supabase
          .from('users')
          .update({
            nickname: userInfo.nickname,
            avatar_url: userInfo.avatarUrl,
            gender: userInfo.gender,
            country: userInfo.country,
            province: userInfo.province,
            city: userInfo.city,
            language: userInfo.language,
            last_login_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (updateError) {
          throw new Error('更新用户信息失败: ' + updateError.message)
        }
      } else {
        // 新用户，创建记录
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            openid: userInfo.openid,
            nickname: userInfo.nickname,
            avatar_url: userInfo.avatarUrl,
            gender: userInfo.gender,
            country: userInfo.country,
            province: userInfo.province,
            city: userInfo.city,
            language: userInfo.language
          }])
          .select()

        if (insertError) {
          throw new Error('创建用户失败: ' + insertError.message)
        }

        userId = newUser[0].id
        isNewUser = true
      }

      return {
        userId: userId,
        openid: userInfo.openid,
        nickname: userInfo.nickname,
        avatarUrl: userInfo.avatarUrl,
        isNewUser: isNewUser
      }
    }

    // 生产环境需要通过后端API处理
    throw new Error('生产环境需要配置后端API处理微信登录')
  }

  /**
   * 获取设备信息
   * @returns {object} 设备信息对象
   */
  getDeviceInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync()
      return {
        model: systemInfo.model,
        platform: systemInfo.platform,
        system: systemInfo.system,
        version: systemInfo.version,
        SDKVersion: systemInfo.SDKVersion,
        screenWidth: systemInfo.screenWidth,
        screenHeight: systemInfo.screenHeight,
        pixelRatio: systemInfo.pixelRatio,
        language: systemInfo.language,
        fontSizeSetting: systemInfo.fontSizeSetting,
        theme: systemInfo.theme
      }
    } catch (error) {
      console.error('获取设备信息失败:', error)
      return {}
    }
  }

  /**
   * 退出登录
   * @param {string} openid 用户OpenID
   * @returns {Promise} 退出结果
   */
  async logout(openid) {
    try {
      // 清除本地存储
      wx.removeStorageSync('userInfo')
      wx.removeStorageSync('authToken')
      
      // 更新全局状态
      app.globalData.userInfo = null
      app.globalData.isLoggedIn = false
      
      console.log('用户退出登录成功')
      return { success: true }
    } catch (error) {
      console.error('退出登录失败:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 检查登录状态
   * @returns {Promise} 登录状态
   */
  async checkLoginStatus() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo) {
        return { success: false, isLoggedIn: false }
      }

      // 验证用户是否在数据库中存在
      const { data: users, error } = await supabase
        .from('users')
        .select('id, nickname, avatar_url')
        .eq('openid', userInfo.openid)
        .limit(1)

      if (error || !users || users.length === 0) {
        // 用户不存在，清除本地数据
        wx.removeStorageSync('userInfo')
        wx.removeStorageSync('authToken')
        app.globalData.userInfo = null
        app.globalData.isLoggedIn = false
        return { success: false, isLoggedIn: false }
      }

      // 更新全局状态
      app.globalData.userInfo = userInfo
      app.globalData.isLoggedIn = true

      return { 
        success: true, 
        isLoggedIn: true, 
        userInfo: {
          id: users[0].id,
          nickname: users[0].nickname,
          avatarUrl: users[0].avatar_url
        }
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      return { success: false, isLoggedIn: false }
    }
  }

  
}

// 创建全局实例
const wechatAuth = new WeChatAuth()

module.exports = {
  wechatAuth,
  WeChatAuth
}