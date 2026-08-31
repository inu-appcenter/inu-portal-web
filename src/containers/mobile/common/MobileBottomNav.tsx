import { Fragment, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { ROUTES } from "@/constants/routes";
import { mixpanelTrack } from "@/utils/mixpanel";
import {
  HomeIcon,
  TimetableIcon,
  BusIcon,
  ChatIcon,
  MyIcon,
} from "@/resources/assets/icons/mobile-nav-v2";
import { DESKTOP_MEDIA, DESKTOP_CONTENT_MAX_WIDTH } from "@/styles/responsive";
import { getUnreadTotalCount } from "@/apis/chat";
import useUserStore from "@/stores/useUserStore";
import TooltipMessage from "@/components/common/TooltipMessage";
import { usePromotion } from "@/hooks/usePromotion";
import { PROMOTIONS } from "@/utils/promotion/registry";

const NAV_ITEMS = [
  {
    to: ROUTES.HOME,
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

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = !!tokenInfo.accessToken;

  const timetableIconRef = useRef<HTMLDivElement | null>(null);
  const {
    isVisible: showTimetableTooltip,
    dismiss: dismissTimetableTooltip,
    accept: acceptTimetableTooltip,
  } = usePromotion(PROMOTIONS.TIMETABLE_UPDATE, { enabled: isLoggedIn });

  const { data: unreadResponse } = useQuery({
    queryKey: ["unreadTotalCount"],
    queryFn: getUnreadTotalCount,
    refetchInterval: 30000,
    enabled: isLoggedIn,
  });

  const totalUnreadCount = unreadResponse?.data?.totalUnreadCount || 0;

  const getIndexByPath = (path: string) => {
    const index = NAV_ITEMS.findIndex((item) => {
      if (item.to === ROUTES.HOME) {
        return (
          path === ROUTES.HOME ||
          path === ROUTES.MOBILE_HOME ||
          path === ROUTES.ROOT ||
          path === ROUTES.HOME_V2
        );
      }
      return path === item.to || path.startsWith(item.to);
    });
    return index === -1 ? 0 : index;
  };

  const activeIndex = getIndexByPath(location.pathname);

  const handleNavClick = (to: string, label: string) => {
    if (to === ROUTES.TIMETABLE.ROOT && showTimetableTooltip) {
      acceptTimetableTooltip("Nav Item");
    }

    const targetIndex = NAV_ITEMS.findIndex((item) => item.to === to);
    if (targetIndex === activeIndex) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    mixpanelTrack.navTabClicked(label);

    const isChat = to === ROUTES.CHAT.LIST;
    if (isChat) {
      const savedCategory = localStorage.getItem("lastChatCategory");
      const target = savedCategory ? `${to}?category=${savedCategory}` : to;
      navigate(target, { replace: true, state: { isTabNavigation: true } });
      return;
    }

    navigate(to, { replace: true, state: { isTabNavigation: true } });
  };

  return (
    <NavContainer>
      <NavItemsContainer>
        {NAV_ITEMS.map((item, idx) => {
          const isActive = activeIndex === idx;
          const badge =
            item.key === "chat" ? Number(totalUnreadCount) : undefined;
          const isTimetableItem = item.to === ROUTES.TIMETABLE.ROOT;

          return (
            <Fragment key={item.to}>
              <NavItemButton
                onClick={() => handleNavClick(item.to, item.label)}
                type="button"
              >
                {isActive && (
                  <ActivePillIndicator
                    layoutId="active-pill-bg"
                    transition={{
                      type: "spring",
                      stiffness: 320,
                      damping: 30,
                    }}
                  />
                )}
                <IconWrapper
                  $isActive={isActive}
                  ref={isTimetableItem ? timetableIconRef : undefined}
                >
                  <item.icon />
                  {badge !== undefined && badge > 0 && (
                    <Badge>{badge > 99 ? "99+" : badge}</Badge>
                  )}
                </IconWrapper>
                <LabelText $isActive={isActive}>{item.label}</LabelText>
              </NavItemButton>

              {isTimetableItem && showTimetableTooltip && (
                <TooltipMessage
                  message={"편람 업데이트 완료!\n시간표 기능을 이용해보세요."}
                  onClose={dismissTimetableTooltip}
                  position="top"
                  align="center"
                  width="max-content"
                  anchorRef={timetableIconRef}
                />
              )}
            </Fragment>
          );
        })}
      </NavItemsContainer>
    </NavContainer>
  );
}

export const BOTTOM_PADDING = 8;
export const BOTTOM_NAV_CONTENT_HEIGHT = 76;
export const BOTTOM_NAV_HEIGHT = BOTTOM_NAV_CONTENT_HEIGHT + BOTTOM_PADDING;
export const BOTTOM_NAV_SAFE_HEIGHT = `calc(${BOTTOM_NAV_CONTENT_HEIGHT}px + max(${BOTTOM_PADDING}px, env(safe-area-inset-bottom, 0px)))`;

const NavContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${BOTTOM_NAV_SAFE_HEIGHT};
  z-index: 1000;
  pointer-events: auto;
  background: var(--bg-blur, rgba(255, 255, 255, 0.60));
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 36px 36px 0 0;

  @media ${DESKTOP_MEDIA} {
    max-width: none;
  }
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
  align-items: center;
  padding-top: 0px;
  padding-bottom: max(${BOTTOM_PADDING}px, env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
`;

const NavItemButton = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
`;

const ActivePillIndicator = styled(motion.div)`
  position: absolute;
  width: 74px;
  height: 64px;
  border-radius: 999px;
  background: var(--bg-blur, rgba(255, 255, 255, 0.60));
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 1;
  pointer-events: none;
`;

const IconWrapper = styled.div<{ $isActive: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  z-index: 2;
  color: ${({ $isActive }) => ($isActive ? "#3B82F6" : "#B0B8C1")};
  transition: color 0.2s ease;

  svg {
    width: 100%;
    height: 100%;

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
  position: relative;
  z-index: 2;
  color: ${({ $isActive }) =>
    $isActive ? "#3B82F6" : "var(--text-disabled, #B0B8C1)"};
  text-align: center;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0px;
  margin-top: 2px;
  transition: color 0.2s ease;
`;
