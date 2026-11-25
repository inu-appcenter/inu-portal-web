/**
 * 온보딩 이름·닉네임 입력 검사. 반환값이 빈 문자열이면 통과, 아니면 입력칸 아래 에러 문구.
 * 문구는 Figma 08 온보딩 퍼널(01-3 실명 / 에러, 02-2 닉네임 / 금지어)의 말투를 따른다.
 */

export const NAME_MAX_LENGTH = 10;
export const NICKNAME_MAX_LENGTH = 10;

const NAME_PATTERN = /^(?:[가-힣]{2,10}|[A-Za-z]+(?: [A-Za-z]+)*)$/;

export const NICKNAME_FORBIDDEN_KEYWORDS = [
  "알림", "공지", "알람", "운영자", "운영진", "관리자", "시스템", "스태프", "어드민",
  "notice", "admin", "system", "staff", "intip", "인팁", "appcenter", "앱센터",
];

export function validateRealName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length < 2 || trimmed.length > NAME_MAX_LENGTH || !NAME_PATTERN.test(trimmed)) {
    return "한글 또는 영문 2~10자로 입력해주세요.";
  }
  return "";
}

export function validateNickname(value: string, studentId?: string | null): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length < 2) return "2자 이상 입력해주세요.";
  if (trimmed.length > NICKNAME_MAX_LENGTH) return "10자 이내로 입력해주세요.";
  if (studentId && trimmed === studentId) return "학번은 닉네임으로 쓸 수 없어요.";

  const normalized = trimmed.replace(/\s+/g, "").toLowerCase();
  const hits = NICKNAME_FORBIDDEN_KEYWORDS.filter((kw) => normalized.includes(kw.toLowerCase()));
  if (hits.length > 0) return `${hits.map((kw) => `'${kw}'`).join(", ")} 같은 단어는 쓸 수 없어요.`;

  return "";
}
