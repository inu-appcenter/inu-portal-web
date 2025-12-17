import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { ROUTES } from "@/constants/routes";
import NavItem from "@/components/mobile/common/NavItem";
import homeIcon from "@/resources/assets/mobile-common/home-gray.svg";
import homeIconActive from "@/resources/assets/mobile-common/home-blue.svg";
import busIcon from "@/resources/assets/mobile-common/bus-gray.svg";
import busIconActive from "@/resources/assets/mobile-common/bus-blue.svg";
import saveIcon from "@/resources/assets/mobile-common/save-gray.svg";
import saveIconActive from "@/resources/assets/mobile-common/save-blue.svg";
import mypageIcon from "@/resources/assets/mobile-common/mypage-gray.svg";
import mypageIconActive from "@/resources/assets/mobile-common/mypage-blue.svg";

const NAV_ITEMS = [
  { to: ROUTES.HOME, icon: homeIcon, activeIcon: homeIconActive, label: "홈" },
  {
    to: ROUTES.BUS.ROOT,
    icon: busIcon,
    activeIcon: busIconActive,
    label: "인입런",
  },
  {
    to: ROUTES.SAVE,
    icon: saveIcon,
    activeIcon: saveIconActive,
    label: "스크랩",
  },
  {
    to: ROUTES.MYPAGE.ROOT,
    icon: mypageIcon,
    activeIcon: mypageIconActive,
    label: "마이페이지",
  },
];

export default function MobileNav() {
  const location = useLocation();

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

  return (
    <AreaWrapper>
      <MobileNavWrapper>
        <ActiveIndicator $index={activeIndex} />
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            activeIcon={item.activeIcon}
            label={item.label}
          />
        ))}
      </MobileNavWrapper>
    </AreaWrapper>
  );
}

const AreaWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: fit-content;
  z-index: 100;

  display: flex;
  justify-content: center;
  align-items: flex-end;

  /* 빈 영역 터치 통과 */
  pointer-events: none;
`;

const MobileNavWrapper = styled.nav`
  position: relative;
  z-index: 100;
  margin-bottom: 24px;

  width: 90vw;
  max-width: 400px;
  min-width: 250px;

  padding: 8px 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;

  border-radius: 50px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);

  /* Safari 호환성 */
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);

  overflow: hidden;

  /* 네비게이션 영역 터치 활성화 */
  pointer-events: auto;
`;

const ActiveIndicator = styled.div<{ $index: number }>`
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 0;

  /* 너비는 전체의 1/4 (25%), 높이는 100% */
  width: 25%;
  height: 100%;

  border-radius: 50px;
  background: rgba(231, 231, 231, 0.5);

  /* 왼쪽 끝(0)에서 시작하여 25%씩 이동 */
  left: ${({ $index }) => $index * 25}%;

  transition: left 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
`;
