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
    } else if (prompt.includes('MBTI') || prompt.includes('贝尔宾')) {
      return this.generateAdvancedMockResponse(prompt)
    } else {
      return `基于你的测试结果：

性格分析：${personalityAnalysis}

职业建议：${careerAnalysis}

人际关系：${relationshipAnalysis}`
    }
  }

  // 生成个性化的MBTI分析
  generatePersonalizedMBTIAnalysis(mbtiType, mbtiName) {
    const mbtiProfiles = {
      'INTJ': {
        analysis: '作为建筑师（INTJ），你具有独特的战略思维和创新能力。你善于看到整体格局和发展趋势，能够制定长远而复杂的计划。在决策时，你主要依靠逻辑分析和客观评估，不容易被情感因素影响。你更喜欢独立工作，需要充足的独处时间来思考和规划。你的优势在于系统性思考和创新思维，但可能需要更多地关注他人的情感需求和团队协作。'
      },
      'INTP': {
        analysis: '作为逻辑学家（INTP），你具有卓越的理论思维和逻辑分析能力。你对抽象概念和复杂系统充满好奇，喜欢深入思考问题的本质。你思维灵活，能够从多个角度看待问题，不拘泥于传统观念。在社交中，你可能比较内向，更喜欢与志同道合的人进行深度交流。你的优势在于创新思维和问题解决能力，但需要提高实践执行和时间管理能力。'
      },
      'ENTJ': {
        analysis: '作为指挥官（ENTJ），你天生具有领导才能和组织能力。你善于制定目标和计划，能够有效地组织和激励团队。在决策时果断而自信，能够承担风险和责任。你的外向特质让你善于沟通和协调，在团队中自然扮演领导角色。你的优势在于战略思维和执行力，但需要学会更多地倾听他人意见，关注团队成员的情感需求。'
      },
      'ENTP': {
        analysis: '作为辩论家（ENTP），你充满创新精神和挑战欲望。你思维活跃，善于发现问题和提出新想法，喜欢从不同角度探讨可能性。你的外向特质让你善于表达和交流，能够在社交中展现个人魅力。你适应能力强，喜欢新挑战和变化的环境。你的优势在于创新思维和说服能力，但需要提高专注力和持续执行能力。'
      },
      'INFJ': {
        analysis: '作为提倡者（INFJ），你具有深刻的洞察力和同理心。你能够理解他人的感受和需求，善于提供深度的情感支持。你的直觉能力让你能够看到潜在的发展趋势和可能性。在决策时，你主要依靠价值观和对他人的关怀。你的优势在于创意思维和人际理解，但需要学会设定个人边界，避免过度投入他人的问题。'
      },
      'INFP': {
        analysis: '作为调停者（INFP），你具有强烈的价值观和同理心。你理想主义而善良，总是希望能够帮助他人和改善世界。你的内向特质让你善于深度思考和自我反思，喜欢探索内心世界。在决策时，你主要依靠个人价值观和对他人的关怀。你的优势在于创意表达和理解他人，但需要提高处理冲突和自我主张的能力。'
      },
      'ENFJ': {
        analysis: '作为主人公（ENFJ），你天生具有领导魅力和同理心。你善于激励和组织他人，能够营造积极的团队氛围。你的外向特质让你善于沟通和协调，在团队中自然扮演领导角色。在决策时，你主要考虑他人的感受和集体利益。你的优势在于人际激励和组织能力，但需要学会关注自己的需求，避免过度付出。'
      },
      'ENFP': {
        analysis: '作为竞选者（ENFP），你充满热情和创意。你善于与人建立联系，能够在社交中展现个人魅力和正能量。你的外向特质让你喜欢新的体验和挑战，对生活充满热情。在决策时，你主要依靠价值观和对他人的关怀。你的优势在于人际连接和创意思维，但需要提高时间管理和专注坚持的能力。'
      },
      'ISTJ': {
        analysis: '作为物流师（ISTJ），你具有强烈的责任感和组织能力。你注重细节和事实，善于制定和执行计划。在决策时，你主要依靠过去的经验和逻辑分析，倾向于传统和可靠的方法。你的内向特质让你喜欢有条理的工作环境，重视稳定性和可预测性。你的优势在于组织能力和执行力，但需要提高适应变化和创新思维的能力。'
      },
      'ISFJ': {
        analysis: '作为守卫者（ISFJ），你天生具有照顾和保护他人的特质。你细心而温暖，总是能够注意到他人的需求并提供支持。你的内向特质让你善于观察和倾听，在团队中是可靠的后盾。在决策时，你主要考虑他人的感受和和谐。你的优势在于关怀他人和维护和谐，但需要学会表达自己的需求和处理冲突。'
      },
      'ESTJ': {
        analysis: '作为总经理（ESTJ），你具有出色的组织和管理能力。你善于制定规则和流程，能够高效地组织资源和人员。你的外向特质让你善于领导和协调，在团队中自然扮演管理角色。在决策时，你主要依靠逻辑分析和实际经验。你的优势在于组织管理和执行力，但需要提高灵活性和对他人的情感关怀。'
      },
      'ESFJ': {
        analysis: '作为执政官（ESFJ），你天生具有照顾和协调他人的能力。你善于营造和谐的团队氛围，总是能够关注到他人的需求。你的外向特质让你善于沟通和组织，在团队中是可靠的协调者。在决策时，你主要考虑他人的感受和集体利益。你的优势在于团队协调和关怀他人，但需要学会应对冲突和客观决策。'
      },
      'ISTP': {
        analysis: '作为鉴赏家（ISTP），你具有出色的实践能力和问题解决技能。你善于理解和操作各种工具，能够快速解决实际问题。你的内向特质让你喜欢独立工作，需要充足的时间来思考和实验。在决策时，你主要依靠逻辑分析和实际经验。你的优势在于实践技能和适应能力，但需要提高长期规划和人际沟通能力。'
      },
      'ISFP': {
        analysis: '作为探险家（ISFP），你具有丰富的创意和审美能力。你追求美和自我表达，善于通过各种艺术形式表达内心世界。你的内向特质让你善于观察和感受，对周围环境有敏锐的感知。在决策时，你主要依靠个人价值观和内在感受。你的优势在于创意表达和同理心，但需要提高决策效率和自我主张能力。'
      },
      'ESTP': {
        analysis: '作为企业家（ESTP），你充满活力和行动力。你善于抓住机会，能够在快速变化的环境中做出反应。你的外向特质让你善于社交和协调，喜欢与人互动和合作。在决策时，你主要依靠实际经验和即时反馈。你的优势在于行动导向和适应能力，但需要提高长期规划和分析思考的能力。'
      },
      'ESFP': {
        analysis: '作为娱乐家（ESFP），你活泼而友善，总是能够为周围带来欢乐和活力。你善于与人互动，享受当下，喜欢与他人分享快乐。你的外向特质让你在社交中很受欢迎，能够轻松建立新的联系。在决策时，你主要依靠对他人的关怀和当下的感受。你的优势在于人际互动和适应能力，但需要提高长期规划和分析思考能力。'
      }
    };

    const profile = mbtiProfiles[mbtiType] || mbtiProfiles['INFP'];
    return profile.analysis;
  }

  // 生成高级分析模拟响应（MBTI和贝尔宾）
  generateAdvancedMockResponse(prompt) {
    // 提取MBTI类型和贝尔宾角色信息
    const mbtiMatch = prompt.match(/计算得出的MBTI类型:\s*([A-Z]{4})\s*（([^）]+)）/);
    const belbinMatch = prompt.match(/计算得出的主要贝尔宾角色:\s*([^\n]+)/);

    const mbtiType = mbtiMatch ? mbtiMatch[1] : 'INFP';
    const mbtiName = mbtiMatch ? mbtiMatch[2] : '调停者';
    const belbinRole = belbinMatch ? belbinMatch[1] : '协作者';

    // 根据MBTI类型生成个性化分析
    const mbtiAnalysis = this.generatePersonalizedMBTIAnalysis(mbtiType, mbtiName);

    // 贝尔宾团队角色分析模板
    const belbinAnalysis = `作为${belbinRole}，你在团队中扮演着重要的支持性角色。你天生具有促进团队和谐的能力，善于倾听和理解团队成员的需求和感受。在团队讨论中，你能够营造积极的氛围，让每个人都感到被重视和理解。

你的优势在于建立信任和促进合作。你能够敏锐地察觉团队中的紧张关系，并主动采取措施缓解冲突。在团队决策过程中，你倾向于寻求共识，确保每个人的声音都被听到。

在团队项目中，你是那个确保团队凝聚力的人，通过你的支持和关怀，让团队保持良好的工作状态和积极的心态。`;

    // 职业发展建议
    const careerDevelopment = `基于你的${mbtiName}特质和${belbinRole}角色特点，最适合你的职业发展路径应该结合以下几个方面：

首先，选择能够发挥你同理心和创造力的工作环境。教育、心理咨询、人力资源、社会工作、创意设计等领域都与你的人格特质高度匹配。在这些环境中，你不仅能够发挥专业能力，还能够实现帮助他人的内在动机。

其次，寻求能够提供一定自主性和灵活性的职位。你讨厌过于严格的规章制度和僵化的工作流程，更适合在相对自由的环境中发挥创造力。

最后，考虑团队合作导向的工作。作为${belbinRole}，你在协作型团队中会如鱼得水，能够为团队和谐与效率做出重要贡献。`

    // 个人成长策略
    const personalGrowth = `为了更好地发挥你的性格优势并平衡发展潜力，建议你关注以下成长策略：

1. 增强自我主张能力：学会在必要时表达自己的观点和需求，即使这可能引起短暂的不适。你的善良和同理心很宝贵，但也不应该以牺牲自己的需求为代价。

2. 提高决策效率：虽然你倾向于深入思考各种可能性，但也要学会在适当时机做出决定。可以设定决策期限，避免过度分析。

3. 拓展舒适区：适度尝试一些挑战性的活动和社交场合，这会帮助你建立更大的自信和适应能力。

4. 发展实用技能：在保持理想主义的同时，也要注重一些实用技能的培养，这会让你的创意更容易落地实现。

记住，成长不是要改变你的核心特质，而是让你更好地利用这些特质来创造价值。`

    return `MBTI性格深度解析：${mbtiAnalysis}

贝尔宾团队角色分析：${belbinAnalysis}

职业发展建议：${careerDevelopment}

个人成长策略：${personalGrowth}`
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

  // 生成完整的人格分析总结（包含MBTI和贝尔宾分析）
  async getPersonalitySummary(scores, answers) {
    try {
      // 首先计算MBTI和贝尔宾角色
      const { calculateMBTI } = require('./mbti-calculator')
      const { calculateBelbinRoles } = require('./belbin-calculator')

      const mbtiResult = calculateMBTI(scores)
      const belbinResult = calculateBelbinRoles(scores)

      console.log('计算的MBTI结果:', mbtiResult)
      console.log('计算的贝尔宾结果:', belbinResult)

      // 生成基础分析
      const basicPrompt = `请基于以下大五人格测试结果，生成一份详细的性格分析报告：

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

      // 生成MBTI和贝尔宾的专门分析
      const advancedPrompt = `基于以下测试结果，请提供专业的MBTI和贝尔宾团队角色分析：

大五人格得分：
- 开放性: ${scores.openness?.average || 0}/5.0
- 尽责性: ${scores.conscientiousness?.average || 0}/5.0
- 外向性: ${scores.extraversion?.average || 0}/5.0
- 宜人性: ${scores.agreeableness?.average || 0}/5.0
- 神经质: ${scores.neuroticism?.average || 0}/5.0

计算得出的MBTI类型: ${mbtiResult.type}（${mbtiResult.profile?.name || ''}）
计算得出的主要贝尔宾角色: ${belbinResult.primaryRole?.name || ''}

请提供以下深度分析：
1. MBTI性格深度解析：详细解释${mbtiResult.type}类型的行为特征、思维模式和决策风格
2. 贝尔宾团队角色分析：分析你在团队中的主要作用和贡献方式
3. 职业发展建议：结合MBTI和贝尔宾角色，提供具体的职业规划建议
4. 个人成长策略：基于性格特质，提供切实可行的自我提升建议

要求：语言专业而亲和，内容具体实用，每部分150-250字。`

      // 并行调用API提高效率
      const [basicResponse, advancedResponse] = await Promise.all([
        this.callAI(basicPrompt),
        this.callAI(advancedPrompt)
      ])

      // 解析基础分析
      const basicContent = basicResponse.content
      const basicSections = this.parseSummarySections(basicContent)

      // 解析高级分析
      const advancedContent = advancedResponse.content
      const advancedSections = this.parseAdvancedSections(advancedContent)

      return {
        success: true,
        // 基础分析
        career: basicSections.career || '暂无职业建议',
        personality: basicSections.personality || '暂无性格分析',
        relationship: basicSections.relationship || '暂无人际关系建议',
        // MBTI和贝尔宾分析
        mbtiAnalysis: advancedSections.mbtiAnalysis || '暂无MBTI分析',
        belbinAnalysis: advancedSections.belbinAnalysis || '暂无贝尔宾分析',
        careerDevelopment: advancedSections.careerDevelopment || '暂无职业发展建议',
        personalGrowth: advancedSections.personalGrowth || '暂无个人成长建议',
        // 计算结果
        mbtiResult: mbtiResult,
        belbinResult: belbinResult,
        // 原始内容
        fullContent: basicContent,
        advancedContent: advancedContent
      }
    } catch (error) {
      console.error('生成人格分析总结失败:', error)
      return {
        success: false,
        error: error.message,
        career: 'AI分析服务暂时不可用，请稍后重试',
        personality: 'AI分析服务暂时不可用，请稍后重试',
        relationship: 'AI分析服务暂时不可用，请稍后重试',
        mbtiAnalysis: 'AI分析服务暂时不可用，请稍后重试',
        belbinAnalysis: 'AI分析服务暂时不可用，请稍后重试',
        careerDevelopment: 'AI分析服务暂时不可用，请稍后重试',
        personalGrowth: 'AI分析服务暂时不可用，请稍后重试'
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

  // 解析高级分析部分（MBTI和贝尔宾）
  parseAdvancedSections(content) {
    const sections = {}
    const cleanContent = content.trim()

    // 高级分析解析模式
    const advancedPatterns = [
      // MBTI分析模式
      {
        name: 'mbtiAnalysis',
        patterns: [
          /MBTI性格深度解析[：:]\s*([\s\S]*?)(?=贝尔宾团队角色分析|$)/i,
          /1[、\.\s]*MBTI性格深度解析[：:]\s*([\s\S]*?)(?=2[、\.\s]*贝尔宾|$)/i,
          /MBTI[：:]\s*([\s\S]*?)(?=贝尔宾|$)/i
        ]
      },
      // 贝尔宾分析模式
      {
        name: 'belbinAnalysis',
        patterns: [
          /贝尔宾团队角色分析[：:]\s*([\s\S]*?)(?=职业发展建议|$)/i,
          /2[、\.\s]*贝尔宾团队角色分析[：:]\s*([\s\S]*?)(?=3[、\.\s]*职业发展|$)/i,
          /贝尔宾[：:]\s*([\s\S]*?)(?=职业发展|$)/i
        ]
      },
      // 职业发展建议模式
      {
        name: 'careerDevelopment',
        patterns: [
          /职业发展建议[：:]\s*([\s\S]*?)(?=个人成长策略|$)/i,
          /3[、\.\s]*职业发展建议[：:]\s*([\s\S]*?)(?=4[、\.\s]*个人成长|$)/i,
          /职业发展[：:]\s*([\s\S]*?)(?=个人成长|$)/i
        ]
      },
      // 个人成长策略模式
      {
        name: 'personalGrowth',
        patterns: [
          /个人成长策略[：:]\s*([\s\S]*?)$/i,
          /4[、\.\s]*个人成长策略[：:]\s*([\s\S]*?)$/i,
          /个人成长[：:]\s*([\s\S]*?)$/i
        ]
      }
    ]

    // 尝试解析每个部分
    advancedPatterns.forEach(({ name, patterns }) => {
      for (const pattern of patterns) {
        const match = cleanContent.match(pattern)
        if (match && match[1]) {
          sections[name] = match[1].trim()
          break
        }
      }

      // 如果没有匹配到，提供默认内容
      if (!sections[name]) {
        const defaultContent = {
          mbtiAnalysis: '基于你的MBTI类型，你具有独特的性格特质和行为模式，这影响着你与世界的互动方式。',
          belbinAnalysis: '作为团队的特定角色类型，你有着独特的贡献方式和价值定位。',
          careerDevelopment: '结合你的性格特点，建议寻找能够发挥你优势的工作环境和职业方向。',
          personalGrowth: '通过了解自己的性格特质，你可以有针对性地制定个人成长计划。'
        }
        sections[name] = defaultContent[name]
      }
    })

    console.log('高级分析解析结果:', sections)
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