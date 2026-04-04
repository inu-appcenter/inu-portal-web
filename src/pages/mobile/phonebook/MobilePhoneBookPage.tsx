import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import callinuBannerVideo from "@/resources/assets/phonebook/callinu-banner.mp4";
import callinuBanner from "@/resources/assets/phonebook/callinu-banner.webp";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
  MOBILE_PAGE_GUTTER,
} from "@/styles/responsive";

const BANNER_SECTION_HEIGHT = "clamp(180px, 42vw, 220px)";
const BANNER_PHONE_RADIUS = "10px";
const BANNER_STAGE_GAP = "16px";
/* 영상 이동 시간(0.82s)과 일치시켜 이동 완료 후 텍스트 등장 */
const BANNER_TEXT_REVEAL_DELAY_MS = 820; 
const DESKTOP_SEARCH_BAR_MAX_WIDTH = "760px";

const MobilePhoneBookPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const bannerVideoRef = useRef<HTMLVideoElement | null>(null);
  const [inputValue, setInputValue] = useState(searchParams.get("query") ?? "");
  const [isBannerShifted, setIsBannerShifted] = useState(false);
  const [isBannerTextVisible, setIsBannerTextVisible] = useState(false);

  useEffect(() => {
    setInputValue(searchParams.get("query") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const bannerVideo = bannerVideoRef.current;
    if (!bannerVideo) return;

    setIsBannerShifted(false);
    setIsBannerTextVisible(false);

    const startPlayback = () => {
      bannerVideo.pause();
      try {
        bannerVideo.currentTime = 0;
      } catch {
        return;
      }
      void bannerVideo.play().catch(() => setIsBannerShifted(true));
    };

    if (bannerVideo.readyState >= 2) {
      startPlayback();
    } else {
      bannerVideo.addEventListener("loadeddata", startPlayback, { once: true });
    }

    return () => bannerVideo.removeEventListener("loadeddata", startPlayback);
  }, []);

  /* 영상 이동 완료 후 텍스트 노출 타이머 */
  useEffect(() => {
    if (!isBannerShifted) return;
    const timeoutId = window.setTimeout(() => {
      setIsBannerTextVisible(true);
    }, BANNER_TEXT_REVEAL_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isBannerShifted]);

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

  useHeader({ title: "INU 전화번호부", hasback: true });

  const handleBannerPlaybackEnd = () => setIsBannerShifted(true);

  return (
    <MobilePhoneBookPageWrapper>
      <HeroSection>
        <HeroBannerColumn>
          <Box style={{ width: "100%", maxWidth: "500px" }}>
            <BannerSection>
              <BannerStage $isShifted={isBannerShifted}>
                <BannerVisual
                  layout /* 위치 이동 애니메이션 */
                  transition={{
                    layout: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
                  }}
                >
                  <BannerVideo
                    ref={bannerVideoRef}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    poster={callinuBanner}
                    controls={false}
                    disablePictureInPicture
                    disableRemotePlayback
                    controlsList="nodownload noplaybackrate nofullscreen noremoteplayback"
                    aria-label="Callin U"
                    onEnded={handleBannerPlaybackEnd}
                    onError={handleBannerPlaybackEnd}
                  >
                    <source src={callinuBannerVideo} type="video/mp4" />
                  </BannerVideo>
                </BannerVisual>

                <LogoInfo>
                  <AnimatePresence>
                    {isBannerTextVisible && (
                      <LogoInfoContent
                        /* 이동 완료 후 아래에서 위로 페이드인 */
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <p className="sub-text">우리 학교 연락처 앱</p>
                        <h2 className="main-title">
                          <span>Callin U</span>가{" "}
                          <span className="highlight">INTIP</span>으로
                          <br />
                          돌아왔어요
                        </h2>
                        <p className="sub-text">원하는 연락처를 검색해보세요</p>
                      </LogoInfoContent>
                    )}
                  </AnimatePresence>
                </LogoInfo>
              </BannerStage>
            </BannerSection>
          </Box>
        </HeroBannerColumn>

        <DescriptionSection>
          <GuideList>
            <GuideItem>
              <span className="number">1.</span>
              <div className="content">
                <h3>
                  <strong>내선번호</strong>로 검색해보세요
                </h3>
                <p>
                  우리 학교 전화번호는 032-835-<strong>[내선번호]</strong>{" "}
                  형식으로 찾을 수 있어요.
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
                  <strong>학과명</strong>으로 검색해보세요
                </h3>
                <p>
                  학과사무실 전화번호, 위치, 홈페이지, 단과대학 정보까지 함께
                  찾을 수 있어요.
                </p>
              </div>
            </GuideItem>
          </GuideList>
        </DescriptionSection>
      </HeroSection>

      <SearchSpacer />

      <FloatingSearchBar>
        <MobilePillSearchBar
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSearchSubmit}
          placeholder="검색어를 입력해주세요"
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
  align-items: center;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
    margin: 0 auto;
    padding: 16px 0 40px;
  }
`;

const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  gap: 24px;
  width: 100%;

  @media ${DESKTOP_MEDIA} {
    display: grid;
    grid-template-columns: minmax(0, 500px) minmax(0, 500px);
    align-items: center;
  }
`;

const HeroBannerColumn = styled.div`
  display: flex;
  justify-content: center;
  min-width: 0;
  width: 100%;
  overflow: visible;
`;

const BannerSection = styled.div`
  display: flex;
  width: 100%;
  height: ${BANNER_SECTION_HEIGHT};
`;

const BannerStage = styled.div<{ $isShifted: boolean }>`
  display: flex;
  width: 100%;
  height: 100%;
  /* 재생 중 중앙 정렬, 종료 후 evenly 배치 */
  justify-content: ${(props) => (props.$isShifted ? "space-evenly" : "center")};
  align-items: center;
  gap: ${(props) => (props.$isShifted ? BANNER_STAGE_GAP : "0px")};
  position: relative;
`;

const BannerVisual = styled(motion.div)`
  /* Flex 아이템화 */
  flex-shrink: 0;
  height: 100%;
  /* 너비를 항상 내부 영상 크기에 맞춤 (넙적해짐 방지) */
  width: fit-content;
  
  background: #fff;
  border-top-left-radius: ${BANNER_PHONE_RADIUS};
  border-top-right-radius: ${BANNER_PHONE_RADIUS};
  overflow: hidden;
  /* 그림자 제거 */
  position: relative;
  /* 비디오 중앙 정렬용 */
  display: flex;
  justify-content: center;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-top: 3px solid #111;
    border-left: 3px solid #111;
    border-right: 3px solid #111;
    border-top-left-radius: ${BANNER_PHONE_RADIUS};
    border-top-right-radius: ${BANNER_PHONE_RADIUS};
    pointer-events: none;
    box-sizing: border-box;
  }
`;

const BannerVideo = styled.video`
  display: block;
  height: 100%;
  width: auto;
  object-fit: contain;
  object-position: center bottom;
`;

const LogoInfo = styled.div`
  /* 가용 공간 점유 */
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  /* 폭 보장 및 최대치 제한 */
  min-width: 150px;
  max-width: 300px;
  overflow: hidden;
`;

const LogoInfoContent = styled(motion.div)`
  display: flex;
  flex-direction: column;
  width: 100%;

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
    margin: 4px 0;
    word-break: keep-all;

    span {
      font-weight: 700;
      color: #2b6cb0;
    }
    .highlight {
      color: #4a90e2;
    }
  }
`;

const DescriptionSection = styled.div`
  padding: 0 20px;
  @media ${DESKTOP_MEDIA} {
    width: 100%;
    padding: 0;
  }
`;

const GuideList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const GuideItem = styled.div`
  display: flex;
  gap: 8px;

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
      font-weight: 500;
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
    width: min(calc(100% - 48px), ${DESKTOP_SEARCH_BAR_MAX_WIDTH});
  }
`;
