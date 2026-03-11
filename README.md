# OfferPilot

<div align="center">

![OfferPilot Banner](https://img.shields.io/badge/OfferPilot-AI%20Job%20Prep%20Copilot-111111?style=for-the-badge&labelColor=F6F1E8&color=111111)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-Flash%20%2B%20Pro-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-Production-000000?style=for-the-badge&logo=vercel&logoColor=white)

**面向中文求职用户的 AI 求职准备工作台**

上传 PDF 简历，粘贴目标 JD，系统自动完成 `解析 -> 改写建议 -> 模拟面试`。

[在线体验](https://offerpilot-ai.vercel.app) · [项目仓库](https://github.com/JNHFlow21/offerpilot-ai)

</div>

---

## 产品截图式概览

```mermaid
flowchart LR
    A["登录账号"] --> B["上传 PDF 简历"]
    B --> C["保存目标 JD + 来源 URL"]
    C --> D["JD 解析"]
    D --> E["简历改写建议"]
    E --> F["一问一答模拟面试"]
    F --> G["反馈 / 参考答案 / 记录沉淀"]
```

## 为什么做这个产品

OfferPilot 不是一个泛聊天机器人，而是一个围绕真实求职任务设计的 AI 工作台。

它聚焦 4 个高频痛点：

- 简历和目标岗位 JD 脱节，不知道该怎么改
- 面经、知识点、岗位要求分散，越看越乱
- 模拟面试难以持续推进，也缺少逐题反馈
- 用户不想自己折腾 RAG、向量库和知识库配置

## 核心价值

### 对用户

- 只做两件输入：`上传简历`、`提交 JD`
- 不需要配置知识库，平台预置面经与高频问题
- 自动给出改写建议，并直接进入模拟面试

### 对 AI 产品项目包装

- 覆盖 `RAG / Workflow / Prompt / 轻 Agent / Memory`
- 有清晰主路径，不是拼凑式 AI demo
- 可讲产品定位、能力拆分、结构化输出、评测与性能优化

## 产品北极星

> 每周完成一次有效岗位准备闭环的用户数

### 核心指标盘

```mermaid
pie showData
    title MVP 指标框架
    "JD 解析完成率" : 20
    "改写完成率" : 24
    "面试启动率" : 22
    "闭环完成率" : 20
    "7日复用率" : 14
```

### 体验优先级

```mermaid
flowchart LR
    A["高优先级 / 低复杂度<br/>单工作台流程"] --> B["高优先级 / 中复杂度<br/>PDF 简历解析"]
    B --> C["高优先级 / 中复杂度<br/>持续问答面试"]
    C --> D["中优先级 / 中高复杂度<br/>薄弱项追踪"]
    D --> E["低优先级 / 高复杂度<br/>复杂知识库后台"]
    E --> F["低优先级 / 高复杂度<br/>语音面试"]
```

## 当前 MVP 范围

```mermaid
mindmap
  root((OfferPilot MVP))
    登录与用户态
      邮箱登录
      路由保护
      当前用户上下文
    简历输入
      PDF 上传
      结构化解析
      持久化复用
    目标岗位
      JD 保存
      来源 URL
      JD 解析
    准备方案
      简历改写建议
      引用约束知识增强
      面试角度提炼
    模拟面试
      一问一答
      动态追问
      反馈
      参考答案
```

## AI 能力拆分

OfferPilot 不把所有问题都塞给一个“大 Agent”，而是按任务分层。

| 能力层 | 用途 | 在产品中的位置 |
| --- | --- | --- |
| `RAG` | 检索面经、岗位知识、高频问题 | JD 解析增强、改写建议增强、面试问题增强 |
| `Workflow` | 结构化执行固定任务 | PDF 简历解析、JD 解析、改写建议生成 |
| `Prompt` | 限制风格、控制边界、结构化输出 | 改写摘要、问题反馈、参考答案 |
| `轻 Agent` | 多轮提问、动态追问、状态推进 | 一问一答模拟面试 |
| `Memory` | 复用当前用户简历、岗位、会话记录 | 登录后工作台与 session 恢复 |

### 模型分工

```mermaid
flowchart TB
    A["用户提交 PDF 简历 + JD"] --> B["Gemini Flash<br/>JD 解析"]
    B --> C["Gemini Pro<br/>简历改写"]
    C --> D["Gemini Pro<br/>面试反馈 / 参考答案"]
    B --> E["RAG 检索层"]
    E --> C
    E --> D
```

### 为什么这么分

- `Flash` 更适合首屏解析，降低等待时间
- `Pro` 更适合改写建议和面试反馈，保证质量
- 面试不一次性全部生成，而是按 turn 增量推进

## 用户主路径

```mermaid
sequenceDiagram
    autonumber
    actor U as 用户
    participant W as 中文工作台
    participant A as AI Workflow
    participant R as RAG 知识层
    participant D as Supabase

    U->>W: 登录
    U->>W: 上传 PDF 简历
    W->>A: 解析简历
    A->>D: 保存当前简历与结构化结果
    U->>W: 粘贴目标 JD + 来源 URL
    W->>A: JD 解析
    A->>R: 检索相关知识片段
    R-->>A: 返回高相关面经与知识点
    A-->>W: 返回改写建议
    U->>W: 开始模拟面试
    W->>A: 启动 session
    loop 持续问答
        A-->>W: 当前问题
        U->>W: 回答
        W->>A: 提交回答
        A->>R: 检索追问支持材料
        A-->>W: 反馈 + 参考答案 + 下一题
    end
```

## 系统架构

```mermaid
flowchart TB
    subgraph Frontend["Frontend · Next.js App Router"]
        A["/login"]
        B["/prepare"]
        C["中文单工作台"]
    end

    subgraph API["Application Layer · Route Handlers / Services"]
        D["/api/prepare/run"]
        E["/api/interview/start"]
        F["/api/interview/turn"]
        G["Resume / Job / Knowledge Services"]
    end

    subgraph AI["AI Layer"]
        H["Gemini Flash<br/>JD Analysis"]
        I["Gemini Pro<br/>Resume Rewrite"]
        J["Gemini Pro<br/>Interview Evaluation"]
    end

    subgraph Data["Data Layer · Supabase + Drizzle"]
        K["Auth"]
        L["Postgres"]
        M["Knowledge Sources / Chunks"]
        N["Interview Sessions / Turns"]
    end

    A --> C
    B --> C
    C --> D
    C --> E
    C --> F
    D --> G
    E --> G
    F --> G
    G --> H
    G --> I
    G --> J
    G --> K
    G --> L
    G --> M
    G --> N
```

## 当前实现状态

```mermaid
flowchart LR
    subgraph Done["已完成"]
      A1["登录入口与路由保护"]
      A2["中文单工作台"]
      A3["PDF 简历解析"]
      A4["JD 保存与来源 URL"]
      A5["JD 解析"]
      A6["简历改写建议"]
      A7["一问一答模拟面试"]
      A8["动态追问"]
      A9["单题反馈与参考答案"]
    end
    subgraph Doing["进行中"]
      B1["首屏速度优化"]
      B2["PDF 原文件持久化"]
      B3["OAuth 完整接通"]
    end
    subgraph Next["待做"]
      C1["历史记录页"]
      C2["薄弱项追踪"]
      C3["记录聚合与趋势分析"]
    end
```

## 技术栈

| 维度 | 方案 |
| --- | --- |
| 前端 | Next.js 15 + React 19 |
| 后端 | Next.js Route Handlers |
| 数据库 | Supabase Postgres |
| 鉴权 | Supabase Auth |
| ORM | Drizzle ORM |
| AI SDK | OpenAI Node SDK（Gemini OpenAI-compatible endpoint） |
| 模型 | Gemini Flash / Gemini Pro |
| 文件解析 | `pdf-parse` + AI 结构化抽取 |
| 校验 | Zod |
| 测试 | Vitest + Testing Library |
| 部署 | Vercel |

## 数据模型总览

```mermaid
erDiagram
    USER_PROFILES ||--o{ JOB_TARGETS : owns
    USER_PROFILES ||--o{ RESUME_WORKSPACES : owns
    JOB_TARGETS ||--o{ JD_ANALYSES : has
    RESUME_WORKSPACES ||--o{ RESUME_REWRITES : has
    JOB_TARGETS ||--o{ RESUME_REWRITES : influences
    JOB_TARGETS ||--o{ INTERVIEW_SESSIONS : drives
    INTERVIEW_SESSIONS ||--o{ INTERVIEW_TURNS : contains
    KNOWLEDGE_SOURCES ||--o{ KNOWLEDGE_CHUNKS : splits
```

## 代码结构

```text
.
├── app/                    # Next.js 页面与 API 路由
├── components/             # 业务组件与表单
├── lib/
│   ├── ai/                 # prompts / schemas / model client config
│   ├── auth/               # 当前用户与登录态
│   ├── db/                 # Drizzle schema 与 DB client
│   └── services/           # JD、简历、知识、面试 workflow
├── supabase/
│   └── migrations/         # 数据库迁移
├── tests/                  # 单测与集成测试
├── context/                # 项目上下文与开发行程
└── docs/plans/             # PRD、实现计划、云端文档
```

## 本地启动

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

创建 `.env.local`，至少包含：

```bash
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxx
GEMINI_API_KEY=your_gemini_key
GEMINI_JD_MODEL=gemini-2.5-flash
GEMINI_REWRITE_MODEL=gemini-3.1-pro-preview
GEMINI_INTERVIEW_MODEL=gemini-3.1-pro-preview
```

### 3. 启动项目

```bash
pnpm dev
```

### 4. 运行测试

```bash
pnpm test
pnpm build
```

## 开发路线图

```mermaid
gantt
    title OfferPilot 迭代路线
    dateFormat  YYYY-MM-DD
    axisFormat  %m-%d
    section 已完成
    JD 解析 :done, a1, 2026-03-09, 1d
    知识库支撑层 :done, a2, 2026-03-09, 1d
    简历改写工作流 :done, a3, 2026-03-09, 1d
    中文单工作台 :done, a4, 2026-03-10, 1d
    登录保护 :done, a5, 2026-03-10, 1d
    持续问答模拟面试 :done, a6, 2026-03-10, 1d
    section 下一步
    PDF 原文件持久化 :active, b1, 2026-03-11, 2d
    OAuth 完整接入 :b2, 2026-03-11, 2d
    记录与薄弱项追踪 :b3, 2026-03-13, 3d
```

## 适合写进简历的点

- 从 0 到 1 定义中文 AI 求职工作台的产品定位、MVP 范围与主路径
- 将 AI 能力拆分为 `RAG / Workflow / Prompt / 轻 Agent`，而不是做泛聊天壳
- 设计 `简历上传 -> JD 解析 -> 改写建议 -> 模拟面试` 的可执行闭环
- 通过 staged pipeline 和模型分工优化首屏体验与回答质量

## 项目亮点速览

```mermaid
pie showData
    title OfferPilot 的 AI 能力构成
    "Workflow" : 30
    "RAG" : 25
    "Interview Agent" : 20
    "Prompt Guardrails" : 15
    "Memory / Persistence" : 10
```

## 相关文档

- [产品上下文](./context/OfferPilot_Product_Context.md)
- [项目行程](./context/OfferPilot_Project_Journey.md)
- [PRD](./docs/plans/2026-03-09-ai-job-interview-assistant-prd.md)
- [设计文档](./docs/plans/2026-03-09-ai-job-interview-assistant-design.md)
- [云端配置](./docs/plans/2026-03-09-offerpilot-cloud-setup.md)

---

<div align="center">

**OfferPilot**

把求职准备从“信息堆积”重构成“可执行的 AI 工作流”。

</div>
