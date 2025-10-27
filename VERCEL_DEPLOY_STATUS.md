# Vercel 部署状态排查

## 当前状态
根据您提供的截图，部署显示 "504 Gateway Time-out"。

## 可能的原因

### 1. Supabase 连接问题
- 检查 Supabase 项目是否正常运行
- 确认数据库表是否已创建
- 验证 RLS 策略是否正确配置

### 2. 环境变量未配置
在 Vercel 项目中需要配置以下环境变量：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY`

### 3. API 超时
Supabase 响应可能超过 Vercel 的函数超时限制

## 解决步骤

### 步骤 1：检查 Supabase
1. 访问 https://supabase.com/dashboard/project/fdcvhljebxmbystscrwl
2. 确认项目状态为 "Active"
3. 检查 Table Editor 中是否有：
   - `used_celebrities` 表
   - `celebrities_queue` 表

### 步骤 2：验证 RLS 策略
在 Supabase SQL Editor 中运行：

```sql
SELECT * FROM pg_policies WHERE tablename = 'used_celebrities';
SELECT * FROM pg_policies WHERE tablename = 'celebrities_queue';
```

应该看到 "Allow all operations" 策略。

### 步骤 3：检查 Vercel 环境变量
1. 访问 Vercel Dashboard
2. 进入 inspire 项目
3. 点击 Settings → Environment Variables
4. 确认有 3 个变量：
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - OPENROUTER_API_KEY

### 步骤 4：重新部署
如果环境变量已配置，点击 "Redeploy" 重新部署。

## 联系方式
如果问题持续，请检查 Vercel 和 Supabase 的日志获取更多细节。

