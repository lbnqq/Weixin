// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userInfo } = event

  console.log('用户登录请求:', userInfo)

  try {
    const userCollection = db.collection('users')

    // 查询用户是否已存在
    const existUser = await userCollection.where({
      _openid: wxContext.OPENID
    }).get()

    let result
    if (existUser.data.length > 0) {
      // 用户已存在，更新登录次数和用户信息
      const updateData = {
        loginCount: db.command.inc(1), // 登录次数+1
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      }

      await userCollection.doc(existUser.data[0]._id).update({
        data: updateData
      })

      result = {
        ...existUser.data[0],
        ...updateData,
        loginCount: existUser.data[0].loginCount + 1,
        isNewUser: false
      }

      console.log('老用户登录成功:', result)
    } else {
      // 新用户，创建记录
      const newUser = {
        _openid: wxContext.OPENID,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        loginCount: 1
      }

      const addResult = await userCollection.add({
        data: newUser
      })

      result = {
        _id: addResult._id,
        ...newUser,
        isNewUser: true
      }

      console.log('新用户注册成功:', result)
    }

    return {
      success: true,
      data: result,
      message: result.isNewUser ? '注册成功' : '登录成功'
    }

  } catch (error) {
    console.error('登录失败:', error)
    return {
      success: false,
      error: error.message,
      message: '登录失败'
    }
  }
}