import styled from 'styled-components';
import { Link } from 'react-router-dom';
import likelogo from '.././../resource/assets/like-icon.png';

interface postinfoProps {
  postLikeInfo: {
    id: number;
    title: string;
    category: string;
  }[];
}

export default function LikePost({ postLikeInfo }: postinfoProps) {
  return (
    <LikePostWrapper>
      <CountWrapper>
        <Likeimg src={likelogo} />
        <LikeCount>{postLikeInfo.length}</LikeCount>
      </CountWrapper>
      <Items>
        {postLikeInfo.map((item) => (
          <PostLink  to={`/tips/${item.id}`}>
            <LikePostItem key={item.id}>
              <p className='category'>{item.category}</p>
              <p className='title'>{item.title}</p>
          </LikePostItem>
          </PostLink>
         
        ))}
      </Items>
    </LikePostWrapper>
  );
}

const LikePostWrapper = styled.div`

`;

const CountWrapper = styled.div`
  display: flex;
  margin-top: 26px;
  align-items: center;
`
const Likeimg = styled.img`
  width: 24px;
  height: 20px;
`;

const LikeCount = styled.p`
font-family: Inter;
font-size: 15px;
font-weight: 600;
margin-left: 15px;
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 150px; 
  overflow-y: auto; 
`;

const LikePostItem = styled.div`
  display: flex;
  gap:2px;
  background-color:white;
  .category {
    background-color: #a4c8e4; 
    padding:10px;
    margin:10px;
    color:white;
    font-weight: 600;
    border-radius: 10px;
  }
  .title {
    padding:10px;
    margin:10px;
    color:black;
    font-weight: 600;
    border-radius: 10px;
  }

`;

const PostLink = styled(Link)`
    text-decoration:none;
  color:black;
  box-sizing: border-box;
`;
