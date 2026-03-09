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
- 产品定位：`面向 AI/产品岗求职者的 AI 面试准备 Copilot`

一句话定义：

**帮助用户把 `JD 解析 -> 知识学习 -> 模拟面试 -> 薄弱项追踪` 串成闭环的 AI 求职面试助手。**

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
2. 面试资料太散，知识点看了不会答
3. 缺少高质量模拟面试与反馈
4. 练习记录无法沉淀，薄弱项不清楚

## 5. MVP 核心范围

MVP 只做 4 个模块：

1. `JD 解析`
2. `知识库问答`
3. `模拟面试`
4. `练习记录与薄弱项追踪`

明确不做：

- 自动投递
- 视频/语音面试分析
- 社区功能
- 泛求职平台能力
- 大而全的通用 Agent

## 6. 核心闭环

产品主路径：

1. 用户输入目标岗位 JD
2. 系统拆解考察维度和准备重点
3. 用户导入简历 / 项目 / 资料
4. 系统提供个性化知识问答和题库
5. 用户进行模拟面试
6. 系统评分、反馈、改写建议
7. 系统记录薄弱项并推荐下一轮练习

## 7. AI 方案拆解

这个产品的关键不是“接一个模型”，而是明确不同模块的 AI 角色。

### RAG

用于：

- 面经问答
- JD 解析辅助
- 知识点解释
- 项目包装建议

知识源包括：

- 岗位 JD
- 面经文档
- AI 产品知识笔记
- 用户自己的项目笔记

### Workflow

用于：

- JD 拆解
- 题型归类
- 回答评分
- 复盘总结

原因：

- 这些是高频、标准化、可控的任务

### Memory / 状态

分两类：

#### 用户长期记忆

- 目标岗位
- 目标城市
- 简历版本
- 项目列表
- 偏弱题型

#### 当前任务状态

- 正在练哪一题
- 历次评分
- 高频错误
- 推荐下一步动作

### 轻 Agent

用于：

- 多轮模拟面试
- 动态追问
- 基于用户表现调整下一题

这里强调“轻 Agent”，不是做一个完全开放式全自动系统。

## 8. 关键指标

### 北极星指标

**每周完成有效面试训练任务的用户数**

### 过程指标

- 岗位解析完成率
- 知识问答使用率
- 模拟面试提交率
- 完整训练闭环完成率
- 次日 / 7 日复练率

### 护栏指标

- 明显错误回答率
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
- 云端配置：[2026-03-09-offerpilot-cloud-setup.md](/Users/fujunhao/Desktop/OfferPilot/docs/plans/2026-03-09-offerpilot-cloud-setup.md)
- 行程文档：[OfferPilot_Project_Journey.md](/Users/fujunhao/Desktop/OfferPilot/context/OfferPilot_Project_Journey.md)

补充面试知识库：

- 当前仓库内尚未迁入对应知识库文档；后续如果整理面经/题库/知识笔记，也统一放到 `/Users/fujunhao/Desktop/OfferPilot` 下维护。

## 12. 在新 repo 开始时，Codex 应该直接继续做什么

推荐起手顺序：

1. 先搭页面级功能清单
2. 定义数据结构和状态结构
3. 选技术栈
4. 先实现 MVP 的主路径：
   - JD 解析
   - 知识库问答
   - 模拟面试
   - 练习记录

## 13. 可直接贴给新会话的启动上下文

可以直接把下面这段贴给新开的 Codex repo：

```text
我们正在做一个名为 OfferPilot 的产品，仓库是 https://github.com/JNHFlow21/offerpilot-ai 。

产品定位：面向 AI/产品岗求职者的 AI 面试准备 Copilot。

一句话定义：帮助用户把 JD 解析 -> 知识学习 -> 模拟面试 -> 薄弱项追踪 串成闭环的 AI 求职面试助手。

MVP 只做四个模块：
1. JD 解析
2. 知识库问答
3. 模拟面试
4. 练习记录与薄弱项追踪

AI 方案：
- RAG：面经、JD、知识库问答
- Workflow：JD 拆解、评分、复盘
- Memory：用户长期信息和任务状态
- 轻 Agent：多轮模拟和动态追问

请基于这个方向，继续从页面级功能清单、数据结构和 MVP 实现开始推进。
```
