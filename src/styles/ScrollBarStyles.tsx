import { createGlobalStyle } from "styled-components";

const ScrollBarStyles = createGlobalStyle`
  @media (hover: hover) and (pointer: fine) {
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: #82ADE899;
      border-radius: 5px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #82ADE8FF;
    }
  }
`;

export default ScrollBarStyles;
