# Supabase 数据库修复配置指南

## 🚨 问题概述

### 当前错误
```
HTTP 400: Could not find the 'user_id' column of 'users' in the schema cache
HTTP 400: Could not find the 'avatarUri' column of 'users' in the schema cache
```

### 根本原因
Supabase 数据库中的 `users` 表缺少必要的列，导致用户创建和更新操作失败。

---

## 🔧 修复步骤

### 步骤1：立即修复数据库结构

#### 方法A：快速修复（推荐）
1. 登录 [Supabase 控制台](https://app.supabase.com)
2. 选择您的项目
3. 点击左侧菜单 "SQL Editor"
4. 新建查询，粘贴并执行以下内容：

```sql
-- 立即修复缺失列
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatarUri TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nickName VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 清理缓存
NOTIFY pgrst, 'reload schema';

-- 验证修复
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

#### 方法B：完整初始化
如果需要重新创建完整的表结构：
```sql
-- 执行完整的初始化脚本
-- 复制 supabase-setup.sql 文件内容并执行
```

#### 方法C：使用修复脚本
执行专门的修复脚本：
```sql
-- 复制 fix-missing-columns.sql 文件内容并执行
```

### 步骤2：验证数据库连接

#### 测试连接
```sql
-- 测试基本连接
SELECT COUNT(*) as user_count FROM users;

-- 测试插入（使用事务）
BEGIN;
INSERT INTO users (openid, user_id, nickname, avatar_url) 
VALUES ('test_openid_123', 'test_user_123', '测试用户', 'https://example.com/avatar.jpg');
SELECT * FROM users WHERE openid = 'test_openid_123';
ROLLBACK; -- 回滚测试数据
```

### 步骤3：配置 RLS 策略（如需要）

如果启用了行级安全策略，确保有正确的策略：

```sql
-- 查看当前策略
SELECT * FROM pg_policies WHERE tablename = 'users';

-- 基本策略（用户只能操作自己的数据）
CREATE POLICY IF NOT EXISTS "Users can view own data" ON users
    FOR SELECT USING (openid = current_setting('app.current_user_openid', true));

CREATE POLICY IF NOT EXISTS "Users can update own data" ON users
    FOR UPDATE USING (openid = current_setting('app.current_user_openid', true));

CREATE POLICY IF NOT EXISTS "Users can insert data" ON users
    FOR INSERT WITH CHECK (true);
```

---

## 📝 小程序端配置

### 1. 确保配置文件正确
检查 `utils/config.js`：
```javascript
supabaseUrl: 'https://your-project-id.supabase.co',
supabaseKey: 'your-anon-key',
```

### 2. 使用增强版客户端（可选）
如果需要更好的错误处理和调试功能，可以使用增强版 Supabase 客户端：

```javascript
// 替换原有的 supabase 导入
// const { supabase } = require('../../utils/supabase')
const { enhancedSupabase } = require('../../utils/supabase-enhanced')
```

### 3. 测试代码验证
在小程序中使用以下测试代码：

```javascript
// 测试数据库连接
async testSupabaseConnection() {
  try {
    // 测试查询
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('数据库查询失败:', error)
      return false
    }
    
    console.log('数据库连接正常:', data)
    return true
  } catch (error) {
    console.error('数据库连接异常:', error)
    return false
  }
}

// 测试用户创建
async testUserCreation() {
  try {
    const testUser = {
      openid: 'test_' + Date.now(),
      user_id: 'test_user_' + Date.now(),
      nickname: '测试用户',
      avatar_url: 'https://example.com/avatar.jpg'
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([testUser])
    
    if (error) {
      console.error('用户创建失败:', error)
      return false
    }
    
    console.log('用户创建成功:', data)
    return true
  } catch (error) {
    console.error('用户创建异常:', error)
    return false
  }
}
```

---

## 🔍 调试和验证

### 1. 检查表结构
```sql
-- 查看完整的表结构
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

### 2. 检查 RLS 策略
```sql
-- 查看当前 RLS 策略
SELECT 
    polname as policy_name,
    polcmd as command,
    polqual as qualifying_condition
FROM pg_policies 
WHERE tablename = 'users';
```

### 3. 测试权限
```sql
-- 测试基本插入权限
SET app.current_user_openid = 'test_openid';
INSERT INTO users (openid, nickname) VALUES ('test_openid', '测试用户');
SELECT * FROM users WHERE openid = 'test_openid';
```

---

## ⚠️ 常见问题解决

### 问题1：仍然报列缺失错误
**解决**：
1. 确认 SQL 脚本执行成功
2. 执行 `NOTIFY pgrst, 'reload schema';` 清理缓存
3. 重启小程序开发工具
4. 检查是否有拼写错误

### 问题2：权限被拒绝
**解决**：
1. 检查 RLS 策略是否正确配置
2. 确认小程序端传递了正确的 openid
3. 临时禁用 RLS 进行测试：`ALTER TABLE users DISABLE ROW LEVEL SECURITY;`

### 问题3：网络连接失败
**解决**：
1. 检查 Supabase URL 和密钥配置
2. 确认微信小程序后台已添加域名白名单
3. 检查网络连接状态

### 问题4：数据插入成功但查询不到
**解决**：
1. 检查 RLS 策略是否限制了数据访问
2. 确认查询条件是否正确
3. 检查是否有数据过滤逻辑

---

## 🎯 验证清单

修复完成后，请确认：

- [ ] 数据库表结构完整（所有必要列都存在）
- [ ] 可以成功插入测试数据
- [ ] 可以成功查询数据
- [ ] 小程序端连接正常
- [ ] 用户创建功能正常
- [ ] 用户更新功能正常
- [ ] 错误日志中没有数据库相关错误

---

## 📚 相关文件

- `supabase-setup.sql` - 完整数据库初始化
- `fix-missing-columns.sql` - 列缺失修复脚本
- `DATABASE_FIX_GUIDE.md` - 详细修复指南
- `utils/supabase-enhanced.js` - 增强版客户端
- `SUPABASE_SETUP_GUIDE.md` - 原始配置指南

---

## 🆘 紧急支持

如果问题仍然存在：

1. **查看错误日志**：Supabase 控制台 → Logs
2. **检查网络请求**：微信小程序开发者工具 → Network
3. **验证配置**：双重检查所有 URL 和密钥
4. **临时解决方案**：可以临时禁用 RLS 进行测试
5. **联系支持**：提供完整的错误信息和配置详情