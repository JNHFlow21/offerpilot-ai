import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import {
  jdAnalysisJsonSchema,
  jdAnalysisSchema,
  type JdAnalysisResult,
} from "@/lib/ai/schemas/jd-analysis";

export interface JdAnalysisClient {
  analyzeJd(input: {
    companyName?: string;
    roleName: string;
    jdText: string;
    prompt: string;
  }): Promise<JdAnalysisResult | unknown>;
}

export class GeminiJdAnalysisClient implements JdAnalysisClient {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(
    apiKey = process.env.GEMINI_API_KEY,
    model = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview",
  ) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
    this.model = model;
  }

  async analyzeJd(input: {
    companyName?: string;
    roleName: string;
    jdText: string;
    prompt: string;
  }) {
    const response = await this.client.beta.chat.completions.parse({
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            "You turn job descriptions into structured interview preparation plans.",
        },
        {
          role: "user",
          content: input.prompt,
        },
      ],
      response_format: zodResponseFormat(jdAnalysisSchema, "jd_analysis"),
    });

    return response.choices[0]?.message.parsed ?? null;
  }
}

export class OpenAiJdAnalysisClient implements JdAnalysisClient {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(
    apiKey = process.env.OPENAI_API_KEY,
    model = process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  ) {
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set.");
    }

    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async analyzeJd(input: {
    companyName?: string;
    roleName: string;
    jdText: string;
    prompt: string;
  }) {
    const response = await this.client.responses.create({
      model: this.model,
      input: input.prompt,
      text: {
        format: {
          type: "json_schema",
          name: "jd_analysis",
          strict: true,
          schema: jdAnalysisJsonSchema,
        },
      },
    });

    return JSON.parse(response.output_text);
  }
}

export function getDefaultAiProvider() {
  if (process.env.GEMINI_API_KEY) {
    return "gemini";
  }

  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }

  return null;
}

export function createDefaultJdAnalysisClient(): JdAnalysisClient {
  const provider = getDefaultAiProvider();

  if (provider === "gemini") {
    return new GeminiJdAnalysisClient();
  }

  if (provider === "openai") {
    return new OpenAiJdAnalysisClient();
  }

  throw new Error(
    "No AI provider key found. Set GEMINI_API_KEY or OPENAI_API_KEY.",
  );
}
