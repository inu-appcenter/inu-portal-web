import { createGlobalStyle } from "styled-components";

const CommonStyles = createGlobalStyle`
  //이 안에 전체 프로젝트에 적용될 css를 작성하면 됩니다~!
  @font-face {
    font-family: 'CustomFont';
    src: url('/fonts/AppleSDGothicNeoM.ttf') format('truetype'); // format에 ttc, ttf은 'truetype' otf는 'opentype'
  }

  body {
    font-family: Arial, 'CustomFont', Roboto, Inter;
    margin: 0;
    -ms-overflow-style: none;
    //overflow: scroll;
    cursor: url('/pointers/cursor.svg'), auto; // 기본 커서 이미지 설정

    line-height: 1;
    overflow: hidden; /* 중요 */

  }

  /* src/index.css */

  /* 반드시 포함되어야 합니다! */
  html, body, #root {
    width: 100%;
    height: 100%; /* 이게 없으면 화면이 하얗게 나옵니다 */
    margin: 0;
    padding: 0;
    overflow: hidden; /* 브라우저 자체 스크롤 제거 */
  }


  a, button, img {
    cursor: url('/pointers/cursor-pointer.svg'), pointer;
  }

  button {
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
  }


  * {
    -webkit-tap-highlight-color: rgba(128, 128, 128, 0.2);
  }
  

`;

export default CommonStyles;
