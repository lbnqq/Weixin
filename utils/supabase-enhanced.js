// utils/supabase-enhanced.js
// 增强版 Supabase 客户端，包含更好的错误处理和调试功能

const app = getApp()
const config = require('./config.js')

class EnhancedSupabaseClient {
  constructor() {
    this.url = config.config.supabaseUrl
    this.key = config.config.supabaseKey
    this.debugMode = config.config.debugMode
    
    if (!this.url || !this.key) {
      throw new Error('Supabase配置缺失，请检查config.js文件')
    }
    
    this.headers = {
      'apikey': this.key,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.key}`,
      'Prefer': 'return=representation'
    }
    
    this.retryAttempts = 3
    this.retryDelay = 1000
  }

  // 日志记录
  log(message, data = null) {
    if (this.debugMode) {
      const timestamp = new Date().toLocaleTimeString()
      console.log(`[Supabase ${timestamp}] ${message}`, data || '')
    }
  }

  // 错误处理
  handleError(error, context) {
    this.log(`错误在 ${context}:`, error)
    
    // 详细的错误信息
    const errorDetails = {
      context: context,
      message: error.message,
      statusCode: error.statusCode || error.code,
      timestamp: new Date().toISOString()
    }
    
    // 特殊错误处理
    if (error.message.includes('schema cache')) {
      errorDetails.solution = '数据库列缺失，请执行 fix-missing-columns.sql 脚本'
      errorDetails.docs = '参考 DATABASE_FIX_GUIDE.md'
    } else if (error.message.includes('JWT')) {
      errorDetails.solution = '检查 Supabase 密钥配置'
    } else if (error.message.includes('network')) {
      errorDetails.solution = '检查网络连接和 Supabase URL 配置'
    }
    
    return errorDetails
  }

  // 重试机制
  async retryOperation(operation, context) {
    let lastError = null
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.log(`${context} - 尝试 ${attempt}/${this.retryAttempts}`)
        const result = await operation()
        this.log(`${context} - 成功`)
        return result
      } catch (error) {
        lastError = error
        this.log(`${context} - 失败: ${error.message}`)
        
        if (attempt < this.retryAttempts) {
          this.log(`${context} - ${this.retryDelay}ms 后重试`)
          await this.delay(this.retryDelay)
        }
      }
    }
    
    throw lastError
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 通用请求方法（增强版）
  async request(url, options = {}) {
    const fullUrl = `${this.url}${url}`
    const requestId = Math.random().toString(36).substr(2, 9)
    
    this.log(`请求 [${requestId}]: ${options.method || 'GET'} ${url}`)
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: fullUrl,
        method: options.method || 'GET',
        header: { ...this.headers, ...options.headers },
        data: options.data,
        timeout: 30000, // 30秒超时
        success: (res) => {
          this.log(`响应 [${requestId}]: ${res.statusCode}`)
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            const error = new Error(`HTTP ${res.statusCode}: ${res.data.message || '请求失败'}`)
            error.statusCode = res.statusCode
            error.response = res.data
            reject(error)
          }
        },
        fail: (err) => {
          this.log(`网络错误 [${requestId}]: ${err.errMsg}`)
          reject(new Error(`网络请求失败: ${err.errMsg}`))
        }
      })
    })
  }

  // 查询数据（增强版）
  from(table) {
    this.log(`创建查询: ${table}`)
    const query = new EnhancedSupabaseQuery(this, table)
    return query
  }

  // 插入数据（增强版）
  async insert(table, data) {
    const context = `插入数据到 ${table}`
    
    return this.retryOperation(async () => {
      this.log(`${context}:`, data)
      
      // 数据验证
      if (!data || typeof data !== 'object') {
        throw new Error('插入数据必须是对象')
      }
      
      // 添加时间戳
      if (!data.created_at) {
        data.created_at = new Date().toISOString()
      }
      
      const result = await this.request(`/rest/v1/${table}`, {
        method: 'POST',
        data
      })
      
      this.log(`${context} 成功:`, result)
      return result
    }, context)
  }

  // 更新数据（增强版）
  async update(table, data, conditions) {
    const context = `更新 ${table} 数据`
    
    return this.retryOperation(async () => {
      this.log(`${context}:`, { data, conditions })
      
      // 数据验证
      if (!data || typeof data !== 'object') {
        throw new Error('更新数据必须是对象')
      }
      
      if (!conditions || Object.keys(conditions).length === 0) {
        throw new Error('更新条件不能为空')
      }
      
      // 添加更新时间戳
      if (!data.updated_at) {
        data.updated_at = new Date().toISOString()
      }
      
      const queryString = this.buildQueryString(conditions)
      const result = await this.request(`/rest/v1/${table}?${queryString}`, {
        method: 'PATCH',
        data
      })
      
      this.log(`${context} 成功:`, result)
      return result
    }, context)
  }

  // 删除数据（增强版）
  async delete(table, conditions) {
    const context = `删除 ${table} 数据`
    
    return this.retryOperation(async () => {
      this.log(`${context}:`, conditions)
      
      if (!conditions || Object.keys(conditions).length === 0) {
        throw new Error('删除条件不能为空')
      }
      
      const queryString = this.buildQueryString(conditions)
      const result = await this.request(`/rest/v1/${table}?${queryString}`, {
        method: 'DELETE'
      })
      
      this.log(`${context} 成功`)
      return result
    }, context)
  }

  // 构建查询字符串
  buildQueryString(conditions) {
    if (!conditions || Object.keys(conditions).length === 0) {
      return ''
    }

    return Object.entries(conditions)
      .map(([key, value]) => `${key}=eq.${value}`)
      .join('&')
  }

  // 健康检查
  async healthCheck() {
    try {
      this.log('执行健康检查...')
      const result = await this.from('users').select('count').limit(1)
      this.log('健康检查通过')
      return { status: 'healthy', data: result }
    } catch (error) {
      const errorDetails = this.handleError(error, '健康检查')
      this.log('健康检查失败:', errorDetails)
      return { status: 'unhealthy', error: errorDetails }
    }
  }

  // 获取数据库信息
  async getDatabaseInfo() {
    try {
      this.log('获取数据库信息...')
      
      // 查询表结构
      const tableInfo = await this.request('/rest/v1/users?select=*&limit=1', {
        method: 'GET'
      })
      
      this.log('数据库信息获取成功')
      return { 
        status: 'connected', 
        tableCount: tableInfo.length,
        sampleData: tableInfo[0] 
      }
    } catch (error) {
      const errorDetails = this.handleError(error, '获取数据库信息')
      return { status: 'error', error: errorDetails }
    }
  }
}

class EnhancedSupabaseQuery {
  constructor(client, table) {
    this.client = client
    this.table = table
    this.query = {
      select: '*',
      filter: null,
      orderBy: null,
      limit: null
    }
    
    // 方法绑定
    this.select = this.select.bind(this)
    this.limit = this.limit.bind(this)
    this.execute = this.execute.bind(this)
    this.then = this.then.bind(this)
    this.eq = this.eq.bind(this)
    this.like = this.like.bind(this)
    this.order = this.order.bind(this)
  }

  // 选择字段
  select(columns = '*') {
    this.client.log(`查询选择字段: ${columns}`)
    this.query.select = columns
    return this
  }

  // 过滤条件
  eq(column, value) {
    this.client.log(`添加等值条件: ${column} = ${value}`)
    const filter = `${column}=eq.${value}`
    this.query.filter = this.query.filter ? `${this.query.filter}&${filter}` : filter
    return this
  }

  // 模糊查询
  like(column, pattern) {
    this.client.log(`添加模糊查询: ${column} LIKE ${pattern}`)
    const filter = `${column}=like.${pattern}`
    this.query.filter = this.query.filter ? `${this.query.filter}&${filter}` : filter
    return this
  }

  // 排序
  order(column, ascending = true) {
    this.client.log(`添加排序: ${column} ${ascending ? 'ASC' : 'DESC'}`)
    this.query.orderBy = `${column}.${ascending ? 'asc' : 'desc'}`
    return this
  }

  // 限制数量
  limit(count) {
    this.client.log(`限制结果数量: ${count}`)
    this.query.limit = count
    return this
  }

  // 执行查询
  async execute() {
    let url = `/rest/v1/${this.table}?select=${this.query.select}`

    if (this.query.filter) {
      url += `&${this.query.filter}`
    }

    if (this.query.orderBy) {
      url += `&order=${this.query.orderBy}`
    }

    if (this.query.limit) {
      url += `&limit=${this.query.limit}`
    }

    this.client.log(`执行查询: ${url}`)
    
    try {
      const result = await this.client.request(url)
      this.client.log(`查询成功，返回 ${result.length} 条记录`)
      return result
    } catch (error) {
      const errorDetails = this.client.handleError(error, `查询 ${this.table}`)
      throw new Error(errorDetails.message)
    }
  }

  // 获取单条记录
  async single() {
    this.client.log('获取单条记录')
    try {
      const result = await this.execute()
      return Array.isArray(result) && result.length > 0 ? result[0] : null
    } catch (error) {
      // PGRST116 是 "未找到记录" 的错误代码
      if (error.message.includes('PGRST116')) {
        this.client.log('未找到记录，返回 null')
        return null
      }
      throw error
    }
  }

  // 执行查询（别名）
  then(resolve, reject) {
    return this.execute().then(resolve, reject)
  }
}

// 创建全局实例
const enhancedSupabase = new EnhancedSupabaseClient()

console.log('增强版 Supabase 模块加载完成')

module.exports = {
  enhancedSupabase,
  EnhancedSupabaseClient,
  EnhancedSupabaseQuery
}