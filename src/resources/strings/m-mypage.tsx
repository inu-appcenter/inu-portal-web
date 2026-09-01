import {
  comment as commentImg,
  like as likeImg,
  post as writeImg,
} from "@/resources/assets/icons/mypage";
import scrapImg from "@/resources/assets/illustrations/mobile-mypage/scrap.svg";
import profileImg from "@/resources/assets/illustrations/mobile-mypage/profile.svg";
import {
  inquiry as inquiryImg,
  logout as logoutImg,
} from "@/resources/assets/icons/mypage";
import AppcenterLogo from "@/resources/assets/illustrations/mobile-mypage/appcenter-logo.svg";
import removeImg from "@/resources/assets/illustrations/mobile-mypage/remove.svg";
import { SUPPORT_EMAIL } from "@/constants/support";

export const MyPageActive = [
  { title: "내가 쓴 글", image: `${writeImg}` },
  { title: "좋아요 한 글", image: `${likeImg}` },
  { title: "작성한 댓글", image: `${commentImg}` },
];

export const MyPageCategoryLoggeedIn = [
  {
    title: "프로필 수정",
    image: `${profileImg}`,
    description: "닉네임 · 학과 · 프로필 이미지",
  },
  {
    title: "스크랩",
    image: `${scrapImg}`,
  },
  {
    title: "알림 설정",
    description: "채팅 및 학과/학교 공지 알림 설정",
  },
  {
    title: "차단 사용자 관리",
    description: "차단한 사용자를 확인하고 차단을 해제할 수 있어요.",
  },
  { title: "로그아웃", image: `${logoutImg}` },
  // 앱 내 계정 삭제 진입점 (App Store 가이드라인 5.1.1(v))
  {
    title: "회원탈퇴",
    image: `${removeImg}`,
    description: "계정과 작성한 글·댓글이 삭제됩니다.",
  },
];

export const MyPageCategoryCommon = [
  {
    title: "문의하기",
    image: `${inquiryImg}`,
    description: "문의사항이나 불편사항을 접수할 수 있어요.",
  },
  {
    title: "개발자에게 메일 보내기",
    description: `부적절한 콘텐츠·악성 사용자 신고는 24시간 이내에 처리됩니다.
${SUPPORT_EMAIL}`,
  },
  {
    title: "인천대학교 앱센터",
    image: `${AppcenterLogo}`,
    description:
      '"우리에게 필요한 것은 우리가 만든다!"\nINTIP을 만든 동아리를 알아보세요.',
  },
];
