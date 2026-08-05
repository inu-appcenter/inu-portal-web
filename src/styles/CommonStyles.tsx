import { createGlobalStyle } from "styled-components";

const CommonStyles = createGlobalStyle`
  /* Native app top safe-area inset, mirrored in as a CSS var by the WebView
     shell (intip-mobile-app's WebViewContainer/buildSafeAreaInsetsScript) so
     pages can pad themselves without relying solely on the WebView engine's
     own env(safe-area-inset-top) support (inconsistent on Android). Falls
     back to env() (then 0) outside the app shell, e.g. browser/dev preview. */
  :root {
    --native-safe-area-inset-top: env(safe-area-inset-top, 0px);
  }

  body {
    font-family: 'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
    margin: 0;
    cursor: url('/pointers/cursor.svg'), auto;
    line-height: 1.5; /* Pretendard에 적합한 줄간격 */
    background-color: #f1f1f3;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* 반드시 포함되어야 합니다! */
  html, body, #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  /* 모든 요소에 폰트 상속 강제 */
  * {
    font-family: 'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
    -webkit-tap-highlight-color: transparent;
    box-sizing: border-box;
  }

  a, button, img {
    cursor: url('/pointers/cursor-pointer.svg'), pointer;
  }

  button, input, textarea, select {
    font-family: inherit;
    all: unset;
    box-sizing: border-box;
  }

  button {
    cursor: pointer;
    text-align: center;
  }

  input, textarea {
    text-align: left;
    cursor: text;
  }
`;

export default CommonStyles;
