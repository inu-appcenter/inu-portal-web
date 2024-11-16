import { useState } from "react";
import styled from "styled-components";
import heartEmpty from "resources/assets/posts/heart-empty.svg";
import heartFilled from "resources/assets/posts/heart-filled.svg";
import { putReplyLike } from "apis/replies";
import axios, { AxiosError } from "axios";

interface Props {
  id: number;
  like: number;
  isLiked: boolean;
}

export default function ReplyLikeButton({ id, like, isLiked }: Props) {
  const handleLike = async () => {
    try {
      const response = await putReplyLike(id);
      if (response.data === 1) {
        setLikeState(likeState + 1);
        setIsLikedState(!isLikedState);
      } else {
        setLikeState(likeState - 1);
        setIsLikedState(!isLikedState);
      }
    } catch (error) {
      console.error("댓글 좋아요 여부 변경 실패", error);
      if (
        axios.isAxiosError(error) &&
        (error as AxiosError & { isRefreshError?: boolean }).isRefreshError
      ) {
        console.warn("refreshError");
        return;
      }
      if (axios.isAxiosError(error) && error.response) {
        switch (error.response.status) {
          case 400:
            alert("자신의 댓글에는 추천을 할 수 없습니다.");
            break;
          case 404:
            alert("존재하지 않는 회원입니다. / 존재하지 않는 댓글입니다.");
            break;
          default:
            alert("댓글 좋아요 여부 변경 실패");
            break;
        }
      }
    }
  };

  const [likeState, setLikeState] = useState(like);
  const [isLikedState, setIsLikedState] = useState(isLiked);
  return (
    <ReplyLikeButtonWrapper>
      <img
        src={isLikedState ? heartFilled : heartEmpty}
        onClick={handleLike}
        alt=""
      />
      <span>{likeState}</span>
    </ReplyLikeButtonWrapper>
  );
}

const ReplyLikeButtonWrapper = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  img {
    height: 16px;
    width: 16px;
  }
`;
