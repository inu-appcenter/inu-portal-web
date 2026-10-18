// 표시명 규칙 (PRD v3.4 FR-093): 관계 기반 기능(친구·시간 맞추기·홈 브리핑)은 실명 우선,
// 없으면 닉네임. 게시판·오픈채팅·위키는 닉네임·익명을 그대로 쓴다(이 함수를 쓰지 않는다).

interface NameSource {
  realName?: string | null;
  displayName?: string | null;
  nickname?: string | null;
}

export const getDisplayName = (source: NameSource | null | undefined): string =>
  source?.realName?.trim() ||
  source?.displayName?.trim() ||
  source?.nickname?.trim() ||
  "";

/** 학번은 마스킹해서만 보여 준다(`202401001` → `2024***01`). 이미 마스킹된 값은 그대로 둔다. */
export const maskStudentId = (studentId: string | null | undefined): string => {
  if (!studentId) return "";
  if (!/^\d{8,}$/.test(studentId)) return studentId;
  return `${studentId.slice(0, 4)}***${studentId.slice(-2)}`;
};

/** 닉네임이 학번 그대로인지(가입 기본값). 이름 설정 유도 판정에 쓴다. */
export const isNicknameStudentId = (
  nickname: string | null | undefined,
  studentId: string | null | undefined,
): boolean => Boolean(nickname) && nickname === studentId;
