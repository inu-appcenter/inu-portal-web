// import  { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Link } from 'react-router-dom';

interface postinfoProps {
    postinfo: {
        id: number;
        title: string;
        category: string;
    }[];
}

export default function UserPost({postinfo}:postinfoProps) {
    
  return (
    <ScrapWrapper>
  {postinfo.map((item) => (
    <ScrapItem key={item.id}>
      <h3>{item.title}</h3>
      <p>{item.category}</p>
      {/* 아래의 부분 수정 */}
      <PoistLink to={`/post/${item.id}`}>자세히 보기</PoistLink>
    </ScrapItem>
  ))}
</ScrapWrapper>
  );
}

const ScrapWrapper = styled.div`

  /* 스타일 지정 */
`;

const ScrapItem = styled.div`
  /* 스타일 지정 */
`;

const PoistLink = styled(Link)`
  
`