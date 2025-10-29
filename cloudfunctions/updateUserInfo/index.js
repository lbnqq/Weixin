// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { nickName, avatarUrl } = event

  console.log('更新用户信息请求:', { nickName, avatarUrl })

  try {
    const userCollection = db.collection('users')

    // 构建更新数据
    const updateData = {}

    if (nickName !== undefined && nickName.trim() !== '') {
      updateData.nickName = nickName.trim()
    }

    if (avatarUrl !== undefined && avatarUrl.trim() !== '') {
      updateData.avatarUrl = avatarUrl.trim()
    }

    // 检查是否有数据需要更新
    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        message: '没有需要更新的数据'
      }
    }

    // 更新用户信息
    const updateResult = await userCollection.where({
      _openid: wxContext.OPENID
    }).update({
      data: updateData
    })

    if (updateResult.stats.updated > 0) {
      // 获取更新后的用户信息
      const updatedUser = await userCollection.where({
        _openid: wxContext.OPENID
      }).get()

      console.log('用户信息更新成功:', updatedUser.data[0])

      return {
        success: true,
        data: updatedUser.data[0],
        message: '更新成功'
      }
    } else {
      return {
        success: false,
        message: '用户不存在'
      }
    }

  } catch (error) {
    console.error('更新用户信息失败:', error)
    return {
      success: false,
      error: error.message,
      message: '更新失败'
    }
  }
}