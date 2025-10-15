-- 修复缺失列的 SQL 脚本
-- 解决 "Could not find the 'user_id' column of 'users' in the schema cache" 错误

-- 1. 检查当前表结构
SELECT '检查 users 表当前结构...' AS status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. 添加缺失的列
DO $$
BEGIN
    -- 添加 user_id 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE users ADD COLUMN user_id VARCHAR(255);
        SELECT '已添加 user_id 列' AS action;
    ELSE
        SELECT 'user_id 列已存在' AS action;
    END IF;

    -- 添加 avatarUri 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'avatarUri'
    ) THEN
        ALTER TABLE users ADD COLUMN avatarUri TEXT;
        SELECT '已添加 avatarUri 列' AS action;
    ELSE
        SELECT 'avatarUri 列已存在' AS action;
    END IF;

    -- 添加 avatar_url 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
        SELECT '已添加 avatar_url 列' AS action;
    ELSE
        SELECT 'avatar_url 列已存在' AS action;
    END IF;

    -- 添加 nickname 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'nickname'
    ) THEN
        ALTER TABLE users ADD COLUMN nickname VARCHAR(255);
        SELECT '已添加 nickname 列' AS action;
    ELSE
        SELECT 'nickname 列已存在' AS action;
    END IF;

    -- 添加 nickName 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'nickName'
    ) THEN
        ALTER TABLE users ADD COLUMN nickName VARCHAR(255);
        SELECT '已添加 nickName 列' AS action;
    ELSE
        SELECT 'nickName 列已存在' AS action;
    END IF;
END $$;

-- 3. 更新现有数据，确保兼容性
UPDATE users SET 
    avatar_url = COALESCE(avatar_url, avatarUri, ''),
    avatarUri = COALESCE(avatarUri, avatar_url, ''),
    nickname = COALESCE(nickname, nickName, ''),
    nickName = COALESCE(nickName, nickname, '')
WHERE avatar_url IS NULL OR avatarUri IS NULL OR nickname IS NULL OR nickName IS NULL;

-- 4. 添加更新时间戳列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        SELECT '已添加 updated_at 列' AS action;
    ELSE
        SELECT 'updated_at 列已存在' AS action;
    END IF;
END $$;

-- 5. 创建更新时间触发器（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_users_updated_at'
    ) THEN
        CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON users 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        SELECT '已创建更新时间触发器' AS action;
    ELSE
        SELECT '更新时间触发器已存在' AS action;
    END IF;
END $$;

-- 6. 重新检查表结构
SELECT '修复后的表结构：' AS status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 7. 清理缓存（强制刷新 schema cache）
SELECT '清理数据库缓存...' AS status;
NOTIFY pgrst, 'reload schema';

-- 8. 验证修复结果
SELECT '验证修复结果：' AS verification;
SELECT 
    COUNT(*) as total_columns,
    COUNT(CASE WHEN column_name = 'user_id' THEN 1 END) as has_user_id,
    COUNT(CASE WHEN column_name = 'avatarUri' THEN 1 END) as has_avatarUri,
    COUNT(CASE WHEN column_name = 'avatar_url' THEN 1 END) as has_avatar_url,
    COUNT(CASE WHEN column_name = 'nickname' THEN 1 END) as has_nickname,
    COUNT(CASE WHEN column_name = 'nickName' THEN 1 END) as has_nickName,
    COUNT(CASE WHEN column_name = 'updated_at' THEN 1 END) as has_updated_at
FROM information_schema.columns 
WHERE table_name = 'users';

-- 完成提示
SELECT '列缺失修复完成！' AS final_status;
SELECT '请重新运行您的小程序测试。' AS next_step;
SELECT '如果仍然报错，请检查：1) 数据库连接是否正常 2) RLS策略是否正确 3) 是否有其他权限问题' AS troubleshooting;