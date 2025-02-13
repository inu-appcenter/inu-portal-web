import writeImg from "resources/assets/mobile-mypage/post-img.svg";
import likeImg from "resources/assets/mobile-mypage/like-img.svg";
import commentImg from "resources/assets/mobile-mypage/comment-img.svg";
import scrapImg from "resources/assets/mobile-mypage/scrap.svg";
import profileImg from "resources/assets/mobile-mypage/profile.svg";
import logoutImg from "resources/assets/mobile-mypage/logout.svg";
// import removeImg from "resources/assets/mobile-mypage/remove.svg";
export const MyPageActive = [
  { title: "내가 쓴 글", image: `${writeImg}` },
  { title: "좋아요 한 글", image: `${likeImg}` },
  { title: "작성한 댓글", image: `${commentImg}` },
];

export const MyPageCategory = [
  { title: "프로필 편집", image: `${profileImg}` },
  { title: "스크랩", image: `${scrapImg}` },
  { title: "로그아웃", image: `${logoutImg}` },
  // { title: "회원탈퇴", image: `${removeImg}` },
];
