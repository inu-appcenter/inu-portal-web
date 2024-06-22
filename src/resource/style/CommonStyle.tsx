import { createGlobalStyle } from 'styled-components';

const CommonStyle = createGlobalStyle`
  //이 안에 전체 프로젝트에 적용될 css를 작성하면 됩니다~!
  @font-face {
    font-family: 'CustomFont';
    src: url('/fonts/AppleSDGothicNeoM.ttf') format('truetype'); // format에 ttc, ttf은 'truetype' otf는 'opentype'
  }
  body{
    font-family: 'CustomFont', sans-serif;
    margin: 0;
    -ms-overflow-style: none;
    overflow: auto;
    cursor: url('/pointers/cursor.svg'), auto; // 기본 커서 이미지 설정
  }

  // 스크롤바 커스텀 스타일링
  ::-webkit-scrollbar {
    width: 10px; // 스크롤바의 너비
		height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: transparent; // 스크롤바 배경색
  }

  ::-webkit-scrollbar-thumb {
    background: #82ADE899; // 스크롤바 썸(움직이는 부분)의 색상
		border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #82ADE8FF; // 스크롤바 썸에 마우스를 올렸을 때의 색상
  }
`;

export default CommonStyle;
