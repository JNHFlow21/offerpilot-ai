import { describe, expect, it } from "vitest";

import {
  getRouteProtectionDecision,
  isProtectedPathname,
} from "@/lib/auth/route-protection";

describe("route protection", () => {
  it("marks core product routes as protected", () => {
    expect(isProtectedPathname("/prepare")).toBe(true);
    expect(isProtectedPathname("/jobs/new")).toBe(true);
    expect(isProtectedPathname("/profile")).toBe(true);
    expect(isProtectedPathname("/knowledge")).toBe(true);
    expect(isProtectedPathname("/")).toBe(false);
    expect(isProtectedPathname("/login")).toBe(false);
  });

  it("redirects unauthenticated users to login and authenticated users away from login", () => {
    expect(getRouteProtectionDecision("/prepare", false)).toEqual({
      type: "redirect",
      destination: "/login?next=%2Fprepare",
    });

    expect(getRouteProtectionDecision("/login", true)).toEqual({
      type: "redirect",
      destination: "/prepare",
    });

    expect(getRouteProtectionDecision("/", false)).toEqual({
      type: "allow",
    });
  });
});
