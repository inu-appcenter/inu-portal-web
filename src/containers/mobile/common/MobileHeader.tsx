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

export default function MobileHeader() {
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
          <MenuBackgroundWrapper $isScrolled={isScrolled} $marginLeft="16px">
            <TitleArea>
              {hasback && (
                <BackButton onClick={handleBack} $isScrolled={isScrolled} />
              )}
              <TitleWrapper
                $isScrolled={isScrolled}
                $hasBack={hasback ?? false}
              >
                <Title title={title} />
              </TitleWrapper>
            </TitleArea>
          </MenuBackgroundWrapper>
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
    </MobileHeaderWrapper>
  );
}

const MobileHeaderWrapper = styled.header<{ $visible: boolean }>`
  padding-top: 24px;
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  transition: transform 0.3s ease;
  transform: ${({ $visible }) =>
    $visible ? "translateY(0)" : "translateY(-72px)"};
  pointer-events: none;
`;

const MainHeaderWrapper = styled.div<{ $isScrolled: boolean }>`
  width: 100%;
  height: 56px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;

  .logo {
    height: 100%;
    cursor: pointer;
    padding: 4px 0;
    margin-left: 36px;
    box-sizing: border-box;
    opacity: ${({ $isScrolled }) => ($isScrolled ? 0 : 1)};
    visibility: ${({ $isScrolled }) => ($isScrolled ? "hidden" : "visible")};
    transition:
      opacity 0.1s ease,
      visibility 0s linear ${({ $isScrolled }) => ($isScrolled ? "0.1s" : "0s")};
    pointer-events: auto;
  }
`;

const MenuBackgroundWrapper = styled.div<{
  $isScrolled: boolean;
  $marginLeft?: string;
  $marginRight?: string;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;

  margin-left: ${({ $marginLeft }) => $marginLeft ?? "0"};
  margin-right: ${({ $marginRight }) => $marginRight ?? "0"};

  /* 배경 관련 속성 제거 */
  transition: all 0.2s ease-in-out;
  pointer-events: auto;
`;

const TitleArea = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const TitleWrapper = styled.div<{ $isScrolled: boolean; $hasBack: boolean }>`
  opacity: ${({ $isScrolled }) => ($isScrolled ? 0 : 1)};
  visibility: ${({ $isScrolled }) => ($isScrolled ? "hidden" : "visible")};
  max-width: ${({ $isScrolled }) => ($isScrolled ? "0px" : "300px")};
  overflow: hidden;
  white-space: nowrap;
  transition:
    all 0.2s ease-in-out,
    visibility 0s linear ${({ $isScrolled }) => ($isScrolled ? "0.2s" : "0s")};

  min-width: 200px;
`;
