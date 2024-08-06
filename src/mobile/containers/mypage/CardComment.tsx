import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import HeartFilledImg from '../../../resource/assets/heart-filled-img.svg';

interface Comment {
  id: number;
  title: string;
  replyCount: number;
  content: string;
  like: number;
  postId: number;
  createDate: string;
  modifiedDate: string;
}

interface TipsCardContainerProps {
  posts: Comment[];
}

export default function CardComment({ posts }: TipsCardContainerProps) {
  const navigate = useNavigate();

  const handleDocumentClick = (id: number) => {
    navigate(`/m/home/tips/postdetail?id=${id}`);
  };

  useEffect(()=> {
    console.log("comment",posts);
  },[]);

  return (
    <CardWrapper>
      <p><span>All</span> {posts.length}</p>
      <TipsCardListWrapper>
        {posts.map((p) => (
          <TipsCardWrapper key={p.id} onClick={() => handleDocumentClick(p.postId)}>
            <Date>{p.createDate}</Date>
            <Content>{p.content}</Content>
            <LikeWrapper>
              <img src={HeartFilledImg} />
              <Like>{p.like}</Like>
              <Like>·</Like>
              <Like>댓글 {p.replyCount}</Like>
            </LikeWrapper>
            <Title>{p.title}</Title>
          </TipsCardWrapper>
        ))}
      </TipsCardListWrapper>
    </CardWrapper>
  );
}

const CardWrapper = styled.div`
  font-family: Inter;
  font-size: 15px;
  font-weight: 600;
  color: #0E4D9D;
  span {
    color: #969696;
  }
  p {
    padding-left: 28px;
  }
`;

const TipsCardListWrapper = styled.div`
  background-color: #F6F9FF;
  min-height: calc(100svh - 72px - 49px - 18px - 64px - 78px);
  height: 100%;
  padding-top: 24px;
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TipsCardWrapper = styled.div`
  height: 126px;
  width: calc(100% - 28px);
  padding: 14px 0 14px 28px;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;


const Date = styled.div`
  font-size: 7px;
  font-weight: 400;
  color: #757575;
`;

const Content = styled.div`
  font-size: 10px;
  font-weight: 400;
  color: #000000;
  height: 40px;
`;

const LikeWrapper = styled.div`
  display: flex;
  gap: 6px;
  font-size: 8px;
  font-weight: 400;
  color: #757575;
  height: 10px;
  align-items: center;
  img {
    height: 10px;
  }
`

const Like = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.div`
  padding-left: 8px;
  width: 228px;
  max-width: 90%;
  height: 18px;
  font-size: 8px;
  font-weight: 600;
  color: #000000;
  background-color: #F3F3F3;
  display: flex;
  align-items: center;
`