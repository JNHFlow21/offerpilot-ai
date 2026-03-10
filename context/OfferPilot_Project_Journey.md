---
title: OfferPilot Project Journey
created: 2026-03-09
status: active
owner: 傅俊豪
product_name: OfferPilot
---

# OfferPilot Project Journey

这份文档用于持续记录 OfferPilot 的开发流程、阶段目标和项目进展。

## 1. 产品开发形态

OfferPilot 当前不是做一个独立运行的“通用 Agent”。

更准确的定义是：

**一个中文 Web 产品，里面包含 RAG、Workflow、Memory、Prompt，以及模拟面试场景下的轻 Agent 能力。**

可以理解为三层：

1. 产品层：`Web 页面 / 用户流程 / 数据记录`
2. AI 能力层：`PDF 简历解析`、`JD 解析`、`简历改写建议`、`模拟面试`
3. Agent 层：在 `模拟面试` 模块中承担多轮提问和动态追问

因此，开发对象是一个可使用的网页产品，而不是单独做一个聊天 Agent 壳。

## 2. 完整开发流程图

```mermaid
flowchart TD
    A["1. 定义范围与目标<br/>锁定 MVP 模块和非目标"] --> B["2. 产出实现文档<br/>PRD / 页面清单 / 数据结构 / 技术栈"]
    B --> C["3. 设计系统结构<br/>RAG / Workflow / Memory / 轻 Agent 边界"]
    C --> D["4. 搭建工程基础<br/>仓库 / 前端壳 / 数据库 / 鉴权 / API"]
    D --> E["5. 实现最小闭环 1<br/>JD 录入 -> JD 解析 -> 岗位详情"]
    E --> F["6. 实现最小闭环 2<br/>个人背景 -> 知识入库 -> 检索问答"]
    F --> G["7. 主路径纠偏<br/>中文单工作台 + PDF 简历 + JD 持久化"]
    G --> H["8. 实现最小闭环 4<br/>改写建议 -> 模拟问答 -> 评分反馈"]
    H --> I["9. 联调与测试<br/>功能测试 / AI 输出测试 / 体验测试"]
    I --> J["10. 部署上线<br/>预览环境 / 生产环境 / 基础监控"]
    J --> K["11. 迭代优化<br/>检索质量 / 评分稳定性 / 流程完成率"]
```

## 3. 分阶段说明

### 阶段 1：定义范围

目标：

- 明确当前 MVP 主路径是 `登录`、`上传并保存简历`、`保存 JD`、`改写建议`、`模拟面试`
- 明确不做用户自己配置 RAG、语音面试、复杂 Agent 编排

产出：

- 产品背景文档
- 设计文档
- PRD

### 阶段 2：产出实现规格

目标：

- 把概念文档转成可以开发的规格

产出：

- 页面级功能清单
- API 边界
- 数据表结构
- TypeScript schema
- MVP 技术栈方案

### 阶段 3：搭建工程基础

目标：

- 先把产品运行骨架搭起来

包含：

- 初始化独立仓库
- 搭建 Next.js 项目
- 接入 Supabase
- 建立数据库 migration
- 配置 OpenAI 调用层

### 阶段 4：实现业务闭环

按顺序完成 4 条主路径：

1. `JD 解析`
2. `知识库问答（支撑层）`
3. `简历按 JD 改写`
4. `模拟面试与记录沉淀`

原则：

- 先打通主路径，再补体验
- 先保证结构化输出稳定，再补 fancy 交互

### 阶段 5：测试与部署

测试分为三层：

1. 功能测试：页面和接口是否走通
2. AI 测试：输出是否稳定、是否可解析、是否低幻觉
3. 产品测试：用户能否完成一轮训练闭环

部署后重点看：

- 岗位解析完成率
- 简历改写完成率
- 面试辅助使用率
- 完整准备闭环完成率
- 平均响应时长

## 4. 开发顺序原则

OfferPilot 的推荐开发顺序：

1. 先写必要文档，不继续做空泛分析
2. 再定数据结构和 AI 输出 schema
3. 然后搭前后端工程壳
4. 再按模块逐个接 AI 能力
5. 最后做联调、测试和部署

对应到代码层就是：

1. `docs`
2. `database schema`
3. `service layer / AI workflows`
4. `frontend pages`
5. `integration`
6. `testing`
7. `deploy`

## 5. 当前项目状态

截至 `2026-03-09`：

- 已完成产品背景文档
- 已完成设计文档
- 已完成 PRD
- 已完成 MVP 页面级功能清单、数据结构设计、技术栈建议
- 已初始化 OfferPilot 独立 Git 仓库
- 已绑定 GitHub 远端仓库
- 已完成第一条 MVP 业务闭环并上线生产环境

## 6. MVP 模块状态

### 已完成

- [x] `能力一：JD 解析`
- [x] `能力二：知识库问答支撑层`
- [x] `/jobs/new -> /api/jobs -> /api/jobs/[jobId]/analyze -> /jobs/[jobId]`
- [x] `job_targets` / `jd_analyses` 真实落库到 Supabase
- [x] `gemini-3.1-pro-preview` 真实解析 JD 并返回结构化结果
- [x] Vercel 生产环境部署完成并验证 JD 解析链路可用
- [x] `/knowledge -> /api/knowledge/sources -> /api/knowledge/ask` 第一版知识库闭环
- [x] `knowledge_sources` / `knowledge_chunks` 真实落库到 Supabase
- [x] 第一版 source-bounded retrieval + citations 工作台已完成
- [x] `profile` 页面和用户背景持久化
- [x] `resume_workspaces + resume_rewrites + /api/resume + /api/resume/rewrite + /api/interview/assist + /prepare`
- [x] `中文单工作台骨架 + 登录入口 + PDF 简历上传入口 + JD 来源 URL`
- [x] `interview_sessions` / `interview_turns` 表与一问一答模拟面试 API`
- [x] `prepare staged fast path：先返回改写建议，再启动模拟面试`
- [x] `登录态路由保护 + 核心工作台 API 鉴权`
- [x] `工作台当前用户上下文 + 退出登录`
- [x] `模拟面试持续提问 + 单题反馈 + 参考答案`

### 进行中

- [ ] `单工作台体验继续压缩与提速`
- [ ] `登录系统 OAuth 完整接通`
- [ ] `PDF 原文件持久化到 Supabase Storage`
- [ ] `后续能力：记录与薄弱项追踪`

### 当前未做完的关键基础设施

- [x] `knowledge_sources` / `knowledge_chunks` 表与第一版检索链路
- [x] `resume_workspaces` / `resume_rewrites` 表与改写 workflow
- [x] `interview_sessions` / `interview_turns` 表与评分 workflow
- [ ] `resume_files` 或等价的文件存储映射`
- [ ] `records` 聚合页和薄弱项规则计算
- [ ] Supabase 项目 link 本地目录稳定化

## 7. 当前下一步

当前发现线上功能虽然可用，但主路径过于分散、英文过多、用户需要理解太多页面关系。下一阶段先进入 **MVP 冻结版重构：中文单工作台 + 登录 + PDF 简历 + JD 持久化 + 模拟面试**。

执行顺序固定为：

1. 接 `Supabase Auth`
2. 支持 `PDF 简历上传 + 持久化保存 + 结构化解析`
3. 扩充 `job_targets`：
   - 保存目标 JD
   - 保存来源 URL
   - 保留 JD 解析结果
4. 把主流程收敛到一个中文工作台：
   - 我的简历
   - 目标 JD
   - 改写建议
   - 模拟面试
5. 再接 `interview_sessions` / `interview_turns` 与多轮追问

对应实现计划：

- [2026-03-09-phase-4-single-workspace-auth-pdf-interview.md](/Users/fujunhao/Desktop/OfferPilot/docs/plans/2026-03-09-phase-4-single-workspace-auth-pdf-interview.md)

## 8. 进展记录

### 2026-03-09

- 新建项目上下文文档、设计文档、PRD
- 新增 MVP 落地规格文档，明确页面、数据结构和技术栈
- 新增本行程文档，并补充完整开发流程图
- 初始化 `/Users/fujunhao/Desktop/OfferPilot` 独立 Git 仓库
- 绑定 GitHub 远端仓库 `JNHFlow21/offerpilot-ai`
- 完成 Next.js 工程骨架、Vitest 测试环境、Drizzle phase 1 schema、JD analysis schema 和 workflow
- 搭出第一版 `JD 录入 -> 解析结果页` 页面流，当前用内存 store 过渡，下一步接真实数据库
- 完成 repository 重构：本地开发可用内存 fallback，配置 `DATABASE_URL` 后可切到真实 Postgres
- 补充云端配置模板与部署说明，当前只差真实 Supabase / OpenAI 环境变量即可接云端
- 已切换到 Gemini 作为默认模型，并确认 `gemini-3.1-pro-preview` 可实际完成 JD 解析
- 已连接 Supabase Transaction Pooler，并把 phase 1 migration 真正执行到云端数据库
- 已完成 Vercel / Supabase CLI 授权，可直接查看生产部署与项目状态
- 已定位并修复生产环境 `DATABASE_URL` 密码错误，`/api/jobs` 与 `/api/jobs/[jobId]/analyze` 已返回 `200`
- 已确认 MVP 第一个功能 `JD 解析` 正式完成
- 已完成 Phase 2 第一条切片：`/profile + /api/profile + user_profiles` 真实持久化
- 已完成 Phase 2 第二条切片：`knowledge_sources + knowledge_chunks + /api/knowledge/* + /knowledge`
- 已把 `0004_add_knowledge_tables.sql` 执行到 Supabase，并完成第一版 source-bounded retrieval + citations
- 已完成文档对齐：当前 MVP 主路径调整为 `简历输入 -> JD 解析 -> 简历按 JD 改写 -> 面试辅助`
- 已完成 Phase 3：`resume_workspaces + resume_rewrites + /api/resume + /api/resume/rewrite + /api/interview/assist + /prepare`
- 已把 `0005_add_resume_rewrite_tables.sql` 执行到 Supabase，并通过 `pnpm test` / `pnpm build`
- 已确认主路径体验仍然过于分散，下一步不继续堆页面，而是重构为中文单工作台

### 2026-03-10

- 已完成性能重构第一刀：`/prepare` 改成 staged fast path，先完成 `PDF 简历解析 + JD 解析 + 简历改写`，不再把面试辅助绑在第一次提交里
- 已切分 Gemini 模型职责：`JD 解析` 使用更快的 Flash 模型，`简历改写` 与 `面试评估` 继续使用 Pro 模型
- 已新增 `interview_sessions` / `interview_turns`、`/api/interview/start`、`/api/interview/turn`
- 已把模拟面试改成真正的一问一答：启动 session、当前题目、提交回答、反馈、追问 / 下一题
- 已新增 `middleware` 与核心 API 鉴权，未登录用户不能再直接绕过登录进入 `/prepare`
- 已把工作台主路径切到当前登录用户，不再把主工作台当作匿名全局状态
- 已把单题反馈扩展为 `评分 + 反馈 + 参考答案`
- 已把固定题纲改成持续提问：初始题纲耗尽后继续生成新的主问题
- 已将 `0006_add_interview_session_tables.sql` 执行到 Supabase
- 已通过 `pnpm test` / `pnpm build` 全量验证
- 下一步聚焦：进一步压缩首屏等待时间、补齐 PDF 文件持久化、完善真实登录后用户态与记录沉淀

## 9. 更新规则

后续每次有重要进展，都在这份文档补一条：

- 完成了什么
- 修改了哪些文档或代码
- 当前阻塞点是什么
- 下一步做什么
