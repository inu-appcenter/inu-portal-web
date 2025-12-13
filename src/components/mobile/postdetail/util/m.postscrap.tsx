import { useEffect, useState } from "react";
import scrapEmptyImg from "@/resources/assets/posts/scrap-empty.svg";
import scrapFilledImg from "@/resources/assets/posts/scrap-filled.svg";
import styled from "styled-components";
import { putScrap } from "@/apis/posts";
import axios, { AxiosError } from "axios";

interface PostScrapProps {
  id: number;
  scrap: number;
  isScrapedProp: boolean;
}

export default function PostScrap({
  id,
  scrap,
  isScrapedProp,
}: PostScrapProps) {
  const [scrapState, setScrapState] = useState(scrap);
  const [isScrapedState, setIsScrapedState] = useState(isScrapedProp);

  useEffect(() => {
    setScrapState(scrap);
    setIsScrapedState(isScrapedProp);
  }, [scrap, isScrapedProp]);

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
    <ScrapContainer>
      <img
        className="UtilityImg"
        src={isScrapedState ? scrapFilledImg : scrapEmptyImg}
        alt="scrapImg"
        onClick={handleScrap}
      />
      <span>{scrapState}</span>
    </ScrapContainer>
  );
}

const ScrapContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  img.UtilityImg {
    width: 14px;
  }
`;
