import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import Box from "@/components/common/Box";
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";
import { ROUTES } from "@/constants/routes";
import { useHeader } from "@/context/HeaderContext";
import {
  MIN_PHONEBOOK_QUERY_LENGTH,
  PHONEBOOK_MIN_QUERY_MESSAGE,
} from "@/pages/mobile/phonebook/phonebookConfig";
import callinuBanner from "@/resources/assets/phonebook/callinu-banner.webp";
import callinuLogo from "@/resources/assets/phonebook/callinu-logo.webp";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
  MOBILE_PAGE_GUTTER,
} from "@/styles/responsive";

const MobilePhoneBookPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const [inputValue, setInputValue] = useState(searchParams.get("query") ?? "");

  useEffect(() => {
    setInputValue(searchParams.get("query") ?? "");
  }, [searchParams]);

  const handleSearchSubmit = () => {
    const nextQuery = inputValue.trim();

    if (nextQuery.length < MIN_PHONEBOOK_QUERY_LENGTH) {
      window.alert(PHONEBOOK_MIN_QUERY_MESSAGE);
      return;
    }

    const nextParams = new URLSearchParams();

    nextParams.set("query", nextQuery);

    navigate(
      nextParams.toString()
        ? `${ROUTES.PHONEBOOK.SEARCH}?${nextParams.toString()}`
        : ROUTES.PHONEBOOK.SEARCH,
    );
  };

  useHeader({
    title: "INU 전화번호부",
    hasback: true,
  });

  return (
    <MobilePhoneBookPageWrapper>
      <Box>
        <BannerSection>
          <BannerImage src={callinuBanner} alt="Callin U" />
        </BannerSection>
      </Box>

      <DescriptionSection>
        <LogoInfo>
          <LogoIcon src={callinuLogo} alt="INTIP" />
          <div className="text-group">
            <p className="sub-text">우리 학교 연락처를</p>
            <h2 className="main-title">
              <span>Callin U</span>가 <span className="highlight">INTIP</span>
              으로 찾아왔어요
            </h2>
            <p className="sub-text">원하는 연락처를 검색해보세요</p>
          </div>
        </LogoInfo>

        <GuideList>
          <GuideItem>
            <span className="number">1.</span>
            <div className="content">
              <h3>
                <strong>내선번호</strong>로 검색해보세요
              </h3>
              <p>
                우리 학교 전화번호는 032-835-[내선번호] 형식으로 찾을 수
                있어요.
              </p>
            </div>
          </GuideItem>

          <GuideItem>
            <span className="number">2.</span>
            <div className="content">
              <h3>
                <strong>이름, 소속, 직위</strong>로 검색해보세요
              </h3>
              <p>
                교직원·교수 정보는 이름, 소속, 상세소속, 직위, 담당업무,
                이메일로 찾을 수 있어요.
              </p>
            </div>
          </GuideItem>

          <GuideItem>
            <span className="number">3.</span>
            <div className="content">
              <h3>
                <strong>학과명 또는 위치</strong>로 검색해보세요
              </h3>
              <p>
                학과사무실 전화번호, 위치, 홈페이지, 단과대학 정보까지 함께
                찾을 수 있어요.
              </p>
            </div>
          </GuideItem>
        </GuideList>
      </DescriptionSection>

      <SearchSpacer />

      <FloatingSearchBar>
        <MobilePillSearchBar
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSearchSubmit}
          placeholder="이름, 소속, 학과명, 위치, 전화번호를 검색해보세요"
        />
      </FloatingSearchBar>
    </MobilePhoneBookPageWrapper>
  );
};

export default MobilePhoneBookPage;

const MobilePhoneBookPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 12px ${MOBILE_PAGE_GUTTER};
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
    margin: 0 auto;
    padding: 16px 0 40px;
  }
`;

const BannerSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const BannerImage = styled.img`
  width: 100px;
  max-width: 200px;
  height: auto;
`;

const DescriptionSection = styled.div`
  padding: 0 20px;
`;

const LogoInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;

  .text-group {
    display: flex;
    flex-direction: column;
  }

  .sub-text {
    font-size: 14px;
    color: #666;
    margin: 0;
  }

  .main-title {
    font-size: 18px;
    font-weight: 500;
    color: #333;
    line-height: 1.4;
    margin: 0;

    span {
      font-weight: 700;
      color: #2b6cb0;
    }

    .highlight {
      color: #4a90e2;
    }
  }
`;

const LogoIcon = styled.img`
  width: 54px;
  height: 54px;
`;

const GuideList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const GuideItem = styled.div`
  display: flex;
  gap: 4px;

  .number {
    font-size: 16px;
    font-weight: 700;
    color: #333;
    min-width: 20px;
  }

  .content {
    h3 {
      font-size: 16px;
      color: #333;
      margin: 0 0 4px;

      strong {
        font-weight: 700;
      }
    }

    p {
      font-size: 14px;
      color: #666;
      margin: 0;
    }
  }
`;

const SearchSpacer = styled.div`
  height: 88px;
`;

const FloatingSearchBar = styled.div`
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  z-index: 120;

  @media ${DESKTOP_MEDIA} {
    width: min(calc(100% - 48px), ${DESKTOP_CONTENT_MAX_WIDTH});
  }
`;
