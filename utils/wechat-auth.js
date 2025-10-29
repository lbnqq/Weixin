// utils/wechat-auth.js
// 微信小程序认证工具类

const app = getApp()
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

      // 3. 处理用户登录（本地保存）
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
   * @returns {Promise} 登录凭证
   */
  getWxLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            console.log('获取微信登录凭证成功')
            resolve(res)
          } else {
            console.error('获取微信登录凭证失败:', res.errMsg)
            reject(new Error(res.errMsg))
          }
        },
        fail: (err) => {
          console.error('wx.login 调用失败:', err)
          reject(err)
        }
      })
    })
  }

  /**
   * 获取用户信息
   * @returns {Promise} 用户信息
   */
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          console.log('获取用户信息成功')
          resolve(res.userInfo)
        },
        fail: (err) => {
          console.error('获取用户信息失败:', err)
          reject(err)
        }
      })
    })
  }

  /**
   * 处理用户认证（本地存储）
   * @param {string} loginCode 登录凭证
   * @param {object} userInfo 用户信息
   * @returns {Promise} 处理结果
   */
  async handleUserAuth(loginCode, userInfo) {
    try {
      // 生成模拟的OpenID
      const mockOpenId = 'mock_openid_' + this.hashCode(JSON.stringify(userInfo))

      // 准备用户数据
      const userData = {
        ...userInfo,
        openid: mockOpenId,
        loginTime: new Date().toISOString(),
        loginCode: loginCode
      }

      // 保存到本地存储
      wx.setStorageSync('userInfo', userData)
      wx.setStorageSync('loginCode', loginCode)

      // 更新全局状态
      app.globalData.userInfo = userData
      app.globalData.isLoggedIn = true

      console.log('用户认证成功，数据已保存到本地')

      return userData
    } catch (error) {
      console.error('处理用户认证失败:', error)
      throw error
    }
  }

  /**
   * 检查用户登录状态
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    const userInfo = wx.getStorageSync('userInfo')
    return !!(userInfo && userInfo.openid)
  }

  /**
   * 获取当前用户信息
   * @returns {object|null} 用户信息
   */
  getCurrentUser() {
    return wx.getStorageSync('userInfo') || null
  }

  /**
   * 用户登出
   */
  logout() {
    // 清除本地存储
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('loginCode')

    // 更新全局状态
    app.globalData.userInfo = null
    app.globalData.isLoggedIn = false

    console.log('用户已登出')
  }

  /**
   * 简单的字符串哈希函数
   * @param {string} str 字符串
   * @returns {number} 哈希值
   */
  hashCode(str) {
    let hash = 0
    if (str.length === 0) return hash
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash)
  }
}

module.exports = {
  WeChatAuth
}