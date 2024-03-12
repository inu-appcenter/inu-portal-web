import React from 'react'
import styled from 'styled-components';

const StyledPopularPosts = styled.div`
  height: 270px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: linear-gradient(to bottom right, #9CAFE2, #AAC9EE);
`;
const PopularPosts: React.FC = () => {
    return (
      // 스타일이 적용된 StyledPopularPosts 컴포넌트 사용
      <StyledPopularPosts>
        인기글 생성 중(뚝닥뚝닥🔨)
      </StyledPopularPosts>
    );
  };
  
  export default PopularPosts;