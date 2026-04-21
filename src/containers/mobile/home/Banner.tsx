import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import styled from "styled-components";

import { ROUTES } from "@/constants/routes";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import { SOFT_CARD_SHADOW } from "@/styles/shadows";

import deptNoticeBanner from "@/resources/assets/banner/학과공지알리미.webp";
import busBanner from "@/resources/assets/banner/인입런.webp";
import surveyBanner from "@/resources/assets/banner/설문배너.webp";
import appcenterBanner from "@/resources/assets/banner/앱센터배너.webp";

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

  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
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
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    syncSelectedIndex();
    emblaApi.on("select", syncSelectedIndex);
    emblaApi.on("reInit", syncSelectedIndex);

    return () => {
      emblaApi.off("select", syncSelectedIndex);
      emblaApi.off("reInit", syncSelectedIndex);
    };
  }, [emblaApi]);

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
    <BannerWrapper>
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
