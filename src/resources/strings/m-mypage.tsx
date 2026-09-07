import { appcenterLogoMark } from "@/resources/assets/illustrations/brand";
import { SUPPORT_EMAIL } from "@/constants/support";
import type { MenuItemProps } from "@/components/mobile/mypage/MenuGroup";

/**
 * 마이페이지 설정 목록. 카드(그룹) 단위로 나뉜다.
 *
 * 아이콘은 Fontello 글리프 이름으로 지정한다. 앱센터 로고처럼 글리프로 만들 수
 * 없는 브랜드 이미지만 `image`를 쓴다.
 *
 * 프로필 수정 · 내가 쓴 글 · 좋아요 · 댓글 · 스크랩은 목록이 아니라 프로필
 * 카드(`MobileMyPage`)의 헤더와 카운터로 들어간다.
 */
export type MyPageMenuItem = Omit<MenuItemProps, "onClick">;

/** 로그인한 사용자에게만 보이는 계정 설정. */
export const MyPageAccountMenu: MyPageMenuItem[] = [
  { title: "알림 설정", icon: "bell", info: "채팅 · 공지" },
  { title: "차단 사용자 관리", icon: "user-close" },
];

/** 로그인 여부와 무관한 문의 · 소개. */
export const MyPageSupportMenu: MyPageMenuItem[] = [
  { title: "문의하기", icon: "question-mark-circle" },
  // 부적절한 콘텐츠·악성 사용자 신고를 위한 개발자 직통 연락처
  // (App Store 가이드라인 1.2(UGC) 요구사항이라 디자인에 없어도 유지한다)
  {
    title: "개발자에게 메일 보내기",
    icon: "mail",
    description: `부적절한 콘텐츠·악성 사용자 신고는 24시간 이내에 처리됩니다.\n${SUPPORT_EMAIL}`,
  },
  {
    title: "인천대학교 IT Innovation LAB",
    image: appcenterLogoMark,
    monochromeImage: true,
    description: "INTIP을 만든 동아리를 알아보세요.",
  },
];

/** 진단용 메뉴. 관리자에게는 페이지에서 관리자 항목을 덧붙인다. */
export const MyPageSystemMenu: MyPageMenuItem[] = [
  { title: "알림 설정 확인", icon: "settings", info: "FCM 토큰 · 전송 상태" },
];

export const MyPageAdminMenu: MyPageMenuItem = {
  title: "관리자 페이지",
  icon: "settings",
};
