import styled from 'styled-components';

import { Link } from 'react-router-dom';

interface postinfoProps {
  postLikeInfo: {
        id: number;
        title: string;
        category: string;
    }[];
}

export default function LikePost({postLikeInfo}:postinfoProps) {
    
  return (
    <ScrapWrapper>
    {postLikeInfo.map((item) => (
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

`;

const ScrapItem = styled.div`
  
`;

const PoistLink = styled(Link)`
  
`