import { useState } from "react";
import styled from "styled-components";
import heartEmpty from "resources/assets/posts/heart-empty.svg";
import heartFilled from "resources/assets/posts/heart-filled.svg";
import scrapImage from "resources/assets/posts/scrap.svg";
import { putLike } from "apis/posts";
import { putScrap } from "apis/posts";
import axios, { AxiosError } from "axios";

interface Props {
  id: number;
  like: number;
  isLiked: boolean;
  scrap: number;
  isScraped: boolean;
}

export default function LikeScrapButtons({
  id,
  like,
  isLiked,
  scrap,
  isScraped,
}: Props) {
  const [likeState, setLikeState] = useState(like);
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const [scrapState, setScrapState] = useState(scrap);
  const [isScrapedState, setIsScrapedState] = useState(isScraped);

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

  const handleScrap = async () => {
    try {
      const response = await putScrap(id);
      if (response.data === 1) {
        setScrapState(scrapState + 1);
        setIsScrapedState(!isScrapedState);
      } else {
        setScrapState(scrapState - 1);
        setIsScrapedState(!isScrapedState);
      }
    } catch (error) {
      console.error("스크랩 여부 변경 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        switch (error.response.status) {
          case 404:
            alert("존재하지 않는 회원입니다. / 존재하지 않는 게시글입니다.");
            break;
          default:
            alert("스크랩 여부 변경 실패");
            break;
        }
      }
    }
  };

  return (
    <LikeScrapButtonsWrapper>
      <div>
        <img
          src={isLikedState ? heartFilled : heartEmpty}
          onClick={handleLike}
          alt=""
        />
        <span>{likeState}</span>
      </div>
      <div>
        <button onClick={handleScrap}>
          <img src={scrapImage} alt="" />
          {isScrapedState ? "스크랩 취소" : "스크랩"}
        </button>
        <span>{scrapState}</span>
      </div>
    </LikeScrapButtonsWrapper>
  );
}

const LikeScrapButtonsWrapper = styled.span`
  align-self: flex-end;
  display: flex;
  gap: 24px;
  align-items: center;
  div {
    font-size: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    button {
      width: 120px;
      height: 32px;
      display: flex;
      align-items: center;
      padding-left: 16px;
      gap: 12px;
      background: linear-gradient(
        90deg,
        rgba(194, 205, 255, 0.7) 0%,
        rgba(197, 223, 255, 0.7) 100%
      );
      border-radius: 8px;
      border: none;
      img {
        height: 20px;
      }
    }
    img {
      height: 24px;
    }
    span {
      min-width: 24px;
    }
  }
`;
