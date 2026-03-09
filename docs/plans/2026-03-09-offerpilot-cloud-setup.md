---
title: OfferPilot Cloud Setup
created: 2026-03-09
status: draft
owner: 傅俊豪
---

# OfferPilot Cloud Setup

这份文档用于把当前的 OfferPilot 从本地工程推进到真实云端运行。

## 1. 当前部署形态

当前推荐形态：

- 前端与 API：`Vercel`
- 数据库：`Supabase Postgres`
- 模型调用：`Google Gemini API`

这意味着用户最终使用的是一个网页产品，而不是自己配置数据库、RAG、embedding 或模型密钥。

用户体验应当是：

1. 打开网页
2. 登录
3. 粘贴 JD / 简历 / 项目经历
4. 直接开始使用

## 2. 当前阶段必须配置的环境变量

当前 `JD 解析` 链路最少需要：

- `DATABASE_URL`
- `GEMINI_API_KEY`

这些变量已经写入 [`.env.example`](/Users/fujunhao/Desktop/OfferPilot/.env.example)。

说明：

- `DATABASE_URL` 用于服务端通过 `Drizzle + postgres` 直连 Supabase Postgres
- `GEMINI_API_KEY` 用于 `JD analysis workflow`
- `OPENAI_API_KEY` 当前保留为兼容兜底，不是默认路径

## 3. 下一阶段会用到的 Supabase 环境变量

等接入登录和用户态后，再启用：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

当前代码还没有正式接入 `Supabase Auth`，所以这三项属于下一阶段准备项。

## 4. Supabase 配置步骤

1. 在 Supabase 创建项目
2. 打开项目的 `Connect` 面板
3. 复制适合 serverless / short-lived runtime 的连接串到 `DATABASE_URL`
4. 执行仓库里的 migration：

```bash
pnpm db:migrate
```

当前 migration 包括：

- [0001_initial_phase1.sql](/Users/fujunhao/Desktop/OfferPilot/supabase/migrations/0001_initial_phase1.sql)
- [0002_make_job_target_user_optional.sql](/Users/fujunhao/Desktop/OfferPilot/supabase/migrations/0002_make_job_target_user_optional.sql)

注意：

- 当前为了在未接入 Auth 的阶段先跑通 `JD 解析`，`job_targets.user_id` 暂时允许为空
- 等接入 `Supabase Auth` 后，再把用户归属约束收紧

## 5. Vercel 配置步骤

1. 在 Vercel 导入这个 GitHub 仓库
2. 在项目设置里添加环境变量：
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL=gemini-3.1-pro-preview`
3. 先发 Preview Deployment
4. 验证 `JD 录入 -> 解析结果页` 走通后，再考虑 Production

补充：

- `Vercel Environment Variables` 才是当前 Web 应用运行时真正读取的位置
- `GitHub repo secrets` 只在以后你引入 `GitHub Actions` 工作流时才有必要

## 6. 当前代码状态

当前代码已经具备以下行为：

- 本地开发时，如果没有 `DATABASE_URL`，会退回内存 repository，方便前端/页面调试
- 生产环境或 Vercel 环境下，如果没有 `DATABASE_URL`，会直接报错，避免“假上线”
- 一旦补上 `DATABASE_URL`，`/api/jobs` 和 `/api/jobs/[jobId]/analyze` 就会切到真实数据库持久化路径
- AI provider 默认优先选 `Gemini`；如果配置了 `GEMINI_API_KEY`，不会依赖 OpenAI

## 7. 官方文档参考

- [Supabase Drizzle guide](https://supabase.com/docs/guides/database/drizzle)
- [Supabase Postgres connection guide](https://supabase.com/docs/guides/database/connecting-to-postgres/serverless-drivers)
- [Supabase Next.js SSR client guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Google Gemini OpenAI compatibility](https://ai.google.dev/gemini-api/docs/openai)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Vercel deployments](https://vercel.com/docs/deployments)
