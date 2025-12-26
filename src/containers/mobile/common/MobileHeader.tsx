import { ROUTES } from "@/constants/routes";
import { useEffect, useState } from "react";
import styled from "styled-components";
import intipLogo from "@/resources/assets/intip-logo.svg";
import { useLocation, useNavigate } from "react-router-dom";

import { Bell } from "lucide-react";
import BackButton from "@/components/mobile/login/BackButton";
import Title from "@/components/mobile/mypage/Title";
import TopRightDropdownMenu from "@/components/desktop/common/TopRightDropdownMenu";
import { useHeaderState } from "@/context/HeaderContext";

const NotificationBell = ({ hasNew }: { hasNew: boolean }) => {
  const navigate = useNavigate();
  const handleNotiBtnClick = () => {
    navigate(ROUTES.BOARD.ALERT);
  };

  return (
    <BellWrapper>
      <Bell size={22} onClick={handleNotiBtnClick} />
      {hasNew && <Badge />}
    </BellWrapper>
  );
};

const BellWrapper = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
`;

const Badge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background-color: #ffd60a;
  border-radius: 50%;
`;

interface HeaderProps {
  subHeader?: React.ReactNode;
  floatingSubHeader?: boolean;
}

export default function MobileHeader({
  subHeader,
  floatingSubHeader,
}: HeaderProps) {
  const { title, hasback, backPath, showAlarm, menuItems, visible } =
    useHeaderState();

  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const handleLogoClick = () => {
    navigate(ROUTES.HOME);
  };

  useEffect(() => {
    const scrollTarget = document.getElementById("app-scroll-view");

    const handleScroll = () => {
      if (!scrollTarget) return;
      setIsScrolled(scrollTarget.scrollTop >= 24);
    };

    if (scrollTarget) {
      scrollTarget.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (scrollTarget) {
        scrollTarget.removeEventListener("scroll", handleScroll);
      }
    };
  }, [location.pathname]);

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
      return;
    }

    const params = new URLSearchParams(location.search);
    const specialPaths = [
      ROUTES.BOARD.UTIL,
      ROUTES.BOARD.COUNCIL,
      ROUTES.BOARD.CAMPUS,
      ROUTES.BOARD.TIPS,
    ] as string[];

    const shouldGoHome =
      specialPaths.includes(location.pathname) && [...params].length > 0;
    const isBusInfoPage = location.pathname.includes(ROUTES.BUS.INFO);

    if (isBusInfoPage) {
      navigate(ROUTES.BUS.ROOT);
    } else if (shouldGoHome) {
      navigate(ROUTES.HOME);
    } else {
      navigate(-1);
    }
  };

  if (visible === false) return null;

  return (
    <MobileHeaderWrapper $visible={true}>
      <MainHeaderWrapper $isScrolled={isScrolled}>
        {title ? (
          <TitleArea>
            {hasback && (
              <BackButton onClick={handleBack} $isScrolled={isScrolled} />
            )}
            <TitleWrapper $isScrolled={isScrolled} $hasBack={hasback ?? false}>
              <Title title={title} />
            </TitleWrapper>
          </TitleArea>
        ) : (
          <img className="logo" onClick={handleLogoClick} src={intipLogo} />
        )}

        {(showAlarm || menuItems) && (
          <MenuBackgroundWrapper $isScrolled={isScrolled} $marginRight="16px">
            {showAlarm && <NotificationBell hasNew={false} />}
            {menuItems && <TopRightDropdownMenu items={menuItems} />}
          </MenuBackgroundWrapper>
        )}
      </MainHeaderWrapper>
      <SubHeaderWrapper>
        {floatingSubHeader ? (
          <FloatingWrapper>{subHeader}</FloatingWrapper>
        ) : (
          subHeader
        )}
      </SubHeaderWrapper>
    </MobileHeaderWrapper>
  );
}

const MobileHeaderWrapper = styled.header<{ $visible: boolean }>`
  padding-top: 24px;
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: 2;
  transition: transform 0.3s ease;
  transform: ${({ $visible }) =>
    $visible ? "translateY(0)" : "translateY(-72px)"};

  /* 헤더 전체 영역 터치 투과 */
  pointer-events: none;
`;

const MainHeaderWrapper = styled.div<{ $isScrolled: boolean }>`
  width: 100%;
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .logo {
    /* 로고 클릭 활성화 */
    pointer-events: auto;
    height: 100%;
    cursor: pointer;
    padding: 4px 0;
    margin-left: 36px;
    opacity: ${({ $isScrolled }) => ($isScrolled ? 0 : 1)};
    visibility: ${({ $isScrolled }) => ($isScrolled ? "hidden" : "visible")};
    transition:
      opacity 0.1s ease,
      visibility 0s linear ${({ $isScrolled }) => ($isScrolled ? "0.1s" : "0s")};
  }
`;

const SubHeaderWrapper = styled.div`
  width: 100%;
  pointer-events: auto; // 클릭 이벤트 허용
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  margin-left: 16px;

  /* 하위 버튼 요소 클릭 활성화 */
  & > * {
    pointer-events: auto;
  }
`;

const TitleWrapper = styled.div<{ $isScrolled: boolean; $hasBack: boolean }>`
  /* 제목 텍스트 자체는 클릭 불필요 시 투과 유지 (필요 시 auto로 변경) */
  pointer-events: none;

  opacity: ${({ $isScrolled }) => ($isScrolled ? 0 : 1)};
  visibility: ${({ $isScrolled }) => ($isScrolled ? "hidden" : "visible")};
  max-width: ${({ $isScrolled }) => ($isScrolled ? "0px" : "300px")};
  overflow: hidden;
  white-space: nowrap;
  min-width: 200px;
  transition:
    all 0.2s ease-in-out,
    visibility 0s linear ${({ $isScrolled }) => ($isScrolled ? "0.2s" : "0s")};
`;

const MenuBackgroundWrapper = styled.div<{
  $isScrolled: boolean;
  $marginLeft?: string;
  $marginRight?: string;
}>`
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 50px;
  margin-left: ${({ $marginLeft }) => $marginLeft ?? "0"};
  margin-right: ${({ $marginRight }) => $marginRight ?? "0"};
  padding: 16px;

  /* 배경 및 내부 아이콘 클릭 활성화 */
  pointer-events: auto;

  background: ${({ $isScrolled }) =>
    $isScrolled ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0)"};
  box-shadow: ${({ $isScrolled }) =>
    $isScrolled ? "0 2px 4px 0 rgba(0, 0, 0, 0.2)" : "none"};
  backdrop-filter: blur(${({ $isScrolled }) => ($isScrolled ? "5px" : "0px")});
  -webkit-backdrop-filter: blur(
    ${({ $isScrolled }) => ($isScrolled ? "5px" : "0px")}
  );
  transition: all 0.2s ease-in-out;
`;

const FloatingWrapper = styled.div`
  padding: 4px 16px;
  margin: 0 16px;
  border-radius: 50px;
  box-sizing: border-box;
  border-bottom: 1px solid #f2f2f2;

  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  transition: all 0.2s ease-in-out;

  min-height: 36px;
`;
