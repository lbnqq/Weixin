# Supabase 数据库修复指南

## 问题描述

当前遇到的错误：
- `HTTP 400: Could not find the 'user_id' column of 'users' in the schema cache`
- `HTTP 400: Could not find the 'avatarUri' column of 'users' in the schema cache`

## 根本原因

Supabase 数据库中的 `users` 表缺少必要的列，导致插入和更新操作失败。

## 解决方案

### 方法1：使用修复脚本（推荐）

1. 登录 Supabase 控制台
2. 进入 "SQL Editor"
3. 复制并执行 `fix-missing-columns.sql` 文件中的内容
4. 等待执行完成

### 方法2：手动添加缺失列

在 Supabase SQL Editor 中执行以下语句：

```sql
-- 添加缺失的列
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatarUri TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nickName VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 清理缓存
NOTIFY pgrst, 'reload schema';
```

### 方法3：重新创建完整的表结构

如果表结构严重缺失，建议重新创建：

1. 备份现有数据（如果有）
2. 执行 `supabase-setup.sql` 文件中的完整脚本
3. 恢复必要的数据

## 验证修复

执行修复后，可以通过以下方式验证：

1. **检查表结构**：
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

2. **测试插入操作**：
```sql
-- 测试数据插入
INSERT INTO users (openid, user_id, nickname, avatar_url, avatarUri) 
VALUES ('test_openid_123', 'test_user_123', '测试用户', 'https://example.com/avatar.jpg', 'https://example.com/avatar.jpg');

-- 验证数据
SELECT * FROM users WHERE openid = 'test_openid_123';
```

3. **清理测试数据**：
```sql
DELETE FROM users WHERE openid = 'test_openid_123';
```

## 小程序端代码调整

确保小程序端的代码使用正确的字段名。当前代码中使用了以下字段：

- `user_id` - 用户ID
- `openid` - 微信openid
- `nickname` - 昵称
- `avatar_url` - 头像URL

## 预防措施

1. **版本控制**：将数据库 schema 文件纳入版本控制
2. **部署流程**：建立标准化的数据库部署流程
3. **环境同步**：确保开发、测试、生产环境表结构一致
4. **监控告警**：设置数据库结构变更监控

## 常见问题

### Q: 执行修复脚本后仍然报错？
A: 检查以下几点：
- 确认执行成功，没有错误信息
- 清理小程序缓存，重新编译
- 检查数据库连接是否正常
- 确认 RLS 策略是否正确配置

### Q: 如何查看当前表结构？
A: 在 Supabase SQL Editor 中执行：
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

### Q: 如何清理数据库缓存？
A: 执行：
```sql
NOTIFY pgrst, 'reload schema';
```

## 技术支持

如果问题仍然存在：
1. 检查 Supabase 控制台中的错误日志
2. 验证小程序端的网络请求
3. 确认所有必要的环境变量都已正确配置
4. 联系技术支持

## 相关文件

- `supabase-setup.sql` - 完整的数据库初始化脚本
- `fix-missing-columns.sql` - 修复缺失列的专用脚本
- `fix-rls-complete.sql` - RLS 策略修复脚本