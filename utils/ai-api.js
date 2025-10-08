// utils/ai-api.js
// 质谱AI GLM-4.5 API调用工具类

const app = getApp()

class AIAPI {
  constructor() {
    this.apiURL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    this.apiKey = '53a22f0eecc24bcd950df858b8de53f8.31ItPeBubaQgWOfQ' // 需要替换为实际的质谱AI API密钥
  }

  // 调用质谱AI GLM-4.5 API
  async callAI(prompt, options = {}) {
    // 检查是否在开发环境
    const isDevelopment = true // 在开发期间使用模拟数据

    if (isDevelopment) {
      return this.getMockAIResponse(prompt)
    }

    const defaultOptions = {
      model: 'glm-4.5',
      max_tokens: 2000,
      temperature: 0.7,
      top_p: 0.9
    }

    const requestOptions = {
      ...defaultOptions,
      ...options
    }

    const requestData = {
      model: requestOptions.model,
      messages: [
        {
          role: 'system',
          content: '你是一位专业的性格分析师，擅长基于大五人格测试结果为用户提供亲和、温暖的分析建议。你的回答应该通俗易懂，充满正能量。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      thinking: {
        type: "enabled"
      },
      max_tokens: requestOptions.max_tokens,
      temperature: requestOptions.temperature
    }

    try {
      const response = await this.makeRequest(requestData)
      return this.parseResponse(response)
    } catch (error) {
      console.error('AI API调用失败:', error)
      throw error
    }
  }

  // 模拟AI响应（开发期间使用）
  getMockAIResponse(prompt) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          content: this.generateMockResponse(prompt),
          usage: {
            prompt_tokens: 100,
            completion_tokens: 200,
            total_tokens: 300
          }
        })
      }, 1000) // 模拟1秒延迟
    })
  }

  // 生成模拟响应
  generateMockResponse(prompt) {
    // 提取得分信息（如果有的话）
    const getScoreFromPrompt = (dimension) => {
      const regex = new RegExp(`${dimension}[：:]*\\s*([\\d.]+)\\/5\\.0`, 'i')
      const match = prompt.match(regex)
      return match ? parseFloat(match[1]) : 3.0 // 默认中等得分
    }

    const scores = {
      openness: getScoreFromPrompt('开放性'),
      conscientiousness: getScoreFromPrompt('尽责性'),
      extraversion: getScoreFromPrompt('外向性'),
      agreeableness: getScoreFromPrompt('宜人性'),
      neuroticism: getScoreFromPrompt('神经质')
    }

    // 找出最高和最低得分
    const getHighestTrait = () => {
      return Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)
    }

    const getLowestTrait = () => {
      return Object.entries(scores).reduce((a, b) => scores[a[0]] < scores[b[0]] ? a : b)
    }

    const [highestTrait] = getHighestTrait()
    const [lowestTrait] = getLowestTrait()

    const traitNames = {
      openness: '开放性',
      conscientiousness: '尽责性',
      extraversion: '外向性',
      agreeableness: '宜人性',
      neuroticism: '情绪稳定性'
    }

    // 个性化性格分析
    const personalityAnalysis = `
## 你的性格特征

你的性格特质主要体现在${traitNames[highestTrait]}方面，得分${scores[highestTrait]}，这让你在日常生活中表现出独特的魅力和优势。

基于你的测试结果，你在${traitNames[highestTrait]}方面表现尤为突出，这是你性格中最闪亮的特质。这种特质让你在面对生活挑战时展现出独特的能力和智慧。

## 性格优势与发展

### 核心优势

• ${traitNames[highestTrait]}特质突出，得分${scores[highestTrait]}，这是你性格中最显著的特征
• 具有良好的自我认知能力，能够客观评估自己的表现
• 在人际交往中展现积极正面的特质，容易获得他人的信任和喜爱
• 适应能力强，能够灵活应对不同的环境和挑战

### 成长空间

相对而言，你在${traitNames[lowestTrait]}方面得分${scores[lowestTrait]}，这为你提供了成长的机会。这并不意味着你在这方面存在缺陷，而是为你提供了继续发展的潜力。

### 发展建议

• 主动接触能够锻炼${traitNames[lowestTrait]}的活动和情境
• 学习相关的技巧和方法，不断提升自己的综合能力
• 保持开放的心态，将挑战视为成长的宝贵机会

## 总结

你拥有平衡而丰富的性格特质，这为你的人生发展提供了坚实的基础。继续保持你的优势，同时勇敢地面对可以提升的方面，你会发现自己的潜力无限。
    `.trim()

    // 个性化职业建议
    const careerAdvice = {
      openness: "你的开放性特质让你非常适合需要创造力和创新思维的工作。建议考虑从事设计、艺术创作、市场营销、广告策划、产品开发等职业。这些工作能够充分发挥你的想象力和对新事物的接受能力，让你在工作中获得持续的成就感和满足感。",

      conscientiousness: "你的尽责性和条理性使你在需要细致和责任心的职业中表现出色。建议考虑从事会计、项目管理、质量控制、教师、医生、律师等职业。你的可靠性和组织能力会让这些职业的工作变得高效而有序。",

      extraversion: "你的外向特质让你在需要人际交往的职场中如鱼得水。建议考虑从事销售、公关、人力资源、培训师、活动策划、媒体主持等职业。你的社交能力和感染力会成为这些职业中的重要优势。",

      agreeableness: "你的友善和同理心让你在服务性和支持性职业中很有优势。建议考虑从事心理咨询师、社工、教师、护士、客户服务、人力资源等职业。你的善解人意会让你在这些职业中获得很好的发展。",

      neuroticism: "你的情绪稳定性让你在压力环境中能够保持冷静。建议考虑从事研究、技术工作、写作、分析、咨询等需要稳定心态的职业。你的平和性格会帮助你在这些需要深度思考的工作中取得好成绩。"
    }

    const careerAnalysis = `
## 推荐职业方向

基于你的${traitNames[highestTrait]}特质，你非常适合需要发挥这一优势的职业类型。

${careerAdvice[highestTrait]}

## 理想工作环境

最适合你的工作环境应该具备以下特点：

• 能够充分发挥你的${traitNames[highestTrait]}特质
• 提供成长和发展的机会
• 与你的价值观和工作风格相匹配
• 让你感到充实和有成就感

## 职业发展策略

### 短期规划

• 选择能够发挥你${traitNames[highestTrait]}优势的入门级职位
• 在实践中积累相关经验和技能
• 建立行业人脉和专业知识

### 长期发展

• 找到与你价值观相符的组织和企业
• 不要害怕尝试新领域，你的适应能力很强
• 持续学习和提升，保持职业竞争力

## 成功要素

1. 自我认知：了解自己的性格优势和局限性
2. 环境匹配：选择适合自己的工作环境和团队文化
3. 持续成长：保持学习的热情，不断提升自己
4. 平衡发展：在发挥优势的同时，也要关注其他能力的培养

记住，最好的职业是能让你同时发挥才能和感到快乐的工作。
    `.trim()

    // 个性化人际关系建议
    const relationshipAdvice = {
      openness: "你的开放性让你在人际交往中能够接受不同的观点和想法。建议你多与背景不同的人交流，这会丰富你的视野。在交往中保持开放和包容的态度，会让你建立更广泛而深入的人际关系。",

      conscientiousness: "你的责任心让你在人际关系中很可靠。朋友们都很信任你，知道你会信守承诺。建议你在关系中继续保持这种可靠性，同时也要学会适当放松，不要过于苛责自己。",

      extraversion: "你的外向特质让你在社交中很受欢迎。建议你发挥自己的社交优势，主动参与集体活动。同时也要学会在关系中倾听他人，给予对方足够的关注和空间。",

      agreeableness: "你的友善和同理心让你在人际关系中很温暖。建议你继续保持这种善良的特质，但也要学会在必要时表达自己的需求和边界，这样关系会更加健康平衡。",

      neuroticism: "你的情绪稳定性让你在处理人际冲突时能够保持冷静。建议你发挥这一优势，帮助他人化解矛盾。在关系中保持平和的心态，会让你成为朋友们寻求建议的重要对象。"
    }

    const relationshipAnalysis = `
## 人际交往优势

你的${traitNames[highestTrait]}特质让你在人际关系中具有独特的优势。

${relationshipAdvice[highestTrait]}

这种优势让你在社交场合中：

• 轻松建立新的友谊和联系
• 维护长期而稳定的人际关系
• 在冲突中扮演积极的建设性角色
• 成为他人们信任和依赖的对象

## 关系发展策略

### 建立深度连接

• 发挥你的${traitNames[highestTrait]}优势，建立真诚而深入的关系
• 学会在关系中保持适当的边界，这有助于长久的关系健康
• 多倾听他人的想法和感受，这会让你成为更好的朋友和伙伴

### 沟通技巧提升

1. 积极倾听：不仅听对方说什么，还要理解背后的情感
2. 有效表达：学会清晰、温和地表达自己的需求和感受
3. 情感共鸣：尝试理解他人的情绪状态，给予适当的回应

### 关系维护

• 定期联系，保持关系的温度
• 在重要时刻给予支持和关心
• 学会原谅和修复关系中的裂痕

## 成长空间

同时也要关注在${traitNames[lowestTrait]}方面的发展，这会让你的人际关系更加完善和平衡。

## 总结

你的性格特质让你在人际交往中具有独特的魅力。继续保持真诚和善良，同时有意识地提升自己的交往技巧，你会发现自己在建立和维护人际关系方面越来越得心应手。
    `.trim()

    // 根据prompt返回相应的内容
    if (prompt.includes('性格分析')) {
      return `性格分析：${personalityAnalysis}`
    } else if (prompt.includes('职业建议')) {
      return `职业建议：${careerAnalysis}`
    } else if (prompt.includes('人际关系')) {
      return `人际关系：${relationshipAnalysis}`
    } else {
      return `基于你的测试结果：

性格分析：${personalityAnalysis}

职业建议：${careerAnalysis}

人际关系：${relationshipAnalysis}`
    }
  }

  // 发送HTTP请求
  async makeRequest(data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.apiURL,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        data: data,
        timeout: 60000, // 60秒超时，质谱AI响应可能较慢
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            const errorMsg = res.data?.error?.message || res.data?.message || '未知错误'
            reject(new Error(`API请求失败: ${res.statusCode} - ${errorMsg}`))
          }
        },
        fail: (err) => {
          reject(new Error(`网络请求失败: ${err.errMsg}`))
        }
      })
    })
  }

  // 解析AI响应
  parseResponse(response) {
    try {
      // 质谱AI API响应格式解析
      if (response.choices && response.choices.length > 0) {
        const choice = response.choices[0]
        if (choice.message && choice.message.content) {
          return {
            success: true,
            content: choice.message.content,
            usage: response.usage,
            model: response.model,
            finish_reason: choice.finish_reason
          }
        }
      }

      throw new Error('API响应格式不正确，未找到有效内容')
    } catch (error) {
      console.error('解析AI响应失败:', error, response)
      throw new Error(`解析AI响应失败: ${error.message}`)
    }
  }

  // 生成人格分析总结
  async getPersonalitySummary(scores, answers) {
    const prompt = `请基于以下大五人格测试结果，生成一份详细的性格分析报告：

测试得分：
- 开放性: ${scores.openness?.average || 0}/5.0
- 尽责性: ${scores.conscientiousness?.average || 0}/5.0
- 外向性: ${scores.extraversion?.average || 0}/5.0
- 宜人性: ${scores.agreeableness?.average || 0}/5.0
- 神经质: ${scores.neuroticism?.average || 0}/5.0

请从以下三个角度进行分析，要求语言亲和温暖，每部分100-200字：

1. 职业建议：
基于性格特点，推荐适合的职业方向和工作环境，以及如何在职场中发挥优势。

2. 性格分析：
深入分析性格特征，包括优势特点和可能需要注意的成长空间。

3. 人际关系：
分析在社交和人际关系中的表现特点，给出建立良好人际关系的建议。

请用积极正面的语言，给予鼓励和实用建议。`

    try {
      const response = await this.callAI(prompt)

      // 尝试解析三个部分的内容
      const content = response.content
      const sections = this.parseSummarySections(content)

      return {
        success: true,
        career: sections.career || '暂无职业建议',
        personality: sections.personality || '暂无性格分析',
        relationship: sections.relationship || '暂无人际关系建议',
        fullContent: content
      }
    } catch (error) {
      console.error('生成人格分析总结失败:', error)
      return {
        success: false,
        error: error.message,
        career: 'AI分析服务暂时不可用，请稍后重试',
        personality: 'AI分析服务暂时不可用，请稍后重试',
        relationship: 'AI分析服务暂时不可用，请稍后重试'
      }
    }
  }

  // 解析总结的三个部分
  parseSummarySections(content) {
    const sections = {}

    // 清理内容，移除多余的空格和换行
    const cleanContent = content.trim().replace(/\s+/g, ' ')

    // 尝试匹配不同格式的分隔符
    const patterns = [
      // 格式1: 职业建议：xxx 性格分析：xxx 人际关系：xxx
      /职业建议[：:]\s*([^性格分析]+)(?=性格分析[：:])/i,
      /性格分析[：:]\s*([^人际关系]+)(?=人际关系[：:])/i,
      /人际关系[：:]\s*(.+)$/i,

      // 格式2: 1. 职业建议：xxx 2. 性格分析：xxx 3. 人际关系：xxx
      /1[、\.\s]*职业建议[：:]\s*([^2]+)/i,
      /2[、\.\s]*性格分析[：:]\s*([^3]+)/i,
      /3[、\.\s]*人际关系[：:]\s*(.+)$/i,

      // 格式3: 只匹配标题
      /职业建议[：:]\s*([\s\S]*?)(?=性格分析|$)/i,
      /性格分析[：:]\s*([\s\S]*?)(?=人际关系|$)/i,
      /人际关系[：:]\s*([\s\S]*?)$/i
    ]

    // 尝试所有模式
    patterns.forEach((pattern, index) => {
      const match = cleanContent.match(pattern)
      if (match && match[1]) {
        // 根据索引确定对应的section
        if (index < 3) {
          const sectionNames = ['career', 'personality', 'relationship']
          sections[sectionNames[index]] = match[1].trim()
        } else if (index < 6) {
          const sectionNames = ['career', 'personality', 'relationship']
          sections[sectionNames[index - 3]] = match[1].trim()
        } else {
          const sectionNames = ['career', 'personality', 'relationship']
          sections[sectionNames[index - 6]] = match[1].trim()
        }
      }
    })

    // 如果仍然解析失败，使用智能分割
    if (Object.keys(sections).length < 3) {
      console.log('智能分割解析AI响应')

      // 查找关键词位置
      const careerIndex = cleanContent.search(/职业建议[：:]/i)
      const personalityIndex = cleanContent.search(/性格分析[：:]/i)
      const relationshipIndex = cleanContent.search(/人际关系[：:]/i)

      if (careerIndex !== -1 && personalityIndex !== -1 && relationshipIndex !== -1) {
        // 按位置分割
        sections.career = cleanContent.substring(careerIndex, personalityIndex).replace(/职业建议[：:]\s*/i, '').trim()
        sections.personality = cleanContent.substring(personalityIndex, relationshipIndex).replace(/性格分析[：:]\s*/i, '').trim()
        sections.relationship = cleanContent.substring(relationshipIndex).replace(/人际关系[：:]\s*/i, '').trim()
      } else {
        // 如果找不到明确的分隔符，将整个内容作为性格分析
        sections.personality = cleanContent
        sections.career = '根据你的性格特点，建议选择能够发挥你优势的职业方向。'
        sections.relationship = '在人际关系中，继续保持你的真诚和善意，这将帮助你建立良好的关系。'
      }
    }

    console.log('解析结果:', sections)
    return sections
  }

  // 重试机制
  async callAIWithRetry(prompt, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.callAI(prompt)
      } catch (error) {
        console.warn(`AI API调用失败，第${i + 1}次重试:`, error.message)

        if (i === maxRetries - 1) {
          throw error
        }

        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }
}

// 创建全局实例
const aiAPI = new AIAPI()

module.exports = {
  aiAPI,
  AIAPI
}