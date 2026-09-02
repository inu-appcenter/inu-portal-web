/**
 * JWT 액세스 토큰의 payload에서 회원 식별자(sub / memberId)를 안전하게 추출합니다.
 */
export const getMemberIdFromToken = (
  token?: string | null,
): string | null => {
  if (!token || typeof token !== "string") return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

    const jsonString =
      typeof window !== "undefined"
        ? window.atob(normalized)
        : Buffer.from(normalized, "base64").toString("utf-8");

    const decoded = JSON.parse(jsonString);
    return typeof decoded.sub === "string" && decoded.sub ? decoded.sub : null;
  } catch {
    return null;
  }
};
