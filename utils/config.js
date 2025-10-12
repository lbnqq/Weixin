// utils/config.js
// 微信小程序大五人格测试 - 配置文件

// 开发环境设置
const isDevelopment = true

// API配置
const config = {
  // 开发环境
  development: {
    useMockAI: true, // 使用模拟AI
    useMockSupabase: false, // 开发环境使用真实Supabase
    debugMode: true, // 调试模式
    // Supabase配置
    supabaseUrl: 'https://hxcjphtimfelkxbzqgms.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Y2pwaHRpbWZlbGt4YnpxZ21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNjA4MjAsImV4cCI6MjA3NTczNjgyMH0.lmPbTyF0enJZK9GQXCuyrhrLOKQc-wCf6hytO4dc5Nc',
    // 微信小程序配置
    wechatAppId: '', // 请在微信小程序后台获取
    wechatAppSecret: '' // 请在微信小程序后台获取
  },

  // 生产环境
  production: {
    useMockAI: false,
    useMockSupabase: false,
    debugMode: false,
    // Supabase配置
    supabaseUrl: 'https://hxcjphtimfelkxbzqgms.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Y2pwaHRpbWZlbGt4YnpxZ21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNjA4MjAsImV4cCI6MjA3NTczNjgyMH0.lmPbTyF0enJZK9GQXCuyrhrLOKQc-wCf6hytO4dc5Nc',
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