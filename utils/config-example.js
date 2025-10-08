// utils/config-example.js
// 配置文件示例 - 请复制此文件为 config.js 并填入实际的API密钥

module.exports = {
  // 质谱AI配置
  ai: {
    // 请在智谱AI开放平台获取API密钥：https://open.bigmodel.cn/
    apiKey: 'your-actual-api-key-here',

    // API基础URL
    baseURL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',

    // 模型配置
    model: 'glm-4.5',
    maxTokens: 4096,
    temperature: 0.6
  },

  // Supabase配置
  supabase: {
    // 请在Supabase官网获取：https://supabase.com/
    url: 'your-supabase-url-here',
    key: 'your-supabase-anon-key-here'
  }
}

// 使用说明：
// 1. 将此文件复制为 config.js
// 2. 填入实际的API密钥
// 3. 在相应的工具文件中引入配置
// 4. 不要将 config.js 提交到代码仓库