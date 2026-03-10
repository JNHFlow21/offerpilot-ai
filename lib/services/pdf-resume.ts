import { PDFParse } from "pdf-parse";

async function parsePdfBuffer(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return { text: result.text };
  } finally {
    await parser.destroy();
  }
}

function normalizeResumeText(text: string) {
  return text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function extractResumeTextFromPdfFile(
  file: File,
  parser: (buffer: Buffer) => Promise<{ text?: string }> = parsePdfBuffer,
) {
  const arrayBuffer =
    typeof file.arrayBuffer === "function"
      ? await file.arrayBuffer()
      : await new Response(file).arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const parsed = await parser(buffer);
  const normalized = normalizeResumeText(parsed.text ?? "");

  if (normalized.length < 20) {
    throw new Error("PDF 简历解析失败，提取出的文本过短。");
  }

  return normalized;
}
