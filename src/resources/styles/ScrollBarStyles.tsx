import { createGlobalStyle } from "styled-components";

const ScrollBarStyles = createGlobalStyle`
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

export default ScrollBarStyles;
