# 🚀 部署指南：人类群星闪耀时

## 📋 准备工作清单

- [ ] Supabase 账号
- [ ] Vercel 账号（可用 GitHub 登录）
- [ ] GitHub 账号
- [ ] OpenRouter API Key（已有）

## 🗄️ 第一步：创建 Supabase 数据库

### 1. 创建项目
1. 访问 https://supabase.com/dashboard
2. 点击 "New Project"
3. 填写信息：
   - **Name**: inspire（或任意名称）
   - **Database Password**: 记录下密码（重要！）
   - **Region**: 选择 Asia Pacific (Hong Kong)
4. 点击 "Create new project"
5. 等待 2-3 分钟创建完成

### 2. 创建数据表
1. 在 Supabase Dashboard 左侧菜单点击 "SQL Editor"
2. 点击 "New query"
3. 复制粘贴以下 SQL（来自 `supabase_schema.sql`）：

```sql
-- 已使用名人表
CREATE TABLE IF NOT EXISTS used_celebrities (
  id SERIAL PRIMARY KEY,
  celebrity_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 名人队列表
CREATE TABLE IF NOT EXISTS celebrities_queue (
  id INTEGER PRIMARY KEY DEFAULT 1,
  queue_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_celebrity_name ON used_celebrities(celebrity_name);
CREATE INDEX IF NOT EXISTS idx_celebrity_created ON used_celebrities(created_at DESC);

-- 启用 RLS
ALTER TABLE used_celebrities ENABLE ROW LEVEL SECURITY;
ALTER TABLE celebrities_queue ENABLE ROW LEVEL SECURITY;

-- 允许匿名访问（开发阶段）
CREATE POLICY "Allow all operations" ON used_celebrities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON celebrities_queue FOR ALL USING (true) WITH CHECK (true);

-- 初始化队列表
INSERT INTO celebrities_queue (id, queue_data) 
VALUES (1, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;
```

4. 点击 "Run" 执行 SQL
5. 确认看到 "Success. No rows returned"

### 3. 获取 API 密钥
1. 点击左侧菜单 "Settings" → "API"
2. 复制并保存：
   - **Project URL**：https://fdcvhljebxmbystscrwl.supabase.co
   - **anon public** key：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkY3ZobGplYnhtYnlzdHNjcndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MzUwMDUsImV4cCI6MjA3NzExMTAwNX0.0UzbJ5vgGD40ZerqtIRQ05QQekOv_siuCS_c3VnA0aY

## 🌐 第二步：部署到 Vercel

### 1. 准备 GitHub 仓库

```bash
# 在项目目录下
cd /Users/xmh/Desktop/独立开发者/ai编程/inspire

# 初始化 Git（如果还没有）
git init

# 添加文件
git add .

# 提交
git commit -m "人类群星闪耀时 - 初始版本"
```

### 2. 推送到 GitHub
1. 访问 https://github.com/new
2. 创建新仓库，名称为 `inspire`
3. 不要初始化 README（因为已有）
4. 复制仓库的 SSH 或 HTTPS 地址
5. 在项目目录执行：

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/inspire.git

# 推送到 GitHub
git push -u origin main
```

### 3. 部署到 Vercel
1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 "Add New..." → "Project"
4. 选择 `inspire` 仓库
5. 点击 "Import"
6. **添加环境变量**（重要！）：
   - 点击 "Environment Variables"
   - 添加以下 3 个变量：
     - `NEXT_PUBLIC_SUPABASE_URL` = 你的 Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 Supabase anon key
     - `OPENROUTER_API_KEY` = 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
7. 点击 "Deploy"
8. 等待 1-2 分钟部署完成
9. ✅ 获得你的公开链接！例如：`https://inspire-xxx.vercel.app`

## ✅ 第三步：测试

1. 访问你的 Vercel 链接
2. 点击"获取新名言"按钮
3. 确认能看到名言卡片
4. 检查 Supabase 数据库：应该能看到 `used_celebrities` 表中有数据

## 🎉 完成！

现在你可以：
- 将链接分享给好友：`https://your-app.vercel.app`
- 每半小时自动更新新名言
- 所有记录都保存在 Supabase，不会丢失

## 📝 本地开发（可选）

如果你想在本地修改代码：

1. 创建 `.env.local` 文件：
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=你的Supabase_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
OPENROUTER_API_KEY=你的API_Key
```

2. 运行本地服务器：
```bash
npm run dev
```

3. 访问 http://localhost:3000

## 🔧 常见问题

**Q: 部署后提示 "Failed to fetch"**
A: 检查环境变量是否正确配置在 Vercel

**Q: Supabase 连接失败**
A: 确认 RLS 策略已正确设置，允许匿名访问

**Q: API 配额不足**
A: 检查 OpenRouter 账户余额，需要充值

**Q: 如何更新代码**
A: 修改代码后提交到 GitHub，Vercel 会自动重新部署

## 📞 获取帮助

- Supabase 文档：https://supabase.com/docs
- Vercel 文档：https://vercel.com/docs
- Next.js 文档：https://nextjs.org/docs

---

祝部署顺利！🌟

