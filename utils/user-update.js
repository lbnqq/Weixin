// utils/user-update.js
// 用户信息更新工具类

class UserUpdate {
  /**
   * 更新用户昵称
   * @param {string} nickName 新昵称
   * @returns {Promise} 更新结果
   */
  async updateNickName(nickName) {
    try {
      const result = await this.callUpdateFunction({ nickName })

      // 更新本地存储
      const userInfo = wx.getStorageSync('userInfo')
      userInfo.nickName = nickName
      wx.setStorageSync('userInfo', userInfo)

      // 更新全局状态
      const app = getApp()
      app.globalData.userInfo = userInfo

      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      console.error('更新昵称失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 上传头像到云存储
   * @param {string} filePath 本地文件路径
   * @returns {Promise} 上传结果
   */
  async uploadAvatar(filePath) {
    return new Promise((resolve, reject) => {
      const cloudPath = `avatars/${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`

      wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: filePath,
        success: (res) => {
          console.log('头像上传成功:', res.fileID)
          resolve({
            success: true,
            fileID: res.fileID
          })
        },
        fail: (err) => {
          console.error('头像上传失败:', err)
          reject(err)
        }
      })
    })
  }

  /**
   * 获取云存储文件URL
   * @param {string} fileID 文件ID
   * @returns {Promise} 文件URL
   */
  getFileUrl(fileID) {
    return new Promise((resolve, reject) => {
      wx.cloud.getTempFileURL({
        fileList: [fileID],
        success: (res) => {
          if (res.fileList && res.fileList.length > 0) {
            resolve(res.fileList[0].tempFileURL)
          } else {
            reject(new Error('获取文件URL失败'))
          }
        },
        fail: (err) => {
          console.error('获取文件URL失败:', err)
          reject(err)
        }
      })
    })
  }

  /**
   * 更新用户头像
   * @param {string} filePath 本地头像文件路径
   * @returns {Promise} 更新结果
   */
  async updateAvatar(filePath) {
    try {
      // 1. 上传头像到云存储
      const uploadResult = await this.uploadAvatar(filePath)

      // 2. 获取云存储文件的下载链接
      const fileUrl = await this.getFileUrl(uploadResult.fileID)

      // 3. 调用云函数更新用户信息
      const updateResult = await this.callUpdateFunction({ avatarUrl: fileUrl })

      // 4. 更新本地存储
      const userInfo = wx.getStorageSync('userInfo')
      userInfo.avatarUrl = fileUrl
      wx.setStorageSync('userInfo', userInfo)

      // 5. 更新全局状态
      const app = getApp()
      app.globalData.userInfo = userInfo

      return {
        success: true,
        data: updateResult.data,
        fileID: uploadResult.fileID
      }
    } catch (error) {
      console.error('更新头像失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 调用更新用户信息云函数
   * @param {object} updateData 更新数据
   * @returns {Promise} 更新结果
   */
  callUpdateFunction(updateData) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'updateUserInfo',
        data: updateData,
        success: (res) => {
          if (res.result && res.result.success) {
            resolve(res.result)
          } else {
            reject(new Error(res.result ? res.result.message : '更新失败'))
          }
        },
        fail: (err) => {
          console.error('调用更新用户信息云函数失败:', err)
          reject(err)
        }
      })
    })
  }
}

module.exports = {
  UserUpdate
}