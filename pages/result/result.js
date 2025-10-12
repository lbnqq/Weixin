// pages/result/result.js
Page({
  data: {
    userInfo: null,
    scores: null,
    aiSummary: null,
    mbtiResult: null,
    belbinResult: null,
    isLoading: true,
    error: null,
    // UI状态
    activeTab: 'personality', // personality, mbti, belbin, career
    showAdvancedAnalysis: false
  },

  onLoad: function (options) {
    // 检查是否从历史记录进入
    const fromHistory = options.fromHistory === 'true'

    if (fromHistory) {
      // 从历史记录加载结果
      this.loadHistoryResult()
    } else {
      // 计算新的测试结果
      this.calculateResult()
    }

    // 加载用户信息
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo: function () {
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo
    })
  },

  // 从历史记录加载结果
  loadHistoryResult: function () {
    try {
      const result = wx.getStorageSync('tempResult')
      if (result) {
        console.log('从历史记录加载的结果:', result)

        // 如果历史记录中没有MBTI和贝尔宾结果，重新计算
        let mbtiResult = result.mbtiResult
        let belbinResult = result.belbinResult

        if (!mbtiResult) {
          const { calculateMBTI } = require('../../utils/mbti-calculator')
          mbtiResult = calculateMBTI(result.scores)
        }

        if (!belbinResult) {
          const { calculateBelbinRoles } = require('../../utils/belbin-calculator')
          belbinResult = calculateBelbinRoles(result.scores)
        }

        // 检查AI分析结果是否完整，如果不完整则生成完整的默认分析
        const aiSummary = result.aiSummary || {}
        const enhancedSummary = {
          success: aiSummary.success || false,
          // 基础分析
          career: aiSummary.career || this.getDefaultCareerAnalysis(result.scores),
          personality: aiSummary.personality || this.getDefaultPersonalityAnalysis(result.scores),
          relationship: aiSummary.relationship || this.getDefaultRelationshipAnalysis(result.scores),
          // MBTI和贝尔宾分析 - 如果没有则生成基于计算结果的默认分析
          mbtiAnalysis: aiSummary.mbtiAnalysis || this.generateMBTIAnalysis(mbtiResult),
          belbinAnalysis: aiSummary.belbinAnalysis || this.generateBelbinAnalysis(belbinResult),
          careerDevelopment: aiSummary.careerDevelopment || this.generateCareerDevelopment(result.scores, mbtiResult, belbinResult),
          personalGrowth: aiSummary.personalGrowth || this.generatePersonalGrowth(result.scores, mbtiResult, belbinResult)
        }

        console.log('增强后的AI总结:', enhancedSummary)

        // 格式化内容
        const formattedData = {
          formattedPersonality: this.formatContentText(enhancedSummary.personality),
          formattedCareer: this.formatContentText(enhancedSummary.career),
          formattedRelationship: this.formatContentText(enhancedSummary.relationship),
          formattedMBTIAnalysis: this.formatContentText(enhancedSummary.mbtiAnalysis),
          formattedBelbinAnalysis: this.formatContentText(enhancedSummary.belbinAnalysis),
          formattedCareerDevelopment: this.formatContentText(enhancedSummary.careerDevelopment),
          formattedPersonalGrowth: this.formatContentText(enhancedSummary.personalGrowth)
        }

        console.log('格式化后的内容:', formattedData)

        this.setData({
          scores: result.scores,
          aiSummary: enhancedSummary,
          mbtiResult: mbtiResult,
          belbinResult: belbinResult,
          ...formattedData,
          showAdvancedAnalysis: true,
          isLoading: false
        })
      } else {
        this.setData({
          error: '历史记录数据丢失',
          isLoading: false
        })
      }
    } catch (error) {
      console.error('加载历史结果失败:', error)
      this.setData({
        error: '加载历史记录失败',
        isLoading: false
      })
    }
  },

  // 计算测试结果
  calculateResult: async function () {
    try {
      // 获取测试答案
      const answers = wx.getStorageSync('currentTestAnswers')
      if (!answers) {
        this.setData({
          error: '未找到测试答案',
          isLoading: false
        })
        return
      }

      // 计算得分
      const { calculateScores, saveTestResult } = require('../../utils/calculation')
      const scores = calculateScores(answers)

      // 设置得分
      this.setData({
        scores: scores
      })

      // 生成AI总结
      await this.generateAISummary(scores, answers)

      // 保存测试结果
      this.saveTestResult(scores, answers, this.data.aiSummary)

      // 清除临时数据
      wx.removeStorageSync('currentTestAnswers')

    } catch (error) {
      console.error('计算测试结果失败:', error)
      this.setData({
        error: '计算测试结果失败: ' + error.message,
        isLoading: false
      })
    }
  },

  // 生成AI总结
  generateAISummary: async function (scores, answers) {
    try {
      const { aiAPI } = require('../../utils/ai-api')
      const summary = await aiAPI.getPersonalitySummary(scores, answers)

      // 确保所有部分都有内容
      const enhancedSummary = {
        ...summary,
        // 基础分析
        career: summary.career || this.getDefaultCareerAnalysis(scores),
        personality: summary.personality || this.getDefaultPersonalityAnalysis(scores),
        relationship: summary.relationship || this.getDefaultRelationshipAnalysis(scores),
        // MBTI和贝尔宾分析
        mbtiAnalysis: summary.mbtiAnalysis || '暂无MBTI分析',
        belbinAnalysis: summary.belbinAnalysis || '暂无贝尔宾分析',
        careerDevelopment: summary.careerDevelopment || '暂无职业发展建议',
        personalGrowth: summary.personalGrowth || '暂无个人成长建议'
      }

      // 调试信息
      console.log('AI总结数据:', enhancedSummary)

      // 格式化内容
      const formattedData = {
        formattedPersonality: this.formatContentText(enhancedSummary.personality),
        formattedCareer: this.formatContentText(enhancedSummary.career),
        formattedRelationship: this.formatContentText(enhancedSummary.relationship),
        formattedMBTIAnalysis: this.formatContentText(enhancedSummary.mbtiAnalysis),
        formattedBelbinAnalysis: this.formatContentText(enhancedSummary.belbinAnalysis),
        formattedCareerDevelopment: this.formatContentText(enhancedSummary.careerDevelopment),
        formattedPersonalGrowth: this.formatContentText(enhancedSummary.personalGrowth)
      }

      console.log('格式化后的分析内容:', formattedData)

      this.setData({
        aiSummary: enhancedSummary,
        mbtiResult: summary.mbtiResult,
        belbinResult: summary.belbinResult,
        ...formattedData,
        showAdvancedAnalysis: true,
        isLoading: false
      })

    } catch (error) {
      console.error('生成AI总结失败:', error)

      // 即使AI分析失败，也要计算MBTI和贝尔宾
      const { calculateMBTI } = require('../../utils/mbti-calculator')
      const { calculateBelbinRoles } = require('../../utils/belbin-calculator')

      const mbtiResult = calculateMBTI(scores)
      const belbinResult = calculateBelbinRoles(scores)

      // 使用默认分析
      const defaultSummary = {
        success: false,
        career: this.getDefaultCareerAnalysis(scores),
        personality: this.getDefaultPersonalityAnalysis(scores),
        relationship: this.getDefaultRelationshipAnalysis(scores),
        mbtiAnalysis: `基于你的MBTI类型${mbtiResult.type}，你具有独特的性格特质组合。`,
        belbinAnalysis: `作为${belbinResult.primaryRole.name || '团队成员'}，你在团队中扮演着重要的角色。`,
        careerDevelopment: '结合你的性格特点，建议寻找能够发挥你优势的工作环境。',
        personalGrowth: '通过了解自己的性格特质，你可以有针对性地制定个人成长计划。'
      }

      // 格式化默认内容
      const formattedData = {
        formattedPersonality: this.formatContentText(defaultSummary.personality),
        formattedCareer: this.formatContentText(defaultSummary.career),
        formattedRelationship: this.formatContentText(defaultSummary.relationship),
        formattedMBTIAnalysis: this.formatContentText(defaultSummary.mbtiAnalysis),
        formattedBelbinAnalysis: this.formatContentText(defaultSummary.belbinAnalysis),
        formattedCareerDevelopment: this.formatContentText(defaultSummary.careerDevelopment),
        formattedPersonalGrowth: this.formatContentText(defaultSummary.personalGrowth)
      }

      this.setData({
        aiSummary: defaultSummary,
        mbtiResult: mbtiResult,
        belbinResult: belbinResult,
        ...formattedData,
        showAdvancedAnalysis: true,
        isLoading: false
      })
    }
  },

  // 默认性格分析
  getDefaultPersonalityAnalysis: function(scores) {
    const highestTrait = this.getHighestTrait(scores)
    const lowestTrait = this.getLowestTrait(scores)

    const analyses = {
      openness: "具有开放思维和丰富想象力，对新事物充满好奇心，乐于接受新观念。",
      conscientiousness: "认真负责、有条理，注重细节，做事有计划，能够坚持完成目标。",
      extraversion: "性格外向，善于与人交流，享受团队合作，能够调动他人积极性。",
      agreeableness: "友善合作，在意他人感受，善于倾听，乐于助人，在人际关系中受欢迎。",
      neuroticism: "情绪相对稳定，能够很好应对压力和挑战，内心平和，面对困难能保持冷静。"
    }

    return `你最突出的性格特质是<text class="content-emphasis">${highestTrait.name}</text>（得分${highestTrait.score}分）。

${analyses[highestTrait.dimension]}

在<text class="content-emphasis">${lowestTrait.name}</text>方面还有发展空间，建议主动接触相关活动来提升这一能力。

总体来说，你拥有平衡而丰富的性格特质，这为人生发展提供了坚实基础。`
  },

  // 默认职业建议
  getDefaultCareerAnalysis: function(scores) {
    const highestTrait = this.getHighestTrait(scores)

    const careers = {
      openness: "设计师、艺术家、作家、市场营销、广告策划",
      conscientiousness: "会计师、项目管理、质量控制、教师、医生",
      extraversion: "销售、公关、人力资源、培训师、活动策划",
      agreeableness: "心理咨询师、社工、教师、护士、客户服务",
      neuroticism: "研究、技术工作、写作、分析、咨询"
    }

    return `基于你的<text class="content-emphasis">${highestTrait.name}</text>特质，推荐职业：

<text class="content-emphasis">${careers[highestTrait.dimension]}</text>

这些工作能充分发挥你的性格优势，让职业生涯更有成就感。

建议选择与你的价值观相符的环境，保持学习热情，在发挥优势的同时也要关注其他能力的培养。`
  },

  // 默认人际关系建议
  getDefaultRelationshipAnalysis: function(scores) {
    const highestTrait = this.getHighestTrait(scores)

    const relationships = {
      openness: "能够接受不同观点，在多元化社交环境中表现出色，对新朋友持开放态度。",
      conscientiousness: "在人际关系中很可靠，信守承诺，成为朋友们可以依靠的对象。",
      extraversion: "天生善于社交，很容易与陌生人建立联系，热情和活力能够感染他人。",
      agreeableness: "是很好的倾听者，优先考虑他人感受，善良和同理心建立深厚信任。",
      neuroticism: "情绪稳定，面对冲突能保持冷静，理性解决人际问题，成为他人支柱。"
    }

    return `你的<text class="content-emphasis">${highestTrait.name}</text>特质在人际关系中具有优势：

${relationships[highestTrait.dimension]}

建议继续保持真诚和善良，有意识地提升交往技巧，用心经营每一段关系。你的性格为建立良好人际关系提供了很好的基础。`
  },

  // 获取得分最高的特质
  getHighestTrait: function(scores) {
    let highest = null
    let highestScore = 0

    Object.keys(scores).forEach(dimension => {
      if (scores[dimension].average > highestScore) {
        highestScore = scores[dimension].average
        highest = {
          dimension: dimension,
          name: this.getTraitName(dimension),
          score: highestScore
        }
      }
    })

    return highest
  },

  // 获取得分最低的特质
  getLowestTrait: function(scores) {
    let lowest = null
    let lowestScore = 5

    Object.keys(scores).forEach(dimension => {
      if (scores[dimension].average < lowestScore) {
        lowestScore = scores[dimension].average
        lowest = {
          dimension: dimension,
          name: this.getTraitName(dimension),
          score: lowestScore
        }
      }
    })

    return lowest
  },

  // 获取特质名称
  getTraitName: function(dimension) {
    const names = {
      openness: '开放性',
      conscientiousness: '尽责性',
      extraversion: '外向性',
      agreeableness: '宜人性',
      neuroticism: '情绪稳定性'
    }
    return names[dimension] || dimension
  },

  // 获取友谊关系风格
  getFriendshipStyle: function(dimension) {
    const styles = {
      openness: '能够与不同背景的朋友建立联系，朋友圈多样化且充满创意',
      conscientiousness: '是朋友们可以依靠的对象，总是能够给予实际的帮助和支持',
      extraversion: '善于组织聚会和活动，是朋友圈中的活跃分子和连接者',
      agreeableness: '是很好的倾听者和支持者，朋友们都喜欢向你倾诉心事',
      neuroticism: '在朋友们遇到困难时能够提供稳定的支持，是可靠的伙伴'
    }
    return styles[dimension] || '建立真诚而持久的友谊'
  },

  // 获取家庭关系风格
  getFamilyStyle: function(dimension) {
    const styles = {
      openness: '为家庭带来新的想法和体验，促进家庭成员的成长和开放交流',
      conscientiousness: '承担起家庭中的责任，是家庭运转的重要支柱',
      extraversion: '活跃家庭氛围，组织家庭活动，增进家庭成员间的感情',
      agreeableness: '是家庭关系的调解者，关心每个家庭成员的感受',
      neuroticism: '在家庭冲突中保持冷静，为家庭提供稳定的情绪支持'
    }
    return styles[dimension] || '营造和谐温暖的家庭氛围'
  },

  // 获取职场关系风格
  getWorkStyle: function(dimension) {
    const styles = {
      openness: '带来创新思维和新想法，促进团队的创造力和发展',
      conscientiousness: '确保项目按时高质量完成，是团队中可靠的一员',
      extraversion: '促进团队沟通和协作，提升团队士气和工作效率',
      agreeableness: '善于协调不同意见，营造和谐的工作环境',
      neuroticism: '在压力下保持冷静，为团队提供稳定的支持'
    }
    return styles[dimension] || '建立积极有效的职场关系'
  },

  // 格式化文本内容 - 简化版本
  formatContentText: function(content) {
    if (!content) return []

    console.log('格式化内容:', content.substring(0, 100) + '...')

    // 先尝试最简单的格式化
    return [{
      name: 'text',
      attrs: {
        style: 'font-size: 28rpx; line-height: 1.8; color: #374151; display: block; text-align: justify; margin: 12rpx 0;'
      },
      children: [content]
    }]
  },

  // 保存测试结果
  saveTestResult: function (scores, aiSummary) {
    try {
      const { saveTestResult, generateResultSummary } = require('../../utils/calculation')

      const result = {
        scores: scores,
        aiSummary: aiSummary,
        mbtiResult: this.data.mbtiResult,
        belbinResult: this.data.belbinResult,
        testDate: new Date().toLocaleDateString(),
        timestamp: Date.now(),
        ...generateResultSummary(scores)
      }

      // 保存到本地存储
      saveTestResult(result)

      // 这里可以添加保存到Supabase的逻辑
      this.saveToSupabase(result)

    } catch (error) {
      console.error('保存测试结果失败:', error)
    }
  },

  // 切换分析标签页
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
  },

  // 展开/收起高级分析
  toggleAdvancedAnalysis: function() {
    this.setData({
      showAdvancedAnalysis: !this.data.showAdvancedAnalysis
    })
  },

  // 复制MBTI类型
  copyMBTIType: function() {
    if (this.data.mbtiResult) {
      const text = `我的MBTI类型是：${this.data.mbtiResult.type}（${this.data.mbtiResult.profile.name}）`
      wx.setClipboardData({
        data: text,
        success: () => {
          wx.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          })
        }
      })
    }
  },

  // 复制贝尔宾角色
  copyBelbinRole: function() {
    if (this.data.belbinResult && this.data.belbinResult.primaryRole) {
      const text = `我的贝尔宾团队角色是：${this.data.belbinResult.primaryRole.name}`
      wx.setClipboardData({
        data: text,
        success: () => {
          wx.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          })
        }
      })
    }
  },

  // 保存到Supabase
  async saveToSupabase(result) {
    // 暂时跳过Supabase保存，等待域名配置
    try {
      const { supabase } = require('../../utils/supabase')
      const userInfo = wx.getStorageSync('userInfo')

      if (userInfo) {
        // 在开发环境中暂时不调用Supabase
        console.log('开发环境：跳过Supabase保存')
        return

        // 等域名配置完成后，取消下面这行注释
        // await supabase.insert('test_records', {
        //   user_openid: userInfo.openid || 'anonymous',
        //   scores: result.scores,
        //   ai_summary: result.aiSummary,
        //   test_date: new Date().toISOString()
        // })
      }
    } catch (error) {
      console.error('保存到Supabase失败:', error)
    }
  },

  // 重新测试
  retakeTest: function () {
    wx.redirectTo({
      url: '/pages/test/test'
    })
  },

  // 查看历史
  viewHistory: function () {
    wx.switchTab({
      url: '/pages/history/history'
    })
  },

  // 分享结果
  shareResult: function () {
    // 直接保存到相册，不再显示选项菜单
    this.saveToAlbum()
  },

  // 保存到相册
  saveToAlbum: function () {
    this.generateShareImage()
  },

  // 生成分享图片
  generateShareImage: function () {
    // 检查数据是否完整
    if (!this.data.scores) {
      wx.showToast({
        title: '数据不完整，无法生成图片',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '生成图片中...'
    })

    // 直接使用旧版本API，更稳定
    this.drawShareImageOld(750, 1200)
  },

  // 使用新Canvas API绘制
  drawShareImage: function (ctx, canvasWidth, canvasHeight) {
    try {
      // 设置背景
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // 绘制顶部渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvasWidth, 400)

      // 绘制标题
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '48px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('大五人格测试', canvasWidth / 2, 100)

      ctx.font = '32px sans-serif'
      ctx.fillText('性格分析报告', canvasWidth / 2, 160)

      // 绘制用户信息
      if (this.data.userInfo) {
        ctx.font = '28px sans-serif'
        ctx.fillText(this.data.userInfo.nickName, canvasWidth / 2, 220)
      }

      ctx.font = '24px sans-serif'
      ctx.fillText(new Date().toLocaleDateString(), canvasWidth / 2, 260)

      // 绘制五维度得分
      this.drawScores(ctx, canvasWidth, 320)

      // 绘制性格分析摘要
      this.drawPersonalitySummary(ctx, canvasWidth, 750)

      // 绘制底部信息
      this.drawFooter(ctx, canvasWidth, canvasHeight)

      // 导出图片
      wx.canvasToTempFilePath({
        canvas: ctx.canvas,
        success: (res) => {
          wx.hideLoading()
          this.saveImageToAlbum(res.tempFilePath)
        },
        fail: (error) => {
          wx.hideLoading()
          console.error('生成图片失败:', error)
          wx.showToast({
            title: '生成图片失败',
            icon: 'none'
          })
        }
      }, this)
    } catch (error) {
      wx.hideLoading()
      console.error('绘制失败:', error)
      wx.showToast({
        title: '生成图片失败',
        icon: 'none'
      })
    }
  },

  // 降级版本：使用旧Canvas API
  drawShareImageOld: function (canvasWidth, canvasHeight) {
    const ctx = wx.createCanvasContext('shareCanvas', this)

    // 重要：设置canvas的实际绘制尺寸
    // 微信小程序中，canvas默认是375px宽，我们需要明确指定
    const systemInfo = wx.getSystemInfoSync()
    const pixelRatio = systemInfo.pixelRatio || 2

    // 设置Canvas绘制区域大小 - 确保使用完整的750px宽度
    const actualWidth = 750
    const actualHeight = 1200

    // 设置背景 - 确保覆盖整个画布
    ctx.setFillStyle('#FFFFFF')
    ctx.fillRect(0, 0, actualWidth, actualHeight)

    // 绘制顶部渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, 400)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    ctx.setFillStyle(gradient)
    ctx.fillRect(0, 0, actualWidth, 400)

    // 绘制标题 - 使用完整的宽度中心点
    ctx.setFillStyle('#FFFFFF')
    ctx.setFontSize(48)
    ctx.setTextAlign('center')
    ctx.fillText('大五人格测试', actualWidth / 2, 100)

    ctx.setFontSize(32)
    ctx.fillText('性格分析报告', actualWidth / 2, 160)

    // 绘制用户信息
    if (this.data.userInfo) {
      ctx.setFontSize(28)
      ctx.fillText(this.data.userInfo.nickName, actualWidth / 2, 220)
    }

    ctx.setFontSize(24)
    ctx.fillText(new Date().toLocaleDateString(), actualWidth / 2, 260)

    // 绘制五维度得分 - 传递实际的宽度
    this.drawScoresOld(ctx, actualWidth, 320)

    // 绘制性格分析摘要
    this.drawPersonalitySummaryOld(ctx, actualWidth, 750)

    // 绘制底部信息
    this.drawFooterOld(ctx, actualWidth, actualHeight)

    // 绘制到画布
    ctx.draw(false, () => {
      // 将canvas转为图片 - 使用实际的绘制尺寸
      wx.canvasToTempFilePath({
        canvasId: 'shareCanvas',
        x: 0,
        y: 0,
        width: actualWidth,
        height: actualHeight,
        destWidth: actualWidth * pixelRatio,
        destHeight: actualHeight * pixelRatio,
        fileType: 'png',
        quality: 1.0,
        success: (res) => {
          wx.hideLoading()
          console.log('图片生成成功，尺寸:', actualWidth + 'x' + actualHeight)
          this.saveImageToAlbum(res.tempFilePath)
        },
        fail: (error) => {
          wx.hideLoading()
          console.error('生成图片失败:', error)
          wx.showToast({
            title: '生成图片失败',
            icon: 'none'
          })
        }
      }, this)
    })
  },

  // 新版Canvas API：绘制五维度得分
  drawScores: function (ctx, canvasWidth, startY) {
    const traits = [
      { name: '开放性', key: 'openness', color: '#FF6B6B' },
      { name: '尽责性', key: 'conscientiousness', color: '#4ECDC4' },
      { name: '外向性', key: 'extraversion', color: '#45B7D1' },
      { name: '宜人性', key: 'agreeableness', color: '#96CEB4' },
      { name: '神经质', key: 'neuroticism', color: '#FFEAA7' }
    ]

    traits.forEach((trait, index) => {
      const y = startY + index * 80
      const score = this.data.scores[trait.key].average || 0

      // 特质名称
      ctx.fillStyle = '#333333'
      ctx.font = '28px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(trait.name, 80, y)

      // 得分
      ctx.fillStyle = trait.color
      ctx.font = '32px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(score.toFixed(1), canvasWidth - 80, y)

      // 进度条
      const barX = 200
      const barWidth = canvasWidth - 400
      const barHeight = 12
      const fillWidth = (score / 5) * barWidth

      // 进度条背景
      ctx.fillStyle = '#E0E0E0'
      ctx.fillRect(barX, y - 20, barWidth, barHeight)

      // 进度条填充
      ctx.fillStyle = trait.color
      ctx.fillRect(barX, y - 20, fillWidth, barHeight)
    })
  },

  // 旧版Canvas API：绘制五维度得分
  drawScoresOld: function (ctx, canvasWidth, startY) {
    const traits = [
      { name: '开放性', key: 'openness', color: '#FF6B6B' },
      { name: '尽责性', key: 'conscientiousness', color: '#4ECDC4' },
      { name: '外向性', key: 'extraversion', color: '#45B7D1' },
      { name: '宜人性', key: 'agreeableness', color: '#96CEB4' },
      { name: '神经质', key: 'neuroticism', color: '#FFEAA7' }
    ]

    traits.forEach((trait, index) => {
      const y = startY + index * 80
      const score = this.data.scores[trait.key].average || 0

      // 特质名称 - 使用相对坐标
      ctx.setFillStyle('#333333')
      ctx.setFontSize(28)
      ctx.setTextAlign('left')
      ctx.fillText(trait.name, 80, y)

      // 得分 - 使用动态右边界
      ctx.setFillStyle(trait.color)
      ctx.setFontSize(32)
      ctx.setTextAlign('right')
      ctx.fillText(score.toFixed(1), canvasWidth - 80, y)

      // 进度条 - 使用动态宽度
      const barX = 200
      const barWidth = canvasWidth - 400  // 动态进度条宽度
      const barHeight = 12
      const fillWidth = (score / 5) * barWidth

      // 进度条背景
      ctx.setFillStyle('#E0E0E0')
      ctx.fillRect(barX, y - 20, barWidth, barHeight)

      // 进度条填充
      ctx.setFillStyle(trait.color)
      ctx.fillRect(barX, y - 20, fillWidth, barHeight)
    })
  },

  // 新版Canvas API：绘制性格分析摘要
  drawPersonalitySummary: function (ctx, canvasWidth, summaryY) {
    // 获取最高分特质
    const highestTrait = this.getHighestTrait(this.data.scores)

    ctx.fillStyle = '#333333'
    ctx.font = '32px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('性格特征', canvasWidth / 2, summaryY)

    if (highestTrait) {
      ctx.font = '28px sans-serif'
      ctx.fillText(`最突出特质：${highestTrait.name}`, canvasWidth / 2, summaryY + 50)
      ctx.fillText(`得分：${highestTrait.score.toFixed(1)}分`, canvasWidth / 2, summaryY + 90)
    }

    // 绘制AI分析摘要
    if (this.data.aiSummary && this.data.aiSummary.personality) {
      ctx.font = '24px sans-serif'
      ctx.fillStyle = '#666666'

      // 提取第一句话作为摘要
      const personality = this.data.aiSummary.personality
      const firstSentence = personality.split('。')[0] + '。'

      // 文字换行处理
      const maxWidth = canvasWidth - 120
      const lineHeight = 35
      const lines = this.wrapTextNew(ctx, firstSentence, maxWidth)

      lines.forEach((line, index) => {
        ctx.fillText(line, canvasWidth / 2, summaryY + 140 + index * lineHeight)
      })
    }
  },

  // 旧版Canvas API：绘制性格分析摘要
  drawPersonalitySummaryOld: function (ctx, canvasWidth, summaryY) {
    // 获取最高分特质
    const highestTrait = this.getHighestTrait(this.data.scores)

    ctx.setFillStyle('#333333')
    ctx.setFontSize(32)
    ctx.setTextAlign('center')
    ctx.fillText('性格特征', canvasWidth / 2, summaryY)  // 使用动态中心点

    if (highestTrait) {
      ctx.setFontSize(28)
      ctx.fillText(`最突出特质：${highestTrait.name}`, canvasWidth / 2, summaryY + 50)
      ctx.fillText(`得分：${highestTrait.score.toFixed(1)}分`, canvasWidth / 2, summaryY + 90)
    }

    // 绘制AI分析摘要
    if (this.data.aiSummary && this.data.aiSummary.personality) {
      ctx.setFontSize(24)
      ctx.setFillStyle('#666666')

      // 提取第一句话作为摘要
      const personality = this.data.aiSummary.personality
      const firstSentence = personality.split('。')[0] + '。'

      // 文字换行处理 - 使用动态的最大宽度
      const maxWidth = canvasWidth - 120  // 动态最大宽度
      const lineHeight = 35
      const lines = this.wrapText(ctx, firstSentence, maxWidth)

      lines.forEach((line, index) => {
        ctx.fillText(line, canvasWidth / 2, summaryY + 140 + index * lineHeight)
      })
    }
  },

  // 新版Canvas API：绘制底部信息
  drawFooter: function (ctx, canvasWidth, canvasHeight) {
    // 绘制分隔线
    ctx.strokeStyle = '#E0E0E0'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(100, canvasHeight - 150)
    ctx.lineTo(canvasWidth - 100, canvasHeight - 150)
    ctx.stroke()

    // 绘制底部文字提示
    ctx.fillStyle = '#999999'
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('长按识别小程序码，开启你的性格探索之旅', canvasWidth / 2, canvasHeight - 60)
    ctx.fillText('测试结果仅供参考，每个人的性格都是独特的', canvasWidth / 2, canvasHeight - 30)

    // 绘制小程序码占位区域
    const qrSize = 120
    const qrX = canvasWidth / 2 - qrSize / 2
    const qrY = canvasHeight - 280

    // 小程序码背景
    ctx.fillStyle = '#F5F5F5'
    ctx.fillRect(qrX, qrY, qrSize, qrSize)

    // 小程序码边框
    ctx.strokeStyle = '#DDDDDD'
    ctx.lineWidth = 2
    ctx.strokeRect(qrX, qrY, qrSize, qrSize)

    // 小程序码中心图标
    ctx.fillStyle = '#666666'
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('小程序', canvasWidth / 2, qrY + qrSize / 2)
  },

  // 旧版Canvas API：绘制底部信息
  drawFooterOld: function (ctx, canvasWidth, canvasHeight) {
    // 绘制分隔线 - 使用动态坐标
    ctx.setStrokeStyle('#E0E0E0')
    ctx.setLineWidth(2)
    const lineY = canvasHeight - 150
    ctx.moveTo(100, lineY)
    ctx.lineTo(canvasWidth - 100, lineY)
    ctx.stroke()

    // 绘制底部文字提示
    ctx.setFillStyle('#999999')
    ctx.setFontSize(20)
    ctx.setTextAlign('center')
    ctx.fillText('长按识别小程序码，开启你的性格探索之旅', canvasWidth / 2, canvasHeight - 60)
    ctx.fillText('测试结果仅供参考，每个人的性格都是独特的', canvasWidth / 2, canvasHeight - 30)

    // 绘制小程序码占位区域 - 使用动态坐标
    const qrSize = 120
    const qrX = canvasWidth / 2 - qrSize / 2
    const qrY = canvasHeight - 280

    // 小程序码背景
    ctx.setFillStyle('#F5F5F5')
    ctx.fillRect(qrX, qrY, qrSize, qrSize)

    // 小程序码边框
    ctx.setStrokeStyle('#DDDDDD')
    ctx.setLineWidth(2)
    ctx.strokeRect(qrX, qrY, qrSize, qrSize)

    // 小程序码中心图标
    ctx.setFillStyle('#666666')
    ctx.setFontSize(16)
    ctx.setTextAlign('center')
    ctx.fillText('小程序', canvasWidth / 2, qrY + qrSize / 2)
  },

  // 新版Canvas API：文字换行处理
  wrapTextNew: function (ctx, text, maxWidth) {
    const chars = text.split('')
    let line = ''
    const lines = []

    for (let i = 0; i < chars.length; i++) {
      const testLine = line + chars[i]
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && i > 0) {
        lines.push(line)
        line = chars[i]
      } else {
        line = testLine
      }
    }

    if (line) {
      lines.push(line)
    }

    return lines.slice(0, 3) // 最多显示3行
  },

  // 保存图片到相册
  saveImageToAlbum: function (tempFilePath) {
    // 先请求授权
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              this.doSaveImage(tempFilePath)
            },
            fail: () => {
              wx.showModal({
                title: '授权失败',
                content: '需要授权访问相册才能保存图片',
                showCancel: false
              })
            }
          })
        } else {
          this.doSaveImage(tempFilePath)
        }
      }
    })
  },

  // 文字换行处理
  wrapText: function (ctx, text, maxWidth) {
    const chars = text.split('')
    let line = ''
    const lines = []

    for (let i = 0; i < chars.length; i++) {
      const testLine = line + chars[i]
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && i > 0) {
        lines.push(line)
        line = chars[i]
      } else {
        line = testLine
      }
    }

    if (line) {
      lines.push(line)
    }

    return lines.slice(0, 3) // 最多显示3行
  },

  // 执行保存图片
  doSaveImage: function (tempFilePath) {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
      },
      fail: (error) => {
        console.error('保存图片失败:', error)
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    })
  },

  // 生成MBTI深度分析
  generateMBTIAnalysis: function(mbtiResult) {
    if (!mbtiResult || !mbtiResult.type) {
      return '无法生成MBTI分析，请检查测试数据。'
    }

    const { aiAPI } = require('../../utils/ai-api')
    return aiAPI.generatePersonalizedMBTIAnalysis(mbtiResult.type, mbtiResult.profile.name)
  },

  // 生成贝尔宾团队角色分析
  generateBelbinAnalysis: function(belbinResult) {
    if (!belbinResult || !belbinResult.primaryRole) {
      return '无法生成贝尔宾团队角色分析，请检查测试数据。'
    }

    const role = belbinResult.primaryRole
    const roleDescriptions = {
      '协调者': '作为团队的协调者，你擅长整合团队资源，促进团队成员之间的沟通与合作。你具有出色的组织能力和领导才能，能够在团队中发挥重要作用。',
      '鞭策者': '作为团队的鞭策者，你具有强烈的目标导向和推动力，能够激励团队成员朝着共同目标努力。你擅长克服困难，在压力下保持冷静。',
      '塑造者': '作为团队的塑造者，你具有创新思维和变革精神，能够为团队带来新的想法和解决方案。你善于挑战现状，推动团队不断进步。',
      '监听评价者': '作为团队的监听评价者，你具有客观分析能力，能够理性评估各种方案的优缺点。你为团队提供重要的决策参考。',
      '团队工作者': '作为团队工作者，你善于促进团队和谐，支持团队成员，为团队营造良好的工作氛围。你是团队中重要的粘合剂。',
      '执行者': '作为执行者，你具有高效的执行力和可靠性，能够将想法转化为实际行动。你为团队提供稳定的支持。',
      '完成者': '作为完成者，你注重细节，追求完美，能够确保工作按时高质量完成。你是团队质量的重要保障。',
      '专家': '作为专家，你在特定领域具有专业知识和技能，能够为团队提供专业的建议和支持。',
      '资源调查者': '作为资源调查者，你善于发现和获取外部资源，为团队创造新的机会和可能性。',
      '创新者': '作为创新者，你具有丰富的想象力和创造力，能够为团队带来创新的解决方案。'
    }

    const baseAnalysis = roleDescriptions[role.name] || `作为${role.name}，你在团队中扮演着重要角色，为团队贡献自己的独特价值。`

    return `${baseAnalysis}

你的团队角色适配度为${role.fitScore}%，说明你在这个角色上有很好的表现。建议继续发挥你的优势，同时在其他方面也要适当发展，形成更全面的团队能力。`
  },

  // 生成职业发展建议
  generateCareerDevelopment: function(scores, mbtiResult, belbinResult) {
    const highestTrait = this.getHighestTrait(scores)
    const careerText = this.getDefaultCareerAnalysis(scores)

    let mbtiAdvice = ''
    if (mbtiResult && mbtiResult.type) {
      const mbtiCareers = {
        'INTJ': '战略规划、科学研究、技术开发、管理咨询',
        'INTP': '科学研究、技术开发、学术研究、分析工作',
        'ENTJ': '高层管理、创业、咨询、战略规划',
        'ENTP': '市场营销、创业、咨询、创意工作',
        'INFJ': '心理咨询、教育、人力资源、社会工作',
        'INFP': '艺术创作、写作、心理咨询、教育',
        'ENFJ': '人力资源、教育、咨询、管理',
        'ENFP': '市场营销、公关、创意工作、教育',
        'ISTJ': '会计、行政管理、技术工作、质量管理',
        'ISFJ': '护理、教育、行政、客户服务',
        'ESTJ': '管理、行政、执法、金融服务',
        'ESFJ': '教育、医疗、客户服务、人力资源',
        'ISTP': '技术工作、手工艺、紧急服务、运动',
        'ISFP': '艺术创作、设计、手工艺、护理',
        'ESTP': '销售、市场营销、运动、娱乐',
        'ESFP': '娱乐、旅游、销售、服务行业'
      }

      mbtiAdvice = `

结合你的MBTI类型${mbtiResult.type}，特别适合的职业方向包括：
${mbtiCareers[mbtiResult.type] || '根据你的MBTI类型，寻找能够发挥你独特优势的工作环境'}`
    }

    let belbinAdvice = ''
    if (belbinResult && belbinResult.primaryRole) {
      belbinAdvice = `

作为${belbinResult.primaryRole.name}，在团队中你可以发挥重要作用，建议寻找能够充分发挥你团队角色的职业环境。`
    }

    return `${careerText}${mbtiAdvice}${belbinAdvice}

职业发展是一个持续的过程，建议定期评估自己的职业目标和发展方向，不断调整和完善自己的职业规划。`
  },

  // 生成个人成长策略
  generatePersonalGrowth: function(scores, mbtiResult, belbinResult) {
    const highestTrait = this.getHighestTrait(scores)
    const lowestTrait = this.getLowestTrait(scores)

    let growthStrategy = `基于你的性格分析，制定以下个人成长策略：

1. **发挥优势**：你的${highestTrait.name}特质最为突出，建议在这方面继续深入发展，形成核心竞争力。

2. **补足短板**：在${lowestTrait.name}方面还有提升空间，建议通过相关活动和训练来加强。

3. **平衡发展**：保持性格特质的平衡，避免过度依赖单一特质。`

    if (mbtiResult && mbtiResult.type) {
      growthStrategy += `

4. **MBTI发展建议**：
   - 发挥你作为${mbtiResult.type}类型的天生优势
   - 针对你的性格特点制定相应的成长计划
   - 在适合的环境中充分展现你的才华`
    }

    if (belbinResult && belbinResult.primaryRole) {
      growthStrategy += `

5. **团队角色发展**：
   - 作为${belbinResult.primaryRole.name}，继续提升相关技能
   - 了解其他团队角色的特点，提高团队协作能力
   - 在团队中找到最适合你的位置`
    }

    return `${growthStrategy}

个人成长是一个持续的过程，建议保持学习和自我反思的习惯，定期评估自己的成长进度，调整发展策略。记住，每个人都有独特的成长路径，关键是找到适合自己的方式。`
  },

  // 分享功能
  onShareAppMessage: function () {
    const highestTrait = this.getHighestTrait(this.data.scores)
    let title = '我刚刚完成了大五人格测试！'

    if (highestTrait) {
      title = `我的性格特质是${highestTrait.name}！来测测你的性格吧`
    }

    return {
      title: title,
      path: '/pages/index/index',
      imageUrl: '' // 可以使用生成的分享图片
    }
  }
})