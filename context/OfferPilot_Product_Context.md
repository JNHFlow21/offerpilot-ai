---
title: OfferPilot Product Context
created: 2026-03-09
status: active
product_name: OfferPilot
repo_name: offerpilot-ai
repo_url: https://github.com/JNHFlow21/offerpilot-ai
---

# OfferPilot Product Context

## 1. 基本信息

- 产品名：`OfferPilot`
- GitHub 仓库：[`JNHFlow21/offerpilot-ai`](https://github.com/JNHFlow21/offerpilot-ai)
- 产品定位：`面向中文求职用户的 AI 求职准备工作台`

一句话定义：

**帮助用户完成 `登录 -> 上传并保存简历 -> 保存目标 JD -> 生成改写建议 -> 模拟面试` 的中文 AI 求职准备工作台。**

## 2. 为什么做这个产品

这个产品不是为了做一个泛用聊天机器人，而是为了同时实现 4 个目标：

1. 做出一个能写进简历的 AI 产品项目
2. 在做项目过程中覆盖 AI PM 高频考点
3. 在面试里能讲清楚产品思维、AI 理解、评测、指标和业务判断
4. 做成一个自己真的能持续使用和迭代的产品

## 3. 目标用户

第一阶段只服务一类用户：

**准备 AI 产品经理 / 产品经理 / AI 应用类岗位面试的求职者**

首批核心用户就是作者本人。

## 4. 核心用户痛点

1. 岗位 JD 看不懂，不知道该准备什么
2. 简历和目标岗位脱节，不知道该怎么改
3. 面试资料太散，知识点看了不会答
4. 不知道改完简历后最可能被问什么

## 5. 当前 MVP 核心范围

当前 MVP 只做 4 个用户核心能力：

1. `登录后保存并复用简历`
2. `保存目标 JD 并记录来源 URL`
3. `基于 JD + 平台知识库的简历改写建议`
4. `基于高频面经的模拟面试`

支撑能力：

- `平台预置知识库 / RAG`
- `用户资料 Memory`
- `结构化 Workflow`
- `Prompt 约束输出`
- `轻 Agent（后续用于多轮模拟）`

明确不做：

- 自动投递
- 视频/语音面试分析
- 社区功能
- 泛求职平台能力
- 大而全的通用 Agent

说明：

- 用户不需要自己配置 RAG
- 面经、常见问题、岗位知识点由平台预置和维护
- 用户主要只需要提供：`PDF 简历 + 目标 JD`
- 所有用户可见页面、按钮、表单、提示文案统一使用中文
- `知识库` 对普通用户默认隐藏为底层能力，不作为主流程页面暴露

## 6. 核心闭环

产品主路径：

1. 用户登录账号
2. 用户上传并保存 PDF 简历，系统解析成结构化简历档案
3. 用户粘贴目标岗位 JD，并保存岗位来源 URL
4. 系统拆解岗位要求、考察维度和面试重点
5. 系统按优先级生成简历改写建议：
   - 第一优先级：紧扣岗位 JD
   - 第二优先级：参考平台预置知识库
6. 用户查看建议并进入模拟面试
7. Agent 围绕高频问题和当前简历进行提问与追问

## 7. AI 方案拆解

这个产品的关键不是“接一个模型”，而是明确不同模块的 AI 角色。

### RAG

用于：

- 平台预置面经检索
- JD 解析辅助
- 简历改写建议
- 高频面试问题生成与追问支持

知识源包括：

- 平台维护的面经文档
- AI 产品知识笔记
- 岗位 JD
- 用户解析后的简历 / 项目经历

### Workflow

用于：

- JD 拆解
- PDF 简历结构化
- 简历改写
- 模拟面试问题生成
- 多轮追问与答题辅助组织

原因：

- 这些是高频、标准化、可控的任务

### Prompt

用于：

- 限制简历改写风格和信息边界
- 约束输出结构，避免大段泛泛润色
- 让面试辅助内容贴合 `JD + 简历 + 知识库`

原因：

- 这是你面试里必须能讲清楚的一层，不是可有可无的胶水

### Memory / 状态

分两类：

#### 用户长期记忆

- 登录账号信息
- 当前主简历
- 历史简历版本
- 目标岗位列表
- 已完成的岗位改写记录
- 已完成的模拟面试记录

#### 当前任务状态

- 当前正在准备哪个岗位
- 当前正在使用哪份简历
- 最近一次改写结果
- 当前模拟面试 session
- 推荐下一步动作

### 轻 Agent

用于：

- 多轮模拟面试
- 基于上一轮回答动态追问
- 根据高频问题和简历内容切换下一题

这里强调“轻 Agent”，不是做一个完全开放式全自动系统。

## 8. 关键指标

### 北极星指标

**每周完成有效岗位准备任务的用户数**

### 过程指标

- 岗位解析完成率
- 简历改写完成率
- 面试辅助使用率
- 完整准备闭环完成率
- 次日 / 7 日复用率

### 护栏指标

- 明显错误建议率
- 幻觉率
- 用户中途放弃率
- 平均响应时长
- 用户负向反馈率

## 9. 这个项目为什么适合写进简历

因为它天然覆盖了 AI PM 高频考点：

- Agent
- Workflow
- RAG
- Memory
- Prompt
- 幻觉
- 指标
- 评测
- MVP
- 产品闭环

建议简历项目名：

**AI 求职面试助手（RAG + Workflow + Memory）**

## 10. 面试中如何讲这个项目

推荐讲述顺序：

1. 背景：为什么做
2. 用户：谁在用
3. 痛点：为什么值得做
4. 产品：核心模块是什么
5. AI：为什么用 RAG / Workflow / Memory / 轻 Agent
6. 指标：如何定义成功
7. 评测：如何判断功能有效
8. 复盘：如果继续做会怎么扩展

## 11. 当前已有文档

关键文档：

- 设计稿：[2026-03-09-ai-job-interview-assistant-design.md](/Users/fujunhao/Desktop/OfferPilot/docs/plans/2026-03-09-ai-job-interview-assistant-design.md)
- PRD：[2026-03-09-ai-job-interview-assistant-prd.md](/Users/fujunhao/Desktop/OfferPilot/docs/plans/2026-03-09-ai-job-interview-assistant-prd.md)
- 落地规格：[2026-03-09-offerpilot-mvp-pages-data-stack.md](/Users/fujunhao/Desktop/OfferPilot/docs/plans/2026-03-09-offerpilot-mvp-pages-data-stack.md)
- 新阶段计划：[2026-03-09-phase-3-resume-rewrite-interview-assist-implementation.md](/Users/fujunhao/Desktop/OfferPilot/docs/plans/2026-03-09-phase-3-resume-rewrite-interview-assist-implementation.md)
- 冻结版下一阶段计划：[2026-03-09-phase-4-single-workspace-auth-pdf-interview.md](/Users/fujunhao/Desktop/OfferPilot/docs/plans/2026-03-09-phase-4-single-workspace-auth-pdf-interview.md)
- 云端配置：[2026-03-09-offerpilot-cloud-setup.md](/Users/fujunhao/Desktop/OfferPilot/docs/plans/2026-03-09-offerpilot-cloud-setup.md)
- Supabase 教程：[2026-03-09-supabase-database-url-setup.md](/Users/fujunhao/Desktop/OfferPilot/docs/plans/2026-03-09-supabase-database-url-setup.md)
- 行程文档：[OfferPilot_Project_Journey.md](/Users/fujunhao/Desktop/OfferPilot/context/OfferPilot_Project_Journey.md)

补充面试知识库：

- 当前仓库内尚未迁入对应知识库文档；后续如果整理面经/题库/知识笔记，也统一放到 `/Users/fujunhao/Desktop/OfferPilot` 下维护。

## 12. 在新 repo 开始时，Codex 应该直接继续做什么

推荐起手顺序：

1. 保持单工作台主路径，不再扩散页面
2. 先做：
   - 登录系统
   - PDF 简历上传与结构化
   - JD 保存与来源 URL
   - 中文单工作台
3. 再接：
   - 改写建议
   - 模拟面试
4. 最后再考虑：
   - 记录与薄弱项追踪
   - 面经回流机制

## 13. 可直接贴给新会话的启动上下文

可以直接把下面这段贴给新开的 Codex repo：

```text
我们正在做一个名为 OfferPilot 的产品，仓库是 https://github.com/JNHFlow21/offerpilot-ai 。

产品定位：面向中文求职用户的 AI 求职准备工作台。

一句话定义：帮助用户完成 登录 -> 上传并保存简历 -> 保存目标 JD -> 生成改写建议 -> 模拟面试 的中文 AI 求职准备工具。

当前 MVP 只做四个用户核心能力：
1. 登录后保存并复用简历
2. 保存目标 JD 并记录来源 URL
3. 基于 JD + 平台知识库的简历改写建议
4. 基于高频面经的模拟面试

AI 方案：
- RAG：预置面经、JD、简历/项目资料检索
- Workflow：JD 拆解、简历改写、问题生成
- Memory：用户长期信息和简历/JD 任务状态
- Prompt：结构化改写和答题辅助约束
- 轻 Agent：后续用于多轮模拟和动态追问

请基于这个方向，继续从页面级功能清单、数据结构和 MVP 实现开始推进。
```
