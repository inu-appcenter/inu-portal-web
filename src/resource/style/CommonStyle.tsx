import { createGlobalStyle } from 'styled-components';


const CommonStyle = createGlobalStyle`
  //이 안에 전체 프로젝트에 적용될 css를 작성하면 됩니다~!
  * {
    font-family: 'Pretendard', sans-serif;
  }

  body {
    margin: 0;
  }

  
`;

export default CommonStyle;
