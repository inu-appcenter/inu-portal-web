import { useState, useEffect } from "react";
import styled from "styled-components";
import "@material/web/fab/fab.js";
import { MdRestaurantMenu } from "react-icons/md";
import { BOTTOM_NAV_SAFE_HEIGHT } from "@/containers/mobile/common/MobileBottomNav";
import { DESKTOP_CONTENT_MAX_WIDTH, DESKTOP_MEDIA } from "@/styles/responsive";

interface FoodRouletteFabProps {
  onClick: () => void;
}

export default function FoodRouletteFab({ onClick }: FoodRouletteFabProps) {
  const [isExtended, setIsExtended] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY || 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY =
            window.scrollY ||
            document.documentElement.scrollTop ||
            document.getElementById("app-scroll-view")?.scrollTop ||
            0;

          if (currentScrollY < 30) {
            setIsExtended(true);
          } else if (currentScrollY > lastScrollY + 6) {
            setIsExtended(false);
          } else if (currentScrollY < lastScrollY - 10) {
            setIsExtended(true);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    const scrollView = document.getElementById("app-scroll-view");
    if (scrollView) {
      scrollView.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollView) {
        scrollView.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <FabWrapper>
      {/* 구글 공식 @material/web 오리지널 <md-fab> */}
      <md-fab
        variant="primary"
        label={isExtended ? "돌림판" : undefined}
        lowered={true}
        onClick={onClick}
        aria-label="식당 돌림판 열기"
        title="돌림판"
      >
        <span slot="icon" style={{ display: "inline-flex", alignItems: "center" }}>
          <MdRestaurantMenu size={22} />
        </span>
      </md-fab>
    </FabWrapper>
  );
}

const FabWrapper = styled.div`
  position: fixed;
  bottom: calc(${BOTTOM_NAV_SAFE_HEIGHT} + 16px);
  right: 16px;
  z-index: 1001;

  md-fab {
    /* 구글 공식 Material 3 M3 디자인 토큰 */
    --md-fab-container-shape: 16px; /* M3 공식 16dp squircle */
    --md-fab-container-color: var(--blue-100); /* M3 Primary Container */
    --md-fab-icon-color: var(--blue-900); /* M3 On Primary Container */
    --md-fab-label-text-color: var(--blue-900);
    --md-fab-container-elevation: 0; /* 배경 그림자 없음 */
    --md-fab-container-shadow-color: transparent;
    --md-fab-label-text-font: inherit;
    --md-fab-label-text-size: 14px;
    --md-fab-label-text-weight: 700;
    --md-fab-label-text-tracking: -0.2px;

    cursor: pointer;
    user-select: none;
    transition: transform 0.15s ease;

    &:hover {
      --md-fab-container-color: var(--blue-200);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  @media ${DESKTOP_MEDIA} {
    right: calc(50% - min(100%, ${DESKTOP_CONTENT_MAX_WIDTH}) / 2 + 24px);
    bottom: 32px;
  }
`;
