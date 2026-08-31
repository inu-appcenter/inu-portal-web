import { useEffect, useState, type FC, type SVGProps } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";

import NavItem from "@/components/mobile/common/NavItem";
import { ROUTES } from "@/constants/routes";
import { mixpanelTrack } from "@/utils/mixpanel";
import {
  BusIcon,
  ChatIcon,
  HomeIcon,
  MypageIcon,
  SaveIcon,
  MOBILE_NAV_ICON_COLORS,
} from "@/resources/assets/icons/mobile-nav";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import { getUnreadTotalCount } from "@/apis/chat";
import useUserStore from "@/stores/useUserStore";

interface MobileNavItem {
  to: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  active: string;
  inactive: string;
  activeAccent?: string;
  label: string;
  key?: string;
}

const NAV_ITEMS: MobileNavItem[] = [
  {
    to: ROUTES.HOME,
    icon: HomeIcon,
    ...MOBILE_NAV_ICON_COLORS.home,
    label: "홈",
  },
  {
    to: ROUTES.TIMETABLE.ROOT,
    icon: SaveIcon,
    ...MOBILE_NAV_ICON_COLORS.save,
    label: "시간표",
  },
  {
    to: ROUTES.BUS.ROOT,
    icon: BusIcon,
    ...MOBILE_NAV_ICON_COLORS.bus,
    label: "인입런",
  },
  {
    to: ROUTES.CHAT.LIST,
    icon: ChatIcon,
    ...MOBILE_NAV_ICON_COLORS.chat,
    label: "채팅",
    key: "chat",
  },
  {
    to: ROUTES.MYPAGE.ROOT,
    icon: MypageIcon,
    ...MOBILE_NAV_ICON_COLORS.mypage,
    label: "마이페이지",
  },
];

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = !!tokenInfo.accessToken;

  const { data: unreadResponse } = useQuery({
    queryKey: ["unreadTotalCount"],
    queryFn: getUnreadTotalCount,
    refetchInterval: 30000, // 30초마다 갱신
    enabled: isLoggedIn,
  });

  const totalUnreadCount = unreadResponse?.data?.totalUnreadCount || 0;

  const getIndexByPath = (path: string) => {
    const index = NAV_ITEMS.findIndex((item) => {
      if (item.to === ROUTES.HOME) return path === ROUTES.HOME;
      return path === item.to || path.startsWith(item.to);
    });

    return index === -1 ? 0 : index;
  };

  const [activeIndex, setActiveIndex] = useState(() =>
    getIndexByPath(location.pathname),
  );

  useEffect(() => {
    setActiveIndex(getIndexByPath(location.pathname));
  }, [location.pathname]);

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
      navigate(`${to}?${params.toString()}`, { replace: true, state: { isTabNavigation: true } });
      return;
    }

    mixpanelTrack.navTabClicked(label);

    // 채팅 탭 진입 시 마지막으로 보던 카테고리로 바로 이동 (스와이프 복구 애니메이션 방지)
    if (isChat) {
      const savedCategory = localStorage.getItem("lastChatCategory");
      const target = savedCategory ? `${to}?category=${savedCategory}` : to;
      navigate(target, { replace: true, state: { isTabNavigation: true } });
      return;
    }

    navigate(to, { replace: true, state: { isTabNavigation: true } });
  };


  return (
    <AreaWrapper>
      <MobileNavWrapper>
        <ActiveIndicator $index={activeIndex} />
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            activeColor={item.active}
            inactiveColor={item.inactive}
            activeAccentColor={item.activeAccent}
            label={item.label}
            onClick={() => handleNavClick(item.to, item.label)}
            badge={item.key === "chat" ? Number(totalUnreadCount) : undefined}
          />
        ))}
      </MobileNavWrapper>
    </AreaWrapper>
  );
}

const AreaWrapper = styled.div`
  width: 100%;
  height: fit-content;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  pointer-events: none;

  @media ${DESKTOP_MEDIA} {
    max-width: none;
    justify-content: center;
  }
`;

const MobileNavWrapper = styled.nav`
  position: relative;
  z-index: 1001;
  margin-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  width: 90vw;
  max-width: 400px;
  min-width: 250px;
  padding: 8px 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
  overflow: hidden;
  pointer-events: auto;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, 520px);
    max-width: 520px;
    padding: 10px 0;
  }
`;

const ActiveIndicator = styled.div<{ $index: number }>`
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 0;
  width: 20%;
  height: 100%;
  border-radius: 50px;
  background: rgba(231, 231, 231, 0.5);
  left: ${({ $index }) => $index * 20}%;
  transition: left 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
`;
