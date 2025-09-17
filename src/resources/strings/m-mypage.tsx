import writeImg from "resources/assets/mobile-mypage/post-img.svg";
import likeImg from "resources/assets/mobile-mypage/like-img.svg";
import commentImg from "resources/assets/mobile-mypage/comment-img.svg";
import scrapImg from "resources/assets/mobile-mypage/scrap.svg";
import profileImg from "resources/assets/mobile-mypage/profile.svg";
import logoutImg from "resources/assets/mobile-mypage/logout.svg";
import inquiryImg from "resources/assets/mobile-mypage/inquiry.svg";
import AppcenterLogo from "resources/assets/mobile-mypage/AppcenterLogo.svg";

// import removeImg from "resources/assets/mobile-mypage/remove.svg";
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
  { title: "로그아웃", image: `${logoutImg}` },
  // { title: "회원탈퇴", image: `${removeImg}` },
];

export const MyPageCategoryCommon = [
  {
    title: "문의하기",
    image: `${inquiryImg}`,
    description: "문의사항이나 불편사항을 접수할 수 있어요.",
  },
  {
    title: "인천대학교 앱센터",
    image: `${AppcenterLogo}`,
    description:
      '"우리에게 필요한 것은 우리가 만든다!"\nINTIP을 만든 동아리를 알아보세요.',
  },
];
