// pages/test/test.js
Page({
  data: {
    currentQuestion: 1,
    totalQuestions: 50,
    answers: {},
    question: null,
    selectedAnswer: null,
    isLoading: false,
    debugInfo: ''
  },

  onLoad: function (options) {
    console.log('测试页面加载，参数:', options)

    // 初始化调试信息
    this.setData({
      debugInfo: '页面开始加载...'
    })

    // 获取传入的题目参数
    if (options.currentQuestion) {
      const questionId = parseInt(options.currentQuestion)
      console.log('设置当前题目ID:', questionId)
      this.setData({
        currentQuestion: questionId,
        debugInfo: `设置题目ID为: ${questionId}`
      })
    }

    console.log('初始数据状态:', {
      currentQuestion: this.data.currentQuestion,
      totalQuestions: this.data.totalQuestions
    })

    this.setData({
      debugInfo: `准备加载题目 ${this.data.currentQuestion}/${this.data.totalQuestions}`
    })

    // 加载进度
    this.loadProgress()

    // 加载当前题目
    this.loadCurrentQuestion()
  },

  // 加载测试进度
  loadProgress: function () {
    try {
      const progress = wx.getStorageSync('testProgress')
      if (progress && progress.answers) {
        this.setData({
          answers: progress.answers
        })
      }
    } catch (error) {
      console.error('加载进度失败:', error)
    }
  },

  // 加载当前题目
  loadCurrentQuestion: function () {
    try {
      console.log('开始加载题目...')

      // 检查数据文件是否存在
      const testData = require('../../utils/test-data')
      console.log('测试数据:', testData)

      const { questions } = testData
      console.log('题目数组:', questions)
      console.log('当前题目ID:', this.data.currentQuestion)

      if (!questions || !Array.isArray(questions)) {
        console.error('题目数据不是数组:', questions)
        this.setData({
          debugInfo: '题目数据格式错误'
        })
        return
      }

      console.log('总题目数:', questions.length)

      const currentQuestion = questions.find(q => q.id === this.data.currentQuestion)
      console.log('找到的题目:', currentQuestion)

      console.log('加载题目:', {
        currentQuestionId: this.data.currentQuestion,
        foundQuestion: currentQuestion,
        totalQuestions: questions.length
      })

      if (currentQuestion) {
        const existingAnswer = this.data.answers[this.data.currentQuestion]
        console.log('已存在的答案:', existingAnswer)

        this.setData({
          question: currentQuestion,
          selectedAnswer: existingAnswer || null,
          debugInfo: `成功加载题目 ${currentQuestion.id}: ${currentQuestion.text.substring(0, 20)}...`
        })
      } else {
        console.error('题目不存在:', this.data.currentQuestion)
        this.setData({
          debugInfo: `题目ID ${this.data.currentQuestion} 不存在`
        })
        // 题目不存在，跳转到结果页面
        wx.redirectTo({
          url: '/pages/result/result'
        })
      }
    } catch (error) {
      console.error('加载题目失败:', error)
      this.setData({
        debugInfo: `加载失败: ${error.message}`
      })
      wx.showToast({
        title: '加载题目失败',
        icon: 'error'
      })
    }
  },

  // 选择答案
  selectAnswer: function (e) {
    const value = parseInt(e.currentTarget.dataset.value)
    this.setData({
      selectedAnswer: value
    })
  },

  // 下一题
  nextQuestion: function () {
    if (this.data.selectedAnswer === null) {
      wx.showToast({
        title: '请选择一个答案',
        icon: 'none'
      })
      return
    }

    // 保存答案
    const answers = { ...this.data.answers }
    answers[this.data.currentQuestion] = this.data.selectedAnswer

    // 保存进度
    this.saveProgress(answers)

    // 更新状态
    this.setData({
      answers: answers,
      selectedAnswer: null
    })

    // 进入下一题
    if (this.data.currentQuestion < this.data.totalQuestions) {
      this.setData({
        currentQuestion: this.data.currentQuestion + 1
      })
      this.loadCurrentQuestion()
    } else {
      // 测试完成，跳转到结果页面
      wx.redirectTo({
        url: '/pages/result/result'
      })
    }
  },

  // 上一题
  prevQuestion: function () {
    if (this.data.currentQuestion > 1) {
      this.setData({
        currentQuestion: this.data.currentQuestion - 1,
        selectedAnswer: null
      })
      this.loadCurrentQuestion()
    }
  },

  // 保存进度
  saveProgress: function (answers) {
    try {
      const progressData = {
        answers: answers,
        currentQuestion: this.data.currentQuestion + (this.data.selectedAnswer !== null ? 1 : this.data.currentQuestion),
        timestamp: Date.now(),
        savedAt: new Date().toISOString()
      }

      wx.setStorageSync('testProgress', progressData)
    } catch (error) {
      console.error('保存进度失败:', error)
    }
  },

  // 提交测试
  submitTest: function () {
    if (this.data.selectedAnswer === null || this.data.selectedAnswer === undefined) {
      wx.showToast({
        title: '请选择一个答案',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '提交中...',
      mask: true
    })

    try {
      // 保存最后一题答案
      const answers = { ...this.data.answers }
      answers[this.data.currentQuestion] = this.data.selectedAnswer

      // 清除进度数据
      wx.removeStorageSync('testProgress')

      // 保存完整答案到临时存储
      wx.setStorageSync('currentTestAnswers', answers)

      wx.hideLoading()

      // 跳转到结果页面
      wx.redirectTo({
        url: '/pages/result/result'
      })
    } catch (error) {
      console.error('提交测试失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'error'
      })
    }
  },

  // 测试数据加载函数
  testDataLoading: function () {
    console.log('=== 手动测试数据加载 ===')

    try {
      this.setData({
        debugInfo: '开始测试数据加载...'
      })

      // 测试1: 检查require函数
      console.log('测试1: 检查require函数')
      const testData = require('../../utils/test-data')
      console.log('require结果:', testData)

      // 测试2: 检查questions数组
      console.log('测试2: 检查questions数组')
      const { questions } = testData
      console.log('questions:', questions)
      console.log('questions类型:', typeof questions)
      console.log('是否为数组:', Array.isArray(questions))
      console.log('数组长度:', questions ? questions.length : 'undefined')

      // 测试3: 检查第一个题目
      console.log('测试3: 检查第一个题目')
      if (questions && questions.length > 0) {
        console.log('第一个题目:', questions[0])
        console.log('第一个题目ID:', questions[0].id)
      }

      // 测试4: 查找当前题目
      console.log('测试4: 查找当前题目')
      const currentQuestionId = this.data.currentQuestion
      console.log('当前题目ID:', currentQuestionId)

      const currentQuestion = questions.find(q => q.id === currentQuestionId)
      console.log('查找结果:', currentQuestion)

      if (currentQuestion) {
        this.setData({
          question: currentQuestion,
          debugInfo: `测试成功！找到题目 ${currentQuestion.id}: ${currentQuestion.text.substring(0, 20)}...`
        })
        console.log('设置题目成功')
      } else {
        this.setData({
          debugInfo: `测试失败！未找到题目ID ${currentQuestionId}`
        })
        console.log('设置题目失败')
      }

    } catch (error) {
      console.error('测试数据加载失败:', error)
      this.setData({
        debugInfo: `测试失败: ${error.message}`
      })
    }
  }
})