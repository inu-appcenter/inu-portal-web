import React from 'react'
import styled from 'styled-components';

const StyledPopularPosts = styled.div`
  height: 270px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right:25px;
  background: linear-gradient(to bottom right, #9CAFE2, #AAC9EE);
  border-bottom: 5px solid #eaeaea;
`;
const PopularPosts: React.FC = () => {
    return (
      <StyledPopularPosts>
        인기글 생성 중(뚝닥뚝닥🔨)
      </StyledPopularPosts>
    );
  };
  
  export default PopularPosts;