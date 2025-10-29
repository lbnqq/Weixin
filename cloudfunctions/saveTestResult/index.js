// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { testType, scores, duration } = event

  console.log('保存测试结果请求:', { testType, scores, duration })

  try {
    // 验证必要参数
    if (!testType || !scores || !duration) {
      return {
        success: false,
        message: '缺少必要参数'
      }
    }

    // 验证分数格式
    const requiredDimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
    for (const dimension of requiredDimensions) {
      if (typeof scores[dimension] !== 'number' || scores[dimension] < 0 || scores[dimension] > 100) {
        return {
          success: false,
          message: `${dimension} 分数必须是 0-100 之间的数字`
        }
      }
    }

    // 生成测试ID
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const testId = `test_${dateStr}_${Date.now().toString().slice(-6)}`

    // 构建测试记录
    const testRecord = {
      _openid: wxContext.OPENID,
      testId: testId,
      testType: testType,
      testDate: now.toISOString(),
      scores: scores,
      duration: parseInt(duration),
      createTime: now.toISOString()
    }

    // 保存到数据库
    const addResult = await db.collection('test_records').add({
      data: testRecord
    })

    const result = {
      _id: addResult._id,
      ...testRecord
    }

    console.log('测试结果保存成功:', result)

    return {
      success: true,
      data: result,
      message: '测试结果保存成功'
    }

  } catch (error) {
    console.error('保存测试结果失败:', error)
    return {
      success: false,
      error: error.message,
      message: '保存失败'
    }
  }
}