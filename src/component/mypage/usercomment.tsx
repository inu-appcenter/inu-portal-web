// import  { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Link } from 'react-router-dom';

interface postinfoProps {
    postCommentInfo: {
        id: number;
        content: string;
        category: string;
    }[];
}

export default function UserComment({postCommentInfo}:postinfoProps) {
    
  return (
    <ScrapWrapper>
  {postCommentInfo.map((item) => (
    <ScrapItem key={item.id}>
      <h3>{item.content}</h3>
      <p>{item.category}</p>
      {/* 아래의 부분 수정 */}
      <PoistLink to={`/tips/${item.id}`}>자세히 보기</PoistLink>
    </ScrapItem>
  ))}
</ScrapWrapper>
  );
}

const ScrapWrapper = styled.div`

`;

const ScrapItem = styled.div`
  
`;

const PoistLink = styled(Link)`
  
`