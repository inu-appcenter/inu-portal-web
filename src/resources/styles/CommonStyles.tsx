import { createGlobalStyle } from "styled-components";

const CommonStyles = createGlobalStyle`
  //이 안에 전체 프로젝트에 적용될 css를 작성하면 됩니다~!
  @font-face {
    font-family: 'CustomFont';
    src: url('/fonts/AppleSDGothicNeoM.ttf') format('truetype'); // format에 ttc, ttf은 'truetype' otf는 'opentype'
  }
  body {
    font-family: Roboto, 'CustomFont', Inter;
    margin: 0;
    -ms-overflow-style: none;
    overflow: scroll;
    cursor: url('/pointers/cursor.svg'), auto; // 기본 커서 이미지 설정
  }
  a, button, img {
    cursor: url('/pointers/cursor-pointer.svg'), pointer;
  }
`;

export default CommonStyles;
