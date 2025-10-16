#!/usr/bin/env node

/**
 * Vercel 环境变量一键配置脚本
 * 生成所有必要的环境变量配置
 */

const crypto = require('crypto');

console.log('🚀 AI Project - Vercel 环境变量配置生成器\n');

// 生成 NEXTAUTH_SECRET
const nextAuthSecret = crypto.randomBytes(32).toString('base64');

// 获取用户输入
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('请提供以下信息来生成环境变量配置:\n');

rl.question('你的 Vercel 应用名称 (例如: my-ai-app): ', (appName) => {
  rl.question('数据库类型 (postgres/mysql): ', (dbType) => {
    rl.question('数据库主机 (例如: db.vercel-storage.com): ', (dbHost) => {
      rl.question('数据库端口 (默认: 5432): ', (dbPort) => {
        rl.question('数据库名称: ', (dbName) => {
          rl.question('数据库用户名: ', (dbUser) => {
            rl.question('数据库密码: ', (dbPassword) => {
              
              // 生成环境变量配置
              const vercelUrl = `https://${appName}.vercel.app`;
              const dbUrl = `${dbType}://${dbUser}:${dbPassword}@${dbHost}:${dbPort || '5432'}/${dbName}`;
              
              console.log('\n' + '='.repeat(60));
              console.log('🎯 Vercel 环境变量配置');
              console.log('='.repeat(60));
              console.log('\n请将以下环境变量复制到 Vercel 控制台中:\n');
              
              console.log('NEXTAUTH_URL=' + vercelUrl);
              console.log('NEXTAUTH_SECRET=' + nextAuthSecret);
              console.log('DATABASE_URL=' + dbUrl);
              console.log('DIRECT_URL=' + dbUrl);
              console.log('NODE_ENV=production');
              
              console.log('\n' + '='.repeat(60));
              console.log('📋 配置步骤:');
              console.log('='.repeat(60));
              console.log('1. 登录 https://vercel.com/dashboard');
              console.log('2. 选择你的项目');
              console.log('3. 点击 "Settings" 标签');
              console.log('4. 点击 "Environment Variables"');
              console.log('5. 添加上述环境变量');
              console.log('6. 确保所有变量都设置为 "Production" 环境');
              console.log('7. 重新部署项目');
              
              console.log('\n' + '='.repeat(60));
              console.log('✅ 配置完成！');
              console.log('='.repeat(60));
              
              rl.close();
            });
          });
        });
      });
    });
  });
});



