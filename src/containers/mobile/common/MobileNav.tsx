import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { ROUTES } from "@/constants/routes";
import NavItem from "@/components/mobile/common/NavItem";

// 아이콘 에셋 임포트
import homeIcon from "@/resources/assets/mobile-common/home-gray.svg";
import homeIconActive from "@/resources/assets/mobile-common/home-blue.svg";
import busIcon from "@/resources/assets/mobile-common/bus-gray.svg";
import busIconActive from "@/resources/assets/mobile-common/bus-blue.svg";
import saveIcon from "@/resources/assets/mobile-common/save-gray.svg";
import saveIconActive from "@/resources/assets/mobile-common/save-blue.svg";
import mypageIcon from "@/resources/assets/mobile-common/mypage-gray.svg";
import mypageIconActive from "@/resources/assets/mobile-common/mypage-blue.svg";

// 네비게이션 항목 정의
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

  // 현재 경로 기준 인덱스 계산 함수
  const getIndexByPath = (path: string) => {
    const index = NAV_ITEMS.findIndex((item) => {
      if (item.to === ROUTES.HOME) return path === ROUTES.HOME;
      return path === item.to || path.startsWith(item.to);
    });
    return index === -1 ? 0 : index;
  };

  // 활성화 인덱스 상태 관리
  const [activeIndex, setActiveIndex] = useState(() =>
    getIndexByPath(location.pathname),
  );

  // 경로 변경 시 인덱스 동기화
  useEffect(() => {
    setActiveIndex(getIndexByPath(location.pathname));
  }, [location.pathname]);

  return (
    <AreaWrapper>
      <MobileNavWrapper>
        {/* 활성화 표시 인디케이터 */}
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

// 레이아웃 상수
const APP_MAX_WIDTH = "768px";

// 하단 고정 최외곽 컨테이너
const AreaWrapper = styled.div`
  position: fixed; /* 브라우저 화면 기준 고정 */
  bottom: 0;
  left: 50%;
  transform: translateX(-50%); /* 중앙 정렬 */
  width: 100%;
  max-width: ${APP_MAX_WIDTH};
  height: fit-content;
  z-index: 1000; /* 콘텐츠보다 상단 배치 */

  display: flex;
  justify-content: center;
  align-items: flex-end;

  /* 터치 이벤트 투과 설정 */
  pointer-events: none;
`;

// 실제 네비게이션 바
const MobileNavWrapper = styled.nav`
  position: relative;
  z-index: 1001;
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

  /* 블러 효과 처리 */
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);

  overflow: hidden;

  /* 네비 바 내부 터치 활성화 */
  pointer-events: auto;

  /* iOS 하단 영역 대응 */
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
`;

// 슬라이딩 인디케이터 스타일
const ActiveIndicator = styled.div<{ $index: number }>`
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 0;

  /* 전체 너비의 1/4 크기 */
  width: 25%;
  height: 100%;

  border-radius: 50px;
  background: rgba(231, 231, 231, 0.5);

  /* 인덱스에 따른 가로 이동 */
  left: ${({ $index }) => $index * 25}%;

  /* 부드러운 이동 곡선 적용 */
  transition: left 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
`;
