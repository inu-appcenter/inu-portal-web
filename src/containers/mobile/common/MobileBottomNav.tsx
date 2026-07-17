import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { ROUTES } from "@/constants/routes";
import { mixpanelTrack } from "@/utils/mixpanel";
import HomeIcon from "@/resources/assets/mobile-nav-v2/Icon_Home.svg?react";
import TimetableIcon from "@/resources/assets/mobile-nav-v2/Icon_Timetable.svg?react";
import BusIcon from "@/resources/assets/mobile-nav-v2/Icon_Bus.svg?react";
import ChatIcon from "@/resources/assets/mobile-nav-v2/Icon_Chat.svg?react";
import MyIcon from "@/resources/assets/mobile-nav-v2/Icon_My.svg?react";
import { DESKTOP_MEDIA, DESKTOP_CONTENT_MAX_WIDTH } from "@/styles/responsive";
import { getUnreadTotalCount } from "@/apis/chat";
import useUserStore from "@/stores/useUserStore";

const NAV_ITEMS = [
  {
    to: ROUTES.HOME_V2,
    icon: HomeIcon,
    label: "홈",
  },
  {
    to: ROUTES.TIMETABLE.ROOT,
    icon: TimetableIcon,
    label: "시간표",
  },
  {
    to: ROUTES.BUS.ROOT,
    icon: BusIcon,
    label: "인입런",
  },
  {
    to: ROUTES.CHAT.LIST,
    icon: ChatIcon,
    label: "채팅",
    key: "chat",
  },
  {
    to: ROUTES.MYPAGE.ROOT,
    icon: MyIcon,
    label: "마이페이지",
  },
];

const getPath = (width: number, height: number, activeX: number) => {
  const topY = 24; // 본체 상단 높이
  const humpWidth = 96; // 돔 너비

  const x0 = activeX - humpWidth / 2;
  const x1 = activeX + humpWidth / 2;

  const cp1x = x0 + 16;
  const cp1y = topY;
  const cp2x = activeX - 22;
  const cp2y = 2;

  const cp3x = activeX + 22;
  const cp3y = 2;
  const cp4x = x1 - 16;
  const cp4y = topY;

  return `M 0 ${topY} L ${x0} ${topY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${activeX} 2 C ${cp3x} ${cp3y}, ${cp4x} ${cp4y}, ${x1} ${topY} L ${width} ${topY} L ${width} ${height} L 0 ${height} Z`;
};

// 그림자용 라인 패스 생성
const getLinePath = (width: number, activeX: number) => {
  const topY = 24;
  const humpWidth = 96;

  const x0 = activeX - humpWidth / 2;
  const x1 = activeX + humpWidth / 2;

  const cp1x = x0 + 16;
  const cp1y = topY;
  const cp2x = activeX - 22;
  const cp2y = 2;

  const cp3x = activeX + 22;
  const cp3y = 2;
  const cp4x = x1 - 16;
  const cp4y = topY;

  return `M -20 ${topY} L ${x0} ${topY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${activeX} 2 C ${cp3x} ${cp3y}, ${cp4x} ${cp4y}, ${x1} ${topY} L ${width + 20} ${topY}`;
};

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = !!tokenInfo.accessToken;

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 390, height: 88 });

  const { data: unreadResponse } = useQuery({
    queryKey: ["unreadTotalCount"],
    queryFn: getUnreadTotalCount,
    refetchInterval: 30000,
    enabled: isLoggedIn,
  });

  const totalUnreadCount = unreadResponse?.data?.totalUnreadCount || 0;

  const getIndexByPath = (path: string) => {
    const index = NAV_ITEMS.findIndex((item) => {
      if (item.to === ROUTES.HOME_V2) return path === ROUTES.HOME_V2;
      return path === item.to || path.startsWith(item.to);
    });
    return index === -1 ? 0 : index;
  };

  const activeIndex = getIndexByPath(location.pathname);

  // 컨테이너 크기 동적 감지
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateDimensions = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    observer.observe(element);
    window.addEventListener("resize", updateDimensions);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const handleNavClick = (to: string, label: string) => {
    const isChat = to === ROUTES.CHAT.LIST;
    const isCurrentlyActive =
      location.pathname === to || location.pathname.startsWith(to);

    if (isChat && isCurrentlyActive) {
      const params = new URLSearchParams(location.search);
      const currentCategory = params.get("category") || "개인";
      const nextCategory =
        currentCategory === "개인"
          ? "오픈채팅"
          : currentCategory === "오픈채팅"
            ? "친구"
            : "개인";
      params.set("category", nextCategory);
      navigate(`${to}?${params.toString()}`, { replace: true });
      return;
    }

    mixpanelTrack.navTabClicked(label);

    if (isChat) {
      const savedCategory = localStorage.getItem("lastChatCategory");
      const target = savedCategory ? `${to}?category=${savedCategory}` : to;
      navigate(target, { replace: true });
      return;
    }

    navigate(to, { replace: true });
  };

  const maxContentWidth = parseInt(DESKTOP_CONTENT_MAX_WIDTH, 10) || 1600;
  const contentWidth = Math.min(dimensions.width, maxContentWidth);
  const leftOffset = (dimensions.width - contentWidth) / 2;

  const activeX = leftOffset + ((activeIndex + 0.5) / 5) * contentWidth;
  const pathD = getPath(dimensions.width, dimensions.height, activeX);
  const lineD = getLinePath(dimensions.width, activeX);

  return (
    <NavContainer ref={containerRef}>
      {/* 크롬 블러 버그 방지용 형제 그림자 레이어 */}
      <NavShadowWrapper>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* 원래 그래픽(선)은 숨기고 그림자만 출력하는 필터 */}
            <filter id="shadow-only" x="-20%" y="-300%" width="140%" height="600%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
              <feOffset dx="0" dy="-4" result="offsetblur" />
              <feFlood flood-color="black" flood-opacity="0.16" />
              <feComposite in2="offsetblur" operator="in" />
            </filter>
          </defs>
          <motion.path
            d={lineD}
            stroke="black"
            strokeWidth="6"
            filter="url(#shadow-only)"
            animate={{ d: lineD }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          />
        </svg>
      </NavShadowWrapper>

      <NavBackground aria-hidden="true">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            initial={false}
            d={pathD}
            fill="rgba(255, 255, 255, 0.82)"
            animate={{ d: pathD }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          />
        </svg>
      </NavBackground>

      {/* 글래스모피즘 테두리 하이라이트 효과 */}
      <GlassBorderWrapper>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: "visible" }}
        >
          <motion.path
            d={lineD}
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1.2"
            animate={{ d: lineD }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          />
        </svg>
      </GlassBorderWrapper>

      <NavItemsContainer>
        {NAV_ITEMS.map((item, idx) => {
          const isActive = activeIndex === idx;
          const badge =
            item.key === "chat" ? Number(totalUnreadCount) : undefined;

          return (
            <NavItemButton
              key={item.to}
              onClick={() => handleNavClick(item.to, item.label)}
              type="button"
            >
              <IconWrapper>
                <IconAnimationContainer
                  animate={{ y: isActive ? -14 : 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 28,
                  }}
                  $isActive={isActive}
                >
                  {isActive && (
                    <ActiveCircleIndicator
                      layoutId="active-circle-bg"
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 28,
                      }}
                    />
                  )}

                  <item.icon />
                  {badge !== undefined && badge > 0 && (
                    <Badge>{badge > 99 ? "99+" : badge}</Badge>
                  )}
                </IconAnimationContainer>
              </IconWrapper>
              <LabelText $isActive={isActive}>{item.label}</LabelText>
            </NavItemButton>
          );
        })}
      </NavItemsContainer>
    </NavContainer>
  );
}

export const BOTTOM_PADDING = 8; // 바텀바 하단 기본 패딩 (더 늘리거나 줄이려면 이 값만 조절)
export const BOTTOM_NAV_HEIGHT = 80 + BOTTOM_PADDING;

const NavContainer = styled.div`
  position: relative;
  width: 100%;
  height: calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px));
  z-index: 1000;
  pointer-events: auto;

  @media ${DESKTOP_MEDIA} {
    max-width: none;
  }
`;

const NavShadowWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
`;

const NavBackground = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;

  svg {
    display: block;
  }
`;

const GlassBorderWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
`;

const NavItemsContainer = styled.nav`
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
  margin: 0 auto;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: flex-end;
  padding-bottom: calc(${BOTTOM_PADDING}px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
`;

const NavItemButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
`;

const IconWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 24px;
`;

const ActiveCircleIndicator = styled(motion.div)`
  position: absolute;
  top: -8px;
  left: -8px;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  z-index: -1;
  pointer-events: none;
`;

const IconAnimationContainer = styled(motion.div)<{ $isActive: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $isActive }) => ($isActive ? "28px" : "24px")};
  height: ${({ $isActive }) => ($isActive ? "28px" : "24px")};
  z-index: 2;
  color: ${({ $isActive }) => ($isActive ? "#3B82F6" : "#B0B8C1")};
  transition:
    color 0.2s ease,
    width 0.2s ease,
    height 0.2s ease;

  svg {
    width: 100%;
    height: 100%;
    transition: transform 0.2s ease;
    ${({ $isActive }) => $isActive && `transform: scale(1.05);`}

    path {
      fill: currentColor;
      transition: fill 0.2s ease;
    }
  }
`;

const Badge = styled.div`
  position: absolute;
  top: -4px;
  right: -8px;
  background-color: #ff3b30;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 10px;
  min-width: 12px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid white;
  z-index: 3;
`;

const LabelText = styled.span<{ $isActive: boolean }>`
  color: ${({ $isActive }) =>
    $isActive ? "#3B82F6" : "var(--text-disabled, #B0B8C1)"};
  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
  margin-top: 4px;
  transition: color 0.2s ease;
`;
