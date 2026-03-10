import type { User } from "@supabase/supabase-js";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export class UnauthorizedError extends Error {
  constructor(message = "请先登录后再继续。") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof UnauthorizedError;
}
