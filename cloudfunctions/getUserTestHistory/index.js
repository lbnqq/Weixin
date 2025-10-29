// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { page = 1, pageSize = 10, testType } = event

  console.log('获取测试历史请求:', { page, pageSize, testType })

  try {
    const collection = db.collection('test_records')

    // 构建查询条件
    let query = collection.where({
      _openid: wxContext.OPENID
    })

    // 如果指定了测试类型，添加类型过滤
    if (testType) {
      query = query.where({
        testType: testType
      })
    }

    // 计算跳过的记录数
    const skip = (page - 1) * pageSize

    // 查询总数
    const countResult = await query.count()
    const total = countResult.total

    // 查询测试记录（按时间倒序）
    const recordsResult = await query
      .orderBy('testDate', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    const records = recordsResult.data

    // 格式化返回数据
    const result = {
      records: records,
      pagination: {
        page: page,
        pageSize: pageSize,
        total: total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1
      }
    }

    console.log('测试历史查询成功:', result)

    return {
      success: true,
      data: result,
      message: '查询成功'
    }

  } catch (error) {
    console.error('获取测试历史失败:', error)
    return {
      success: false,
      error: error.message,
      message: '查询失败'
    }
  }
}