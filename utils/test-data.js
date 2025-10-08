// utils/test-data.js
// 大五人格测试题目数据

const questions = [
  // 开放性维度 (Openness) - 10题
  {
    id: 1,
    text: "我有很多想象力。",
    textEn: "I have a vivid imagination.",
    dimension: "openness",
    dimensionOrder: 1
  },
  {
    id: 2,
    text: "我喜欢尝试新事物。",
    textEn: "I like to try new things.",
    dimension: "openness",
    dimensionOrder: 2
  },
  {
    id: 3,
    text: "我对艺术和美学有浓厚兴趣。",
    textEn: "I have a strong interest in art and aesthetics.",
    dimension: "openness",
    dimensionOrder: 3
  },
  {
    id: 4,
    text: "我喜欢思考抽象的概念。",
    textEn: "I enjoy thinking about abstract concepts.",
    dimension: "openness",
    dimensionOrder: 4
  },
  {
    id: 5,
    text: "我经常有创造性的想法。",
    textEn: "I often have creative ideas.",
    dimension: "openness",
    dimensionOrder: 5
  },
  {
    id: 6,
    text: "我喜欢探索不同的文化。",
    textEn: "I like to explore different cultures.",
    dimension: "openness",
    dimensionOrder: 6
  },
  {
    id: 7,
    text: "我对哲学问题感兴趣。",
    textEn: "I am interested in philosophical questions.",
    dimension: "openness",
    dimensionOrder: 7
  },
  {
    id: 8,
    text: "我喜欢学习新技能。",
    textEn: "I enjoy learning new skills.",
    dimension: "openness",
    dimensionOrder: 8
  },
  {
    id: 9,
    text: "我对未知事物充满好奇。",
    textEn: "I am curious about unknown things.",
    dimension: "openness",
    dimensionOrder: 9
  },
  {
    id: 10,
    text: "我喜欢挑战传统观念。",
    textEn: "I like to challenge traditional ideas.",
    dimension: "openness",
    dimensionOrder: 10
  },

  // 尽责性维度 (Conscientiousness) - 10题
  {
    id: 11,
    text: "我总是准时完成任务。",
    textEn: "I always complete tasks on time.",
    dimension: "conscientiousness",
    dimensionOrder: 1
  },
  {
    id: 12,
    text: "我做事有条理。",
    textEn: "I do things in an organized manner.",
    dimension: "conscientiousness",
    dimensionOrder: 2
  },
  {
    id: 13,
    text: "我注重细节。",
    textEn: "I pay attention to details.",
    dimension: "conscientiousness",
    dimensionOrder: 3
  },
  {
    id: 14,
    text: "我坚持完成自己开始的工作。",
    textEn: "I persist in completing work I start.",
    dimension: "conscientiousness",
    dimensionOrder: 4
  },
  {
    id: 15,
    text: "我制定计划并按计划执行。",
    textEn: "I make plans and follow through with them.",
    dimension: "conscientiousness",
    dimensionOrder: 5
  },
  {
    id: 16,
    text: "我很少拖延。",
    textEn: "I rarely procrastinate.",
    dimension: "conscientiousness",
    dimensionOrder: 6
  },
  {
    id: 17,
    text: "我总是做好充分准备。",
    textEn: "I always prepare thoroughly.",
    dimension: "conscientiousness",
    dimensionOrder: 7
  },
  {
    id: 18,
    text: "我追求完美。",
    textEn: "I pursue perfection.",
    dimension: "conscientiousness",
    dimensionOrder: 8
  },
  {
    id: 19,
    text: "我能够自我约束。",
    textEn: "I am able to exercise self-control.",
    dimension: "conscientiousness",
    dimensionOrder: 9
  },
  {
    id: 20,
    text: "我有很强的目标导向。",
    textEn: "I have strong goal orientation.",
    dimension: "conscientiousness",
    dimensionOrder: 10
  },

  // 外向性维度 (Extraversion) - 10题
  {
    id: 21,
    text: "我在社交场合中感到自在。",
    textEn: "I feel comfortable in social situations.",
    dimension: "extraversion",
    dimensionOrder: 1
  },
  {
    id: 22,
    text: "我喜欢成为关注的焦点。",
    textEn: "I enjoy being the center of attention.",
    dimension: "extraversion",
    dimensionOrder: 2
  },
  {
    id: 23,
    text: "我有很多朋友。",
    textEn: "I have many friends.",
    dimension: "extraversion",
    dimensionOrder: 3
  },
  {
    id: 24,
    text: "我喜欢参加聚会和活动。",
    textEn: "I enjoy attending parties and events.",
    dimension: "extraversion",
    dimensionOrder: 4
  },
  {
    id: 25,
    text: "我很容易与陌生人交谈。",
    textEn: "I find it easy to talk to strangers.",
    dimension: "extraversion",
    dimensionOrder: 5
  },
  {
    id: 26,
    text: "我在团队中表现活跃。",
    textEn: "I am active in team settings.",
    dimension: "extraversion",
    dimensionOrder: 6
  },
  {
    id: 27,
    text: "我喜欢表达自己的观点。",
    textEn: "I enjoy expressing my opinions.",
    dimension: "extraversion",
    dimensionOrder: 7
  },
  {
    id: 28,
    text: "我充满活力。",
    textEn: "I am full of energy.",
    dimension: "extraversion",
    dimensionOrder: 8
  },
  {
    id: 29,
    text: "我喜欢热闹的环境。",
    textEn: "I enjoy lively environments.",
    dimension: "extraversion",
    dimensionOrder: 9
  },
  {
    id: 30,
    text: "我善于激励他人。",
    textEn: "I am good at motivating others.",
    dimension: "extraversion",
    dimensionOrder: 10
  },

  // 宜人性维度 (Agreeableness) - 10题
  {
    id: 31,
    text: "我信任别人。",
    textEn: "I trust others.",
    dimension: "agreeableness",
    dimensionOrder: 1
  },
  {
    id: 32,
    text: "我愿意帮助他人。",
    textEn: "I am willing to help others.",
    dimension: "agreeableness",
    dimensionOrder: 2
  },
  {
    id: 33,
    text: "我容易与人相处。",
    textEn: "I am easy to get along with.",
    dimension: "agreeableness",
    dimensionOrder: 3
  },
  {
    id: 34,
    text: "我很少与人发生争执。",
    textEn: "I rarely argue with others.",
    dimension: "agreeableness",
    dimensionOrder: 4
  },
  {
    id: 35,
    text: "我对人宽容。",
    textEn: "I am tolerant of others.",
    dimension: "agreeableness",
    dimensionOrder: 5
  },
  {
    id: 36,
    text: "我体谅他人的感受。",
    textEn: "I consider others' feelings.",
    dimension: "agreeableness",
    dimensionOrder: 6
  },
  {
    id: 37,
    text: "我愿意与他人合作。",
    textEn: "I am willing to cooperate with others.",
    dimension: "agreeableness",
    dimensionOrder: 7
  },
  {
    id: 38,
    text: "我关心他人的福祉。",
    textEn: "I care about others' well-being.",
    dimension: "agreeableness",
    dimensionOrder: 8
  },
  {
    id: 39,
    text: "我容易相信他人。",
    textEn: "I find it easy to trust others.",
    dimension: "agreeableness",
    dimensionOrder: 9
  },
  {
    id: 40,
    text: "我尽量避免冲突。",
    textEn: "I try to avoid conflicts.",
    dimension: "agreeableness",
    dimensionOrder: 10
  },

  // 神经质维度 (Neuroticism) - 10题
  {
    id: 41,
    text: "我经常感到焦虑。",
    textEn: "I often feel anxious.",
    dimension: "neuroticism",
    dimensionOrder: 1
  },
  {
    id: 42,
    text: "我容易感到沮丧。",
    textEn: "I am easily discouraged.",
    dimension: "neuroticism",
    dimensionOrder: 2
  },
  {
    id: 43,
    text: "我经常感到紧张。",
    textEn: "I often feel tense.",
    dimension: "neuroticism",
    dimensionOrder: 3
  },
  {
    id: 44,
    text: "我担心很多事情。",
    textEn: "I worry about many things.",
    dimension: "neuroticism",
    dimensionOrder: 4
  },
  {
    id: 45,
    text: "我情绪波动较大。",
    textEn: "My emotions fluctuate greatly.",
    dimension: "neuroticism",
    dimensionOrder: 5
  },
  {
    id: 46,
    text: "我容易感到压力。",
    textEn: "I am easily stressed.",
    dimension: "neuroticism",
    dimensionOrder: 6
  },
  {
    id: 47,
    text: "我经常感到不安。",
    textEn: "I often feel uneasy.",
    dimension: "neuroticism",
    dimensionOrder: 7
  },
  {
    id: 48,
    text: "我对批评敏感。",
    textEn: "I am sensitive to criticism.",
    dimension: "neuroticism",
    dimensionOrder: 8
  },
  {
    id: 49,
    text: "我容易感到愤怒。",
    textEn: "I get angry easily.",
    dimension: "neuroticism",
    dimensionOrder: 9
  },
  {
    id: 50,
    text: "我经常感到孤独。",
    textEn: "I often feel lonely.",
    dimension: "neuroticism",
    dimensionOrder: 10
  }
]

// 维度配置
const dimensions = {
  openness: {
    name: "开放性",
    nameEn: "Openness",
    description: "反映个体对新体验的开放程度",
    descriptionEn: "Reflects individual's openness to new experiences",
    color: "#FF6B6B",
    icon: "🎨"
  },
  conscientiousness: {
    name: "尽责性",
    nameEn: "Conscientiousness",
    description: "反映个体在目标导向行为上的组织程度",
    descriptionEn: "Reflects individual's organization in goal-oriented behavior",
    color: "#4ECDC4",
    icon: "📋"
  },
  extraversion: {
    name: "外向性",
    nameEn: "Extraversion",
    description: "反映个体在人际互动中的能量水平",
    descriptionEn: "Reflects individual's energy level in social interactions",
    color: "#45B7D1",
    icon: "🌟"
  },
  agreeableness: {
    name: "宜人性",
    nameEn: "Agreeableness",
    description: "反映个体对他人关心的程度",
    descriptionEn: "Reflects individual's concern for others",
    color: "#96CEB4",
    icon: "🤝"
  },
  neuroticism: {
    name: "神经质",
    nameEn: "Neuroticism",
    description: "反映个体的情绪稳定性和压力应对能力",
    descriptionEn: "Reflects individual's emotional stability and stress coping ability",
    color: "#FFEAA7",
    icon: "😰"
  }
}

// 答案选项
const answerOptions = [
  {
    value: 1,
    text: "完全不同意",
    textEn: "Strongly Disagree",
    color: "#FF6B6B"
  },
  {
    value: 2,
    text: "不同意",
    textEn: "Disagree",
    color: "#FFB6B6"
  },
  {
    value: 3,
    text: "中立",
    textEn: "Neutral",
    color: "#FFD93D"
  },
  {
    value: 4,
    text: "同意",
    textEn: "Agree",
    color: "#6BCF7F"
  },
  {
    value: 5,
    text: "完全同意",
    textEn: "Strongly Agree",
    color: "#4CAF50"
  }
]

module.exports = {
  questions,
  dimensions,
  answerOptions
}