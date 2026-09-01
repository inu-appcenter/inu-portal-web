import comment from "./comment.svg";
import inquiry from "./inquiry.svg";
import like from "./like.svg";
import logout from "./logout.svg";
import post from "./post.svg";

/**
 * 마이페이지 메뉴 아이콘. 소비처는 `resources/strings/m-mypage.tsx`의
 * 메뉴 정의이며, 거기서 URL 문자열로 쓰인다.
 *
 * 원래 `assets/mypage/`와 `assets/mobile-mypage/`로 갈려 있었으나 같은 화면의
 * 같은 성질이라 한 세트로 합쳤다. 전부 #4071B9 채움 스타일이라 외곽선인
 * Fontello 글리프와는 인상이 달라 SVG로 남긴다.
 */
export { comment, inquiry, like, logout, post };
