---
title: OfferPilot MVP 落地规格（页面、数据、技术栈）
created: 2026-03-09
status: draft
owner: 傅俊豪
related:
  - /Users/fujunhao/Desktop/OfferPilot/context/OfferPilot_Product_Context.md
  - /Users/fujunhao/Desktop/OfferPilot/docs/plans/2026-03-09-ai-job-interview-assistant-design.md
  - /Users/fujunhao/Desktop/OfferPilot/docs/plans/2026-03-09-ai-job-interview-assistant-prd.md
---

# OfferPilot MVP 落地规格

这份文档直接承接现有 PRD，目标不是继续讨论概念，而是把 MVP 拆到可以开始实现。

默认边界：

- 只做 Web 版
- 只做文字输入/输出
- 只做单用户起步，但数据结构保留多用户能力
- 只支持手动粘贴 JD、简历、项目、知识资料
- 只覆盖 4 个核心模块：`JD 解析`、`知识库问答`、`模拟面试`、`练习记录与薄弱项追踪`

## 1. 页面级功能清单

## 1.1 路由总览

| 路由 | 页面目标 | MVP 优先级 |
| --- | --- | --- |
| `/` | 首页总览，承接主路径和最近状态 | P0 |
| `/jobs/new` | 新建岗位目标并提交 JD | P0 |
| `/jobs/[jobId]` | 查看 JD 解析结果并进入下一步 | P0 |
| `/profile` | 维护简历、项目、个人背景 | P0 |
| `/knowledge` | 围绕 JD / 简历 / 资料进行知识问答 | P0 |
| `/interview/new` | 配置模拟面试场景 | P0 |
| `/interview/[sessionId]` | 进行多轮模拟、评分、追问 | P0 |
| `/records` | 查看练习记录、薄弱项和推荐动作 | P0 |

## 1.2 首页 `/`

页面目标：让用户一进来就知道自己当前准备进度，以及下一步应该做什么。

必须展示：

- 当前目标岗位卡片：岗位名、公司名、解析状态、上次更新时间
- 推荐下一步动作：`去补充背景`、`开始知识问答`、`开始模拟面试`
- 最近 3 次练习记录
- 当前薄弱项 Top 3
- 本周训练概览：练习次数、平均分、完成率

用户动作：

- 点击“新建岗位目标”
- 点击“继续上次面试”
- 点击“查看薄弱项详情”

后端依赖：

- `getDashboardSummary(userId)`
- `getLatestJobTarget(userId)`
- `getWeaknessSummary(userId)`

空状态：

- 没有岗位时只展示一个主 CTA：`先粘贴一个 JD`

## 1.3 新建岗位页 `/jobs/new`

页面目标：让用户尽快完成第一个 JD 录入和解析。

表单字段：

- `company_name`
- `role_name`
- `job_source_url`
- `jd_text`
- `target_city` 可选

页面行为：

- 提交后先写入 `job_targets`
- 调用 JD 解析 workflow
- 解析完成后跳转 `/jobs/[jobId]`

必须反馈：

- 解析中 loading 状态
- 文本过短 / 为空的表单错误
- 解析失败后的重试按钮

依赖服务：

- `createJobTarget`
- `runJdAnalysis`

## 1.4 岗位详情页 `/jobs/[jobId]`

页面目标：把原始 JD 变成可执行准备清单，并把后续页面串起来。

必须展示：

- 原始 JD 折叠区
- 岗位关键词
- 能力维度拆解
- 高频题型分布
- 推荐准备顺序
- 推荐知识点
- 推荐题目清单

页面动作：

- `加入当前训练目标`
- `去知识库提问`
- `直接开始模拟面试`
- `重新解析`

建议组件：

- `JobHeaderCard`
- `CapabilityTagGroup`
- `PrepChecklist`
- `RecommendedQuestionList`
- `NextActionPanel`

依赖服务：

- `getJobTarget(jobId)`
- `getJdAnalysis(jobId)`
- `generatePracticeQuestions(jobId, profileId)`

## 1.5 个人背景页 `/profile`

页面目标：给后续个性化问答和模拟提供用户上下文。

必须展示：

- 简历文本输入区
- 项目经历列表
- 目标岗位偏好
- 自我介绍草稿

核心字段：

- `resume_text`
- `resume_summary`
- `years_of_experience`
- `target_roles[]`
- `projects[]`

页面动作：

- 保存简历文本
- 新增 / 编辑项目
- 标记主打项目

实现建议：

- 不做文件解析上传，MVP 直接支持粘贴文本
- 项目经历拆成结构化字段，避免后续 prompt 每次重切

依赖服务：

- `upsertUserProfile`
- `createProject`
- `updateProject`

## 1.6 知识库问答页 `/knowledge`

页面目标：让用户围绕岗位和个人资料进行结构化问答，而不是泛聊天。

页面布局建议：

- 左侧：知识源筛选区
- 中间：问答主区域
- 右侧：引用片段 / 推荐追问 / 关联技能标签

必须能力：

- 自然语言提问
- 选择作用范围：`全部资料` / `当前 JD` / `简历项目` / `面经知识库`
- 返回结构化回答
- 显示引用片段和来源
- 支持“基于此题去模拟”

问题模板快捷入口：

- 这个岗位为什么会考 `RAG / Agent / 指标`
- 这个问题我该怎么回答
- 我的某个项目怎么包装成面试答案

依赖服务：

- `searchKnowledge`
- `answerKnowledgeQuestion`
- `logKnowledgeInteraction`

空状态：

- 没有任何知识源时，提示先完成 `JD` 或 `个人背景`

## 1.7 模拟配置页 `/interview/new`

页面目标：让用户明确本轮模拟的范围，避免一进来就进入失控对话。

必须配置项：

- 目标岗位
- 面试模式：`快速单题` / `完整一轮`
- 题型：`动机题`、`AI 基础题`、`项目深挖题`、`场景设计题`、`指标评测题`
- 难度：`基础` / `标准` / `挑战`
- 是否开启动态追问

页面动作：

- 创建 `interview_session`
- 预生成第一题
- 跳转 `/interview/[sessionId]`

依赖服务：

- `createInterviewSession`
- `generateNextQuestion`

## 1.8 模拟面试页 `/interview/[sessionId]`

页面目标：完成多轮问答、评分和追问。

必须展示：

- 当前题目
- 当前轮次
- 题型标签
- 用户回答输入区
- 提交按钮
- AI 反馈区
- 下一题 / 追问按钮

每轮输出必须结构化：

- 总分
- 维度分
- 问题点
- 改写建议
- 是否建议追问
- 推荐补课知识点

页面动作：

- 提交回答
- 查看追问
- 结束本轮模拟

不建议做：

- 语音输入
- 自动连续播放
- 完全开放式自由对话

依赖服务：

- `submitInterviewAnswer`
- `evaluateAnswer`
- `generateFollowUpQuestion`
- `completeInterviewSession`

## 1.9 练习记录页 `/records`

页面目标：把“练过什么”和“还差什么”可视化。

必须展示：

- 总练习次数
- 最近 10 次练习
- 按题型的平均分
- 薄弱项标签
- 高频错误原因
- 推荐下一轮练习

建议模块：

- `PerformanceTrendCard`
- `QuestionTypeScoreTable`
- `WeaknessTagBoard`
- `RecommendedNextActions`

依赖服务：

- `getPracticeHistory`
- `getSkillSignals`
- `getNextPracticeRecommendation`

## 2. 前后端边界与核心 API

MVP 不建议一开始引入复杂 Agent 框架。优先把 4 个核心任务做成 4 组稳定服务：

1. `jd-analysis-service`
2. `retrieval-service`
3. `interview-service`
4. `progress-service`

推荐 API / server action 边界如下：

| 能力 | 方法 | 说明 |
| --- | --- | --- |
| 创建岗位目标 | `POST /api/jobs` | 写入岗位原文 |
| 触发 JD 解析 | `POST /api/jobs/:id/analyze` | 调 workflow，返回结构化结果 |
| 获取岗位详情 | `GET /api/jobs/:id` | 读岗位 + 解析结果 |
| 保存用户背景 | `POST /api/profile` | upsert profile |
| 新增项目经历 | `POST /api/projects` | 写结构化项目 |
| 知识检索问答 | `POST /api/knowledge/ask` | 检索 + 生成回答 |
| 创建模拟会话 | `POST /api/interview/sessions` | 生成 session 与首题 |
| 提交回答 | `POST /api/interview/sessions/:id/turns` | 保存回答并返回评分 |
| 获取练习记录 | `GET /api/records` | 汇总记录和弱项 |

实现建议：

- 普通 CRUD 用 Next.js Server Actions
- 需要流式返回或长耗时任务的接口用 Route Handlers
- AI 输出全部走 `JSON schema + zod` 校验，不接受自由文本直接入库

## 3. 数据结构设计

## 3.1 领域对象总览

MVP 只保留 9 个核心表，避免过早拆太细：

1. `user_profiles`
2. `projects`
3. `job_targets`
4. `jd_analyses`
5. `knowledge_sources`
6. `knowledge_chunks`
7. `practice_questions`
8. `interview_sessions`
9. `interview_turns`

其中：

- 关系型数据存 PostgreSQL
- 向量检索仍然放在 PostgreSQL `pgvector`
- 统计结果优先实时聚合，必要时再加物化视图

## 3.2 枚举定义

```ts
export type QuestionType =
  | "motivation"
  | "ai_foundation"
  | "project_deep_dive"
  | "product_design"
  | "metrics_evaluation"
  | "business_case";

export type SourceType =
  | "jd"
  | "resume"
  | "project"
  | "interview_note"
  | "knowledge_note";

export type SessionMode = "single_question" | "full_round";

export type SessionStatus = "draft" | "active" | "completed" | "abandoned";

export type DifficultyLevel = "basic" | "standard" | "challenging";

export type SignalLevel = "weak" | "medium" | "strong";
```

## 3.3 表结构建议

### `user_profiles`

用途：保存用户长期信息，是 memory 的基础入口。

关键字段：

```sql
id uuid primary key references auth.users(id)
display_name text
target_roles text[] not null default '{}'
target_city text
years_of_experience int
resume_text text
resume_summary text
self_intro_draft text
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### `projects`

用途：保存用户可用于回答的项目经历。

关键字段：

```sql
id uuid primary key
user_id uuid not null references auth.users(id)
name text not null
role text
summary text not null
problem text
solution text
impact text
tech_tags text[] not null default '{}'
business_tags text[] not null default '{}'
is_featured boolean not null default false
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### `job_targets`

用途：保存一次岗位目标和原始 JD。

关键字段：

```sql
id uuid primary key
user_id uuid not null references auth.users(id)
company_name text
role_name text not null
target_city text
job_source_url text
jd_text text not null
status text not null default 'draft'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### `jd_analyses`

用途：保存 JD 解析 workflow 的结构化结果。

关键字段：

```sql
id uuid primary key
job_target_id uuid not null references job_targets(id) on delete cascade
keywords text[] not null default '{}'
capability_dimensions jsonb not null default '[]'
question_type_weights jsonb not null default '{}'
recommended_topics jsonb not null default '[]'
recommended_actions jsonb not null default '[]'
overall_summary text not null
model_name text
model_version text
raw_result jsonb not null
created_at timestamptz not null default now()
```

`capability_dimensions` 建议结构：

```json
[
  {
    "name": "AI 基础能力",
    "importance": 5,
    "evidence": ["熟悉 RAG", "理解评测指标"],
    "preparation_advice": "优先准备 Agent、RAG、评测"
  }
]
```

### `knowledge_sources`

用途：记录可检索资料的元信息。

关键字段：

```sql
id uuid primary key
user_id uuid not null references auth.users(id)
source_type text not null
title text not null
content_text text not null
job_target_id uuid references job_targets(id)
project_id uuid references projects(id)
metadata jsonb not null default '{}'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

说明：

- `JD`、`简历`、`项目`、`面经笔记` 都先统一抽象成 `knowledge_sources`
- 后续如果要支持上传文件，再往这层扩展

### `knowledge_chunks`

用途：存储切片后的检索单元。

关键字段：

```sql
id uuid primary key
source_id uuid not null references knowledge_sources(id) on delete cascade
user_id uuid not null references auth.users(id)
chunk_index int not null
content text not null
token_count int
embedding vector
metadata jsonb not null default '{}'
created_at timestamptz not null default now()
```

索引建议：

- `ivfflat` 或 `hnsw` 向量索引
- `(user_id, source_id)` 普通索引
- 需要关键词补充时增加 `tsvector`

### `practice_questions`

用途：作为题库和推荐题目的落地表。

关键字段：

```sql
id uuid primary key
user_id uuid not null references auth.users(id)
job_target_id uuid references job_targets(id)
question_type text not null
difficulty text not null
question_text text not null
source text not null default 'generated'
linked_skills text[] not null default '{}'
reference_source_ids uuid[] not null default '{}'
created_at timestamptz not null default now()
```

说明：

- 这张表用于复用推荐题目，不必每次都现生
- 可由 JD 解析结果和知识源共同生成

### `interview_sessions`

用途：保存一次模拟练习的会话级状态。

关键字段：

```sql
id uuid primary key
user_id uuid not null references auth.users(id)
job_target_id uuid references job_targets(id)
mode text not null
status text not null default 'active'
difficulty text not null
planned_question_count int not null default 1
current_turn int not null default 0
dynamic_follow_up_enabled boolean not null default true
started_at timestamptz not null default now()
completed_at timestamptz
summary jsonb
created_at timestamptz not null default now()
```

### `interview_turns`

用途：保存每一轮题目、回答、评分、追问结果。

关键字段：

```sql
id uuid primary key
session_id uuid not null references interview_sessions(id) on delete cascade
user_id uuid not null references auth.users(id)
turn_index int not null
question_type text not null
question_text text not null
question_source text not null default 'generated'
user_answer text
score_overall numeric(5,2)
score_breakdown jsonb not null default '{}'
feedback_summary text
strengths jsonb not null default '[]'
weaknesses jsonb not null default '[]'
rewrite_suggestion text
follow_up_question text
knowledge_gap_tags text[] not null default '{}'
created_at timestamptz not null default now()
submitted_at timestamptz
```

`score_breakdown` 建议结构：

```json
{
  "relevance": 4,
  "structure": 3,
  "ai_depth": 4,
  "product_judgment": 3,
  "business_sense": 2
}
```

## 3.4 可直接给 AI 服务的 TypeScript 结构

### JD 解析输出

```ts
export interface JdAnalysisResult {
  keywords: string[];
  capabilityDimensions: {
    name: string;
    importance: 1 | 2 | 3 | 4 | 5;
    evidence: string[];
    preparationAdvice: string;
  }[];
  questionTypeWeights: Record<QuestionType, number>;
  recommendedTopics: {
    topic: string;
    reason: string;
    priority: 1 | 2 | 3;
  }[];
  recommendedActions: string[];
  overallSummary: string;
}
```

### 知识库问答输出

```ts
export interface KnowledgeAnswerResult {
  answer: string;
  answerOutline: string[];
  citations: {
    sourceId: string;
    sourceTitle: string;
    chunkId: string;
    quote: string;
  }[];
  relatedQuestionTypes: QuestionType[];
  recommendedNextAction:
    | "start_interview"
    | "review_project"
    | "ask_follow_up"
    | "none";
}
```

### 面试评分输出

```ts
export interface InterviewEvaluationResult {
  overallScore: number;
  scoreBreakdown: {
    relevance: number;
    structure: number;
    aiDepth: number;
    productJudgment: number;
    businessSense: number;
  };
  strengths: string[];
  weaknesses: string[];
  rewriteSuggestion: string;
  shouldAskFollowUp: boolean;
  followUpQuestion?: string;
  knowledgeGapTags: string[];
}
```

## 3.5 派生指标和薄弱项计算

MVP 不单独建 `weaknesses` 表，优先从 `interview_turns` 聚合得到。

推荐聚合逻辑：

- 最近 10 轮回答中，某题型平均分 `< 3.2`，记为弱项
- 某 `knowledge_gap_tag` 在最近 5 次中出现 `>= 3` 次，提升优先级
- 连续两次同类题分数提升 `>= 0.8`，可从 `weak` 调整为 `medium`

可做成 SQL view：

- `v_question_type_performance`
- `v_recent_weakness_tags`
- `v_next_practice_recommendation`

## 4. 推荐技术栈

## 4.1 推荐方案

优先推荐：

- 前端：`Next.js App Router + TypeScript + Tailwind CSS`
- 鉴权/数据库/存储：`Supabase`
- ORM/SQL：`Drizzle ORM + SQL migration`
- LLM：`OpenAI Responses API`
- Embedding：`text-embedding-3-small`
- 结构化输出校验：`zod`
- 向量检索：`Postgres pgvector`
- 部署：`Vercel`
- 埋点：先用数据库事件表或 PostHog 二选一；MVP 可先只做数据库事件表

推荐原因：

- 单仓即可完成前端、后端、AI 编排和部署
- Supabase 原生 Postgres + RLS + pgvector，足够覆盖 MVP
- Next.js 直接承接页面和 API，不需要再拆一层 BFF
- OpenAI 的 Responses API 适合把 `JD 解析`、`评分`、`追问` 统一到一套接口

## 4.2 不推荐的方案

现阶段不建议：

- 一开始上 LangGraph / AutoGen / CrewAI
- 单独引入 Pinecone、Weaviate 这类额外向量库
- 前后端分仓
- 先做移动端
- 先做语音面试

原因：

- 当前最大风险是范围失控，不是基础设施不够高级

## 4.3 模型使用建议

MVP 默认模型组合：

- 在线主模型：`gpt-4o-mini`
- 高质量评分或复盘实验：`gpt-4o` 或 `o3-mini`
- 向量模型：`text-embedding-3-small`

模型分工建议：

- `gpt-4o-mini`：JD 解析、知识问答回答生成、题目生成、基础评分
- `gpt-4o`：只在你发现评分稳定性不够时作为对照组
- `text-embedding-3-small`：知识切片 embedding

工程要求：

- 所有模型输出使用结构化 schema
- 记录 `model_name` 和 `model_version`
- 关键 prompt 版本入库，便于后面讲评测和迭代

## 4.4 推荐项目目录

```text
/Users/fujunhao/Desktop/OfferPilot
  app/
    (app)/
      page.tsx
      jobs/
        new/page.tsx
        [jobId]/page.tsx
      profile/page.tsx
      knowledge/page.tsx
      interview/
        new/page.tsx
        [sessionId]/page.tsx
      records/page.tsx
    api/
      jobs/route.ts
      jobs/[jobId]/analyze/route.ts
      knowledge/ask/route.ts
      interview/sessions/route.ts
      interview/sessions/[sessionId]/turns/route.ts
  components/
  lib/
    ai/
      clients.ts
      prompts/
      schemas/
      jd-analysis.ts
      knowledge-answer.ts
      interview-evaluation.ts
      question-generation.ts
    db/
      schema/
      migrations/
    rag/
      chunk.ts
      embed.ts
      retrieve.ts
    services/
      dashboard-service.ts
      job-service.ts
      knowledge-service.ts
      interview-service.ts
      records-service.ts
  docs/
    plans/
```

## 5. 建议实施顺序

按可交付价值排序，建议直接这样开工：

1. 搭项目基础壳：路由、登录、数据库连接、UI shell
2. 先打通 `JD 录入 -> JD 解析 -> 岗位详情`
3. 再做 `个人背景 -> knowledge_sources -> 向量检索`
4. 接着做 `模拟配置 -> 模拟问答 -> 评分反馈`
5. 最后补 `records` 聚合页和推荐下一步

每一步的验收标准：

1. 用户能成功录入一个岗位并看到结构化解析
2. 用户能问一个问题并拿到带引用的回答
3. 用户能完成至少 1 轮问答并得到分数和改写建议
4. 用户能在记录页看到自己的弱项和下一步建议

## 6. 第一版实现注意点

- 不要把“知识库问答”做成普通 chat 页面，必须绑定来源和范围
- 不要把“模拟面试”做成自由闲聊，必须有 `题型`、`评分 rubric`、`会话状态`
- 不要把“薄弱项”完全交给模型口头总结，至少要有可重复的聚合规则
- 不要先做文件上传解析，MVP 直接文本粘贴更稳
- 不要一开始就追求多模型编排，先保证单路径稳定

如果下一步直接开始实现，优先先建：

- 数据库 migration
- `zod` 输出 schema
- `JD 解析` 与 `面试评分` 两条 workflow
