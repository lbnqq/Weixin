// utils/belbin-calculator.js
// 贝尔宾团队角色计算工具 - 基于大五人格测试结果

/**
 * 贝尔宾九种团队角色详细信息
 */
const BELBIN_ROLES = {
  '协调者': {
    name: '协调者 (Coordinator)',
    description: '成熟、自信，是团队的天生领导者。善于明确目标、促进决策、授权任务。',
    keyTraits: ['成熟', '自信', '领导力', '善于授权'],
    strengths: ['明确团队目标', '促进有效决策', '善于授权', '处理团队冲突'],
    weaknesses: ['可能过度授权', '容易被人操控', '缺乏创新思维'],
    contributions: ['提供方向和目标', '协调团队成员', '促进沟通', '解决冲突'],
    development: ['培养创新思维', '保持对细节的关注', '避免过度依赖他人'],
    teamValue: '确保团队朝向正确方向前进，提高团队效率'
  },
  '鞭策者': {
    name: '鞭策者 (Shaper)',
    description: '充满挑战精神，推动团队前进。具有驱动力和勇气去克服障碍。',
    keyTraits: ['挑战性', '驱动力', '勇气', '行动导向'],
    strengths: ['推动团队前进', '克服障碍', '带来活力', '保持动力'],
    weaknesses: ['容易冲动', '可能伤害他人感情', '缺乏耐心'],
    contributions: ['提供动力和紧迫感', '挑战现状', '推动决策', '克服惰性'],
    development: ['培养耐心和同理心', '学会更好地倾听', '控制冲动行为'],
    teamValue: '确保团队保持动力，不陷入舒适区'
  },
  '植物': {
    name: '植物 (Plant)',
    description: '富有创造力，善于提出创新想法和解决方案。通常是聪明、内向的思考者。',
    keyTraits: ['创造力', '创新思维', '智慧', '独立思考'],
    strengths: ['产生创新想法', '解决复杂问题', '提供新视角', '突破常规'],
    weaknesses: ['忽视细节', '不善沟通', '缺乏实践能力', '过于理论化'],
    contributions: ['提供创新解决方案', '挑战传统思维', '带来新想法', '解决复杂问题'],
    development: ['提高沟通技巧', '关注实际应用', '培养团队协作', '改进时间管理'],
    teamValue: '为团队带来创新思维和突破性想法'
  },
  '资源调查者': {
    name: '资源调查者 (Resource Investigator)',
    description: '热情、善于交际，是团队的外交官。善于探索机会和建立外部联系。',
    keyTraits: ['热情', '交际能力', '好奇心', '外交手腕'],
    strengths: ['建立外部联系', '探索机会', '促进沟通', '获取资源'],
    weaknesses: ['容易失去兴趣', '缺乏持续性', '可能过于乐观'],
    contributions: ['寻找外部资源', '建立合作关系', '带来新信息', '拓展团队网络'],
    development: ['培养持续专注能力', '提高细节关注度', '学会深入思考'],
    teamValue: '为团队带来外部资源和机会'
  },
  '执行者': {
    name: '执行者 (Implementer)',
    description: '保守、可靠，善于将想法转化为实际行动。有组织能力和实用技能。',
    keyTraits: ['可靠性', '组织性', '实用性', '系统性'],
    strengths: ['将想法付诸实践', '组织工作', '保持效率', '确保质量'],
    weaknesses: ['缺乏灵活性', '抗拒变化', '可能过于保守'],
    contributions: ['实施计划和策略', '组织团队工作', '确保项目完成', '维护系统'],
    development: ['培养灵活性', '接受新想法', '提高创新能力', '学会适应变化'],
    teamValue: '确保团队想法能够有效实施和落地'
  },
  '完成者': {
    name: '完成者 (Finisher)',
    description: '认真负责，注重细节，确保工作按时高质量完成。',
    keyTraits: ['责任感', '注重细节', '完美主义', '坚持不懈'],
    strengths: ['检查工作质量', '按时完成任务', '注重细节', '追求完美'],
    weaknesses: ['可能过于焦虑', '难以授权', '容易陷入细节'],
    contributions: ['质量检查', '确保按时完成', '发现错误', '提高标准'],
    development: ['学会更好地授权', '管理焦虑情绪', '培养大局观', '接受不完美'],
    teamValue: '确保团队工作的高质量和及时完成'
  },
  '协作者': {
    name: '协作者 (Teamworker)',
    description: '友善、敏感，是团队的和事佬。善于促进团队合作和解决冲突。',
    keyTraits: ['友善', '敏感', '合作', '和谐'],
    strengths: ['促进团队合作', '解决冲突', '支持他人', '营造和谐氛围'],
    weaknesses: ['难以做出决定', '可能被忽视', '缺乏权威'],
    contributions: ['维护团队和谐', '促进沟通', '支持队友', '调解冲突'],
    development: ['培养决策能力', '学会表达观点', '建立自信', '处理困难对话'],
    teamValue: '维护团队和谐，提高团队凝聚力'
  },
  '监察员': {
    name: '监察员 (Monitor Evaluator)',
    description: '冷静、客观，善于分析判断。提供理性思考和批判性分析。',
    keyTraits: ['冷静', '客观', '分析能力', '批判思维'],
    strengths: ['客观分析', '批判思维', '战略思考', '风险评估'],
    weaknesses: ['缺乏激励能力', '可能过于悲观', '不善鼓舞他人'],
    contributions: ['提供客观分析', '评估风险', '提出质疑', '确保决策质量'],
    development: ['培养激励能力', '提高积极思考', '改善沟通技巧', '学会鼓励他人'],
    teamValue: '确保团队决策的理性和质量'
  },
  '专家': {
    name: '专家 (Specialist)',
    description: '专注、专业，在特定领域拥有深厚知识和技能。',
    keyTraits: ['专业知识', '专注', '奉献', '精益求精'],
    strengths: ['提供专业知识', '解决技术问题', '保持高标准', '持续学习'],
    weaknesses: ['视野局限', '不善协作', '缺乏兴趣广度'],
    contributions: ['提供专业指导', '解决复杂技术问题', '维护专业标准', '传授知识'],
    development: ['拓宽知识面', '提高团队协作', '培养沟通技巧', '了解其他领域'],
    teamValue: '为团队提供专业知识和技能支持'
  }
}

/**
 * 计算贝尔宾团队角色 - 基于大五人格得分
 * @param {Object} bigFiveScores - 大五人格得分对象
 * @returns {Object} 贝尔宾团队角色分析结果
 */
function calculateBelbinRoles(bigFiveScores) {
  const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFiveScores

  // 计算每种角色的适配度分数
  const roleScores = {
    '协调者': calculateCoordinatorFit(openness.average, conscientiousness.average, extraversion.average, agreeableness.average),
    '鞭策者': calculateShaperFit(extraversion.average, conscientiousness.average, neuroticism.average),
    '植物': calculatePlantFit(openness.average, extraversion.average, conscientiousness.average),
    '资源调查者': calculateResourceInvestigatorFit(extraversion.average, openness.average, agreeableness.average),
    '执行者': calculateImplementerFit(conscientiousness.average, openness.average, neuroticism.average),
    '完成者': calculateFinisherFit(conscientiousness.average, neuroticism.average, agreeableness.average),
    '协作者': calculateTeamworkerFit(agreeableness.average, extraversion.average, neuroticism.average),
    '监察员': calculateMonitorEvaluatorFit(agreeableness.average, openness.average, neuroticism.average),
    '专家': calculateSpecialistFit(conscientiousness.average, openness.average, extraversion.average)
  }

  // 按适配度排序
  const sortedRoles = Object.entries(roleScores)
    .sort(([, a], [, b]) => b.score - a.score)
    .map(([role, data]) => ({
      name: role,
      ...BELBIN_ROLES[role],
      fitScore: Math.round(data.score),
      confidence: data.confidence,
      reasoning: data.reasoning
    }))

  // 返回最适合的3-4种角色
  const topRoles = sortedRoles.slice(0, 4)
  const primaryRole = topRoles[0]
  const secondaryRoles = topRoles.slice(1, 3)

  return {
    primaryRole,
    secondaryRoles,
    allRoles: sortedRoles,
    analysis: generateBelbinAnalysis(primaryRole, secondaryRoles, roleScores),
    teamContribution: generateTeamContributionAdvice(primaryRole, secondaryRoles)
  }
}

/**
 * 计算协调者适配度
 */
function calculateCoordinatorFit(openness, conscientiousness, extraversion, agreeableness) {
  let score = 0
  let reasoning = []

  // 高宜人性（善于合作，关注他人）
  if (agreeableness >= 3.5) {
    score += 30
    reasoning.push('高宜人性使你善于协调和促进团队合作')
  } else if (agreeableness >= 3.0) {
    score += 20
    reasoning.push('中等宜人性让你具有一定的协调能力')
  }

  // 高外向性（领导力和沟通能力）
  if (extraversion >= 3.5) {
    score += 25
    reasoning.push('外向特质为你提供了良好的沟通和领导基础')
  } else if (extraversion >= 2.5) {
    score += 15
    reasoning.push('适度的外向性让你能够有效沟通')
  }

  // 高尽责性（组织能力和责任感）
  if (conscientiousness >= 3.5) {
    score += 25
    reasoning.push('强烈的责任感让你成为团队可靠的核心')
  } else if (conscientiousness >= 3.0) {
    score += 15
    reasoning.push('尽责性为你提供了良好的组织能力')
  }

  // 适度开放性（接受不同观点）
  if (openness >= 2.5 && openness <= 4.0) {
    score += 20
    reasoning.push('平衡的开放性让你能够接纳不同意见')
  }

  return {
    score: Math.min(100, score),
    confidence: Math.min(0.9, score / 120),
    reasoning
  }
}

/**
 * 计算鞭策者适配度
 */
function calculateShaperFit(extraversion, conscientiousness, neuroticism) {
  let score = 0
  let reasoning = []

  // 高外向性（驱动力和影响力）
  if (extraversion >= 4.0) {
    score += 35
    reasoning.push('强烈的外向特质为你提供了强大的驱动力')
  } else if (extraversion >= 3.0) {
    score += 25
    reasoning.push('外向性让你具有推动团队前进的能力')
  }

  // 低神经质（情绪稳定，能够承受压力）
  if (neuroticism <= 2.5) {
    score += 30
    reasoning.push('情绪稳定性让你在挑战面前保持冷静')
  } else if (neuroticism <= 3.0) {
    score += 20
    reasoning.push('相对稳定的情绪帮助你面对挑战')
  }

  // 高尽责性（目标导向和执行力）
  if (conscientiousness >= 3.5) {
    score += 25
    reasoning.push('强烈的执行力确保目标得以实现')
  } else if (conscientiousness >= 3.0) {
    score += 15
    reasoning.push('尽责性为你提供了目标导向的思维')
  }

  return {
    score: Math.min(100, score),
    confidence: Math.min(0.9, score / 120),
    reasoning
  }
}

/**
 * 计算植物适配度
 */
function calculatePlantFit(openness, extraversion, conscientiousness) {
  let score = 0
  let reasoning = []

  // 高开放性（创新思维和创造力）
  if (openness >= 4.0) {
    score += 40
    reasoning.push('高度的开放性为你提供了丰富的创新思维')
  } else if (openness >= 3.5) {
    score += 30
    reasoning.push('开放性让你具有良好的创造力基础')
  }

  // 低外向性（内向，善于深度思考）
  if (extraversion <= 2.5) {
    score += 30
    reasoning.push('内向特质让你能够深度思考和独立创新')
  } else if (extraversion <= 3.0) {
    score += 20
    reasoning.push('适度的内向有助于创新思考')
  }

  // 中等尽责性（有创造力但不忽视细节）
  if (conscientiousness >= 2.5 && conscientiousness <= 3.5) {
    score += 20
    reasoning.push('平衡的尽责性让创意能够落地')
  }

  return {
    score: Math.min(100, score),
    confidence: Math.min(0.9, score / 120),
    reasoning
  }
}

/**
 * 计算资源调查者适配度
 */
function calculateResourceInvestigatorFit(extraversion, openness, agreeableness) {
  let score = 0
  let reasoning = []

  // 高外向性（社交能力和外交手腕）
  if (extraversion >= 3.5) {
    score += 35
    reasoning.push('出色的社交能力让你善于建立外部联系')
  } else if (extraversion >= 3.0) {
    score += 25
    reasoning.push('外向特质为你提供了良好的沟通基础')
  }

  // 高开放性（好奇心和探索精神）
  if (openness >= 3.5) {
    score += 30
    reasoning.push('强烈的好奇心驱使你探索新机会')
  } else if (openness >= 3.0) {
    score += 20
    reasoning.push('开放性让你对新事物保持兴趣')
  }

  // 高宜人性（亲和力和合作精神）
  if (agreeableness >= 3.5) {
    score += 25
    reasoning.push('友善的特质让你容易获得他人信任')
  } else if (agreeableness >= 3.0) {
    score += 15
    reasoning.push('良好的亲和力有助于建立合作关系')
  }

  return {
    score: Math.min(100, score),
    confidence: Math.min(0.9, score / 120),
    reasoning
  }
}

/**
 * 计算执行者适配度
 */
function calculateImplementerFit(conscientiousness, openness, neuroticism) {
  let score = 0
  let reasoning = []

  // 高尽责性（组织能力和执行力）
  if (conscientiousness >= 4.0) {
    score += 40
    reasoning.push('强烈的责任感让你成为可靠的执行者')
  } else if (conscientiousness >= 3.5) {
    score += 30
    reasoning.push('尽责性为你提供了优秀的执行能力')
  }

  // 低开放性（务实和保守）
  if (openness <= 2.5) {
    score += 30
    reasoning.push('务实的特质让你注重实际应用')
  } else if (openness <= 3.0) {
    score += 20
    reasoning.push('适度的开放性平衡了创新与务实')
  }

  // 低神经质（稳定和可靠）
  if (neuroticism <= 2.5) {
    score += 20
    reasoning.push('情绪稳定性让你成为团队可靠的后盾')
  }

  return {
    score: Math.min(100, score),
    confidence: Math.min(0.9, score / 120),
    reasoning
  }
}

/**
 * 计算完成者适配度
 */
function calculateFinisherFit(conscientiousness, neuroticism, agreeableness) {
  let score = 0
  let reasoning = []

  // 高尽责性（完美主义和责任感）
  if (conscientiousness >= 4.0) {
    score += 35
    reasoning.push('强烈的责任感驱使你追求完美')
  } else if (conscientiousness >= 3.5) {
    score += 25
    reasoning.push('尽责性让你注重工作质量')
  }

  // 适度神经质（关注细节和焦虑感）
  if (neuroticism >= 3.0 && neuroticism <= 4.0) {
    score += 25
    reasoning.push('适度的焦虑感让你关注细节和截止日期')
  } else if (neuroticism >= 2.5) {
    score += 15
    reasoning.push('一定的关注让你确保工作质量')
  }

  // 高宜人性（避免让团队失望）
  if (agreeableness >= 3.5) {
    score += 20
    reasoning.push('强烈的合作意识让你不愿让团队失望')
  }

  return {
    score: Math.min(100, score),
    confidence: Math.min(0.9, score / 120),
    reasoning
  }
}

/**
 * 计算协作者适配度
 */
function calculateTeamworkerFit(agreeableness, extraversion, neuroticism) {
  let score = 0
  let reasoning = []

  // 高宜人性（友善和合作精神）
  if (agreeableness >= 4.0) {
    score += 40
    reasoning.push('强烈的合作精神让你成为团队和谐的核心')
  } else if (agreeableness >= 3.5) {
    score += 30
    reasoning.push('友善的特质让你善于促进团队合作')
  }

  // 低神经质（情绪稳定，善于处理冲突）
  if (neuroticism <= 2.5) {
    score += 25
    reasoning.push('情绪稳定性让你能有效处理团队冲突')
  } else if (neuroticism <= 3.0) {
    score += 15
    reasoning.push('相对稳定的情绪有助于团队协作')
  }

  // 适度外向性（既善于沟通又不主导）
  if (extraversion >= 2.5 && extraversion <= 3.5) {
    score += 20
    reasoning.push('平衡的外向性让你既能沟通又不主导')
  }

  return {
    score: Math.min(100, score),
    confidence: Math.min(0.9, score / 120),
    reasoning
  }
}

/**
 * 计算监察员适配度
 */
function calculateMonitorEvaluatorFit(agreeableness, openness, neuroticism) {
  let score = 0
  let reasoning = []

  // 低宜人性（客观和批判性思维）
  if (agreeableness <= 2.5) {
    score += 35
    reasoning.push('客观分析能力让你能做出理性判断')
  } else if (agreeableness <= 3.0) {
    score += 25
    reasoning.push('适度的客观性有助于批判性思考')
  }

  // 高开放性（分析能力和战略思维）
  if (openness >= 3.5) {
    score += 30
    reasoning.push('开放性为你提供了战略思考能力')
  } else if (openness >= 3.0) {
    score += 20
    reasoning.push('开放性有助于分析和评估')
  }

  // 低神经质（冷静和理性）
  if (neuroticism <= 2.5) {
    score += 25
    reasoning.push('冷静的特质让你能进行客观分析')
  }

  return {
    score: Math.min(100, score),
    confidence: Math.min(0.9, score / 120),
    reasoning
  }
}

/**
 * 计算专家适配度
 */
function calculateSpecialistFit(conscientiousness, openness, extraversion) {
  let score = 0
  let reasoning = []

  // 高尽责性（专业精神和奉献精神）
  if (conscientiousness >= 4.0) {
    score += 35
    reasoning.push('强烈的奉献精神让你追求专业卓越')
  } else if (conscientiousness >= 3.5) {
    score += 25
    reasoning.push('尽责性让你具有专业精神基础')
  }

  // 高开放性（学习能力和求知欲）
  if (openness >= 3.5) {
    score += 30
    reasoning.push('强烈的求知欲让你持续学习专业知识')
  } else if (openness >= 3.0) {
    score += 20
    reasoning.push('开放性有助于专业知识的积累')
  }

  // 低外向性（专注和深度工作）
  if (extraversion <= 2.5) {
    score += 25
    reasoning.push('专注的特质让你能够深度钻研专业领域')
  } else if (extraversion <= 3.0) {
    score += 15
    reasoning.push('适度的内向有助于专业技能发展')
  }

  return {
    score: Math.min(100, score),
    confidence: Math.min(0.9, score / 120),
    reasoning
  }
}

/**
 * 生成贝尔宾团队角色分析
 */
function generateBelbinAnalysis(primaryRole, secondaryRoles, roleScores) {
  if (!primaryRole) {
    return {
      overview: '根据你的性格特点，你在团队中可以发挥独特的作用。',
      contributions: [],
      challenges: [],
      development: [],
      teamFit: '多种角色组合'
    }
  }

  return {
    overview: `你在团队中最主要的角色是${primaryRole.name}，这表明你${primaryRole.description}`,
    contributions: primaryRole.contributions.map(contrib => ({ text: contrib, type: 'contribution' })),
    challenges: primaryRole.weaknesses.map(weakness => ({ text: weakness, type: 'challenge' })),
    development: primaryRole.development.map(area => ({ text: area, type: 'development' })),
    teamFit: `${primaryRole.name}是团队中${primaryRole.teamValue}的关键角色`,
    secondaryStrengths: secondaryRoles.map(role => ({
      role: role.name,
      strength: role.contributions[0] || '为团队提供额外支持'
    }))
  }
}

/**
 * 生成团队贡献建议
 */
function generateTeamContributionAdvice(primaryRole, secondaryRoles) {
  const advice = []

  if (primaryRole) {
    advice.push({
      title: '主要贡献',
      content: `作为${primaryRole.name}，你最大的贡献在于${primaryRole.teamValue}`,
      type: 'primary'
    })

    advice.push({
      title: '最佳工作环境',
      content: `最适合你的团队环境是${generateBestTeamEnvironment(primaryRole)}`,
      type: 'environment'
    })
  }

  if (secondaryRoles.length > 0) {
    advice.push({
      title: '辅助角色',
      content: `你也可以在团队中扮演${secondaryRoles.map(r => r.name).join('、')}等角色，为团队提供更全面的支持`,
      type: 'secondary'
    })
  }

  return advice
}

/**
 * 生成最佳团队环境描述
 */
function generateBestTeamEnvironment(role) {
  const environments = {
    '协调者': '需要明确目标和协作氛围的成熟团队',
    '鞭策者': '充满挑战和机遇的高效团队',
    '植物': '鼓励创新和独立思考的研发团队',
    '资源调查者': '需要对外联系和资源拓展的业务团队',
    '执行者': '注重质量和效率的执行型团队',
    '完成者': '追求卓越和完美的专业团队',
    '协作者': '重视和谐与支持的服务型团队',
    '监察员': '需要理性分析和战略决策的团队',
    '专家': '需要专业知识和深度指导的技术团队'
  }

  return environments[role.name] || '能够发挥你专业能力的团队'
}

/**
 * 获取所有贝尔宾角色信息
 */
function getAllBelbinRoles() {
  return Object.keys(BELBIN_ROLES).map(role => ({
    key: role,
    ...BELBIN_ROLES[role]
  }))
}

/**
 * 根据角色名称获取详细信息
 */
function getBelbinRole(roleName) {
  return BELBIN_ROLES[roleName] || null
}

module.exports = {
  calculateBelbinRoles,
  getAllBelbinRoles,
  getBelbinRole,
  BELBIN_ROLES
}