// pages/edit-profile/edit-profile.js
Page({
  data: {
    userInfo: null,
    tempAvatarUrl: '',
    tempNickname: '',
    originalAvatarUrl: '',
    originalNickname: '',
    hasChanges: false,
    isSaving: false,
    showSaveSuccess: false,
    showCropper: false,
    cropImageUrl: ''
  },

  onLoad: function (options) {
    this.loadUserInfo()
  },

  onShow: function () {
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo: function () {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        tempAvatarUrl: '',
        tempNickname: userInfo.nickName || '',
        originalAvatarUrl: userInfo.avatarUrl || '',
        originalNickname: userInfo.nickName || '',
        hasChanges: false
      })
    } else {
      // 如果没有登录信息，返回个人中心
      wx.showModal({
        title: '提示',
        content: '请先登录后再编辑资料',
        showCancel: false,
        confirmText: '去登录',
        success: () => {
          wx.navigateBack()
        }
      })
    }
  },

  // 选择头像
  chooseAvatar: function () {
    const that = this
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 从相册选择
          that.chooseImageFromAlbum()
        } else if (res.tapIndex === 1) {
          // 拍照
          that.takePhoto()
        }
      }
    })
  },

  // 从相册选择图片
  chooseImageFromAlbum: function () {
    const that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        if (tempFilePaths.length > 0) {
          that.processImage(tempFilePaths[0])
        }
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        })
      }
    })
  },

  // 拍照
  takePhoto: function () {
    const that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        if (tempFilePaths.length > 0) {
          that.processImage(tempFilePaths[0])
        }
      },
      fail: (err) => {
        console.error('拍照失败:', err)
        wx.showToast({
          title: '拍照失败',
          icon: 'error'
        })
      }
    })
  },

  // 处理选中的图片
  processImage: function (imagePath) {
    const that = this

    // 检查文件大小（微信小程序限制2MB）
    wx.getFileInfo({
      filePath: imagePath,
      success: (res) => {
        const fileSize = res.size
        const maxSize = 2 * 1024 * 1024 // 2MB

        if (fileSize > maxSize) {
          wx.showModal({
            title: '图片过大',
            content: '请选择大小不超过2MB的图片',
            showCancel: false
          })
          return
        }

        // 检查图片格式
        const validFormats = ['jpg', 'jpeg', 'png']
        const fileExtension = imagePath.split('.').pop().toLowerCase()

        if (!validFormats.includes(fileExtension)) {
          wx.showModal({
            title: '格式不支持',
            content: '请选择JPG或PNG格式的图片',
            showCancel: false
          })
          return
        }

        // 显示裁剪弹窗（简化版，直接使用原图）
        that.setData({
          cropImageUrl: imagePath,
          showCropper: true
        })
      },
      fail: (err) => {
        console.error('获取文件信息失败:', err)
        wx.showToast({
          title: '图片处理失败',
          icon: 'error'
        })
      }
    })
  },

  // 关闭裁剪弹窗
  closeCropper: function () {
    this.setData({
      showCropper: false,
      cropImageUrl: ''
    })
  },

  // 确认裁剪（简化版，直接使用原图）
  confirmCrop: function () {
    this.setData({
      tempAvatarUrl: this.data.cropImageUrl,
      showCropper: false,
      cropImageUrl: '',
      hasChanges: true
    })
  },

  // 昵称输入
  onNicknameInput: function (e) {
    const value = e.detail.value.trim()
    this.setData({
      tempNickname: value,
      hasChanges: this.checkHasChanges(value, this.data.tempAvatarUrl)
    })
  },

  // 检查是否有变更
  checkHasChanges: function (nickname, avatarUrl) {
    const avatarChanged = avatarUrl && avatarUrl !== this.data.originalAvatarUrl
    const nicknameChanged = nickname !== this.data.originalNickname
    return avatarChanged || nicknameChanged
  },

  // 保存个人资料
  saveProfile: function () {
    if (!this.data.hasChanges || this.data.isSaving) {
      return
    }

    // 验证昵称
    const nickname = this.data.tempNickname.trim()
    if (nickname.length < 2 || nickname.length > 20) {
      wx.showToast({
        title: '昵称长度应为2-20个字符',
        icon: 'error',
        duration: 2000
      })
      return
    }

    // 验证昵称内容
    const nicknameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/
    if (!nicknameRegex.test(nickname)) {
      wx.showToast({
        title: '昵称包含不支持的字-符',
        icon: 'error',
        duration: 2000
      })
      return
    }

    this.setData({
      isSaving: true
    })

    // 模拟保存过程
    setTimeout(() => {
      try {
        // 更新用户信息
        const updatedUserInfo = {
          ...this.data.userInfo,
          nickName: nickname,
          avatarUrl: this.data.tempAvatarUrl || this.data.userInfo.avatarUrl
        }

        // 保存到本地存储
        wx.setStorageSync('userInfo', updatedUserInfo)

        // 更新全局数据
        const app = getApp()
        app.globalData.userInfo = updatedUserInfo

        // 更新页面数据
        this.setData({
          userInfo: updatedUserInfo,
          originalAvatarUrl: updatedUserInfo.avatarUrl,
          originalNickname: updatedUserInfo.nickName,
          isSaving: false,
          hasChanges: false,
          showSaveSuccess: true
        })

        // 显示成功提示
        setTimeout(() => {
          this.setData({
            showSaveSuccess: false
          })
        }, 2000)

        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1500
        })

        // 通知其他页面更新
        this.notifyProfileUpdate()

      } catch (error) {
        console.error('保存失败:', error)
        this.setData({
          isSaving: false
        })
        wx.showToast({
          title: '保存失败',
          icon: 'error',
          duration: 2000
        })
      }
    }, 1000) // 模拟网络延迟
  },

  // 重置变更
  resetChanges: function () {
    wx.showModal({
      title: '重置修改',
      content: '确定要重置所有修改吗？',
      confirmText: '重置',
      confirmColor: '#E34D59',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            tempAvatarUrl: '',
            tempNickname: this.data.originalNickname,
            hasChanges: false
          })
        }
      }
    })
  },

  // 返回上一页
  goBack: function () {
    if (this.data.hasChanges) {
      wx.showModal({
        title: '未保存的修改',
        content: '您有未保存的修改，确定要离开吗？',
        confirmText: '离开',
        confirmColor: '#E34D59',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
    } else {
      wx.navigateBack()
    }
  },

  // 通知其他页面用户信息已更新
  notifyProfileUpdate: function () {
    // 发送事件通知其他页面
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const prevPage = pages[pages.length - 2]

    // 如果上一页是个人中心页面，刷新用户信息
    if (prevPage && prevPage.route === 'pages/profile/profile') {
      prevPage.checkLoginStatus && prevPage.checkLoginStatus()
    }

    // 如果上一页是结果页面，刷新用户信息
    if (prevPage && prevPage.route === 'pages/result/result') {
      prevPage.loadUserInfo && prevPage.loadUserInfo()
    }
  },

  // 页面卸载时的处理
  onUnload: function () {
    // 清理临时文件
    if (this.data.tempAvatarUrl && this.data.tempAvatarUrl.startsWith('http://tmp/')) {
      wx.removeSavedFile({
        filePath: this.data.tempAvatarUrl,
        success: () => {
          console.log('清理临时文件成功')
        },
        fail: (err) => {
          console.log('清理临时文件失败:', err)
        }
      })
    }
  },

  // 防止页面被下拉刷新
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  }
})