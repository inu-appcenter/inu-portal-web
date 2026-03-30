import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import heartEmptyImg from "@/resources/assets/posts/heart-empty.svg";
import heartFilledImg from "@/resources/assets/posts/heart-filled.svg";
import styled from "styled-components";
import { ROUTES } from "@/constants/routes";
import { putLike } from "@/apis/posts";
import useUserStore from "@/stores/useUserStore";
import axios, { AxiosError } from "axios";

interface PostLikeProps {
  id: number;
  like: number;
  isLikedProp: boolean;
}

export default function PostLike({ id, like, isLikedProp }: PostLikeProps) {
  const [likeState, setLikeState] = useState(like);
  const [isLikedState, setIsLikedState] = useState(isLikedProp);
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  useEffect(() => {
    setLikeState(like);
    setIsLikedState(isLikedProp);
  }, [like, isLikedProp]);

  const confirmLoginRedirect = () => {
    if (isLoggedIn) {
      return true;
    }

    const shouldMoveLoginPage = window.confirm(
      "로그인이 필요해요. 로그인페이지로 이동할까요?",
    );

    if (shouldMoveLoginPage) {
      navigate(ROUTES.LOGIN);
    }

    return false;
  };

  const handleLike = async () => {
    if (!confirmLoginRedirect()) {
      return;
    }

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
