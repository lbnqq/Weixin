// utils/test-service.js
// 测试相关服务工具类

class TestService {
  /**
   * 保存测试结果
   * @param {object} testResult 测试结果
   * @returns {Promise} 保存结果
   */
  async saveTestResult(testResult) {
    try {
      const { testType, scores, duration } = testResult

      // 验证参数
      if (!testType || !scores || !duration) {
        throw new Error('缺少必要参数')
      }

      // 验证分数格式
      const requiredDimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
      console.log('验证分数数据:', scores) // 添加调试日志

      for (const dimension of requiredDimensions) {
        const score = scores[dimension]
        console.log(`验证 ${dimension}:`, typeof score, score) // 添加调试日志

        if (typeof score !== 'number' || score < 0 || score > 100) {
          throw new Error(`${dimension} 分数必须是 0-100 之间的数字，当前值: ${score} (类型: ${typeof score})`)
        }
      }

      const result = await this.callSaveTestFunction(testResult)

      // 同时保存到本地存储
      this.saveTestResultToLocal(result.data)

      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      console.error('保存测试结果失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 获取用户测试历史
   * @param {object} options 查询选项
   * @returns {Promise} 测试历史
   */
  async getTestHistory(options = {}) {
    try {
      const { page = 1, pageSize = 10, testType } = options

      const result = await this.callGetHistoryFunction({ page, pageSize, testType })

      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      console.error('获取测试历史失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 调用保存测试结果云函数
   * @param {object} testData 测试数据
   * @returns {Promise} 保存结果
   */
  callSaveTestFunction(testData) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'saveTestResult',
        data: testData,
        success: (res) => {
          if (res.result && res.result.success) {
            resolve(res.result)
          } else {
            reject(new Error(res.result ? res.result.message : '保存失败'))
          }
        },
        fail: (err) => {
          console.error('调用保存测试结果云函数失败:', err)
          reject(err)
        }
      })
    })
  }

  /**
   * 调用获取测试历史云函数
   * @param {object} queryParams 查询参数
   * @returns {Promise} 查询结果
   */
  callGetHistoryFunction(queryParams) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'getUserTestHistory',
        data: queryParams,
        success: (res) => {
          if (res.result && res.result.success) {
            resolve(res.result)
          } else {
            reject(new Error(res.result ? res.result.message : '查询失败'))
          }
        },
        fail: (err) => {
          console.error('调用获取测试历史云函数失败:', err)
          reject(err)
        }
      })
    })
  }

  /**
   * 保存测试结果到本地存储
   * @param {object} testResult 测试结果
   */
  saveTestResultToLocal(testResult) {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo) {
        console.warn('用户未登录，无法保存到本地')
        return
      }

      const userHistoryKey = `testHistory_${userInfo._openid || 'anonymous'}`
      let history = wx.getStorageSync(userHistoryKey) || []

      // 添加新记录到开头
      history.unshift(testResult)

      // 限制历史记录数量（最多保存100条）
      if (history.length > 100) {
        history = history.slice(0, 100)
      }

      wx.setStorageSync(userHistoryKey, history)
      console.log('测试结果已保存到本地存储')
    } catch (error) {
      console.error('保存测试结果到本地失败:', error)
    }
  }

  /**
   * 从本地存储获取测试历史
   * @returns {Array} 测试历史记录
   */
  getLocalTestHistory() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo) {
        return []
      }

      const userHistoryKey = `testHistory_${userInfo._openid || 'anonymous'}`
      return wx.getStorageSync(userHistoryKey) || []
    } catch (error) {
      console.error('从本地获取测试历史失败:', error)
      return []
    }
  }

  /**
   * 生成测试ID
   * @returns {string} 测试ID
   */
  generateTestId() {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randomStr = Math.random().toString(36).substr(2, 6)
    return `test_${dateStr}_${randomStr}`
  }
}

module.exports = {
  TestService
}