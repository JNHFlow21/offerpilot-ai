const DEFAULT_APP_URL = "https://offerpilot-ai.vercel.app";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export function getAuthRedirectUrl() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (envUrl) {
    return `${normalizeBaseUrl(envUrl)}/auth/callback`;
  }

  if (typeof window !== "undefined") {
    const origin = window.location.origin;

    if (origin && !origin.startsWith("http://localhost")) {
      return `${normalizeBaseUrl(origin)}/auth/callback`;
    }
  }

  return `${DEFAULT_APP_URL}/auth/callback`;
}

export function isOAuthProviderEnabled(provider: "google" | "github") {
  if (provider === "google") {
    return process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
  }

  return process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true";
}
