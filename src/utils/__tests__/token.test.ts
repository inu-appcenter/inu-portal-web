import { describe, expect, it } from "vitest";
import { getMemberIdFromToken } from "../token";

describe("getMemberIdFromToken", () => {
  it("토큰이 없거나 유효하지 않으면 null을 반환한다", () => {
    expect(getMemberIdFromToken()).toBeNull();
    expect(getMemberIdFromToken("")).toBeNull();
    expect(getMemberIdFromToken("invalid-token")).toBeNull();
  });

  it("JWT 페이로드에서 sub(memberId)를 올바르게 추출한다", () => {
    // payload: {"sub":"202100000","role":"ROLE_USER"}
    const payload = btoa(JSON.stringify({ sub: "202100000", role: "ROLE_USER" }));
    const mockToken = `header.${payload}.signature`;

    expect(getMemberIdFromToken(mockToken)).toBe("202100000");
  });

  it("sub 필드가 없으면 null을 반환한다", () => {
    const payload = btoa(JSON.stringify({ role: "ROLE_USER" }));
    const mockToken = `header.${payload}.signature`;

    expect(getMemberIdFromToken(mockToken)).toBeNull();
  });
});
