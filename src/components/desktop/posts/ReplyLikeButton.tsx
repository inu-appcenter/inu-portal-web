import { useEffect, useState } from "react";
import styled from "styled-components";
import { useQueryClient } from "@tanstack/react-query";
import { heartEmpty, heartFilled } from "@/resources/assets/icons/posts";
import { putReplyLike } from "@/apis/replies";
import axios, { AxiosError } from "axios";

interface Props {
  id: number;
  like: number;
  isLiked: boolean;
}

export default function ReplyLikeButton({ id, like, isLiked }: Props) {
  const [likeState, setLikeState] = useState(like);
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const queryClient = useQueryClient();

  // 댓글은 reply.id가 key라 부모가 새 데이터를 내려줘도 리마운트되지
  // 않는다. props가 바뀌면 로컬 state를 재동기화해서, 서버에서 다시
  // 받아온 최신 값에 이 버튼이 계속 박제되지 않도록 한다.
  useEffect(() => {
    setLikeState(like);
    setIsLikedState(isLiked);
  }, [like, isLiked]);

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
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (error) {
      console.error("댓글 좋아요 여부 변경 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
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
