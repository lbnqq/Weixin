// pages/test/test.js
Page({
  data: {
    currentQuestion: 1,
    totalQuestions: 50,
    answers: {},
    question: null,
    selectedAnswer: null,
    isLoading: false
  },

  onLoad: function (options) {
    // 获取传入的题目参数
    if (options.currentQuestion) {
      this.setData({
        currentQuestion: parseInt(options.currentQuestion)
      })
    }

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
    const { questions } = require('../../utils/test-data')
    const currentQuestion = questions.find(q => q.id === this.data.currentQuestion)

    if (currentQuestion) {
      const existingAnswer = this.data.answers[this.data.currentQuestion]
      this.setData({
        question: currentQuestion,
        selectedAnswer: existingAnswer || null
      })
    } else {
      // 题目不存在，跳转到结果页面
      wx.redirectTo({
        url: '/pages/result/result'
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
  }
})