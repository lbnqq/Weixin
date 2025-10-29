// utils/cloud-auth.js
// 微信小程序云开发认证工具类

const app = getApp()

class CloudAuth {
  constructor() {
    this.envId = 'cloud1-7g80w0g6e3f866b7' // 云环境ID
  }

  /**
   * 微信登录
   * @returns {Promise} 登录结果
   */
  async login() {
    try {
      console.log('开始微信登录流程...')

      // 1. 获取用户信息
      const userInfo = await this.getUserProfile()
      if (!userInfo) {
        throw new Error('获取用户信息失败')
      }

      // 2. 调用云函数登录
      const loginResult = await this.callLoginFunction(userInfo)

      console.log('微信登录成功:', loginResult)

      // 3. 保存用户信息到本地
      wx.setStorageSync('userInfo', loginResult.data)
      app.globalData.userInfo = loginResult.data
      app.globalData.isLoggedIn = true

      return {
        success: true,
        data: loginResult.data,
        isNewUser: loginResult.data.isNewUser
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
   * 调用登录云函数
   * @param {object} userInfo 用户信息
   * @returns {Promise} 登录结果
   */
  callLoginFunction(userInfo) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'userLogin',
        data: {
          userInfo: userInfo
        },
        success: (res) => {
          if (res.result && res.result.success) {
            resolve(res.result)
          } else {
            reject(new Error(res.result ? res.result.message : '登录失败'))
          }
        },
        fail: (err) => {
          console.error('调用登录云函数失败:', err)
          reject(err)
        }
      })
    })
  }

  /**
   * 检查登录状态
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    return !!(wx.getStorageSync('userInfo') && app.globalData.isLoggedIn)
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
    wx.removeStorageSync('userInfo')
    app.globalData.userInfo = null
    app.globalData.isLoggedIn = false
    console.log('用户已登出')
  }
}

module.exports = {
  CloudAuth
}