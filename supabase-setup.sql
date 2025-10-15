-- Supabase 数据库初始化脚本
-- 大五人格测试小程序数据库表结构

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    openid VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255),
    nickname VARCHAR(255),
    avatar_url TEXT,
    avatarUri TEXT, -- 兼容旧版本字段名
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建测试结果表
CREATE TABLE IF NOT EXISTS test_results (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    openid VARCHAR(255) NOT NULL,
    test_type VARCHAR(50) DEFAULT 'bigfive',
    scores JSONB NOT NULL,
    result_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建测试题目表（可选，用于存储题目数据）
CREATE TABLE IF NOT EXISTS questions (
    id BIGSERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    factor VARCHAR(50) NOT NULL,
    scoring_direction INTEGER DEFAULT 1,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_openid ON test_results(openid);
CREATE INDEX IF NOT EXISTS idx_test_results_created_at ON test_results(created_at);

-- 5. 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. 为用户表创建更新时间触发器
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. 启用行级安全策略（RLS）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 8. 创建 RLS 策略

-- 用户表策略
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (openid = current_setting('app.current_user_openid', true));

CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data by openid" ON users
    FOR UPDATE USING (openid = current_setting('app.current_user_openid', true));

CREATE POLICY "Users can update their own data by id" ON users
    FOR UPDATE USING (id = current_setting('app.current_user_id', true)::bigint);

-- 测试结果表策略
CREATE POLICY "Users can view their own test results" ON test_results
    FOR SELECT USING (openid = current_setting('app.current_user_openid', true));

CREATE POLICY "Users can insert their own test results" ON test_results
    FOR INSERT WITH CHECK (openid = current_setting('app.current_user_openid', true));

CREATE POLICY "Users can update their own test results" ON test_results
    FOR UPDATE USING (openid = current_setting('app.current_user_openid', true));

-- 题目表策略（公开读取）
CREATE POLICY "Anyone can view questions" ON questions
    FOR SELECT USING (true);

-- 9. 插入示例题目数据（可选）
INSERT INTO questions (question_text, category, factor, scoring_direction, display_order) VALUES
('我是一个喜欢社交的人', 'extraversion', 'E', 1, 1),
('我喜欢独自工作而不是团队合作', 'extraversion', 'E', -1, 2),
('我很容易感到焦虑', 'neuroticism', 'N', 1, 3),
('我通常能够保持冷静', 'neuroticism', 'N', -1, 4),
('我对新事物很开放', 'openness', 'O', 1, 5),
('我喜欢常规和可预测的事情', 'openness', 'O', -1, 6),
('我对他人很有同情心', 'agreeableness', 'A', 1, 7),
('我倾向于与他人竞争', 'agreeableness', 'A', -1, 8),
('我很有条理和计划性', 'conscientiousness', 'C', 1, 9),
('我倾向于拖延任务', 'conscientiousness', 'C', -1, 10);

-- 10. 创建视图（可选）
CREATE OR REPLACE VIEW user_test_summary AS
SELECT 
    u.id,
    u.openid,
    u.nickname,
    u.avatar_url,
    u.created_at as user_created_at,
    COUNT(tr.id) as test_count,
    MAX(tr.created_at) as last_test_date,
    (SELECT scores FROM test_results tr2 WHERE tr2.user_id = u.id ORDER BY tr2.created_at DESC LIMIT 1) as latest_scores
FROM users u
LEFT JOIN test_results tr ON u.id = tr.user_id
GROUP BY u.id, u.openid, u.nickname, u.avatar_url, u.created_at;

-- 11. 创建函数：获取或创建用户
CREATE OR REPLACE FUNCTION get_or_create_user(
    p_openid VARCHAR(255),
    p_user_id VARCHAR(255) DEFAULT NULL,
    p_nickname VARCHAR(255) DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL
)
RETURNS users AS $$
DECLARE
    user_record users;
BEGIN
    -- 尝试获取现有用户
    SELECT * INTO user_record
    FROM users 
    WHERE openid = p_openid;
    
    -- 如果用户不存在，创建新用户
    IF NOT FOUND THEN
        INSERT INTO users (openid, user_id, nickname, avatar_url)
        VALUES (p_openid, p_user_id, p_nickname, p_avatar_url)
        RETURNING * INTO user_record;
    END IF;
    
    RETURN user_record;
END;
$$ LANGUAGE plpgsql;

-- 12. 权限设置（确保 supabase_auth_admin 有适当权限）
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- 完成提示
SELECT 'Supabase 数据库初始化完成！' AS status;
SELECT '表结构：' AS info;
SELECT '- users: 用户表' AS table_info;
SELECT '- test_results: 测试结果表' AS table_info;
SELECT '- questions: 题目表' AS table_info;
SELECT 'RLS 策略已启用，确保数据安全' AS security_info;