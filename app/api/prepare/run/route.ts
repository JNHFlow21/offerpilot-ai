import { NextResponse } from "next/server";

import { isUnauthorizedError, requireCurrentUser } from "@/lib/auth/current-user";
import { extractResumeTextFromPdfFile } from "@/lib/services/pdf-resume";
import { runPreparePipeline } from "@/lib/services/prepare-run-service";

function formatRouteError(error: unknown) {
  return error instanceof Error ? error.message : "生成准备方案失败。";
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const formData = await request.formData();
    const resumeFile = formData.get("resumeFile");
    const companyName = `${formData.get("companyName") ?? ""}`.trim();
    const roleName = `${formData.get("roleName") ?? ""}`.trim();
    const jdText = `${formData.get("jdText") ?? ""}`.trim();
    const sourceUrl = `${formData.get("sourceUrl") ?? ""}`.trim();

    if (!(resumeFile instanceof File)) {
      return NextResponse.json({ error: "请上传 PDF 简历。" }, { status: 400 });
    }

    if (!roleName || !jdText || jdText.length < 20) {
      return NextResponse.json(
        { error: "请填写完整的岗位名称和岗位 JD。" },
        { status: 400 },
      );
    }

    const resumeText = await extractResumeTextFromPdfFile(resumeFile);
    const result = await runPreparePipeline({
      userId: user.id,
      companyName,
      roleName,
      jdText,
      sourceUrl,
      resumeText,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: formatRouteError(error) }, { status: 500 });
  }
}
