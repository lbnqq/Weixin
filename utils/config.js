// utils/config.js
// 开发环境配置

// 开发环境设置
const isDevelopment = true

// API配置
const config = {
  // 开发环境
  development: {
    useMockAI: true, // 使用模拟AI
    useMockSupabase: true, // 使用模拟Supabase
    debugMode: true // 调试模式
  },

  // 生产环境
  production: {
    useMockAI: false,
    useMockSupabase: false,
    debugMode: false
  }
}

// 当前环境配置
const currentConfig = isDevelopment ? config.development : config.production

module.exports = {
  isDevelopment,
  config: currentConfig
}