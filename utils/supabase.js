// utils/supabase.js
// Supabase数据库集成工具类

const app = getApp()
const config = require('./config.js')

class SupabaseClient {
  constructor() {
    // 直接从配置文件中获取，避免app.js未加载完成的问题
    this.url = config.config.supabaseUrl
    this.key = config.config.supabaseKey
    
    if (!this.url || !this.key) {
      throw new Error('Supabase配置缺失，请检查config.js文件')
    }
    
    this.headers = {
      'apikey': this.key,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.key}`,
      'Prefer': 'return=representation'
    }
  }

  // 通用请求方法
  async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.url}${url}`,
        method: options.method || 'GET',
        header: { ...this.headers, ...options.headers },
        data: options.data,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.data.message || '请求失败'}`))
          }
        },
        fail: (err) => {
          reject(new Error(`网络请求失败: ${err.errMsg}`))
        }
      })
    })
  }

  // 查询数据
  from(table) {
    console.log('SupabaseClient.from called with table:', table)
    const query = new SupabaseQuery(this, table)
    console.log('SupabaseQuery instance created:', query)
    console.log('SupabaseQuery.select type:', typeof query.select)
    return query
  }

  // 插入数据
  async insert(table, data) {
    return this.request(`/rest/v1/${table}`, {
      method: 'POST',
      data
    })
  }

  // 更新数据
  async update(table, data, conditions) {
    const queryString = this.buildQueryString(conditions)
    return this.request(`/rest/v1/${table}?${queryString}`, {
      method: 'PATCH',
      data
    })
  }

  // 删除数据
  async delete(table, conditions) {
    const queryString = this.buildQueryString(conditions)
    return this.request(`/rest/v1/${table}?${queryString}`, {
      method: 'DELETE'
    })
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
}

class SupabaseQuery {
  constructor(client, table) {
    console.log('SupabaseQuery constructor called with client:', client, 'table:', table)
    this.client = client
    this.table = table
    this.query = {
      select: '*',
      filter: null,
      orderBy: null,
      limit: null
    }
    console.log('SupabaseQuery constructor completed, this:', this)
    
    // 确保方法正确绑定
    this.select = this.select.bind(this)
    this.limit = this.limit.bind(this)
    this.execute = this.execute.bind(this)
    this.then = this.then.bind(this)
    
    console.log('SupabaseQuery.select method type:', typeof this.select)
    console.log('SupabaseQuery.limit method type:', typeof this.limit)
  }

  // 选择字段
  select(columns = '*') {
    console.log('SupabaseQuery.select called with columns:', columns)
    this.query.select = columns
    console.log('SupabaseQuery instance after select:', this)
    return this
  }

  // 过滤条件
  eq(column, value) {
    const filter = `${column}=eq.${value}`
    this.query.filter = this.query.filter ? `${this.query.filter}&${filter}` : filter
    return this
  }

  // 模糊查询
  like(column, pattern) {
    const filter = `${column}=like.${pattern}`
    this.query.filter = this.query.filter ? `${this.query.filter}&${filter}` : filter
    return this
  }

  // 排序
  order(column, ascending = true) {
    this.query.orderBy = `${column}.${ascending ? 'asc' : 'desc'}`
    return this
  }

  // 限制数量
  limit(count) {
    console.log('SupabaseQuery.limit called with count:', count)
    this.query.limit = count
    console.log('SupabaseQuery instance after limit:', this)
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

    return this.client.request(url)
  }

  // 获取单条记录
  async single() {
    const result = await this.execute()
    return Array.isArray(result) && result.length > 0 ? result[0] : null
  }

  // 执行查询（别名）
  then(resolve, reject) {
    return this.execute().then(resolve, reject)
  }
}

// 创建全局实例
const supabase = new SupabaseClient()

console.log('Supabase module loaded, supabase instance:', supabase)
console.log('Supabase instance.from method type:', typeof supabase.from)

module.exports = {
  supabase,
  SupabaseClient,
  SupabaseQuery
}