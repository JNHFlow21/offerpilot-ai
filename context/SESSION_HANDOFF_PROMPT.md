# OfferPilot Session Handoff Prompt

```text
我们现在继续做一个 AI 产品项目，产品名叫 OfferPilot。

重要约束：
从现在开始，这个项目相关的所有文件、文档、实现代码、PRD、设计稿、脚本，都统一放在这个文件夹里：
/Users/fujunhao/Desktop/OfferPilot

GitHub 仓库：
https://github.com/JNHFlow21/offerpilot-ai

产品定位：
一个面向中文求职用户的 AI 求职准备工作台，帮助用户完成 登录 -> 上传并保存简历 -> 保存目标 JD -> 生成改写建议 -> 模拟面试。

你先读取并理解这些已有文档，再继续往下推进，不要重复做前面的分析：

1. /Users/fujunhao/Desktop/OfferPilot/context/OfferPilot_Product_Context.md
2. /Users/fujunhao/Desktop/OfferPilot/docs/plans/2026-03-09-ai-job-interview-assistant-design.md
3. /Users/fujunhao/Desktop/OfferPilot/docs/plans/2026-03-09-ai-job-interview-assistant-prd.md

当前共识：
- 当前 MVP 只做 4 个用户核心能力：登录后保存并复用简历、保存目标 JD 并记录来源 URL、基于 JD + 平台知识库的简历改写建议、基于高频面经的模拟面试
- 支撑能力：
  - RAG：平台预置面经、JD、简历/项目资料检索
  - Workflow：PDF 简历结构化、JD 拆解、简历改写、模拟面试生成
  - Memory：登录用户的简历、JD、任务状态
  - Prompt：结构化改写和模拟面试约束
  - 轻 Agent：用于多轮模拟和动态追问
- 当前目标不是继续写概念文档，而是直接进入产品落地

额外约束：
- 所有用户可见页面统一使用中文
- 主入口是单工作台，不继续扩散多页面
- 用户不需要自己配置 RAG
- 普通用户主流程默认不暴露知识库页面

你接下来请直接做这件事：
基于现有 PRD，继续推进最核心 MVP：简历输入、JD 解析、简历按 JD 改写、面试辅助，并尽量写成可以直接开始实现的形式。

要求：
- 不要重复泛泛总结项目背景
- 直接承接已有文档继续做
- 输出要偏产品落地和工程可执行
- 如果需要创建新文档，全部放在 /Users/fujunhao/Desktop/OfferPilot 下面继续维护
```
