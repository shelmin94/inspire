# 部署指南：人类群星闪耀时

## 🚀 快速部署步骤

### 第一步：设置 Supabase

1. **创建 Supabase 项目**
   - 访问 https://supabase.com/ 注册账号
   - 点击 "New Project" 创建新项目
   - 项目名称：inspire
   - 选择香港或新加坡区域（更快）
   - 等待创建完成（约2分钟）

2. **创建数据库表**
   - 进入 Supabase Dashboard
   - 点击左侧 "SQL Editor"
   - 复制粘贴 `supabase_schema.sql` 中的所有 SQL 代码并执行

3. **获取 API 密钥**
   - 点击 "Settings" → "API"
   - 复制以下信息：
     - Project URL
     - anon public key

### 第二步：设置环境变量

在你的项目根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase_anon_key
OPENROUTER_API_KEY=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
```

### 第三步：部署到 Vercel

1. **推送代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "初始提交：人类群星闪耀时"
   git remote add origin https://github.com/YOUR_USERNAME/inspire.git
   git push -u origin main
   ```

2. **部署到 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录
   - 点击 "Import Project"
   - 选择你的仓库
   - 配置环境变量（Settings → Environment Variables）：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `OPENROUTER_API_KEY`
   - 点击 "Deploy"

3. **等待部署完成**
   - 部署成功后，你会得到一个类似 `https://inspire-xxx.vercel.app` 的链接
   - 这就是你的公开访问地址！

### 第四步：测试

访问你的网站，点击"获取新名言"按钮测试功能是否正常。

## 📝 重要文件说明

- `SUPABASE_SETUP.md` - Supabase 详细设置说明
- `supabase_schema.sql` - 数据库表结构（待创建）
- `.env.local` - 本地环境变量（不要提交到 Git）

## ⚠️ 注意事项

1. **不要提交敏感信息**：
   - `.env.local` 已添加到 `.gitignore`
   - 不要在任何代码中硬编码 API Key

2. **Supabase 配置**：
   - 当前使用匿名访问策略
   - 生产环境建议添加 RLS 安全策略

3. **API 配额**：
   - OpenRouter 免费套餐有一定限制
   - 如遇到问题，检查 API 配额使用情况

4. **Vercel 部署**：
   - 会自动检测 Next.js 项目
   - 每次 push 代码会自动重新部署

## 🎉 完成！

现在你可以将网站链接分享给朋友了！

---

**需要帮助？** 
- Supabase 文档：https://supabase.com/docs
- Vercel 文档：https://vercel.com/docs

