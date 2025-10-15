// 简化的数据库连接测试
const https = require('https');
const url = require('url');

console.log('🚀 开始数据库连接诊断...');

// Supabase配置
const supabaseUrl = 'https://hxcjphtimfelkxbzqgms.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Y2pwaHRpbWZlbGt4YnpxZ21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNjA4MjAsImV4cCI6MjA3NTczNjgyMH0.lmPbTyF0enJZK9GQXCuyrhrLOKQc-wCf6hytO4dc5Nc';

// 测试1: 基础网络连接
async function testNetworkConnection() {
  console.log('
1️⃣ 测试网络连接...');
  try {
    const parsedUrl = url.parse(supabaseUrl);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: '/',
      method: 'GET',
      timeout: 10000
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        console.log(`✅ 网络连接正常，状态码: ${res.statusCode}`);
        console.log(`📊 响应头:`, res.headers);
        resolve(true);
      });

      req.on('error', (err) => {
        console.error('❌ 网络连接失败:', err.message);
        reject(err);
      });

      req.on('timeout', () => {
        console.error('❌ 连接超时');
        req.destroy();
        reject(new Error('连接超时'));
      });

      req.end();
    });
  } catch (error) {
    console.error('❌ 网络测试失败:', error.message);
    throw error;
  }
}

// 测试2: Supabase REST API
async function testSupabaseAPI() {
  console.log('
2️⃣ 测试Supabase REST API...');
  try {
    const options = {
      hostname: 'hxcjphtimfelkxbzqgms.supabase.co',
      port: 443,
      path: '/rest/v1/users?select=id&limit=1',
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`✅ API响应状态码: ${res.statusCode}`);
          console.log(`📊 响应头:`, res.headers);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const result = JSON.parse(data);
              console.log(`✅ API调用成功，返回数据:`, result);
              resolve(result);
            } catch (parseError) {
              console.log(`📄 原始响应数据:`, data);
              resolve(data);
            }
          } else {
            console.error(`⚠️ API返回错误状态: ${res.statusCode}`);
            console.error(`📄 错误响应:`, data);
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (err) => {
        console.error('❌ API请求失败:', err.message);
        reject(err);
      });

      req.on('timeout', () => {
        console.error('❌ API请求超时');
        req.destroy();
        reject(new Error('API请求超时'));
      });

      req.end();
    });
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
    throw error;
  }
}

// 测试3: 数据库表结构
async function testTableStructure() {
  console.log('
3️⃣ 测试数据库表结构...');
  try {
    // 查询information_schema
    const options = {
      hostname: 'hxcjphtimfelkxbzqgms.supabase.co',
      port: 443,
      path: '/rest/v1/information_schema.columns?table_name=eq.users&order=ordinal_position',
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`✅ 表结构查询状态码: ${res.statusCode}`);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const columns = JSON.parse(data);
              if (columns && Array.isArray(columns) && columns.length > 0) {
                console.log('✅ users表存在，字段信息:');
                columns.forEach(col => {
                  console.log(`  📋 ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
                });
                resolve(columns);
              } else {
                console.log('⚠️ 未找到users表或表为空');
                resolve([]);
              }
            } catch (parseError) {
              console.log(`📄 原始响应数据:`, data);
              resolve(data);
            }
          } else {
            console.error(`⚠️ 表结构查询失败: ${res.statusCode}`);
            console.error(`📄 响应数据:`, data);
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (err) => {
        console.error('❌ 表结构查询失败:', err.message);
        reject(err);
      });

      req.end();
    });
  } catch (error) {
    console.error('❌ 表结构测试失败:', error.message);
    throw error;
  }
}

// 运行所有测试
async function runDiagnostic() {
  try {
    console.log('🔍 开始数据库连接诊断...');
    console.log('=' .repeat(50));
    
    await testNetworkConnection();
    await testSupabaseAPI();
    await testTableStructure();
    
    console.log('
' + '='.repeat(50));
    console.log('🎉 诊断完成！');
    console.log('✅ 数据库连接和基本功能正常');
    
  } catch (error) {
    console.error('
' + '='.repeat(50));
    console.error('❌ 诊断失败！');
    console.error('错误详情:', error.message);
    console.error('
🔧 建议:');
    console.error('1. 检查网络连接');
    console.error('2. 验证Supabase配置');
    console.error('3. 检查数据库权限');
    console.error('4. 查看详细错误日志');
  }
}

// 运行诊断
runDiagnostic();