import { desc, eq } from "drizzle-orm";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { getDefaultAiProvider } from "@/lib/ai/clients";
import {
  knowledgeAnswerJsonSchema,
  knowledgeAnswerSchema,
  type KnowledgeAnswer,
} from "@/lib/ai/schemas/knowledge-answer";
import {
  knowledgeChunkContextSchema,
  knowledgeChunkRecordSchema,
  knowledgeScopeSchema,
  knowledgeSourceInputSchema,
  knowledgeSourceRecordSchema,
  type KnowledgeChunkContext,
  type KnowledgeChunkRecord,
  type KnowledgeQuestionInput,
  type KnowledgeScope,
  type KnowledgeSourceInput,
  type KnowledgeSourceRecord,
} from "@/lib/ai/schemas/knowledge-source";
import { getDb } from "@/lib/db/client";
import { knowledgeChunks, knowledgeSources } from "@/lib/db/schema";

export interface CreateKnowledgeSourceResult {
  source: KnowledgeSourceRecord;
  chunks: KnowledgeChunkRecord[];
}

export interface KnowledgeAnswerClient {
  answer(input: {
    question: string;
    scope: KnowledgeScope;
    chunks: KnowledgeChunkContext[];
  }): Promise<KnowledgeAnswer>;
}

export interface KnowledgeStore {
  listSources(): Promise<KnowledgeSourceRecord[]>;
  createSource(input: KnowledgeSourceInput): Promise<CreateKnowledgeSourceResult>;
  listChunkContexts(scope: KnowledgeScope): Promise<KnowledgeChunkContext[]>;
}

const EMPTY_KNOWLEDGE_ANSWER = {
  answer:
    "I don't have enough source material yet to answer this confidently. Add JD, resume, project, or note content first.",
  citations: [],
  scopeNotice:
    "No sources available. Add JD, resume, project, interview note, or knowledge note first.",
} satisfies KnowledgeAnswer;

function normalizeOptionalMetadata(value: unknown) {
  return value && typeof value === "object" ? value : {};
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fa5]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function countTokens(value: string) {
  return tokenize(value).length;
}

function splitLongParagraph(paragraph: string, maxLength = 420) {
  if (paragraph.length <= maxLength) {
    return [paragraph];
  }

  const sentences = paragraph
    .split(/(?<=[。！？.!?])\s+/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    return paragraph.match(new RegExp(`.{1,${maxLength}}`, "gu")) ?? [paragraph];
  }

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;

    if (candidate.length > maxLength && current) {
      chunks.push(current);
      current = sentence;
      continue;
    }

    current = candidate;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function splitKnowledgeText(contentText: string) {
  return contentText
    .split(/\n\s*\n/u)
    .map((part) => part.trim())
    .filter(Boolean)
    .flatMap((part) => splitLongParagraph(part))
    .map((content, index) => ({
      chunkIndex: index,
      content,
      tokenCount: countTokens(content),
      metadata: {},
    }));
}

function toSourceRecord(row: typeof knowledgeSources.$inferSelect) {
  return knowledgeSourceRecordSchema.parse({
    id: row.id,
    sourceType: row.sourceType,
    title: row.title,
    contentText: row.contentText,
    jobTargetId: row.jobTargetId ?? undefined,
    metadata: normalizeOptionalMetadata(row.metadata),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function toChunkRecord(row: typeof knowledgeChunks.$inferSelect) {
  return knowledgeChunkRecordSchema.parse({
    id: row.id,
    sourceId: row.sourceId,
    chunkIndex: row.chunkIndex,
    content: row.content,
    tokenCount: row.tokenCount ?? null,
    metadata: normalizeOptionalMetadata(row.metadata),
    createdAt: row.createdAt.toISOString(),
  });
}

function buildChunkContexts(
  source: KnowledgeSourceRecord,
  chunks: KnowledgeChunkRecord[],
): KnowledgeChunkContext[] {
  return chunks.map((chunk) =>
    knowledgeChunkContextSchema.parse({
      ...chunk,
      sourceTitle: source.title,
      sourceType: source.sourceType,
    }),
  );
}

function scoreChunk(question: string, chunk: KnowledgeChunkContext) {
  const questionTokens = tokenize(question);
  const contentTokens = new Set(
    tokenize(`${chunk.sourceTitle} ${chunk.content} ${chunk.sourceType}`),
  );

  return questionTokens.reduce((score, token) => {
    if (!contentTokens.has(token)) {
      return score;
    }

    return score + 1;
  }, 0);
}

function selectTopChunks(question: string, chunks: KnowledgeChunkContext[], limit = 4) {
  return [...chunks]
    .map((chunk) => ({
      chunk,
      score: scoreChunk(question, chunk),
    }))
    .sort((left, right) => right.score - left.score || left.chunk.chunkIndex - right.chunk.chunkIndex)
    .slice(0, limit)
    .map((entry) => entry.chunk);
}

function buildKnowledgePrompt(input: {
  question: string;
  scope: KnowledgeScope;
  chunks: KnowledgeChunkContext[];
}) {
  const chunkBlock = input.chunks
    .map(
      (chunk) =>
        [
          `source_id: ${chunk.sourceId}`,
          `source_title: ${chunk.sourceTitle}`,
          `source_type: ${chunk.sourceType}`,
          `chunk_id: ${chunk.id}`,
          `content: ${chunk.content}`,
        ].join("\n"),
    )
    .join("\n\n---\n\n");

  return [
    "Answer the user's interview-prep question using only the supplied source chunks.",
    "Do not invent facts that are not supported by the provided chunks.",
    "If the sources are thin or partial, say so inside the answer and keep the scopeNotice explicit.",
    `Question: ${input.question}`,
    `Scope: ${input.scope}`,
    "Source chunks:",
    chunkBlock,
  ].join("\n\n");
}

class GeminiKnowledgeAnswerClient implements KnowledgeAnswerClient {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(
    apiKey = process.env.GEMINI_API_KEY,
    model = process.env.GEMINI_MODEL ?? "gemini-3.1-pro-preview",
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

  async answer(input: {
    question: string;
    scope: KnowledgeScope;
    chunks: KnowledgeChunkContext[];
  }) {
    const response = await this.client.beta.chat.completions.parse({
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            "You are a bounded interview-prep copilot. Answer only from supplied sources and always keep citations faithful.",
        },
        {
          role: "user",
          content: buildKnowledgePrompt(input),
        },
      ],
      response_format: zodResponseFormat(knowledgeAnswerSchema, "knowledge_answer"),
    });

    return knowledgeAnswerSchema.parse(response.choices[0]?.message.parsed ?? null);
  }
}

class OpenAiKnowledgeAnswerClient implements KnowledgeAnswerClient {
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

  async answer(input: {
    question: string;
    scope: KnowledgeScope;
    chunks: KnowledgeChunkContext[];
  }) {
    const response = await this.client.responses.create({
      model: this.model,
      input: buildKnowledgePrompt(input),
      text: {
        format: {
          type: "json_schema",
          name: "knowledge_answer",
          strict: true,
          schema: knowledgeAnswerJsonSchema,
        },
      },
    });

    return knowledgeAnswerSchema.parse(JSON.parse(response.output_text));
  }
}

class MemoryKnowledgeStore implements KnowledgeStore {
  async listSources() {
    return [...memorySources].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async createSource(input: KnowledgeSourceInput) {
    const now = new Date().toISOString();
    const parsed = knowledgeSourceInputSchema.parse(input);
    const source = knowledgeSourceRecordSchema.parse({
      ...parsed,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
    const chunks = splitKnowledgeText(parsed.contentText).map((chunk) =>
      knowledgeChunkRecordSchema.parse({
        id: crypto.randomUUID(),
        sourceId: source.id,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        tokenCount: chunk.tokenCount,
        metadata: chunk.metadata,
        createdAt: now,
      }),
    );

    memorySources.push(source);
    memoryChunks.push(...chunks);

    return { source, chunks };
  }

  async listChunkContexts(scope: KnowledgeScope) {
    const visibleSources = scope === "all"
      ? memorySources
      : memorySources.filter((source) => source.sourceType === scope);

    return visibleSources.flatMap((source) =>
      buildChunkContexts(
        source,
        memoryChunks.filter((chunk) => chunk.sourceId === source.id),
      ),
    );
  }
}

class PostgresKnowledgeStore implements KnowledgeStore {
  async listSources() {
    const db = getDb();
    const rows = await db
      .select()
      .from(knowledgeSources)
      .orderBy(desc(knowledgeSources.updatedAt));

    return rows.map((row) => toSourceRecord(row));
  }

  async createSource(input: KnowledgeSourceInput) {
    const db = getDb();
    const parsed = knowledgeSourceInputSchema.parse(input);
    const preparedChunks = splitKnowledgeText(parsed.contentText);

    return db.transaction(async (tx) => {
      const [sourceRow] = await tx
        .insert(knowledgeSources)
        .values({
          sourceType: parsed.sourceType,
          title: parsed.title,
          contentText: parsed.contentText,
          jobTargetId: parsed.jobTargetId,
          metadata: parsed.metadata,
        })
        .returning();

      const chunkRows = preparedChunks.length
        ? await tx
            .insert(knowledgeChunks)
            .values(
              preparedChunks.map((chunk) => ({
                sourceId: sourceRow.id,
                chunkIndex: chunk.chunkIndex,
                content: chunk.content,
                tokenCount: chunk.tokenCount,
                metadata: chunk.metadata,
              })),
            )
            .returning()
        : [];

      return {
        source: toSourceRecord(sourceRow),
        chunks: chunkRows.map((row) => toChunkRecord(row)),
      };
    });
  }

  async listChunkContexts(scope: KnowledgeScope) {
    const db = getDb();
    const baseQuery = db
      .select({
        chunk: knowledgeChunks,
        source: knowledgeSources,
      })
      .from(knowledgeChunks)
      .innerJoin(knowledgeSources, eq(knowledgeChunks.sourceId, knowledgeSources.id))
      .orderBy(desc(knowledgeChunks.createdAt));

    const rows = scope === "all"
      ? await baseQuery
      : await baseQuery.where(eq(knowledgeSources.sourceType, scope));

    return rows.map(({ chunk, source }) =>
      knowledgeChunkContextSchema.parse({
        ...toChunkRecord(chunk),
        sourceTitle: source.title,
        sourceType: source.sourceType,
      }),
    );
  }
}

const memorySources: KnowledgeSourceRecord[] = [];
const memoryChunks: KnowledgeChunkRecord[] = [];
const memoryStore = new MemoryKnowledgeStore();

export function createDefaultKnowledgeAnswerClient(): KnowledgeAnswerClient {
  const provider = getDefaultAiProvider();

  if (provider === "gemini") {
    return new GeminiKnowledgeAnswerClient();
  }

  if (provider === "openai") {
    return new OpenAiKnowledgeAnswerClient();
  }

  throw new Error(
    "No AI provider key found. Set GEMINI_API_KEY or OPENAI_API_KEY.",
  );
}

export function getKnowledgeStore(): KnowledgeStore {
  if (process.env.DATABASE_URL) {
    return new PostgresKnowledgeStore();
  }

  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error("DATABASE_URL is required in production environments.");
  }

  return memoryStore;
}

export async function askKnowledgeQuestion(
  input: KnowledgeQuestionInput,
  store: KnowledgeStore = getKnowledgeStore(),
  answerClient?: KnowledgeAnswerClient,
) {
  const parsed = {
    ...input,
    scope: knowledgeScopeSchema.parse(input.scope),
  };
  const chunkContexts = await store.listChunkContexts(parsed.scope);

  if (!chunkContexts.length) {
    return EMPTY_KNOWLEDGE_ANSWER;
  }

  const selectedChunks = selectTopChunks(parsed.question, chunkContexts);

  if (!selectedChunks.length) {
    return EMPTY_KNOWLEDGE_ANSWER;
  }

  const client = answerClient ?? createDefaultKnowledgeAnswerClient();

  return knowledgeAnswerSchema.parse(
    await client.answer({
      question: parsed.question,
      scope: parsed.scope,
      chunks: selectedChunks,
    }),
  );
}

export function resetMemoryKnowledgeStore() {
  memorySources.splice(0, memorySources.length);
  memoryChunks.splice(0, memoryChunks.length);
}
