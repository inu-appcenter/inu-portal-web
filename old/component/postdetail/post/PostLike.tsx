import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { handlePostLike } from "old/utils/API/Posts";
import heartEmptyImg from "../../../resource/assets/heart-empty-img.svg";
import heartFilledImg from "../../../resource/assets/heart-filled-img.svg";
import styled from "styled-components";

interface PostLikeProps {
  like: number;
  isLikedProp: boolean;
  hasAuthority: boolean;
}

export default function PostLike({
  like,
  isLikedProp,
  hasAuthority,
}: PostLikeProps) {
  const [likes, setLikes] = useState(like);
  const { id } = useParams<{ id: string }>();
  const [isLiked, setIsLiked] = useState(isLikedProp);
  const token = useSelector((state: any) => state.user.token);
  const [showError, setShowError] = useState<boolean>(false);

  useEffect(() => {
    setLikes(like);
  }, [like]);

  useEffect(() => {
    setIsLiked(isLikedProp);
  }, [isLikedProp]);

  const handleLikeClick = async () => {
    if (hasAuthority) {
      setShowError(true); // 본인 게시글인 경우 에러 표시
      setTimeout(() => setShowError(false), 5000); // 5초 후 에러 메시지 숨김
      return;
    }
    if (id === undefined) {
      console.error("ID is undefined");
      return;
    }
    if (token) {
      try {
        const result = await handlePostLike(token, id);
        if (result.status === 400) {
          alert("본인의 게시글에는 좋아요를 누를 수 없습니다.");
          return;
        }
        setIsLiked(!isLiked);
        if (result.body.data === -1) {
          setLikes(likes - 1);
        } else {
          setLikes(likes + 1);
        }
      } catch (error) {
        console.error("좋아요 처리 에러", error);
        alert("좋아요 처리 에러");
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
      <UtilityText>{likes}</UtilityText>
      {showError && (
        <ErrorMessage>본인 게시글에는 좋아요를 누를 수 없습니다.</ErrorMessage>
      )}
    </LikeContainer>
  );
}

// Styled Components
const ErrorMessage = styled.div`
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
`;

const LikeContainer = styled.span`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  cursor: url("/pointers/cursor-pointer.svg"), pointer;

  @media (max-width: 768px) {
    gap: 7px;
  }
`;

const UtilityImg = styled.img`
  height: 15px;
  width: auto;
`;

const UtilityText = styled.span`
  font-size: 15px;
  font-weight: 400;
`;
