import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import styled from "styled-components";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
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
      // 게시글 리스트(마이페이지, 커뮤니티 목록 등)가 들고 있는 캐시된 like
      // 값은 이 컴포넌트의 로컬 state와 별개라 갱신되지 않는다. 리스트를
      // 다시 불러오도록 무효화한다. (queryKey 접두사 매칭으로
      // ["posts","mobile",category] 등도 함께 무효화됨)
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (error) {
      console.error("게시글 좋아요 여부 변경 실패", error);
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
    <LikeContainer onClick={handleLike}>
      <Heart
        size={24}
        color={isLikedState ? "#ef4444" : "#333D4B"}
        fill={isLikedState ? "#ef4444" : "none"}
      />
      <span>{likeState}</span>
    </LikeContainer>
  );
}

const LikeContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  height: 44px;
  cursor: pointer;

  span {
    font-family: Pretendard, sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.6;
    color: var(--text-secondary, #333d4b);
  }
`;
