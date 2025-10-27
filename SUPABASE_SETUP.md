# Supabase 设置指南

## 1. 创建 Supabase 项目

1. 访问 https://supabase.com/
2. 注册/登录账号
3. 点击 "New Project"
4. 填写项目信息：
   - **Name**: inspire
   - **Database Password**: 设置一个强密码
   - **Region**: 选择离你最近的区域（建议选择香港或新加坡）
5. 点击 "Create new project"

## 2. 创建数据库表

在 Supabase 的 SQL Editor 中运行以下 SQL：

```sql
-- 创建已使用名人表
CREATE TABLE used_celebrities (
  id SERIAL PRIMARY KEY,
  celebrity_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建名人队列表
CREATE TABLE celebrities_queue (
  id INTEGER PRIMARY KEY DEFAULT 1,
  queue_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提高查询性能
CREATE INDEX idx_celebrity_name ON used_celebrities(celebrity_name);
CREATE INDEX idx_celebrity_created ON used_celebrities(created_at DESC);
```

## 3. 获取 API 密钥

1. 在 Supabase 项目页面，点击左侧 "Settings" → "API"
2. 找到以下信息：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public key**: 以 `eyJ...` 开头的长字符串

## 4. 配置环境变量

### 本地开发环境

创建 `.env.local` 文件（如果还没有的话）：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENROUTER_API_KEY=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
```

### Vercel 环境变量

部署到 Vercel 后：
1. 进入 Vercel 项目设置页面
2. 点击 "Settings" → "Environment Variables"
3. 添加以下变量：
   - `NEXT_PUBLIC_SUPABASE_URL` = 你的 Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 Supabase anon key
   - `OPENROUTER_API_KEY` = 你的 OpenRouter API key

## 5. 禁用 Row Level Security (RLS)

为了简化操作，暂时不等 RLS，但需要允许匿名访问：

在 Supabase SQL Editor 中运行：

```sql
-- 允许匿名读取和写入
ALTER TABLE used_celebrities ENABLE ROW LEVEL SECURITY;
ALTER TABLE celebrities_queue ENABLE ROW LEVEL SECURITY;

-- 创建策略允许所有人访问
CREATE POLICY "Allow all operations" ON used_celebrities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON celebrities_queue FOR ALL USING (true) WITH CHECK (true);
```

## 6. 测试连接

运行本地开发服务器测试：

```bash
npm run dev
```

访问 http://localhost:3000 并点击"获取新名言"按钮，检查是否能正常使用。

## 7. 部署到 Vercel

按照主 README 中的步骤部署到 Vercel，记得添加环境变量。

---

**注意**: 这是临时方案。生产环境建议：
- 使用服务端 API 路由而不是公开的 anon key
- 启用更严格的 RLS 策略
- 考虑添加速率限制

