-- 修复Supabase RLS策略问题
-- 允许匿名用户进行所有操作

-- 1. 禁用RLS（最简单的解决方案）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 如果需要启用RLS，则使用以下正确的策略语法：

-- 2. 启用RLS
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. 删除所有现有策略
DROP POLICY IF EXISTS "Enable insert for all" ON users;
DROP POLICY IF EXISTS "Enable select for all" ON users;
DROP POLICY IF EXISTS "Enable update for all" ON users;
DROP POLICY IF EXISTS "Enable delete for all" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- 4. 创建允许所有操作的策略（正确语法）
-- 注意：INSERT策略只能使用WITH CHECK，不能使用USING

-- CREATE POLICY "Enable insert for all" ON users
--     FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Enable select for all" ON users
--     FOR SELECT USING (true);

-- CREATE POLICY "Enable update for all" ON users
--     FOR UPDATE USING (true) WITH CHECK (true);

-- CREATE POLICY "Enable delete for all" ON users
--     FOR DELETE USING (true);

-- 5. 测试完成提示
SELECT 'RLS已禁用！现在允许所有操作。' AS message;