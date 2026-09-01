import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import styled from "styled-components";

import { ROUTES } from "@/constants/routes";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import { SOFT_CARD_SHADOW } from "@/styles/shadows";

import {
  deptNoticeBanner,
  inipreonBanner as busBanner,
  surveyBanner,
  appcenterBanner,
  appcenterRecruitBanner,
  ainuBanner,
} from "@/resources/assets/illustrations/banner";

import WeatherForm from "./Weather.tsx";
import { mixpanelTrack } from "@/utils/mixpanel";

type BannerItem = {
  id: string;
  alt: string;
  onClick?: () => void;
  render: () => ReactNode;
};

const openExternalLink = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const Banner = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);

  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        playOnInit: false,
      }),
    [],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "center",
      loop: true,
      skipSnaps: false,
      dragFree: false,
      containScroll: false,
      startIndex: 0,
    },
    [autoplay],
  );

  const banners = useMemo<BannerItem[]>(
    () => [
      {
        id: "weather",
        alt: "인천대학교 날씨 배너",
        onClick: () =>
          openExternalLink("https://weather.naver.com/today/11185106"),
        render: () => (
          <BannerSurface>
            <WeatherForm />
          </BannerSurface>
        ),
      },
      {
        id: "appcenter-recruit",
        alt: "앱센터 18.5기 모집 배너",
        onClick: () => openExternalLink("https://home.inuappcenter.kr/joinus/239"),
        render: () => (
          <BannerSurface>
            <BannerImage
              src={appcenterRecruitBanner}
              alt="앱센터 18.5기 모집 배너"
              loading="eager"
            />
          </BannerSurface>
        ),
      },
      {
        id: "ainu",
        alt: "AINU 배너",
        onClick: () => openExternalLink("https://ainu.inu.ac.kr/"),
        render: () => (
          <BannerSurface>
            <BannerImage
              src={ainuBanner}
              alt="AINU 배너"
              loading="eager"
            />
          </BannerSurface>
        ),
      },
      {
        id: "department-notice",
        alt: "학과 공지 알리미 배너",
        onClick: () => navigate(ROUTES.BOARD.DEPT_NOTICE),
        render: () => (
          <BannerSurface>
            <BannerImage
              src={deptNoticeBanner}
              alt="학과 공지 알리미 배너"
              loading="eager"
            />
          </BannerSurface>
        ),
      },
      {
        id: "bus",
        alt: "인입런 배너",
        onClick: () => navigate(ROUTES.BUS.ROOT),
        render: () => (
          <BannerSurface>
            <BannerImage src={busBanner} alt="인입런 배너" loading="eager" />
          </BannerSurface>
        ),
      },
      {
        id: "survey",
        alt: "설문 배너",
        onClick: () => openExternalLink("https://forms.gle/DHk5zsAF8Ko3SN38A"),
        render: () => (
          <BannerSurface>
            <BannerImage src={surveyBanner} alt="설문 배너" loading="eager" />
          </BannerSurface>
        ),
      },
      // {
      //   id: "unidorm",
      //   alt: "유니돔 배너",
      //   onClick: () => openExternalLink("https://unidorm.inuappcenter.kr"),
      //   render: () => (
      //     <BannerSurface>
      //       <BannerImage
      //         src={unidormBanner}
      //         alt="유니돔 배너"
      //         loading="eager"
      //       />
      //     </BannerSurface>
      //   ),
      // },
      {
        id: "appcenter",
        alt: "앱센터 배너",
        onClick: () => openExternalLink("https://home.inuappcenter.kr"),
        render: () => (
          <BannerSurface>
            <BannerImage
              src={appcenterBanner}
              alt="앱센터 배너"
              loading="eager"
            />
          </BannerSurface>
        ),
      },
    ],
    [navigate],
  );

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const syncSelectedIndex = () => {
      const index = emblaApi.selectedScrollSnap();
      setSelectedIndex(index);

      // // 믹스패널 트래킹: 배너 슬라이드 노출
      // const banner = banners[index];
      // if (banner) {
      //   mixpanelTrack.promotionImpression(banner.alt, "Home Banner");
      // }
    };

    syncSelectedIndex();
    emblaApi.on("select", syncSelectedIndex);
    emblaApi.on("reInit", syncSelectedIndex);

    return () => {
      emblaApi.off("select", syncSelectedIndex);
      emblaApi.off("reInit", syncSelectedIndex);
    };
  }, [emblaApi]);

  useEffect(() => {
    const target = bannerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          autoplay.play();
        } else {
          autoplay.stop();
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [autoplay]);

  const resetAutoplay = () => {
    autoplay.reset();
  };

  const handleSlideClick = (index: number, onClick?: () => void) => {
    if (!emblaApi) {
      onClick?.();
      return;
    }

    if (index !== selectedIndex) {
      emblaApi.scrollTo(index);
      resetAutoplay();
      return;
    }

    const banner = banners[index];
    if (banner) {
      mixpanelTrack.featureClicked(banner.alt, "Home Banner");
    }
    onClick?.();
  };

  return (
    <BannerWrapper ref={bannerRef}>
      <Viewport ref={emblaRef}>
        <Track>
          {banners.map((banner, index) => (
            <Slide key={banner.id}>
              <BannerButton
                type="button"
                $isSelected={index === selectedIndex}
                onClick={() => handleSlideClick(index, banner.onClick)}
                aria-label={banner.alt}
              >
                {banner.render()}
              </BannerButton>
            </Slide>
          ))}
        </Track>
      </Viewport>

      <PaginationDots aria-label="홈 배너 페이지네이션">
        {banners.map((banner, index) => (
          <PaginationDot
            key={banner.id}
            type="button"
            $active={index === selectedIndex}
            onClick={() => {
              emblaApi?.scrollTo(index);
              resetAutoplay();
            }}
            aria-label={`${index + 1}번째 배너 보기`}
            aria-current={index === selectedIndex}
          />
        ))}
      </PaginationDots>

      <PageCounter aria-label={`현재 ${selectedIndex + 1}페이지, 총 ${banners.length}페이지`}>
        <span className="current">{selectedIndex + 1}</span>
        <span className="divider">/</span>
        <span className="total">{banners.length}</span>
      </PageCounter>
    </BannerWrapper>
  );
};

export default Banner;

const BannerWrapper = styled.div`
  position: relative;
  background: transparent;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: ${SOFT_CARD_SHADOW};

  @media ${DESKTOP_MEDIA} {
    box-shadow: none;
  }
`;

const Viewport = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
`;

const Track = styled.div`
  display: flex;
  align-items: stretch;
`;

const Slide = styled.div`
  flex: 0 0 100%;
  min-width: 0;
  display: flex;
  justify-content: center;

  @media ${DESKTOP_MEDIA} {
    flex: 0 0 40%;
    padding: 0 12px;
  }
`;

const BannerButton = styled.button<{ $isSelected: boolean }>`
  display: block;
  width: 100%;
  padding: 0;
  background: transparent;
  opacity: ${(props) => (props.$isSelected ? 1 : 0.55)};
  transition:
    transform 0.35s ease,
    opacity 0.35s ease,
    filter 0.35s ease;
  filter: ${(props) => (props.$isSelected ? "none" : "saturate(0.9)")};

  @media ${DESKTOP_MEDIA} {
    width: 100%;
    transform: ${(props) => (props.$isSelected ? "scale(1)" : "scale(0.9)")};
  }
`;

const BannerSurface = styled.div`
  width: 100%;
  aspect-ratio: 2 / 1;
  overflow: hidden;
  background: transparent;

  @media ${DESKTOP_MEDIA} {
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`;

const BannerImage = styled.img`
  display: block;
  width: 100%;
  height: 100%;

  &.banner-image--overscan {
    width: calc(100% + 36px);
    max-width: none;
    margin-left: -18px;
  }

  &[src$=".svg"] {
    object-fit: fill;
  }

  @media ${DESKTOP_MEDIA} {
    object-fit: cover;

    &.banner-image--overscan {
      width: calc(100% + 72px);
      margin-left: -36px;
    }

    &[src$=".svg"] {
      object-fit: fill;
    }
  }
`;

const PaginationDots = styled.div`
  position: absolute;
  left: 50%;
  bottom: 10px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  transform: translateX(-50%);

  @media ${DESKTOP_MEDIA} {
    bottom: 14px;
  }
`;

const PaginationDot = styled.button<{ $active: boolean }>`
  display: block;
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background-color: ${(props) =>
    props.$active
      ? "var(--swiper-theme-color, #007aff)"
      : "rgba(0, 0, 0, 0.2)"};
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
  transform: ${(props) => (props.$active ? "scale(1)" : "scale(0.95)")};
`;

const PageCounter = styled.div`
  position: absolute;
  right: 12px;
  bottom: 8px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px 8px;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  color: #ffffff;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.2px;
  pointer-events: none;
  user-select: none;

  span.current {
    font-weight: 700;
    color: #ffffff;
  }

  span.divider {
    opacity: 0.6;
    margin: 0 1px;
  }

  span.total {
    opacity: 0.75;
  }

  @media ${DESKTOP_MEDIA} {
    right: calc(30% - 12px);
    bottom: 12px;
  }
`;
