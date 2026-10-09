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
      background: rgba(130, 173, 232, 0.6);
      border-radius: 5px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(130, 173, 232, 1);
    }
  }
`;

export default ScrollBarStyles;
