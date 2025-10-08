// utils/supabase.js
// Supabase数据库集成工具类

const app = getApp()

class SupabaseClient {
  constructor() {
    this.url = app.globalData.supabaseUrl
    this.key = app.globalData.supabaseKey
    this.headers = {
      'apikey': this.key,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.key}`
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
  async from(table) {
    return new SupabaseQuery(this, table)
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
    this.client = client
    this.table = table
    this.query = {
      select: '*',
      filter: null,
      orderBy: null,
      limit: null
    }
  }

  // 选择字段
  select(columns = '*') {
    this.query.select = columns
    return this
  }

  // 过滤条件
  eq(column, value) {
    const filter = `${column}=eq.${value}`
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

module.exports = {
  supabase,
  SupabaseClient
}