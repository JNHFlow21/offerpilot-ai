const PROTECTED_PREFIXES = ["/prepare", "/profile", "/knowledge", "/jobs"];
const PUBLIC_PATHS = ["/", "/login", "/auth/callback"];

export function isProtectedPathname(pathname: string) {
  if (!pathname || PUBLIC_PATHS.includes(pathname)) {
    return false;
  }

  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function getRouteProtectionDecision(
  pathname: string,
  isAuthenticated: boolean,
): { type: "allow" } | { type: "redirect"; destination: string } {
  if (!isAuthenticated && isProtectedPathname(pathname)) {
    return {
      type: "redirect",
      destination: `/login?next=${encodeURIComponent(pathname)}`,
    };
  }

  if (isAuthenticated && pathname === "/login") {
    return {
      type: "redirect",
      destination: "/prepare",
    };
  }

  return { type: "allow" };
}
