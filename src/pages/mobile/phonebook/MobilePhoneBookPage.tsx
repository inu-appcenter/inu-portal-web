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
const DESKTOP_SEARCH_BAR_MAX_WIDTH = "760px";
const BANNER_EXPAND_DURATION = 820;
const BANNER_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const MobilePhoneBookPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const bannerVideoRef = useRef<HTMLVideoElement | null>(null);
  const bannerVisualRef = useRef<HTMLDivElement | null>(null);
  const pendingFlipRectRef = useRef<DOMRect | null>(null);
  const flipAnimationFrameRef = useRef<number | null>(null);
  const hasExpandedRef = useRef(false);

  const [inputValue, setInputValue] = useState(searchParams.get("query") ?? "");
  const [isBannerExpanded, setIsBannerExpanded] = useState(false);
  const [isBannerTextVisible, setIsBannerTextVisible] = useState(false);

  useEffect(() => {
    setInputValue(searchParams.get("query") ?? "");
  }, [searchParams]);

  const runExpandAnimation = () => {
    if (hasExpandedRef.current) {
      return;
    }

    hasExpandedRef.current = true;

    const visual = bannerVisualRef.current;

    if (visual) {
      pendingFlipRectRef.current = visual.getBoundingClientRect();
    }

    setIsBannerExpanded(true);
  };

  useEffect(() => {
    const bannerVideo = bannerVideoRef.current;

    if (!bannerVideo) {
      return;
    }

    hasExpandedRef.current = false;
    pendingFlipRectRef.current = null;
    setIsBannerExpanded(false);
    setIsBannerTextVisible(false);

    const startPlayback = () => {
      bannerVideo.pause();

      try {
        bannerVideo.currentTime = 0;
      } catch {
        runExpandAnimation();
        return;
      }

      void bannerVideo.play().catch(() => {
        runExpandAnimation();
      });
    };

    if (bannerVideo.readyState >= 2) {
      startPlayback();
      return;
    }

    bannerVideo.addEventListener("loadeddata", startPlayback, { once: true });

    return () => {
      bannerVideo.removeEventListener("loadeddata", startPlayback);
    };
  }, []);

  useEffect(() => {
    if (!isBannerExpanded) {
      return;
    }

    const visual = bannerVisualRef.current;
    const prevRect = pendingFlipRectRef.current;

    if (!visual || !prevRect) {
      return;
    }

    const nextRect = visual.getBoundingClientRect();
    const deltaX = prevRect.left - nextRect.left;

    pendingFlipRectRef.current = null;

    if (Math.abs(deltaX) < 1) {
      return;
    }

    visual.style.transition = "none";
    visual.style.transform = `translate3d(${deltaX}px, 0, 0)`;

    flipAnimationFrameRef.current = window.requestAnimationFrame(() => {
      visual.style.transition = `transform ${BANNER_EXPAND_DURATION}ms ${BANNER_EASE}`;
      visual.style.transform = "translate3d(0, 0, 0)";
    });

    return () => {
      if (flipAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(flipAnimationFrameRef.current);
        flipAnimationFrameRef.current = null;
      }
    };
  }, [isBannerExpanded]);

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

  const handleBannerPlaybackEnd = () => {
    runExpandAnimation();
  };

  useHeader({
    title: "INU 전화번호부",
    hasback: true,
  });

  return (
    <MobilePhoneBookPageWrapper>
      <HeroSection>
        <HeroBannerColumn>
          <Box style={{ width: "100%", maxWidth: "500px" }}>
            <BannerSection>
              <BannerStage $isExpanded={isBannerExpanded}>
                <BannerVisual ref={bannerVisualRef}>
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

                <LogoInfo
                  $isExpanded={isBannerExpanded}
                  onTransitionEnd={(event) => {
                    if (!isBannerExpanded) return;
                    if (event.propertyName !== "width") return;
                    setIsBannerTextVisible(true);
                  }}
                >
                  <AnimatePresence>
                    {isBannerTextVisible && (
                      <LogoInfoContent
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{
                          duration: 0.36,
                          ease: [0.22, 1, 0.36, 1],
                        }}
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
                  형식이에요.
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
                  <br />
                  학과 사무실 교직원 검색은 지원되지 않아요.
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
                  학과사무실 대표 전화번호와 위치, 홈페이지를 확인할 수 있어요.
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
`;

const BannerSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: stretch;
  width: 100%;
  height: ${BANNER_SECTION_HEIGHT};
  overflow: hidden;
`;

const BannerStage = styled.div<{ $isExpanded: boolean }>`
  width: 100%;
  height: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: ${({ $isExpanded }) =>
    $isExpanded ? "space-evenly" : "center"};
  gap: ${({ $isExpanded }) => ($isExpanded ? "clamp(12px, 4vw, 28px)" : "0px")};
  box-sizing: border-box;
  transition: gap ${BANNER_EXPAND_DURATION}ms ${BANNER_EASE};
`;

const BannerVisual = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex: 0 0 auto;
  width: fit-content;
  height: 100%;
  background: #fff;
  border-top-left-radius: ${BANNER_PHONE_RADIUS};
  border-top-right-radius: ${BANNER_PHONE_RADIUS};
  overflow: hidden;
  position: relative;

  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);

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
  max-width: none;
  object-fit: contain;
  object-position: center bottom;
  pointer-events: none;
  background: transparent;

  &::-webkit-media-controls {
    display: none !important;
  }

  &::-webkit-media-controls-enclosure {
    display: none !important;
  }
`;

const LogoInfo = styled.div<{ $isExpanded: boolean }>`
  width: ${({ $isExpanded }) =>
    $isExpanded ? "clamp(120px, 50vw, 220px)" : "0px"};
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  opacity: ${({ $isExpanded }) => ($isExpanded ? 1 : 0)};
  transition:
    width ${BANNER_EXPAND_DURATION}ms ease,
    opacity 0.2s ease;

  will-change: width, opacity;
`;

const LogoInfoContent = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  max-width: 100%;
  text-align: left;
  white-space: normal;
  word-break: keep-all;
  overflow-wrap: break-word;

  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0);

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
    max-width: none;
  }
`;

const GuideList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media ${DESKTOP_MEDIA} {
    gap: 24px;
  }
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
