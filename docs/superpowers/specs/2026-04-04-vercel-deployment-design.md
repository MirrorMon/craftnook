# Vercel 部署设计文档 (2026-04-04)

本文档概述了将当前 Next.js 项目部署到 Vercel 的流程和配置要求。

## 1. 目标
通过 Vercel CLI 将项目链接并部署到生产环境，确保 Supabase 集成和 Vercel Analytics 正常工作。

## 2. 部署流程 (方案 1: Vercel CLI)

### 第一阶段：项目链接与初始化
1.  **执行命令**：运行 `npx vercel`。
2.  **交互式配置**：
    *   登录 Vercel 账号（如果尚未登录）。
    *   确认部署目录（默认为当前目录）。
    *   选择/创建项目名称（建议使用 `crafttool` 或 `my-project`）。
    *   确认 Next.js 预设配置（Vercel 会自动识别）。

### 第二阶段：环境变量配置
项目运行需要以下来自 Supabase 的环境变量：
*   `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目 URL。
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名访问 Key。

**配置方式**：
*   在 Vercel Dashboard -> Project Settings -> Environment Variables 中手动添加。
*   或使用 CLI 命令：`npx vercel env add NEXT_PUBLIC_SUPABASE_URL <value>`。

### 第三阶段：正式生产部署
1.  **执行命令**：`npx vercel --prod`。
2.  这将触发完整的构建过程并生成生产环境 URL。

## 3. 验证准则
- [ ] 生产环境 URL 可正常打开。
- [ ] 页面能正确从 Supabase 获取数据（如系列列表）。
- [ ] Server Actions（如 `publishSeriesAction`）在生产环境下执行无误。
- [ ] Vercel Analytics 成功初始化（在控制台无报错）。

## 4. 后续维护
- 启用 Git 集成：建议随后将项目关联到 GitHub 仓库，以实现自动部署。
- 域名配置：如有自定义域名，可在 Vercel 控制台进行绑定。
