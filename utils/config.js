// utils/config.js
// 微信小程序大五人格测试 - 配置文件

// 开发环境设置
const isDevelopment = true

// API配置
const config = {
  // 开发环境
  development: {
    useMockAI: true, // 使用模拟AI
    debugMode: true, // 调试模式
    // 微信小程序配置
    wechatAppId: '', // 请在微信小程序后台获取
    wechatAppSecret: '' // 请在微信小程序后台获取
  },

  // 生产环境
  production: {
    useMockAI: false,
    debugMode: false,
    // 微信小程序配置
    wechatAppId: '', // 请在微信小程序后台获取
    wechatAppSecret: '' // 请在微信小程序后台获取
  }
}

// 当前环境配置
const currentConfig = isDevelopment ? config.development : config.production

module.exports = {
  isDevelopment,
  config: currentConfig
}