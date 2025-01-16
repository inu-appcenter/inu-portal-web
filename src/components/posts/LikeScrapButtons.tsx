import { useState } from "react";
import styled from "styled-components";
import heartEmpty from "resources/assets/posts/heart-empty.svg";
import heartFilled from "resources/assets/posts/heart-filled.svg";
import scrapEmpty from "resources/assets/posts/scrap-empty.svg";
import scrapFilled from "resources/assets/posts/scrap-filled.svg";
import { putLike } from "apis/posts";
import { putScrap } from "apis/posts";
import { postReports } from "apis/reports";
import { reportsReasons } from "resources/strings/reportsReasons";
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");

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

  const handleReports = async () => {
    if (!selectedReason) {
      alert("신고 사유를 선택해주세요.");
      return;
    }

    const comment = prompt("추가 의견을 입력해주세요. (선택 사항)");

    try {
      await postReports(id, selectedReason, comment || "");
      alert("신고가 완료되었습니다. 검토까지는 최대 24시간 소요됩니다.");
      setSelectedReason("");
      setShowDropdown(false);
    } catch (error) {
      console.error("신고하기 실패", error);
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        switch (error.response.status) {
          default:
            alert("신고하기 실패");
            break;
        }
      }
    }
  };

  return (
    <LikeScrapButtonsWrapper>
      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        className="reports-button"
      >
        신고하기
      </button>

      {showDropdown && (
        <DropdownWrapper>
          <span className="desc">
            신고 사유에 맞지 않는 신고일 경우, 해당 신고는 처리되지 않습니다.
          </span>
          <span className="desc">
            신고 접수 시 관리자의 검토 후, 해당 사용자는 서비스 이용이 제한될 수
            있습니다.
          </span>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            <option value="">신고 사유를 선택하세요</option>
            {reportsReasons.map((reason, index) => (
              <option key={index} value={reason}>
                {reason}
              </option>
            ))}
          </select>
          <div>
            <button className="reports-button" onClick={handleReports}>
              제출
            </button>
            <button
              className="cancel-button"
              onClick={() => setShowDropdown(false)}
            >
              취소
            </button>
          </div>
        </DropdownWrapper>
      )}

      <div>
        <img
          src={isLikedState ? heartFilled : heartEmpty}
          onClick={handleLike}
          alt=""
        />
        <span>{likeState}</span>
      </div>
      <div>
        <button className="scrap-button" onClick={handleScrap}>
          <img src={isScrapedState ? scrapFilled : scrapEmpty} alt="" />
          스크랩
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
  position: relative;
  .reports-button {
    color: red;
    background-color: transparent;
    border: 1px solid;
    border-radius: 4px;
  }
  div {
    font-size: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    .scrap-button {
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

const DropdownWrapper = styled.div`
  position: absolute;
  top: -120px;
  right: 0;
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 4px;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  .desc {
    font-size: 14px;
  }
  select {
    padding: 4px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
  .cancel-button {
  }
`;
