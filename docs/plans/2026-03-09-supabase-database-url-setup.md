---
title: Supabase DATABASE_URL 获取教程
created: 2026-03-09
status: draft
owner: 傅俊豪
---

# Supabase DATABASE_URL 获取教程

这份教程只解决一件事：

**创建 Supabase 项目，并拿到 OfferPilot 需要的 `DATABASE_URL`。**

## 1. 先回答一个关键问题

当前这一步需要你手动操作。

原因：

- 我现在没有可用的 Supabase 官方 MCP 或控制台登录权限
- 所以我不能直接替你在 Supabase 后台创建项目

但后续流程可以按下面方式协作：

1. 你打开或登录 Supabase
2. 完成创建项目这一步
3. 把 `DATABASE_URL` 配到本地或 Vercel
4. 我继续完成 migration、联调和部署

## 2. 创建 Supabase 项目

操作路径：

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 登录账号
3. 点击 `New project`
4. 选择组织
5. 填写：
   - `Name`：推荐 `offerpilot`
   - `Database Password`：设置一个新密码并保存
   - `Region`：优先选离你和目标用户更近的区域
6. 点击创建

注意：

- 这个数据库密码会直接影响后面的 `DATABASE_URL`
- 一定要保存好，不然后面还要重置

## 3. 去哪里拿 DATABASE_URL

创建完成后，进入项目。

推荐路径：

1. 左侧找到 `Connect`
2. 进入 Postgres 连接信息页面
3. 找到 `Connection string`
4. 优先选择适合 serverless / pooling 的连接方式

对 OfferPilot 当前阶段，优先使用：

- `Transaction pooler`
- 或 Supabase 标注为适合 serverless runtime 的连接串

原因：

- 我们当前前端/API 运行在 Vercel
- Vercel 的函数执行环境更适合短连接和池化连接
- Supabase 官方文档说明 `Direct connection` 默认依赖 IPv6，更适合持久服务器；而 `Transaction pooler` 更适合 serverless / edge / transient connections

## 4. 你最后要复制的内容长什么样

你最终需要复制的是 `Transaction pooler` 那一条，格式大致像这样：

```env
DATABASE_URL=postgres://postgres.<project-ref>:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

注意两点：

1. 把其中的数据库密码替换成你创建项目时设置的密码
2. 不要把这个值提交到 Git 仓库

补充判断：

- 你刚刚给我的这个：

```text
postgresql://postgres:[PASSWORD]@db.ouztklyuapapgatqjucl.supabase.co:5432/postgres
```

这是 `Direct Connection String`

- 它不是当前 OfferPilot 首选
- 现在请你回到 `Connect` 面板，切换到 `Transaction pooler`
- 然后把那条 `6543` 的连接串发我

## 5. 这个值应该配置到哪里

### 本地开发

放在本地 `.env.local`：

```env
DATABASE_URL=你的 Supabase Postgres 连接串
GEMINI_API_KEY=你的 Google AI API Key
GEMINI_MODEL=你想试的模型名
```

### 线上运行

不要优先放 GitHub repo secrets。

对 OfferPilot 这种 Web 应用来说，运行时环境变量应该优先放在：

- `Vercel Project Environment Variables`

原因：

- GitHub repo secrets 主要给 `GitHub Actions` 工作流用
- 我们的 Next.js 应用真正运行在 `Vercel`
- 所以运行时读取环境变量，应该从 Vercel 项目配置里拿

结论：

- `GitHub Secrets`：只在以后做 CI/CD workflow 时需要
- `Vercel Environment Variables`：当前真正必须

## 6. 拿到 DATABASE_URL 之后你要做什么

拿到后，下一步是：

1. 本地配置 `.env.local`
2. 在 Vercel 项目里配置同名变量
3. 跑数据库 migration
4. 验证 `/jobs/new -> /jobs/[jobId]` 是否真的落库

## 7. 关于 Gemini 模型名

这个模型名已经可以确认。

Google 官方 Gemini 3 文档里直接给了下面这个模型：

```text
gemini-3.1-pro-preview
```

所以 OfferPilot 当前默认就按这个模型来配。

如果后面 Google 改了 preview 版本策略，再按官方文档调整。

## 8. 当前 OfferPilot 需要的最小环境变量

```env
DATABASE_URL=你的 Supabase Postgres 连接串
GEMINI_API_KEY=你的 Google AI API Key
GEMINI_MODEL=gemini-3.1-pro-preview
```

## 9. 官方文档

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Drizzle guide](https://supabase.com/docs/guides/database/drizzle)
- [Supabase serverless Postgres connections](https://supabase.com/docs/guides/database/connecting-to-postgres/serverless-drivers)
- [Supabase connection strings reference](https://supabase.com/docs/reference/postgres/connection-strings)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [GitHub Actions secrets](https://docs.github.com/en/actions/reference/security/secrets)
- [Gemini 3 developer guide](https://ai.google.dev/gemini-api/docs/gemini-3)
