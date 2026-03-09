import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/prepare", requestUrl.origin));
}
