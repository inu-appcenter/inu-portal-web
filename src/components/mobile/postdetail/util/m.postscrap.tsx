import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import styled from "styled-components";
import { ROUTES } from "@/constants/routes";
import { putScrap } from "@/apis/posts";
import useUserStore from "@/stores/useUserStore";
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
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  useEffect(() => {
    setScrapState(scrap);
    setIsScrapedState(isScrapedProp);
  }, [scrap, isScrapedProp]);

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

  const handleScrap = async () => {
    if (!confirmLoginRedirect()) {
      return;
    }

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
    <ScrapContainer onClick={handleScrap}>
      <Bookmark
        size={24}
        color={isScrapedState ? "#0061FF" : "#333D4B"}
        fill={isScrapedState ? "#0061FF" : "none"}
      />
      <span>{scrapState}</span>
    </ScrapContainer>
  );
}

const ScrapContainer = styled.div`
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
