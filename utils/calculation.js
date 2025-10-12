// utils/calculation.js
// 大五人格测试评分计算工具

const { questions } = require('./test-data')

/**
 * 计算五维度得分
 * @param {Object} answers - 用户答案对象 {questionId: score}
 * @returns {Object} 五维度得分结果
 */
function calculateScores(answers) {
  // 初始化维度数组
  const dimensions = {
    openness: [],
    conscientiousness: [],
    extraversion: [],
    agreeableness: [],
    neuroticism: []
  }

  // 将答案按维度分组
  questions.forEach(question => {
    const answer = answers[question.id]
    if (answer !== undefined && answer !== null) {
      dimensions[question.dimension].push(parseInt(answer))
    }
  })

  // 计算每个维度的统计数据
  const results = {}
  Object.keys(dimensions).forEach(dimension => {
    const scores = dimensions[dimension]
    const total = scores.reduce((sum, score) => sum + score, 0)
    const count = scores.length
    const average = count > 0 ? (total / count).toFixed(2) : 0

    results[dimension] = {
      scores: scores,           // 原始得分数组
      total: total,             // 总分
      average: parseFloat(average), // 平均分
      count: count,             // 已答题数
      maxPossible: 10,          // 该维度最大可能得分
      percentage: (average / 5 * 100).toFixed(1) // 百分比
    }
  })

  return results
}

/**
 * 验证答案完整性
 * @param {Object} answers - 用户答案对象
 * @returns {Object} 验证结果
 */
function validateAnswers(answers) {
  const answeredQuestions = Object.keys(answers).length
  const totalQuestions = questions.length
  const isComplete = answeredQuestions === totalQuestions

  // 检查未回答的题目
  const unansweredQuestions = []
  questions.forEach(question => {
    if (answers[question.id] === undefined || answers[question.id] === null) {
      unansweredQuestions.push(question.id)
    }
  })

  return {
    isComplete,
    answeredCount: answeredQuestions,
    totalCount: totalQuestions,
    completionRate: Math.round((answeredQuestions / totalQuestions) * 100),
    unansweredQuestions
  }
}

/**
 * 获取测试进度信息
 * @param {Object} answers - 用户答案对象
 * @param {Number} currentQuestion - 当前题目ID
 * @returns {Object} 进度信息
 */
function getProgressInfo(answers, currentQuestion = 1) {
  const answeredQuestions = Object.keys(answers).length
  const totalQuestions = questions.length
  const progress = Math.round((answeredQuestions / totalQuestions) * 100)

  return {
    current: currentQuestion,
    total: totalQuestions,
    answered: answeredQuestions,
    remaining: totalQuestions - answeredQuestions,
    progress: progress,
    progressText: `${answeredQuestions}/${totalQuestions} (${progress}%)`
  }
}

/**
 * 生成测试结果摘要
 * @param {Object} scores - 五维度得分
 * @returns {Object} 结果摘要
 */
function generateResultSummary(scores) {
  // 找出得分最高和最低的维度
  const dimensionScores = Object.keys(scores).map(dimension => ({
    dimension,
    average: scores[dimension].average,
    name: getDimensionName(dimension)
  }))

  dimensionScores.sort((a, b) => b.average - a.average)

  const highest = dimensionScores[0]
  const lowest = dimensionScores[dimensionScores.length - 1]

  // 计算整体得分
  const totalAverage = Object.values(scores)
    .reduce((sum, score) => sum + score.average, 0) / Object.keys(scores).length

  return {
    totalAverage: totalAverage.toFixed(2),
    highest: {
      dimension: highest.dimension,
      name: highest.name,
      score: highest.average
    },
    lowest: {
      dimension: lowest.dimension,
      name: lowest.name,
      score: lowest.average
    },
    dimensions: dimensionScores,
    personalityType: getPersonalityType(scores)
  }
}

/**
 * 获取维度名称
 * @param {String} dimension - 维度标识
 * @returns {String} 维度中文名称
 */
function getDimensionName(dimension) {
  const names = {
    openness: '开放性',
    conscientiousness: '尽责性',
    extraversion: '外向性',
    agreeableness: '宜人性',
    neuroticism: '神经质'
  }
  return names[dimension] || dimension
}

/**
 * 根据得分判断性格类型（简化版）
 * @param {Object} scores - 五维度得分
 * @returns {String} 性格类型描述
 */
function getPersonalityType(scores) {
  const traits = []

  if (scores.openness.average >= 4) traits.push('富有创造力')
  if (scores.conscientiousness.average >= 4) traits.push('认真负责')
  if (scores.extraversion.average >= 4) traits.push('外向活跃')
  if (scores.agreeableness.average >= 4) traits.push('友善合作')
  if (scores.neuroticism.average <= 2) traits.push('情绪稳定')

  if (traits.length === 0) {
    return '平衡型'
  } else if (traits.length >= 3) {
    return '多面发展型'
  } else {
    return traits.join('、')
  }
}

/**
 * 计算两个测试结果的对比
 * @param {Object} scores1 - 第一次测试得分
 * @param {Object} scores2 - 第二次测试得分
 * @returns {Object} 对比结果
 */
function compareResults(scores1, scores2) {
  const comparison = {}

  Object.keys(scores1).forEach(dimension => {
    const oldScore = scores1[dimension].average
    const newScore = scores2[dimension].average
    const change = (newScore - oldScore).toFixed(2)
    const changePercent = ((change / oldScore) * 100).toFixed(1)

    comparison[dimension] = {
      old: oldScore,
      new: newScore,
      change: parseFloat(change),
      changePercent: parseFloat(changePercent),
      trend: change > 0 ? '上升' : change < 0 ? '下降' : '稳定'
    }
  })

  return comparison
}

/**
 * 保存测试答案到本地存储
 * @param {Object} answers - 用户答案
 * @param {Number} currentQuestion - 当前题目ID
 */
function saveProgress(answers, currentQuestion) {
  const progressData = {
    answers,
    currentQuestion,
    timestamp: Date.now(),
    savedAt: new Date().toISOString()
  }

  try {
    wx.setStorageSync('testProgress', progressData)
    return true
  } catch (error) {
    console.error('保存进度失败:', error)
    return false
  }
}

/**
 * 从本地存储加载测试进度
 * @returns {Object|null} 进度数据
 */
function loadProgress() {
  try {
    const progress = wx.getStorageSync('testProgress')
    if (progress) {
      // 检查进度是否过期（7天）
      const savedTime = new Date(progress.savedAt).getTime()
      const currentTime = Date.now()
      const daysDiff = (currentTime - savedTime) / (1000 * 60 * 60 * 24)

      if (daysDiff > 7) {
        // 进度过期，清除数据
        wx.removeStorageSync('testProgress')
        return null
      }

      return progress
    }
    return null
  } catch (error) {
    console.error('加载进度失败:', error)
    return null
  }
}

/**
 * 清除测试进度
 */
function clearProgress() {
  try {
    wx.removeStorageSync('testProgress')
    return true
  } catch (error) {
    console.error('清除进度失败:', error)
    return false
  }
}

/**
 * 保存测试结果到本地存储
 * @param {Object} result - 测试结果
 */
function saveTestResult(result) {
  try {
    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      console.log('用户未登录，无法保存测试结果')
      return false
    }

    // 生成用户特定的存储key
    const userHistoryKey = `testResults_${userInfo.userId || userInfo.openid || 'anonymous'}`

    // 获取当前用户的现有测试结果
    const existingResults = wx.getStorageSync(userHistoryKey) || []

    // 添加用户信息到结果中
    const resultWithUserInfo = {
      ...result,
      userInfo: {
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      },
      userId: userInfo.userId || userInfo.openid || 'anonymous',
      savedAt: new Date().toISOString(),
      timestamp: Date.now()
    }

    // 添加新结果到开头
    existingResults.unshift(resultWithUserInfo)

    // 最多保存10条本地记录
    const limitedResults = existingResults.slice(0, 10)

    wx.setStorageSync(userHistoryKey, limitedResults)
    console.log(`已保存用户 ${userInfo.nickName} 的测试结果，总计 ${limitedResults.length} 条记录`)

    return true
  } catch (error) {
    console.error('保存测试结果失败:', error)
    return false
  }
}

module.exports = {
  calculateScores,
  validateAnswers,
  getProgressInfo,
  generateResultSummary,
  getPersonalityType,
  compareResults,
  saveProgress,
  loadProgress,
  clearProgress,
  saveTestResult
}