import type { ResumeRewriteRecord } from "@/lib/ai/schemas/resume-rewrite";
import type { ResumeWorkspaceRecord } from "@/lib/ai/schemas/resume-workspace";
import type { InterviewQuestionOutline } from "@/lib/ai/schemas/interview-session";
import type { JobRecord } from "@/lib/services/job-repository";
import type { InterviewTurnRecord } from "@/lib/ai/schemas/interview-session";

export function buildInterviewTurnEvaluationPrompt(input: {
  workspace: ResumeWorkspaceRecord;
  job: JobRecord;
  rewrite: ResumeRewriteRecord;
  currentQuestion: string;
  answer: string;
  currentKind: "primary" | "follow_up";
  outline: InterviewQuestionOutline[];
}) {
  const outlineText = input.outline
    .map(
      (item, index) =>
        `${index + 1}. ${item.question}\n追问候选：${item.followUps.join("；") || "无"}\n回答框架：${item.answerFramework.join(" -> ") || "无"}`,
    )
    .join("\n\n");

  return [
    "你是一个中文 AI 面试官，需要对单轮回答做轻量评分，并决定是否追问。",
    "输出必须严格遵循 schema，不要输出额外解释。",
    "",
    "【岗位信息】",
    `公司：${input.job.companyName ?? "未提供"}`,
    `岗位：${input.job.roleName}`,
    `JD：${input.job.jdText}`,
    "",
    "【候选人简历摘要】",
    input.workspace.resumeSummary || input.workspace.rawResumeText,
    "",
    "【当前改写重点】",
    input.rewrite.rewriteSummary,
    "",
    "【当前面试大纲】",
    outlineText,
    "",
    "【当前问题】",
    input.currentQuestion,
    `当前问题类型：${input.currentKind}`,
    "",
    "【候选人回答】",
    input.answer,
    "",
    "请完成这三件事：",
    "1. 给当前回答打 1-5 分。",
    "2. 用中文给出一句到两句简短反馈。",
    "3. 给出一段 2-4 句的参考答案，代表一个更稳妥、更像优秀候选人的回答方式。",
    "4. 如果回答仍然值得深挖，并且当前是主问题，则决定 shouldAskFollowUp=true，并给出一条中文追问；否则为 false。",
    "",
    "要求：",
    "- 追问必须紧扣当前回答，不要跳题。",
    "- 不要重复已经问过的问题。",
    "- 如果回答已经足够清楚，就不要强行追问。",
    "- 参考答案必须紧扣 JD、当前简历重点和问题本身，不要编造不存在的经历。",
  ].join("\n");
}

export function buildNextInterviewQuestionPrompt(input: {
  workspace: ResumeWorkspaceRecord;
  job: JobRecord;
  rewrite: ResumeRewriteRecord;
  outline: InterviewQuestionOutline[];
  turns: InterviewTurnRecord[];
}) {
  const askedQuestions = input.turns
    .filter((turn) => turn.kind === "primary")
    .map((turn, index) => `${index + 1}. ${turn.question}`)
    .join("\n");

  return [
    "你是一个中文 AI 面试官，需要继续这场模拟面试。",
    "请基于当前岗位、简历重点、已问过的问题，生成下一道新的主问题。",
    "输出必须严格遵循 schema，不要输出额外解释。",
    "",
    "【岗位信息】",
    `公司：${input.job.companyName ?? "未提供"}`,
    `岗位：${input.job.roleName}`,
    `JD：${input.job.jdText}`,
    "",
    "【候选人简历摘要】",
    input.workspace.resumeSummary || input.workspace.rawResumeText,
    "",
    "【当前改写重点】",
    input.rewrite.rewriteSummary,
    "",
    "【已经问过的主问题】",
    askedQuestions || "暂无",
    "",
    "【现有面试大纲】",
    input.outline
      .map(
        (item, index) =>
          `${index + 1}. ${item.question}\n追问候选：${item.followUps.join("；") || "无"}\n回答框架：${item.answerFramework.join(" -> ") || "无"}`,
      )
      .join("\n\n"),
    "",
    "要求：",
    "- 新问题不能重复已经问过的主问题。",
    "- 继续围绕高频 AI 产品经理面试场景。",
    "- followUps 给 1-3 个，answerFramework 给 2-4 个关键点。",
    "- 问题要具体，能引导用户给出真实项目例子或判断过程。",
  ].join("\n");
}
