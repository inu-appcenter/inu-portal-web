import { useState } from "react";
import { useSelector } from "react-redux";
import { handleRepliesLike } from "../../../utils/API/Replies";
import heartEmptyImg from "../../../resource/assets/heart-empty-img.svg";
import heartFilledImg from "../../../resource/assets/heart-filled-img.svg";
import styled from "styled-components";

interface CommentLikeProps {
  id: number;
  like: number;
  isLikedProp: boolean;
}

export default function CommentLike({
  id,
  like,
  isLikedProp,
}: CommentLikeProps) {
  const [likes, setLikes] = useState(like);
  const [isLiked, setIsLiked] = useState(isLikedProp);
  const token = useSelector((state: any) => state.user.token);

  const handleLikeClick = async () => {
    if (token) {
      try {
        const result = await handleRepliesLike(token, id);
        if (result.status === 200) {
          setIsLiked(!isLiked);
          setLikes(result.body.data === -1 ? likes - 1 : likes + 1);
        } else if (result.status === 400) {
          alert("자신의 댓글에는 추천을 할 수 없습니다.");
        } else if (result.status === 401) {
          alert("존재하지 않는 회원입니다. / 존재하지 않는 댓글입니다.");
        } else {
          alert("좋아요 실패");
        }
      } catch (error) {
        console.error("좋아요 에러", error);
        alert("좋아요 에러");
      }
    } else {
      alert("로그인 필요");
    }
  };

  return (
    <LikeContainer>
      <UtilityImg
        src={isLiked ? heartFilledImg : heartEmptyImg}
        alt="heartImg"
        onClick={handleLikeClick}
      />
      <ContentText>{likes}</ContentText>
    </LikeContainer>
  );
}

// Styled Components
const LikeContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const UtilityImg = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 5px;
`;

const ContentText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #757575;
`;
