import OpenAI from "openai";

import {
  jdAnalysisJsonSchema,
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

export class OpenAiJdAnalysisClient implements JdAnalysisClient {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(apiKey = process.env.OPENAI_API_KEY, model = "gpt-4o-mini") {
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
