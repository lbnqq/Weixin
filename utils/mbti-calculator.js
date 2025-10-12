// utils/mbti-calculator.js
// MBTI人格类型计算工具 - 基于大五人格测试结果

/**
 * MBTI 16种人格类型详细信息
 */
const MBTI_TYPES = {
  'INTJ': {
    name: '建筑师',
    description: '具有创新思维的策略家，善于规划，追求完美。',
    traits: ['理性', '独立', '远见', '决断'],
    career: ['软件架构师', '战略顾问', '研发工程师', '投资分析师'],
    strengths: ['战略思维', '独立工作', '高标准', '长远规划'],
    growth_areas: ['情感表达', '团队协作', '灵活性']
  },
  'INTP': {
    name: '逻辑学家',
    description: '富有创造力的理论家，善于抽象思维和逻辑分析。',
    traits: ['理性', '好奇', '灵活', '独立'],
    career: ['研究员', '程序员', '哲学家', '数据分析师'],
    strengths: ['逻辑分析', '创新思维', '客观判断', '深度思考'],
    growth_areas: ['实践执行', '时间管理', '社交技巧']
  },
  'ENTJ': {
    name: '指挥官',
    description: '天生的领导者，善于组织团队，实现目标。',
    traits: ['领导力', '果断', '自信', '战略思维'],
    career: ['CEO', '管理顾问', '项目经理', '创业者'],
    strengths: ['领导能力', '决策制定', '目标导向', '团队激励'],
    growth_areas: ['耐心倾听', '情感关怀', '细节关注']
  },
  'ENTP': {
    name: '辩论家',
    description: '充满活力的创新者，善于探索可能性和挑战传统。',
    traits: ['创新', '灵活', '善辩', '热情'],
    career: ['创意总监', '企业家', '咨询顾问', '市场营销'],
    strengths: ['创新思维', '适应能力', '说服能力', '快速学习'],
    growth_areas: ['专注坚持', '细节执行', '情绪管理']
  },
  'INFJ': {
    name: '提倡者',
    description: '理想主义的保护者，具有深刻的洞察力和同理心。',
    traits: ['理想主义', '洞察力', '同理心', '坚持'],
    career: ['心理咨询师', '作家', '社工', '人力资源'],
    strengths: ['深度理解', '创意思维', '价值观驱动', '关怀他人'],
    growth_areas: ['自我关怀', '设定边界', '应对批评']
  },
  'INFP': {
    name: '调停者',
    description: '温和的理想主义者，致力于帮助他人和追求和谐。',
    traits: ['理想主义', '善良', '创意', '灵活'],
    career: ['艺术家', '心理咨询师', '作家', '教育工作者'],
    strengths: ['同理心', '创意表达', '价值观坚持', '适应能力'],
    growth_areas: ['冲突处理', '决策制定', '自我主张']
  },
  'ENFJ': {
    name: '主人公',
    description: '富有魅力的领导者，善于激励他人和组织团队。',
    traits: ['魅力', '利他主义', '领导力', '同理心'],
    career: ['教师', '培训师', '人力资源', '非营利组织管理'],
    strengths: ['激励他人', '团队协作', '沟通能力', '组织能力'],
    growth_areas: ['自我需求', '冲突管理', '客观分析']
  },
  'ENFP': {
    name: '竞选者',
    description: '热情洋溢的创意者，善于连接人和想法。',
    traits: ['热情', '创意', '社交', '灵活'],
    career: ['市场营销', '公关', '心理咨询师', '创意工作者'],
    strengths: ['人际连接', '创意思维', '适应能力', '积极能量'],
    growth_areas: ['时间管理', '专注坚持', '细节关注']
  },
  'ISTJ': {
    name: '物流师',
    description: '可靠务实的管理者，致力于维护秩序和传统。',
    traits: ['可靠', '务实', '有条理', '责任感'],
    career: ['会计师', '律师', '医生', '工程师'],
    strengths: ['组织能力', '注重细节', '责任感', '稳定可靠'],
    growth_areas: ['适应变化', '创新思维', '情感表达']
  },
  'ISFJ': {
    name: '守卫者',
    description: '温暖的守护者，致力于保护和支持他人。',
    traits: ['温暖', '利他', '可靠', '细心'],
    career: ['护士', '教师', '社工', '人力资源'],
    strengths: ['关怀他人', '细致入微', '忠诚可靠', '支持能力'],
    growth_areas: ['自我主张', '应对冲突', '接受变化']
  },
  'ESTJ': {
    name: '总经理',
    description: '高效的管理者，善于组织资源和人员。',
    traits: ['高效', '组织', '务实', '领导力'],
    career: ['企业管理', '项目经理', '军官', '政府官员'],
    strengths: ['组织管理', '决策制定', '效率导向', '团队领导'],
    growth_areas: ['灵活适应', '情感关怀', '创新思维']
  },
  'ESFJ': {
    name: '执政官',
    description: '和谐的维护者，善于组织和支持他人。',
    traits: ['和谐', '支持', '组织', '温暖'],
    career: ['护士', '教师', '客服', '活动策划'],
    strengths: ['团队协作', '关怀他人', '组织能力', '社交技巧'],
    growth_areas: ['应对冲突', '客观决策', '自我关怀']
  },
  'ISTP': {
    name: '鉴赏家',
    description: '灵活的实践者，善于理解和操作各种工具。',
    traits: ['实用', '灵活', '冷静', '独立'],
    career: ['工程师', '技师', '运动员', '飞行员'],
    strengths: ['实践技能', '问题解决', '适应能力', '冷静分析'],
    growth_areas: ['长期规划', '情感表达', '团队沟通']
  },
  'ISFP': {
    name: '探险家',
    description: '温和的艺术家，追求美和自我表达。',
    traits: ['艺术', '敏感', '友善', '独立'],
    career: ['艺术家', '设计师', '心理咨询师', '作家'],
    strengths: ['创意表达', '美学敏感', '同理心', '适应能力'],
    growth_areas: ['决策制定', '冲突处理', '自我主张']
  },
  'ESTP': {
    name: '企业家',
    description: '充满活力的行动派，善于抓住机会。',
    traits: ['活力', '务实', '适应', '社交'],
    career: ['销售', '企业家', '运动员', '活动策划'],
    strengths: ['行动导向', '适应能力', '社交技巧', '问题解决'],
    growth_areas: ['长期规划', '细致执行', '情绪管理']
  },
  'ESFP': {
    name: '娱乐家',
    description: '活泼的表演者，善于享受生活和带动他人。',
    traits: ['活泼', '友善', '热情', '实用'],
    career: ['演艺', '销售', '教师', '活动策划'],
    strengths: ['人际互动', '适应能力', '积极能量', '实用技能'],
    growth_areas: ['长期规划', '专注坚持', '分析思考']
  }
}

/**
 * 计算MBTI类型 - 基于大五人格得分
 * @param {Object} bigFiveScores - 大五人格得分对象
 * @returns {Object} MBTI分析结果
 */
function calculateMBTI(bigFiveScores) {
  const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFiveScores

  // 计算四个维度的得分和置信度
  const dimensions = {
    EI: calculateEIDimension(extraversion.average),
    SN: calculateSNDimension(openness.average),
    TF: calculateTFDimension(agreeableness.average),
    JP: calculateJPDimension(conscientiousness.average)
  }

  const mbtiType = dimensions.EI.type + dimensions.SN.type + dimensions.TF.type + dimensions.JP.type
  const confidence = calculateOverallConfidence(dimensions)

  return {
    type: mbtiType,
    dimensions: dimensions,
    confidence: confidence,
    profile: MBTI_TYPES[mbtiType] || MBTI_TYPES['INFP'], // 默认类型
    analysis: generateMBTIAnalysis(dimensions, MBTI_TYPES[mbtiType])
  }
}

/**
 * 计算E-I维度（外向-内向）
 * @param {Number} extraversionScore - 外向性得分
 * @returns {Object} E-I维度结果
 */
function calculateEIDimension(extraversionScore) {
  // 外向性 >= 3.5 倾向于E，<= 2.5 倾向于I，中间为模糊区域
  let type, confidence, description

  if (extraversionScore >= 3.5) {
    type = 'E'
    confidence = Math.min(0.9, 0.5 + (extraversionScore - 3.5) * 0.4)
    description = '外向型：从外部世界获得能量，喜欢社交和行动'
  } else if (extraversionScore <= 2.5) {
    type = 'I'
    confidence = Math.min(0.9, 0.5 + (2.5 - extraversionScore) * 0.4)
    description = '内向型：从内心世界获得能量，喜欢独处和深度思考'
  } else {
    // 中间区域，根据细微倾向
    type = extraversionScore >= 3.0 ? 'E' : 'I'
    confidence = 0.5
    description = extraversionScore >= 3.0 ?
      '轻微外向：在不同情境下可以表现出外向或内向特征' :
      '轻微内向：在不同情境下可以表现出内向或外向特征'
  }

  return {
    type,
    confidence,
    score: extraversionScore,
    description,
    fullType: type === 'E' ? 'Extraversion' : 'Introversion',
    chineseName: type === 'E' ? '外向' : '内向'
  }
}

/**
 * 计算S-N维度（感觉-直觉）
 * @param {Number} opennessScore - 开放性得分
 * @returns {Object} S-N维度结果
 */
function calculateSNDimension(opennessScore) {
  // 开放性 <= 2.5 倾向于S，>= 3.5 倾向于N
  let type, confidence, description

  if (opennessScore <= 2.5) {
    type = 'S'
    confidence = Math.min(0.9, 0.5 + (2.5 - opennessScore) * 0.4)
    description = '感觉型：注重具体事实和实际经验，喜欢实用的信息'
  } else if (opennessScore >= 3.5) {
    type = 'N'
    confidence = Math.min(0.9, 0.5 + (opennessScore - 3.5) * 0.4)
    description = '直觉型：注重可能性和概念，喜欢创新和理论'
  } else {
    type = opennessScore >= 3.0 ? 'N' : 'S'
    confidence = 0.5
    description = opennessScore >= 3.0 ?
      '轻微直觉：能够平衡现实信息与未来可能性' :
      '轻微感觉：能够平衡实际经验与创新想法'
  }

  return {
    type,
    confidence,
    score: opennessScore,
    description,
    fullType: type === 'S' ? 'Sensing' : 'Intuition',
    chineseName: type === 'S' ? '感觉' : '直觉'
  }
}

/**
 * 计算T-F维度（思考-情感）
 * @param {Number} agreeablenessScore - 宜人性得分
 * @returns {Object} T-F维度结果
 */
function calculateTFDimension(agreeablenessScore) {
  // 宜人性 <= 2.5 倾向于T，>= 3.5 倾向于F
  let type, confidence, description

  if (agreeablenessScore <= 2.5) {
    type = 'T'
    confidence = Math.min(0.9, 0.5 + (2.5 - agreeablenessScore) * 0.4)
    description = '思考型：基于逻辑和客观分析做决定，重视公平和原则'
  } else if (agreeablenessScore >= 3.5) {
    type = 'F'
    confidence = Math.min(0.9, 0.5 + (agreeablenessScore - 3.5) * 0.4)
    description = '情感型：基于价值观和人际和谐做决定，重视同理心'
  } else {
    type = agreeablenessScore >= 3.0 ? 'F' : 'T'
    confidence = 0.5
    description = agreeablenessScore >= 3.0 ?
      '轻微情感：能够平衡逻辑分析与人文关怀' :
      '轻微思考：能够平衡客观原则与人际关系'
  }

  return {
    type,
    confidence,
    score: agreeablenessScore,
    description,
    fullType: type === 'T' ? 'Thinking' : 'Feeling',
    chineseName: type === 'T' ? '思考' : '情感'
  }
}

/**
 * 计算J-P维度（判断-感知）
 * @param {Number} conscientiousnessScore - 尽责性得分
 * @returns {Object} J-P维度结果
 */
function calculateJPDimension(conscientiousnessScore) {
  // 尽责性 >= 3.5 倾向于J，<= 2.5 倾向于P
  let type, confidence, description

  if (conscientiousnessScore >= 3.5) {
    type = 'J'
    confidence = Math.min(0.9, 0.5 + (conscientiousnessScore - 3.5) * 0.4)
    description = '判断型：喜欢有计划、有条理的生活方式，重视结果'
  } else if (conscientiousnessScore <= 2.5) {
    type = 'P'
    confidence = Math.min(0.9, 0.5 + (2.5 - conscientiousnessScore) * 0.4)
    description = '感知型：喜欢灵活、开放的生活方式，重视过程'
  } else {
    type = conscientiousnessScore >= 3.0 ? 'J' : 'P'
    confidence = 0.5
    description = conscientiousnessScore >= 3.0 ?
      '轻微判断：能够在计划与灵活之间找到平衡' :
      '轻微感知：能够在灵活与计划之间找到平衡'
  }

  return {
    type,
    confidence,
    score: conscientiousnessScore,
    description,
    fullType: type === 'J' ? 'Judging' : 'Perceiving',
    chineseName: type === 'J' ? '判断' : '感知'
  }
}

/**
 * 计算整体置信度
 * @param {Object} dimensions - 四个维度结果
 * @returns {Number} 整体置信度
 */
function calculateOverallConfidence(dimensions) {
  const confidences = [
    dimensions.EI.confidence,
    dimensions.SN.confidence,
    dimensions.TF.confidence,
    dimensions.JP.confidence
  ]

  // 使用几何平均值避免极端值影响
  const product = confidences.reduce((acc, conf) => acc * conf, 1)
  const geometricMean = Math.pow(product, 1 / confidences.length)

  return Math.round(geometricMean * 100)
}

/**
 * 生成MBTI分析文本
 * @param {Object} dimensions - 维度结果
 * @param {Object} profile - MBTI类型配置
 * @returns {Object} 分析结果
 */
function generateMBTIAnalysis(dimensions, profile) {
  if (!profile) {
    return {
      overview: '根据你的测试结果，你展现了独特的性格特质组合。',
      strengths: [],
      development: [],
      career: [],
      relationships: []
    }
  }

  return {
    overview: `作为${profile.name}（${dimensions.EI.chineseName}${dimensions.SN.chineseName}${dimensions.TF.chineseName}${dimensions.JP.chineseName}），${profile.description}`,
    strengths: profile.strengths.map(s => ({ text: s, type: 'strength' })),
    development: profile.growth_areas.map(area => ({ text: area, type: 'growth' })),
    career: profile.career.map(job => ({ text: job, type: 'career' })),
    relationships: generateRelationshipAdvice(dimensions),
    workStyle: generateWorkStyleAdvice(dimensions)
  }
}

/**
 * 生成人际关系建议
 * @param {Object} dimensions - 维度结果
 * @returns {Array} 人际关系建议
 */
function generateRelationshipAdvice(dimensions) {
  const advice = []

  if (dimensions.EI.type === 'I') {
    advice.push({ text: '需要充足的独处时间来充电', type: 'relationship' })
    advice.push({ text: '在深入的一对一交流中表现最佳', type: 'relationship' })
  } else {
    advice.push({ text: '从社交互动中获得能量和灵感', type: 'relationship' })
    advice.push({ text: '喜欢与各种不同的人建立联系', type: 'relationship' })
  }

  if (dimensions.TF.type === 'F') {
    advice.push({ text: '重视和谐，避免不必要的冲突', type: 'relationship' })
    advice.push({ text: '对他人的情感需求非常敏感', type: 'relationship' })
  } else {
    advice.push({ text: '重视诚实和直接的沟通', type: 'relationship' })
    advice.push({ text: '在决策时倾向于客观分析', type: 'relationship' })
  }

  return advice
}

/**
 * 生成工作风格建议
 * @param {Object} dimensions - 维度结果
 * @returns {Array} 工作风格建议
 */
function generateWorkStyleAdvice(dimensions) {
  const advice = []

  if (dimensions.JP.type === 'J') {
    advice.push({ text: '喜欢有计划、有条理的工作环境', type: 'work' })
    advice.push({ text: '善于按时完成任务和目标', type: 'work' })
  } else {
    advice.push({ text: '在灵活多变的环境中表现最佳', type: 'work' })
    advice.push({ text: '喜欢同时处理多个项目', type: 'work' })
  }

  if (dimensions.SN.type === 'N') {
    advice.push({ text: '专注于创新想法和未来可能性', type: 'work' })
    advice.push({ text: '善于看到整体格局和发展趋势', type: 'work' })
  } else {
    advice.push({ text: '注重具体细节和实际应用', type: 'work' })
    advice.push({ text: '擅长处理具体的事务和操作', type: 'work' })
  }

  return advice
}

/**
 * 获取MBTI类型列表（用于测试和参考）
 * @returns {Array} 所有MBTI类型信息
 */
function getAllMBTITypes() {
  return Object.keys(MBTI_TYPES).map(type => ({
    type,
    ...MBTI_TYPES[type]
  }))
}

/**
 * 根据MBTI类型获取详细信息
 * @param {String} type - MBTI类型代码
 * @returns {Object|null} 类型详细信息
 */
function getMBTIProfile(type) {
  return MBTI_TYPES[type] || null
}

module.exports = {
  calculateMBTI,
  getAllMBTITypes,
  getMBTIProfile,
  MBTI_TYPES
}