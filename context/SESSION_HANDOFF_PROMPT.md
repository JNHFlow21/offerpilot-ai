# OfferPilot Session Handoff Prompt

```text
我们现在继续做一个 AI 产品项目，产品名叫 OfferPilot。

重要约束：
从现在开始，这个项目相关的所有文件、文档、实现代码、PRD、设计稿、脚本，都统一放在这个文件夹里：
/Users/fujunhao/Desktop/OfferPilot

GitHub 仓库：
https://github.com/JNHFlow21/offerpilot-ai

产品定位：
一个面向 AI/产品岗求职者的 AI 面试准备 Copilot，帮助用户把 JD 解析 -> 知识学习 -> 模拟面试 -> 薄弱项追踪 串成闭环。

你先读取并理解这些已有文档，再继续往下推进，不要重复做前面的分析：

1. /Users/fujunhao/Desktop/OfferPilot/context/OfferPilot_Product_Context.md
2. /Users/fujunhao/Desktop/OfferPilot/docs/plans/2026-03-09-ai-job-interview-assistant-design.md
3. /Users/fujunhao/Desktop/OfferPilot/docs/plans/2026-03-09-ai-job-interview-assistant-prd.md

当前共识：
- MVP 只做 4 个模块：JD 解析、知识库问答、模拟面试、练习记录与薄弱项追踪
- AI 方案拆分：
  - RAG：面经、JD、知识库问答
  - Workflow：JD 拆解、评分、复盘
  - Memory：用户长期信息和任务状态
  - 轻 Agent：多轮模拟和动态追问
- 当前目标不是继续写概念文档，而是直接进入产品落地

你接下来请直接做这件事：
基于现有 PRD，继续输出“页面级功能清单 + 数据结构设计 + MVP 技术栈建议”，并尽量写成可以直接开始实现的形式。

要求：
- 不要重复泛泛总结项目背景
- 直接承接已有文档继续做
- 输出要偏产品落地和工程可执行
- 如果需要创建新文档，全部放在 /Users/fujunhao/Desktop/OfferPilot 下面继续维护
```
