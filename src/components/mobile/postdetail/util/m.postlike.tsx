import { useEffect, useState } from "react";
import heartEmptyImg from "@/resources/assets/posts/heart-empty.svg";
import heartFilledImg from "@/resources/assets/posts/heart-filled.svg";
import styled from "styled-components";
import { putLike } from "@/apis/posts";
import axios, { AxiosError } from "axios";

interface PostLikeProps {
  id: number;
  like: number;
  isLikedProp: boolean;
}

export default function PostLike({ id, like, isLikedProp }: PostLikeProps) {
  const [likeState, setLikeState] = useState(like);
  const [isLikedState, setIsLikedState] = useState(isLikedProp);

  useEffect(() => {
    setLikeState(like);
    setIsLikedState(isLikedProp);
  }, [like, isLikedProp]);

  const handleLike = async () => {
    try {
      const response = await putLike(id);
      if (response.data === 1) {
        setLikeState(likeState + 1);
        setIsLikedState(!isLikedState);
      } else {
        setLikeState(likeState - 1);
        setIsLikedState(!isLikedState);
      }
    } catch (error) {
      console.error("게시글 좋아요 여부 변경 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        switch (error.response.status) {
          case 400:
            alert("자신의 게시글에는 추천을 할 수 없습니다.");
            break;
          case 404:
            alert("존재하지 않는 회원입니다. / 존재하지 않는 게시글입니다.");
            break;
          default:
            alert("게시글 좋아요 여부 변경 실패");
            break;
        }
      }
    }
  };

  return (
    <LikeContainer>
      <img
        className="UtilityImg"
        src={isLikedState ? heartFilledImg : heartEmptyImg}
        alt="heartImg"
        onClick={handleLike}
      />
      <span>{likeState}</span>
    </LikeContainer>
  );
}

const LikeContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  img.UtilityImg {
    width: 23px;
  }
`;
