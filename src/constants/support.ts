/**
 * 고객 문의 · 신고 접수 채널.
 *
 * App Store 가이드라인 1.2(UGC)는 사용자가 부적절한 활동을 신고할 수 있도록
 * 앱 내에 개발자 연락처가 명시돼 있을 것을 요구한다.
 */

/** 운영자/개발자 문의 이메일 (이용약관 문의처와 동일해야 한다) */
export const SUPPORT_EMAIL = "inuappcenter@gmail.com";

/** 1:1 문의 구글폼 */
export const SUPPORT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc1DAOC2N_HVzsMa6JMoSOqckpkX39SkHbrZD_eKTtr2cfKqA/viewform";

/** 앱센터 홈페이지 */
export const APPCENTER_URL = "https://home.inuappcenter.kr";

/** 신고/문의 메일 작성 링크 */
export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  "[INTIP] 문의 및 신고 접수",
)}&body=${encodeURIComponent(
  [
    "아래 내용을 적어주시면 24시간 이내에 확인 후 조치하겠습니다.",
    "",
    "- 신고/문의 유형(부적절한 콘텐츠, 악성 사용자, 기타):",
    "- 대상 게시글/댓글 또는 사용자:",
    "- 상세 내용:",
    "",
  ].join("\n"),
)}`;
