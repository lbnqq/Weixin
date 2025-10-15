# Supabase 配置指南

## 概述

本指南将帮助您完成微信小程序大五人格测试项目的Supabase配置。

## 步骤1：创建Supabase项目

1. 访问 [Supabase官网](https://supabase.com) 并登录
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - **项目名称**: `bigfive-personality-test`
   - **数据库密码**: 设置一个强密码
   - **地区**: 选择离您的用户最近的地区
4. 点击 "Create new project" 等待项目创建完成

## 步骤2：获取项目凭证

项目创建完成后，在项目仪表板中：

1. 点击左侧菜单的 "Settings" > "API"
2. 复制以下信息：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 步骤3：更新配置文件

将获取的凭证更新到 `utils/config.js` 文件中：

```javascript
// 开发环境
development: {
  // ... 其他配置
  supabaseUrl: 'https://your-project-id.supabase.co', // 替换为您的Project URL
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // 替换为您的anon public key
  // ... 其他配置
},

// 生产环境
production: {
  // ... 其他配置
  supabaseUrl: 'https://your-project-id.supabase.co', // 替换为您的Project URL
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // 替换为您的anon public key
  // ... 其他配置
}
```

## 步骤4：创建数据库表

1. 在Supabase项目仪表板中，点击左侧菜单的 "SQL Editor"
2. 点击 "New query" 创建新查询
3. 复制 `supabase-setup.sql` 文件中的所有SQL代码
4. 粘贴到SQL编辑器中
5. 点击 "Run" 执行SQL脚本

### 如果遇到列缺失错误

如果在测试过程中遇到类似 `Could not find the 'user_id' column of 'users' in the schema cache` 的错误，请参考 `DATABASE_FIX_GUIDE.md` 文件中的修复指南。

快速修复方法：
1. 执行 `fix-missing-columns.sql` 脚本
2. 或者手动执行以下SQL语句：

```sql
-- 添加缺失的列
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatarUri TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nickName VARCHAR(255);

-- 清理缓存
NOTIFY pgrst, 'reload schema';
```

## 步骤5：配置微信小程序

### 5.1 获取微信小程序AppID

1. 登录 [微信小程序后台](https://mp.weixin.qq.com)
2. 在 "开发" > "开发设置" 中找到AppID
3. 将AppID更新到 `utils/config.js` 文件中：

```javascript
wechatAppId: 'your-wechat-app-id', // 替换为您的微信小程序AppID
```

### 5.2 配置服务器域名

1. 在微信小程序后台，进入 "开发" > "开发设置" > "服务器域名"
2. 添加以下域名到白名单：
   - **request合法域名**: `https://your-project-id.supabase.co`
   - **uploadFile合法域名**: `https://your-project-id.supabase.co`
   - **downloadFile合法域名**: `https://your-project-id.supabase.co`

### 5.3 配置用户隐私保护

1. 在微信小程序后台，进入 "设置" > "基本设置" > "用户隐私保护指引"
2. 根据您的实际使用场景配置隐私保护指引

## 步骤6：测试连接

1. 打开微信开发者工具
2. 加载项目
3. 在控制台中查看是否有连接错误
4. 尝试登录功能，检查用户数据是否正确保存到Supabase

## 步骤7：生产环境配置

### 7.1 环境变量配置

在生产环境中，建议使用环境变量来管理敏感信息：

```javascript
// 生产环境配置
production: {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  wechatAppId: process.env.WECHAT_APP_ID,
  wechatAppSecret: process.env.WECHAT_APP_SECRET,
  // ... 其他配置
}
```

### 7.2 安全配置

1. 在Supabase项目中，进入 "Authentication" > "Settings"
2. 配置以下设置：
   - **Site URL**: `https://your-mini-program-domain.com`
   - **Redirect URLs**: 根据需要配置
   - **JWT expiry**: 设置合适的过期时间

## 步骤8：监控和维护

### 8.1 数据库监控

1. 在Supabase仪表板中，定期检查：
   - 数据库使用情况
   - API请求统计
   - 错误日志

### 8.2 性能优化

1. 定期优化数据库查询
2. 监控API响应时间
3. 根据需要调整数据库索引

## 常见问题

### Q: 连接Supabase时出现CORS错误
A: 确保已在微信小程序后台正确配置了服务器域名白名单

### Q: 用户数据无法保存
A: 检查Row Level Security策略是否正确配置，确保用户有权限插入数据

### Q: 微信登录失败
A: 确保微信小程序AppID正确配置，并且用户已授权获取信息

### Q: 生产环境如何保护密钥
A: 使用环境变量或密钥管理服务，不要将密钥硬编码在代码中

## 技术支持

如果遇到问题，可以：
1. 查看Supabase官方文档
2. 检查微信小程序开发者工具控制台日志
3. 联系技术支持

---

**注意**: 在生产环境中部署前，请确保所有安全配置都已正确设置，并且已充分测试所有功能。